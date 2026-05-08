import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { NominatimUtilities } from "../nominatim";
import { OverpassUtilities } from "../overpass";
import { FhirClientInstance } from "../fhir-client";
import { FhirUtilities } from "../fhir-utilities";

class FindNearbyFacilitiesTool implements IMcpTool {
  registerTool(server: McpServer, _req: Request) {
    server.registerTool(
      "FindNearbyFacilities",
      {
        description:
          "Finds nearby healthcare facilities (hospitals, clinics, pharmacies, doctors, dentists) based on location. " +
          "Use the patient's FHIR record or available patient context to tailor responses - consider their conditions, medications, allergies when presenting options. " +
          "Uses OpenStreetMap data. Verify facility services by calling ahead - capabilities may change. \n\nCORE BEHAVIOR: Provide an overview of available facility types. \n\nINTERPRETATION RULES: Group results by category (e.g., pharmacies, clinics, labs, urgent care). Highlight what is most relevant based on user context. Apply prioritization rule (proximity, relevance, availability) within each category. For each category, mention the closest option and its key metric. \n\nGUIDANCE RULES: Help the user narrow focus without overwhelming (e.g., offer filtering by open status or distance). Limit results to a manageable number per category. \n\nADDITIONAL RULES: If no facilities within a reasonable radius, gradually expand the search and report the expanded radius. \n\nEXCITEMENT: When a facility is unusually close or offers special services, call it out in a positive but natural way.",
        inputSchema: {
          location: z.string().describe("The location to search near (can be an address, city name, or 'lat,lon' coordinates)"),
          radius: z.number().optional().describe("Search radius in meters (default: 5000)"),
          filterAllergies: z.boolean().optional().describe("Filter out facilities based on patient allergies from FHIR (requires FHIR context)")
        },
      },
      async ({ location, radius, filterAllergies }) => {
        try {
          const searchRadius = Math.min(radius || 5000, 50000);

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

          const facilities = await OverpassUtilities.findNearbyFacilities(geoResult.latitude, geoResult.longitude, searchRadius);

          let filteredFacilities = facilities;
          let allergyWarning: string | undefined;
          let inNetworkWarning: string | undefined;
          
          const patientId = FhirUtilities.getPatientIdIfContextExists(_req);
          
          if (patientId && filterAllergies) {
            try {
              const allergies = await FhirClientInstance.getPatientAllergies(_req, patientId);
              const allergyCodes: string[] = [];
              
              if (allergies?.entry) {
                for (const entry of allergies.entry) {
                  const resource = entry.resource as any;
                  if (resource?.code?.coding?.[0]?.code) {
                    allergyCodes.push(resource.code.coding[0].code);
                  }
                }
              }
              
              if (allergyCodes.some(code => 
                code.toLowerCase().includes('latex') || 
                code.toLowerCase().includes('rubber')
              )) {
                filteredFacilities = filteredFacilities.filter(f => {
                  const amenities = f.amenities?.map(a => a.toLowerCase()) || [];
                  return !amenities.some(a => a.includes('latex') || a.includes('rubber'));
                });
                allergyWarning = "Filtered for latex-safe facilities based on patient allergies from FHIR";
              }
            } catch (e) {
              console.warn('FHIR allergy query failed:', e);
            }
            
            try {
              const coverage = await FhirClientInstance.getPatientCoverage(_req, patientId);
              if (coverage?.entry && coverage.entry.length > 0) {
                inNetworkWarning = "Insurance coverage found. In-network filtering not implemented.";
              }
            } catch (e) {
              console.warn('FHIR coverage query failed:', e);
            }
          }

          const formattedResults = filteredFacilities.slice(0, 10).map((f) => ({
            name: f.name, type: f.type, address: f.address, phone: f.phone, openingHours: f.openingHours, amenities: f.amenities, latitude: f.latitude, longitude: f.longitude
          }));

          return McpUtilities.createTextResponse(
            JSON.stringify({
              location: { query: location, displayName: geoResult.displayName, latitude: geoResult.latitude, longitude: geoResult.longitude },
              results: formattedResults, searchRadius: searchRadius, totalFound: facilities.length,
              facilityTypes: [...new Set(facilities.map(f => f.type))],
              fhirContext: patientId ? { patientId, allergyFiltering: filterAllergies } : null,
              allergyWarning: allergyWarning || null,
              inNetworkWarning: inNetworkWarning || null,
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

export const FindNearbyFacilitiesToolInstance = new FindNearbyFacilitiesTool();