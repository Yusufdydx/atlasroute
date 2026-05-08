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
exports.PatientIdToolInstance = void 0;
const zod_1 = require("zod");
const fhir_client_1 = require("../fhir-client");
const mcp_utilities_1 = require("../mcp-utilities");
const null_utilities_1 = require("../null-utilities");
class PatientIdTool {
    registerTool(server, req) {
        server.registerTool("FindPatientId", {
            description: "Finds a patient id given a first name and last name. \n\nCORE BEHAVIOR: Resolve identity clearly. \n\nDISAMBIGUATION: If multiple matches, present clear, non-sensitive distinguishing attributes. Request confirmation before proceeding. Never output full sensitive identifiers; use partial masking. \n\nCLARITY: Keep response minimal and precise. If no match, state zero results and suggest alternative identifiers. \n\nADDITIONAL RULES: After confirmation, confirm back that the correct record has been selected. \n\nNO EXCITEMENT — purely administrative.",
            inputSchema: {
                firstName: zod_1.z.string().describe("The patient's first name").nonempty(),
                lastName: zod_1.z.string().describe("The patient's last name. This is optional").optional(),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ firstName, lastName }) {
            var _b, _c;
            let patients = yield this._patientSearcher(req, firstName, lastName);
            if (!(patients === null || patients === void 0 ? void 0 : patients.length)) {
                patients = yield this._patientSearcher(req, lastName, firstName);
            }
            if (patients && patients.length > 1) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    error: true,
                    message: "Multiple patients found",
                    patients: patients.map((p) => {
                        var _a, _b;
                        return ({
                            id: p.id,
                            name: ((_a = p.name) === null || _a === void 0 ? void 0 : _a[0])
                                ? `${(_b = p.name[0].given) === null || _b === void 0 ? void 0 : _b.join(" ")} ${p.name[0].family}`
                                : "Unknown",
                        });
                    }),
                    suggestion: "Provide more details like date of birth or middle name",
                }));
            }
            if (patients === null || patients === void 0 ? void 0 : patients[0]) {
                const patient = patients[0];
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    patientId: null_utilities_1.NullUtilities.getOrThrow(patient.id),
                    name: ((_b = patient.name) === null || _b === void 0 ? void 0 : _b[0])
                        ? `${(_c = patient.name[0].given) === null || _c === void 0 ? void 0 : _c.join(" ")} ${patient.name[0].family}`
                        : "Unknown",
                }));
            }
            return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                error: true,
                message: "No patient found",
                searchParams: { firstName, lastName },
            }));
        }));
    }
    _patientSearcher(req, searchFirstName, searchLastName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const searchParameters = [];
            if (searchFirstName) {
                searchParameters.push(`given=${searchFirstName}`);
            }
            if (searchLastName) {
                searchParameters.push(`family=${searchLastName}`);
            }
            const response = yield fhir_client_1.FhirClientInstance.search(req, "Patient", searchParameters);
            return ((_a = response === null || response === void 0 ? void 0 : response.entry) === null || _a === void 0 ? void 0 : _a.length)
                ? response.entry
                    .filter((x) => !!x.resource)
                    .map((x) => x.resource)
                : null;
        });
    }
}
exports.PatientIdToolInstance = new PatientIdTool();
