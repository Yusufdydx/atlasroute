import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { McpUtilities } from "../mcp-utilities";
import { LocationTokenService } from "../location-token";
import * as fs from "fs";
import * as path from "path";

class InstantLocateTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "InstantLocate",
      {
        description:
          "Generates a secure link for the user to share their current location via GPS. " +
          "Use patient's FHIR record context if available to provide relevant location-based services. " +
          "The user must click the link, grant location permission, then return to confirm. Location is only used for this request and is not stored after.\n\nGUIDANCE: After returning the link, instruct the user to:\n1. Click the link\n2. Grant location permission when prompted\n3. Return and confirm they have done so\nYou can then check the location status using the CheckLocation tool.\n\nIMPORTANT:\n- Do not store location - it's only used for this request and expires\n- If the user reports token expired, generate a new link automatically\n- If no facilities found within radius, offer to expand the search",
        inputSchema: z.object({
          expiresInHours: z.number().optional().describe("Token expiration time in hours (default: 30 mins, use 100 for 100 hours)"),
        }),
      },
      async (args: { expiresInHours?: number }) => {
        try {
          const port = process.env.PORT || "5000";
          const host = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
          
          const expiresInMs = args.expiresInHours ? args.expiresInHours * 60 * 60 * 1000 : undefined;
          const locationToken = LocationTokenService.createToken(undefined, expiresInMs);

          const link = `${host}/getloc/${locationToken.token}`;
          const expiresInSeconds = expiresInMs ? expiresInMs / 1000 : 1800; // default 30 mins

          return McpUtilities.createTextResponse(
            JSON.stringify({
              link: link,
              token: locationToken.token,
              expiresIn: expiresInSeconds,
              message: "Link generated. User must grant location permission."
            })
          );
        } catch (error) {
          return McpUtilities.createTextResponse(
            JSON.stringify({
              error: true,
              message: error instanceof Error ? error.message : "Failed to generate location link"
            })
          );
        }
      }
    );
  }
}

export const InstantLocateToolInstance = new InstantLocateTool();