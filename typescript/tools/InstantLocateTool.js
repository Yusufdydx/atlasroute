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
exports.InstantLocateToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const location_token_1 = require("../location-token");
class InstantLocateTool {
    registerTool(server, req) {
        server.registerTool("InstantLocate", {
            description: "Generates a secure link for the user to share their current location via GPS. " +
                "Use patient's FHIR record context if available to provide relevant location-based services. " +
                "The user must click the link, grant location permission, then return to confirm. Location is only used for this request and is not stored after.\n\nGUIDANCE: After returning the link, instruct the user to:\n1. Click the link\n2. Grant location permission when prompted\n3. Return and confirm they have done so\nYou can then check the location status using the CheckLocation tool.\n\nIMPORTANT:\n- Do not store location - it's only used for this request and expires\n- If the user reports token expired, generate a new link automatically\n- If no facilities found within radius, offer to expand the search",
            inputSchema: zod_1.z.object({
                expiresInHours: zod_1.z.number().optional().describe("Token expiration time in hours (default: 30 mins, use 100 for 100 hours)"),
            }),
        }, (args) => __awaiter(this, void 0, void 0, function* () {
            try {
                const port = process.env.PORT || "5000";
                const host = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
                const expiresInMs = args.expiresInHours ? args.expiresInHours * 60 * 60 * 1000 : undefined;
                const locationToken = location_token_1.LocationTokenService.createToken(undefined, expiresInMs);
                const link = `${host}/getloc/${locationToken.token}`;
                const expiresInSeconds = expiresInMs ? expiresInMs / 1000 : 1800; // default 30 mins
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    link: link,
                    token: locationToken.token,
                    expiresIn: expiresInSeconds,
                    message: "Link generated. User must grant location permission."
                }));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    error: true,
                    message: error instanceof Error ? error.message : "Failed to generate location link"
                }));
            }
        }));
    }
}
exports.InstantLocateToolInstance = new InstantLocateTool();
