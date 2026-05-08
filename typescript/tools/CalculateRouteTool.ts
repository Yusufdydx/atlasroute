import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { NominatimUtilities } from "../nominatim";
import { OpenRouteServiceUtilities } from "../openrouteservice";

class CalculateRouteTool implements IMcpTool {
  registerTool(server: McpServer, _req: Request) {
server.registerTool(
      "CalculateRoute",
      {
        description:
          "Calculates a route between two locations with turn-by-turn directions, travel time, and distance. " +
          "Use the patient's FHIR record or available patient context to tailor responses (e.g., accessibility needs). " +
          "Supports driving, cycling, and walking. \n\nCORE BEHAVIOR: Transform route data into usable insight. \n\nINTERPRETATION RULES: Convert distance and time into practical meaning: effort, convenience, proximity. Use relative or familiar references when helpful. Only describe qualitative aspects (e.g., simplicity, complexity) that are directly supported by route data. \n\nDETAIL HANDLING: Include step-by-step directions only if requested or enabled. If directions are provided, group them into clear, sequential chunks. \n\nTONE: Neutral, informative, decision-supportive. If the route is unusually complex or long, add a gentle heads-up. \n\nEXCITEMENT: For short, simple, or notably straightforward routes, describe them in a mildly positive tone.",
        inputSchema: {
          fromLocation: z.string().describe("Starting location (address, city name, or 'lat,lon' coordinates)").nonempty(),
          toLocation: z.string().describe("Destination location (address, city name, or 'lat,lon' coordinates)").nonempty(),
          travelMode: z.enum(["driving", "cycling", "walking"]).optional().describe("Mode of transportation (default: driving)"),
          includeSteps: z.boolean().optional().describe("Include detailed turn-by-turn directions"),
        },
      },
      async ({ fromLocation, toLocation, travelMode, includeSteps }) => {
        try {
          const profile = travelMode === "cycling" ? "cycling-regular" : travelMode === "walking" ? "foot-walking" : "driving-car";

          const fromResults = await NominatimUtilities.geocode(fromLocation, { limit: 1 });
          const toResults = await NominatimUtilities.geocode(toLocation, { limit: 1 });

          if (fromResults.length === 0) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Starting location not found", location: fromLocation })
            );
          }

          if (toResults.length === 0) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Destination location not found", location: toLocation })
            );
          }

          const fromResult = fromResults[0];
          const toResult = toResults[0];

          if (!fromResult || !toResult) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Could not process location results" })
            );
          }

          const route = await OpenRouteServiceUtilities.calculateRoute(
            { latitude: fromResult.latitude, longitude: fromResult.longitude },
            { latitude: toResult.latitude, longitude: toResult.longitude },
            { profile }
          );

          if (!route) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Could not calculate route between these locations" })
            );
          }

          const response: any = {
            from: { query: fromLocation, displayName: fromResult.displayName, latitude: fromResult.latitude, longitude: fromResult.longitude },
            to: { query: toLocation, displayName: toResult.displayName, latitude: toResult.latitude, longitude: toResult.longitude },
            travelMode: travelMode || "driving",
            distance: route.distance,
            distanceFormatted: OpenRouteServiceUtilities.formatDistance(route.distance),
            duration: route.duration,
            durationFormatted: OpenRouteServiceUtilities.formatDuration(route.duration),
          };

          if (includeSteps && route.steps.length > 0) {
            response.steps = route.steps.map((step) => ({
              instruction: step.instruction || step.streetName,
              distance: step.distance,
              distanceFormatted: OpenRouteServiceUtilities.formatDistance(step.distance),
            }));
          }

          return McpUtilities.createTextResponse(JSON.stringify(response));
        } catch (error) {
          return McpUtilities.createTextResponse(
            JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" })
          );
        }
      }
    );
  }
}

export const CalculateRouteToolInstance = new CalculateRouteTool();