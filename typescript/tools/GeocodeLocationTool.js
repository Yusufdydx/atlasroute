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
exports.GeocodeLocationToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const nominatim_1 = require("../nominatim");
class GeocodeLocationTool {
    registerTool(server, _req) {
        server.registerTool("GeocodeLocation", {
            description: "Converts a location name or address into geographic coordinates. Also supports reverse geocoding - converting coordinates back to an address. " +
                "Use the patient's FHIR record or available patient context when relevant. \n\nCORE BEHAVIOR: Convert location into a meaningful reference. \n\nAMBIGUITY HANDLING: If multiple matches, present clear distinctions (e.g., zip code, city vs. neighborhood). Prompt the user to select the intended one. If no match, ask for a well-known landmark or intersection. \n\nCLARITY: Avoid unnecessary coordinate emphasis unless required for precise navigation. Use place names plus relative direction when possible. \n\nADDITIONAL RULES: For future steps, keep the resolved location in context. \n\nEXCITEMENT: If the resolved location is especially recognizable or easy to find, mention that positively.",
            inputSchema: {
                location: zod_1.z.string().optional().describe("The location to geocode (address, city name, or landmark).").optional(),
                latitude: zod_1.z.number().optional().describe("Latitude for reverse geocoding"),
                longitude: zod_1.z.number().optional().describe("Longitude for reverse geocoding"),
                limit: zod_1.z.number().optional().describe("Maximum number of results (default: 5)"),
                countryCode: zod_1.z.string().optional().describe("Filter by country code (e.g., 'us', 'gb')"),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ location, latitude, longitude, limit, countryCode }) {
            try {
                if (!location && (latitude === undefined || longitude === undefined)) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Missing input", details: "Provide location name OR latitude/longitude" }));
                }
                if (latitude !== undefined && longitude !== undefined) {
                    const reverseResult = yield nominatim_1.NominatimUtilities.reverseGeocode(latitude, longitude);
                    if (!reverseResult) {
                        return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "No address found for coordinates", latitude, longitude }));
                    }
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                        type: "reverse_geocode",
                        latitude: reverseResult.latitude,
                        longitude: reverseResult.longitude,
                        displayName: reverseResult.displayName,
                        address: reverseResult.address,
                        locationType: reverseResult.type,
                    }));
                }
                const results = yield nominatim_1.NominatimUtilities.geocode(location, { limit: limit || 5, countrycodes: countryCode });
                if (results.length === 0) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Location not found", location: location }));
                }
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    type: "geocode",
                    location: location,
                    results: results.map((r) => ({
                        displayName: r.displayName,
                        latitude: r.latitude,
                        longitude: r.longitude,
                        address: r.address,
                        locationType: r.type,
                    })),
                }));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" }));
            }
        }));
    }
}
exports.GeocodeLocationToolInstance = new GeocodeLocationTool();
