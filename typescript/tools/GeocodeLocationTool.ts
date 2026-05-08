import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { NominatimUtilities } from "../nominatim";

class GeocodeLocationTool implements IMcpTool {
  registerTool(server: McpServer, _req: Request) {
server.registerTool(
      "GeocodeLocation",
      {
        description:
          "Converts a location name or address into geographic coordinates. Also supports reverse geocoding - converting coordinates back to an address. " +
          "Use the patient's FHIR record or available patient context when relevant. \n\nCORE BEHAVIOR: Convert location into a meaningful reference. \n\nAMBIGUITY HANDLING: If multiple matches, present clear distinctions (e.g., zip code, city vs. neighborhood). Prompt the user to select the intended one. If no match, ask for a well-known landmark or intersection. \n\nCLARITY: Avoid unnecessary coordinate emphasis unless required for precise navigation. Use place names plus relative direction when possible. \n\nADDITIONAL RULES: For future steps, keep the resolved location in context. \n\nEXCITEMENT: If the resolved location is especially recognizable or easy to find, mention that positively.",
        inputSchema: {
          location: z.string().optional().describe("The location to geocode (address, city name, or landmark).").optional(),
          latitude: z.number().optional().describe("Latitude for reverse geocoding"),
          longitude: z.number().optional().describe("Longitude for reverse geocoding"),
          limit: z.number().optional().describe("Maximum number of results (default: 5)"),
          countryCode: z.string().optional().describe("Filter by country code (e.g., 'us', 'gb')"),
        },
      },
      async ({ location, latitude, longitude, limit, countryCode }) => {
        try {
          if (!location && (latitude === undefined || longitude === undefined)) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Missing input", details: "Provide location name OR latitude/longitude" })
            );
          }

          if (latitude !== undefined && longitude !== undefined) {
            const reverseResult = await NominatimUtilities.reverseGeocode(latitude, longitude);
            if (!reverseResult) {
              return McpUtilities.createTextResponse(
                JSON.stringify({ error: true, message: "No address found for coordinates", latitude, longitude })
              );
            }
            return McpUtilities.createTextResponse(
              JSON.stringify({
                type: "reverse_geocode",
                latitude: reverseResult.latitude,
                longitude: reverseResult.longitude,
                displayName: reverseResult.displayName,
                address: reverseResult.address,
                locationType: reverseResult.type,
              })
            );
          }

          const results = await NominatimUtilities.geocode(location!, { limit: limit || 5, countrycodes: countryCode });
          if (results.length === 0) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Location not found", location: location })
            );
          }

          return McpUtilities.createTextResponse(
            JSON.stringify({
              type: "geocode",
              location: location,
              results: results.map((r) => ({
                displayName: r.displayName,
                latitude: r.latitude,
                longitude: r.longitude,
                address: r.address,
                locationType: r.type,
              })),
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

export const GeocodeLocationToolInstance = new GeocodeLocationTool();