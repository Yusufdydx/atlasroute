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
exports.CheckLocationToolInstance = void 0;
const zod_1 = require("zod");
const mcp_utilities_1 = require("../mcp-utilities");
const location_token_1 = require("../location-token");
class CheckLocationTool {
    registerTool(server, req) {
        server.registerTool("CheckLocation", {
            description: "Check if a location confirmation token has been confirmed. Returns coordinates if confirmed, or status if pending/expired. " +
                "Use patient's FHIR record context if available to provide relevant location-based services.\n\nGUIDANCE:\n- If status is 'confirmed': use the returned coordinates to find facilities\n- If status is 'pending': inform the user to grant permission and return to confirm\n- If status is 'expired': generate a new InstantLocate link automatically\n- If status is 'invalid': generate a new InstantLocate link",
            inputSchema: zod_1.z.object({
                token: zod_1.z.string().describe("Token from InstantLocate response")
            }),
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ token }) {
            try {
                const status = location_token_1.LocationTokenService.getStatus(token);
                if (status === 'invalid' || status === 'expired') {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                        status: status,
                        message: status === 'expired' ? 'Token has expired. Please generate a new link.' : 'Token is invalid.'
                    }));
                }
                if (status === 'pending') {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                        status: 'pending',
                        message: 'Location not yet confirmed. User must grant permission.'
                    }));
                }
                const coords = location_token_1.LocationTokenService.getCoordinates(token);
                if (!coords) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                        status: 'invalid',
                        message: 'Location data not found.'
                    }));
                }
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    status: 'confirmed',
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                    message: 'Location confirmed. Use these coordinates to find nearby facilities.'
                }));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    error: true,
                    message: error instanceof Error ? error.message : "Failed to check location"
                }));
            }
        }));
    }
}
exports.CheckLocationToolInstance = new CheckLocationTool();
