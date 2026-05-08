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
exports.PatientAgeToolInstance = void 0;
const zod_1 = require("zod");
const fhir_utilities_1 = require("../fhir-utilities");
const mcp_utilities_1 = require("../mcp-utilities");
const date_fns_1 = require("date-fns");
const null_utilities_1 = require("../null-utilities");
const fhir_client_1 = require("../fhir-client");
class PatientAgeTool {
    registerTool(server, req) {
        server.registerTool("GetPatientAge", {
            description: "Gets the age of a patient. \n\nCORE BEHAVIOR: Provide age clearly. \n\nUSAGE: Integrate age into context only if relevant to the current task. If age is at an extreme (very young or very old), note implications carefully. \n\nTONE: Neutral and concise. \n\nADDITIONAL RULES: If age conflicts with reported symptoms or typical patterns, highlight the discrepancy for review. \n\nEXCITEMENT: Not applicable.",
            inputSchema: {
                patientId: zod_1.z.string().describe("The id of the patient. This is optional if patient context already exists").optional(),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ patientId }) {
            if (!patientId) {
                patientId = null_utilities_1.NullUtilities.getOrThrow(fhir_utilities_1.FhirUtilities.getPatientIdIfContextExists(req));
            }
            const patient = yield fhir_client_1.FhirClientInstance.read(req, `Patient/${patientId}`);
            if (!patient) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    error: true,
                    message: "Patient not found",
                    patientId: patientId,
                }));
            }
            if (!patient.birthDate) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    error: true,
                    message: "Birth date not found",
                    patientId: patientId,
                }));
            }
            try {
                const date = (0, date_fns_1.parseISO)(patient.birthDate);
                const age = (0, date_fns_1.differenceInYears)(new Date(), date);
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    patientId: patientId,
                    birthDate: patient.birthDate,
                    age: age,
                }));
            }
            catch (_b) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    error: true,
                    message: "Could not parse birth date",
                    birthDate: patient.birthDate,
                }));
            }
        }));
    }
}
exports.PatientAgeToolInstance = new PatientAgeTool();
