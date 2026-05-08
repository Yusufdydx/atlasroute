import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { NominatimUtilities } from "../nominatim";
import { OpenRouteServiceUtilities } from "../openrouteservice";

class GetDistanceTool implements IMcpTool {
  registerTool(server: McpServer, _req: Request) {
server.registerTool(
      "GetDistance",
      {
        description:
          "Calculates the route distance between two locations with estimated travel time. " +
          "Use the patient's FHIR record or available patient context to tailor responses if relevant (e.g., accessibility needs). " +
          "Useful for comparing travel distances. \n\nCORE BEHAVIOR: Provide concise distance interpretation. \n\nINTERPRETATION RULES: Focus on travel feasibility rather than raw numbers. Translate distance into user-relevant context (e.g., walking time, biking time, driving time). If distance is very long, state plainly and offer alternatives. \n\nAVOID: Standalone numeric output without explanation. Technical units without real-world anchors. \n\nADDITIONAL RULES: For multiple distances, sort from shortest to longest. Include a brief recommendation if one distance is clearly better. \n\nEXCITEMENT: When distance is very short, express mild delight.",
        inputSchema: {
          fromLocation: z.string().describe("Starting location (address, city name, or 'lat,lon' coordinates)").nonempty(),
          toLocation: z.string().describe("Destination location (address, city name, or 'lat,lon' coordinates)").nonempty(),
          travelMode: z.enum(["driving", "cycling", "walking"]).optional().describe("Mode of transportation (default: driving)"),
        },
      },
      async ({ fromLocation, toLocation, travelMode }) => {
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

          const distanceResult = await OpenRouteServiceUtilities.getDistance(
            { latitude: fromResult.latitude, longitude: fromResult.longitude },
            { latitude: toResult.latitude, longitude: toResult.longitude },
            profile
          );

          if (!distanceResult) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Could not calculate distance" })
            );
          }

          return McpUtilities.createTextResponse(
            JSON.stringify({
              from: { query: fromLocation, displayName: fromResult.displayName, latitude: fromResult.latitude, longitude: fromResult.longitude },
              to: { query: toLocation, displayName: toResult.displayName, latitude: toResult.latitude, longitude: toResult.longitude },
              travelMode: travelMode || "driving",
              distance: distanceResult.distance,
              distanceFormatted: OpenRouteServiceUtilities.formatDistance(distanceResult.distance),
              duration: distanceResult.duration,
              durationFormatted: OpenRouteServiceUtilities.formatDuration(distanceResult.duration),
            })
          );
        } catch (error) {
          return McpUtilities.createTextResponse(
            JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" })
          );
        }
      }
    );
  }
}

export const GetDistanceToolInstance = new GetDistanceTool();