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
exports.CalculateRouteToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const nominatim_1 = require("../nominatim");
const openrouteservice_1 = require("../openrouteservice");
class CalculateRouteTool {
    registerTool(server, _req) {
        server.registerTool("CalculateRoute", {
            description: "Calculates a route between two locations with turn-by-turn directions, travel time, and distance. " +
                "Use the patient's FHIR record or available patient context to tailor responses (e.g., accessibility needs). " +
                "Supports driving, cycling, and walking. \n\nCORE BEHAVIOR: Transform route data into usable insight. \n\nINTERPRETATION RULES: Convert distance and time into practical meaning: effort, convenience, proximity. Use relative or familiar references when helpful. Only describe qualitative aspects (e.g., simplicity, complexity) that are directly supported by route data. \n\nDETAIL HANDLING: Include step-by-step directions only if requested or enabled. If directions are provided, group them into clear, sequential chunks. \n\nTONE: Neutral, informative, decision-supportive. If the route is unusually complex or long, add a gentle heads-up. \n\nEXCITEMENT: For short, simple, or notably straightforward routes, describe them in a mildly positive tone.",
            inputSchema: {
                fromLocation: zod_1.z.string().describe("Starting location (address, city name, or 'lat,lon' coordinates)").nonempty(),
                toLocation: zod_1.z.string().describe("Destination location (address, city name, or 'lat,lon' coordinates)").nonempty(),
                travelMode: zod_1.z.enum(["driving", "cycling", "walking"]).optional().describe("Mode of transportation (default: driving)"),
                includeSteps: zod_1.z.boolean().optional().describe("Include detailed turn-by-turn directions"),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ fromLocation, toLocation, travelMode, includeSteps }) {
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
                const route = yield openrouteservice_1.OpenRouteServiceUtilities.calculateRoute({ latitude: fromResult.latitude, longitude: fromResult.longitude }, { latitude: toResult.latitude, longitude: toResult.longitude }, { profile });
                if (!route) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: "Could not calculate route between these locations" }));
                }
                const response = {
                    from: { query: fromLocation, displayName: fromResult.displayName, latitude: fromResult.latitude, longitude: fromResult.longitude },
                    to: { query: toLocation, displayName: toResult.displayName, latitude: toResult.latitude, longitude: toResult.longitude },
                    travelMode: travelMode || "driving",
                    distance: route.distance,
                    distanceFormatted: openrouteservice_1.OpenRouteServiceUtilities.formatDistance(route.distance),
                    duration: route.duration,
                    durationFormatted: openrouteservice_1.OpenRouteServiceUtilities.formatDuration(route.duration),
                };
                if (includeSteps && route.steps.length > 0) {
                    response.steps = route.steps.map((step) => ({
                        instruction: step.instruction || step.streetName,
                        distance: step.distance,
                        distanceFormatted: openrouteservice_1.OpenRouteServiceUtilities.formatDistance(step.distance),
                    }));
                }
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify(response));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" }));
            }
        }));
    }
}
exports.CalculateRouteToolInstance = new CalculateRouteTool();
