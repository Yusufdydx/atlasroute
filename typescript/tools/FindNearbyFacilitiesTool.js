"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindNearbyFacilitiesToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const nominatim_1 = require("../nominatim");
const overpass_1 = require("../overpass");
const fhir_client_1 = require("../fhir-client");
const fhir_utilities_1 = require("../fhir-utilities");
class FindNearbyFacilitiesTool {
    registerTool(server, _req) {
        server.registerTool("FindNearbyFacilities", {
            description: "Finds nearby healthcare facilities (hospitals, clinics, pharmacies, doctors, dentists) based on location. " +
                "Use the patient's FHIR record or available patient context to tailor responses - consider their conditions, medications, allergies when presenting options. " +
                "Uses OpenStreetMap data. Verify facility services by calling ahead - capabilities may change. \n\nCORE BEHAVIOR: Provide an overview of available facility types. \n\nINTERPRETATION RULES: Group results by category (e.g., pharmacies, clinics, labs, urgent care). Highlight what is most relevant based on user context. Apply prioritization rule (proximity, relevance, availability) within each category. For each category, mention the closest option and its key metric. \n\nGUIDANCE RULES: Help the user narrow focus without overwhelming (e.g., offer filtering by open status or distance). Limit results to a manageable number per category. \n\nADDITIONAL RULES: If no facilities within a reasonable radius, gradually expand the search and report the expanded radius. \n\nEXCITEMENT: When a facility is unusually close or offers special services, call it out in a positive but natural way.",
            inputSchema: {
                location: zod_1.z.string().describe("The location to search near (can be an address, city name, or 'lat,lon' coordinates)"),
                radius: zod_1.z.number().optional().describe("Search radius in meters (default: 5000)"),
                filterAllergies: zod_1.z.boolean().optional().describe("Filter out facilities based on patient allergies from FHIR (requires FHIR context)")
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ location, radius, filterAllergies }) {
            var _b, _c, _d;
            try {
                const searchRadius = Math.min(radius || 5000, 50000);
                const geocodeResults = yield nominatim_1.NominatimUtilities.geocode(location, { limit: 1 });
                if (geocodeResults.length === 0) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Location not found", location: location }));
                }
                const geoResult = geocodeResults[0];
                if (!geoResult) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Could not process location" }));
                }
                const facilities = yield overpass_1.OverpassUtilities.findNearbyFacilities(geoResult.latitude, geoResult.longitude, searchRadius);
                let filteredFacilities = facilities;
                let allergyWarning;
                let inNetworkWarning;
                const patientId = fhir_utilities_1.FhirUtilities.getPatientIdIfContextExists(_req);
                if (patientId && filterAllergies) {
                    try {
                        const allergies = yield fhir_client_1.FhirClientInstance.getPatientAllergies(_req, patientId);
                        const allergyCodes = [];
                        if (allergies === null || allergies === void 0 ? void 0 : allergies.entry) {
                            for (const entry of allergies.entry) {
                                const resource = entry.resource;
                                if ((_d = (_c = (_b = resource === null || resource === void 0 ? void 0 : resource.code) === null || _b === void 0 ? void 0 : _b.coding) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.code) {
                                    allergyCodes.push(resource.code.coding[0].code);
                                }
                            }
                        }
                        if (allergyCodes.some(code => code.toLowerCase().includes('latex') ||
                            code.toLowerCase().includes('rubber'))) {
                            filteredFacilities = filteredFacilities.filter(f => {
                                var _a;
                                const amenities = ((_a = f.amenities) === null || _a === void 0 ? void 0 : _a.map(a => a.toLowerCase())) || [];
                                return !amenities.some(a => a.includes('latex') || a.includes('rubber'));
                            });
                            allergyWarning = "Filtered for latex-safe facilities based on patient allergies from FHIR";
                        }
                    }
                    catch (e) {
                        console.warn('FHIR allergy query failed:', e);
                    }
                    try {
                        const coverage = yield fhir_client_1.FhirClientInstance.getPatientCoverage(_req, patientId);
                        if ((coverage === null || coverage === void 0 ? void 0 : coverage.entry) && coverage.entry.length > 0) {
                            inNetworkWarning = "Insurance coverage found. In-network filtering not implemented.";
                        }
                    }
                    catch (e) {
                        console.warn('FHIR coverage query failed:', e);
                    }
                }
                const formattedResults = filteredFacilities.slice(0, 10).map((f) => ({
                    name: f.name, type: f.type, address: f.address, phone: f.phone, openingHours: f.openingHours, amenities: f.amenities, latitude: f.latitude, longitude: f.longitude
                }));
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    location: { query: location, displayName: geoResult.displayName, latitude: geoResult.latitude, longitude: geoResult.longitude },
                    results: formattedResults, searchRadius: searchRadius, totalFound: facilities.length,
                    facilityTypes: [...new Set(facilities.map(f => f.type))],
                    fhirContext: patientId ? { patientId, allergyFiltering: filterAllergies } : null,
                    allergyWarning: allergyWarning || null,
                    inNetworkWarning: inNetworkWarning || null,
                    dataSource: "OpenStreetMap",
                    dataLastUpdated: new Date().toISOString().split('T')[0]
                }));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" }));
            }
        }));
    }
}
exports.FindNearbyFacilitiesToolInstance = new FindNearbyFacilitiesTool();
