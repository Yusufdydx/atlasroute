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
exports.FindHospitalsWithRouteToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const nominatim_1 = require("../nominatim");
const overpass_1 = require("../overpass");
const openrouteservice_1 = require("../openrouteservice");
class FindHospitalsWithRouteTool {
    registerTool(server, _req) {
        server.registerTool("FindHospitalsWithRoute", {
            description: "Finds hospitals and medical facilities near a location with route directions and travel time. " +
                "Use the patient's FHIR record or available patient context to tailor responses - consider their conditions, medications, and needs when presenting options. " +
                "IMPORTANT: If user does not provide a location, FIRST call InstantLocate tool to generate a secure link. " +
                "After user clicks the link and confirms location, call CheckLocation tool to get coordinates. " +
                "Then pass those coordinates as lat,lon to this tool. " +
                "CORE BEHAVIOR: Present results as options, not raw listings.",
            inputSchema: {
                location: zod_1.z
                    .string()
                    .describe("Your current location (address, city name, or 'lat,lon' coordinates)")
                    .nonempty(),
                radius: zod_1.z.number().optional().describe("Search radius in meters (default: 10000, max: 50000)"),
                travelMode: zod_1.z.enum(["driving", "cycling", "walking"]).optional().describe("Mode of transportation (default: driving)"),
                limit: zod_1.z.number().optional().describe("Maximum number of hospitals to find (default: 5)"),
                specialtyFilter: zod_1.z.enum([
                    "trauma", "burn", "stroke", "pediatric",
                    "cardiac", "rehabilitation", "emergency"
                ]).optional().describe("Filter by specialty type (trauma, burn, stroke, pediatric, cardiac, rehabilitation)")
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ location, radius, travelMode, limit, specialtyFilter }) {
            try {
                const searchRadius = Math.min(radius || 10000, 50000);
                const maxResults = limit || 5;
                const profile = travelMode === "cycling" ? "cycling-regular" : travelMode === "walking" ? "foot-walking" : "driving-car";
                const geocodeResults = yield nominatim_1.NominatimUtilities.geocode(location, { limit: 1 });
                if (geocodeResults.length === 0) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Location not found", location: location }));
                }
                const geoResult = geocodeResults[0];
                if (!geoResult) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Could not process location" }));
                }
                const hospitals = yield overpass_1.OverpassUtilities.findHospitals(geoResult.latitude, geoResult.longitude, searchRadius);
                let filteredHospitals = hospitals;
                let specialtyWarning;
                if (specialtyFilter) {
                    filteredHospitals = hospitals.filter(h => {
                        var _a;
                        const amenities = ((_a = h.amenities) === null || _a === void 0 ? void 0 : _a.map(a => a.toLowerCase())) || [];
                        const name = h.name.toLowerCase();
                        const searchTerm = specialtyFilter.toLowerCase();
                        return amenities.some(a => a.includes(searchTerm)) || name.includes(searchTerm);
                    });
                    if (filteredHospitals.length === 0) {
                        filteredHospitals = hospitals;
                        specialtyWarning = "No hospitals with " + specialtyFilter + " specialty found within radius. Showing all hospitals.";
                    }
                }
                const hospitalsToProcess = filteredHospitals.slice(0, maxResults);
                const routes = [];
                for (const hospital of hospitalsToProcess) {
                    const route = yield openrouteservice_1.OpenRouteServiceUtilities.getDistance({ latitude: geoResult.latitude, longitude: geoResult.longitude }, { latitude: hospital.latitude, longitude: hospital.longitude }, profile);
                    if (route) {
                        routes.push({
                            name: hospital.name,
                            address: hospital.address || "",
                            phone: hospital.phone,
                            openingHours: hospital.openingHours,
                            amenities: hospital.amenities,
                            latitude: hospital.latitude,
                            longitude: hospital.longitude,
                            distance: route.distance,
                            duration: route.duration,
                            distanceFormatted: openrouteservice_1.OpenRouteServiceUtilities.formatDistance(route.distance),
                            durationFormatted: openrouteservice_1.OpenRouteServiceUtilities.formatDuration(route.duration),
                        });
                    }
                }
                routes.sort((a, b) => a.duration - b.duration);
                if (routes.length === 0) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                        error: false,
                        location: { query: location, displayName: geoResult.displayName, latitude: geoResult.latitude, longitude: geoResult.longitude },
                        travelMode: travelMode || "driving",
                        searchRadius: searchRadius,
                        results: [],
                        totalFound: 0,
                        emergencyGuidance: "No hospitals found. Contact local emergency services.",
                        dataSource: "OpenStreetMap",
                        dataLastUpdated: new Date().toISOString().split("T")[0]
                    }));
                }
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    location: { query: location, displayName: geoResult.displayName, latitude: geoResult.latitude, longitude: geoResult.longitude },
                    travelMode: travelMode || "driving",
                    searchRadius: searchRadius,
                    results: routes,
                    totalFound: hospitals.length,
                    specialtyFilter: specialtyFilter || null,
                    specialtyWarning: specialtyWarning || null,
                    dataSource: "OpenStreetMap",
                    dataLastUpdated: new Date().toISOString().split("T")[0],
                    verificationNote: "Verify capabilities by calling facility directly. Hospital services may change."
                }));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" }));
            }
        }));
    }
}
exports.FindHospitalsWithRouteToolInstance = new FindHospitalsWithRouteTool();
