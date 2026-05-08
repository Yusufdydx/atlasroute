import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { NominatimUtilities } from "../nominatim";
import { OverpassUtilities } from "../overpass";

class FindPharmaciesTool implements IMcpTool {
  registerTool(server: McpServer, _req: Request) {
    server.registerTool(
      "FindPharmacies",
      {
        description:
          "Finds pharmacies near a location using OpenStreetMap data (amenity=pharmacy). " +
          "Use the patient's FHIR record or available patient context to tailor responses - consider their current medications when suggesting pharmacies. " +
          "Use when user needs medications.\n\nIMPORTANT: If user does not provide a location, FIRST call InstantLocate tool to generate a secure link. After user clicks the link and confirms location, call CheckLocation tool to get coordinates. Then pass those coordinates as lat,lon to this tool.\n\nCORE BEHAVIOR: Present results as options, not raw listings.",
        inputSchema: {
          location: z
            .string()
            .describe("The location to search near (address, city, or lat,lon)"),
          radius: z.number().optional().describe("Search radius in meters (default: 5000)"),
          limit: z.number().optional().describe("Maximum results to return (default: 5)"),
        },
      },
      async ({ location, radius, limit }) => {
        try {
          const searchRadius = Math.min(radius || 5000, 50000);
          const maxResults = limit || 5;

          const geocodeResults = await NominatimUtilities.geocode(location, { limit: 1 });
          if (geocodeResults.length === 0) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Location not found", location: location })
            );
          }

          const geoResult = geocodeResults[0];
          if (!geoResult) {
            return McpUtilities.createTextResponse(
              JSON.stringify({ error: true, message: "Could not process location" })
            );
          }
          
          const facilities = await OverpassUtilities.findNearbyFacilities(
            geoResult.latitude,
            geoResult.longitude,
            searchRadius,
            ["pharmacy"]
          );

          const results = facilities.slice(0, maxResults).map((f) => ({
            name: f.name, address: f.address, phone: f.phone, openingHours: f.openingHours, latitude: f.latitude, longitude: f.longitude
          }));

          return McpUtilities.createTextResponse(
            JSON.stringify({
              location: { query: location, displayName: geoResult.displayName, latitude: geoResult.latitude, longitude: geoResult.longitude },
              results: results,
              searchRadius: searchRadius,
              totalFound: facilities.length,
              facilityType: "pharmacy",
              dataSource: "OpenStreetMap",
              dataLastUpdated: new Date().toISOString().split('T')[0]
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

export const FindPharmaciesToolInstance = new FindPharmaciesTool();