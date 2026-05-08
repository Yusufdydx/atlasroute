import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { LocationTokenService } from "../location-token";

class CheckLocationTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "CheckLocation",
      {
        description:
          "Check if a location confirmation token has been confirmed. Returns coordinates if confirmed, or status if pending/expired. " +
          "Use patient's FHIR record context if available to provide relevant location-based services.\n\nGUIDANCE:\n- If status is 'confirmed': use the returned coordinates to find facilities\n- If status is 'pending': inform the user to grant permission and return to confirm\n- If status is 'expired': generate a new InstantLocate link automatically\n- If status is 'invalid': generate a new InstantLocate link",
        inputSchema: z.object({
          token: z.string().describe("Token from InstantLocate response")
        }),
      },
      async ({ token }: { token: string }) => {
        try {
          const status = LocationTokenService.getStatus(token);

          if (status === 'invalid' || status === 'expired') {
            return McpUtilities.createTextResponse(
              JSON.stringify({
                status: status,
                message: status === 'expired' ? 'Token has expired. Please generate a new link.' : 'Token is invalid.'
              })
            );
          }

          if (status === 'pending') {
            return McpUtilities.createTextResponse(
              JSON.stringify({
                status: 'pending',
                message: 'Location not yet confirmed. User must grant permission.'
              })
            );
          }

          const coords = LocationTokenService.getCoordinates(token);
          if (!coords) {
            return McpUtilities.createTextResponse(
              JSON.stringify({
                status: 'invalid',
                message: 'Location data not found.'
              })
            );
          }

          return McpUtilities.createTextResponse(
            JSON.stringify({
              status: 'confirmed',
              latitude: coords.latitude,
              longitude: coords.longitude,
              message: 'Location confirmed. Use these coordinates to find nearby facilities.'
            })
          );
        } catch (error) {
          return McpUtilities.createTextResponse(
            JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Failed to check location"
            })
          );
        }
      }
    );
  }
}

export const CheckLocationToolInstance = new CheckLocationTool();