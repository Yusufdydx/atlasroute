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
exports.GetDistanceToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const nominatim_1 = require("../nominatim");
const openrouteservice_1 = require("../openrouteservice");
class GetDistanceTool {
    registerTool(server, _req) {
        server.registerTool("GetDistance", {
            description: "Calculates the route distance between two locations with estimated travel time. " +
                "Use the patient's FHIR record or available patient context to tailor responses if relevant (e.g., accessibility needs). " +
                "Useful for comparing travel distances. \n\nCORE BEHAVIOR: Provide concise distance interpretation. \n\nINTERPRETATION RULES: Focus on travel feasibility rather than raw numbers. Translate distance into user-relevant context (e.g., walking time, biking time, driving time). If distance is very long, state plainly and offer alternatives. \n\nAVOID: Standalone numeric output without explanation. Technical units without real-world anchors. \n\nADDITIONAL RULES: For multiple distances, sort from shortest to longest. Include a brief recommendation if one distance is clearly better. \n\nEXCITEMENT: When distance is very short, express mild delight.",
            inputSchema: {
                fromLocation: zod_1.z.string().describe("Starting location (address, city name, or 'lat,lon' coordinates)").nonempty(),
                toLocation: zod_1.z.string().describe("Destination location (address, city name, or 'lat,lon' coordinates)").nonempty(),
                travelMode: zod_1.z.enum(["driving", "cycling", "walking"]).optional().describe("Mode of transportation (default: driving)"),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ fromLocation, toLocation, travelMode }) {
            try {
                const profile = travelMode === "cycling" ? "cycling-regular" : travelMode === "walking" ? "foot-walking" : "driving-car";
                const fromResults = yield nominatim_1.NominatimUtilities.geocode(fromLocation, { limit: 1 });
                const toResults = yield nominatim_1.NominatimUtilities.geocode(toLocation, { limit: 1 });
                if (fromResults.length === 0) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Starting location not found", location: fromLocation }));
                }
                if (toResults.length === 0) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Destination location not found", location: toLocation }));
                }
                const fromResult = fromResults[0];
                const toResult = toResults[0];
                if (!fromResult || !toResult) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Could not process location results" }));
                }
                const distanceResult = yield openrouteservice_1.OpenRouteServiceUtilities.getDistance({ latitude: fromResult.latitude, longitude: fromResult.longitude }, { latitude: toResult.latitude, longitude: toResult.longitude }, profile);
                if (!distanceResult) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Could not calculate distance" }));
                }
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    from: { query: fromLocation, displayName: fromResult.displayName, latitude: fromResult.latitude, longitude: fromResult.longitude },
                    to: { query: toLocation, displayName: toResult.displayName, latitude: toResult.latitude, longitude: toResult.longitude },
                    travelMode: travelMode || "driving",
                    distance: distanceResult.distance,
                    distanceFormatted: openrouteservice_1.OpenRouteServiceUtilities.formatDistance(distanceResult.distance),
                    duration: distanceResult.duration,
                    durationFormatted: openrouteservice_1.OpenRouteServiceUtilities.formatDuration(distanceResult.duration),
                }));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" }));
            }
        }));
    }
}
exports.GetDistanceToolInstance = new GetDistanceTool();
