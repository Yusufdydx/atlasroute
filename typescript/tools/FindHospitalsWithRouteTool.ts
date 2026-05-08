import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { NominatimUtilities } from "../nominatim";
import { OverpassUtilities } from "../overpass";
import { OpenRouteServiceUtilities } from "../openrouteservice";

class FindHospitalsWithRouteTool implements IMcpTool {
  registerTool(server: McpServer, _req: Request) {
    server.registerTool(
      "FindHospitalsWithRoute",
      {
        description:
          "Finds hospitals and medical facilities near a location with route directions and travel time. " +
          "Use the patient's FHIR record or available patient context to tailor responses - consider their conditions, medications, and needs when presenting options. " +
          "IMPORTANT: If user does not provide a location, FIRST call InstantLocate tool to generate a secure link. " +
          "After user clicks the link and confirms location, call CheckLocation tool to get coordinates. " +
          "Then pass those coordinates as lat,lon to this tool. " +
          "CORE BEHAVIOR: Present results as options, not raw listings.",
        inputSchema: {
          location: z
            .string()
            .describe("Your current location (address, city name, or 'lat,lon' coordinates)")
            .nonempty(),
          radius: z.number().optional().describe("Search radius in meters (default: 10000, max: 50000)"),
          travelMode: z.enum(["driving", "cycling", "walking"]).optional().describe("Mode of transportation (default: driving)"),
          limit: z.number().optional().describe("Maximum number of hospitals to find (default: 5)"),
          specialtyFilter: z.enum([
            "trauma", "burn", "stroke", "pediatric",
            "cardiac", "rehabilitation", "emergency"
          ]).optional().describe("Filter by specialty type (trauma, burn, stroke, pediatric, cardiac, rehabilitation)")
        },
      },
      async ({ location, radius, travelMode, limit, specialtyFilter }) => {
        try {
          const searchRadius = Math.min(radius || 10000, 50000);
          const maxResults = limit || 5;

          const profile = travelMode === "cycling" ? "cycling-regular" : travelMode === "walking" ? "foot-walking" : "driving-car";

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

          const hospitals = await OverpassUtilities.findHospitals(
            geoResult.latitude,
            geoResult.longitude,
            searchRadius
          );

          let filteredHospitals = hospitals;
          let specialtyWarning: string | undefined;

          if (specialtyFilter) {
            filteredHospitals = hospitals.filter(h => {
              const amenities = h.amenities?.map(a => a.toLowerCase()) || [];
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
          const routes: Array<{
            name: string;
            address: string;
            phone?: string;
            openingHours?: string;
            amenities?: string[];
            latitude: number;
            longitude: number;
            distance: number;
            duration: number;
            distanceFormatted: string;
            durationFormatted: string;
          }> = [];

          for (const hospital of hospitalsToProcess) {
            const route = await OpenRouteServiceUtilities.getDistance(
              { latitude: geoResult.latitude, longitude: geoResult.longitude },
              { latitude: hospital.latitude, longitude: hospital.longitude },
              profile
            );

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
                distanceFormatted: OpenRouteServiceUtilities.formatDistance(route.distance),
                durationFormatted: OpenRouteServiceUtilities.formatDuration(route.duration),
              });
            }
          }

          routes.sort((a, b) => a.duration - b.duration);

          if (routes.length === 0) {
            return McpUtilities.createTextResponse(
              JSON.stringify({
                error: false,
                location: { query: location, displayName: geoResult.displayName, latitude: geoResult.latitude, longitude: geoResult.longitude },
                travelMode: travelMode || "driving",
                searchRadius: searchRadius,
                results: [],
                totalFound: 0,
                emergencyGuidance: "No hospitals found. Contact local emergency services.",
                dataSource: "OpenStreetMap",
                dataLastUpdated: new Date().toISOString().split("T")[0]
              })
            );
          }

          return McpUtilities.createTextResponse(
            JSON.stringify({
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

export const FindHospitalsWithRouteToolInstance = new FindHospitalsWithRouteTool();