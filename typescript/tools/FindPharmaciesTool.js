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
exports.FindPharmaciesToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const nominatim_1 = require("../nominatim");
const overpass_1 = require("../overpass");
class FindPharmaciesTool {
    registerTool(server, _req) {
        server.registerTool("FindPharmacies", {
            description: "Finds pharmacies near a location using OpenStreetMap data (amenity=pharmacy). " +
                "Use the patient's FHIR record or available patient context to tailor responses - consider their current medications when suggesting pharmacies. " +
                "Use when user needs medications.\n\nIMPORTANT: If user does not provide a location, FIRST call InstantLocate tool to generate a secure link. After user clicks the link and confirms location, call CheckLocation tool to get coordinates. Then pass those coordinates as lat,lon to this tool.\n\nCORE BEHAVIOR: Present results as options, not raw listings.",
            inputSchema: {
                location: zod_1.z
                    .string()
                    .describe("The location to search near (address, city, or lat,lon)"),
                radius: zod_1.z.number().optional().describe("Search radius in meters (default: 5000)"),
                limit: zod_1.z.number().optional().describe("Maximum results to return (default: 5)"),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ location, radius, limit }) {
            try {
                const searchRadius = Math.min(radius || 5000, 50000);
                const maxResults = limit || 5;
                const geocodeResults = yield nominatim_1.NominatimUtilities.geocode(location, { limit: 1 });
                if (geocodeResults.length === 0) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Location not found", location: location }));
                }
                const geoResult = geocodeResults[0];
                if (!geoResult) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Could not process location" }));
                }
                const facilities = yield overpass_1.OverpassUtilities.findNearbyFacilities(geoResult.latitude, geoResult.longitude, searchRadius, ["pharmacy"]);
                const results = facilities.slice(0, maxResults).map((f) => ({
                    name: f.name, address: f.address, phone: f.phone, openingHours: f.openingHours, latitude: f.latitude, longitude: f.longitude
                }));
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    location: { query: location, displayName: geoResult.displayName, latitude: geoResult.latitude, longitude: geoResult.longitude },
                    results: results,
                    searchRadius: searchRadius,
                    totalFound: facilities.length,
                    facilityType: "pharmacy",
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
exports.FindPharmaciesToolInstance = new FindPharmaciesTool();
