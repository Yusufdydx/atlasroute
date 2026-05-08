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
exports.MedicalSummaryToolInstance = void 0;
const zod_1 = require("zod");
const fhir_utilities_1 = require("../fhir-utilities");
const mcp_utilities_1 = require("../mcp-utilities");
const fhir_client_1 = require("../fhir-client");
class MedicalSummaryTool {
    registerTool(server, req) {
        server.registerTool("GenerateMedicalSummary", {
            description: "Generates a structured, comprehensive summary of the patient's current health issue and relevant medical context for healthcare professionals. \n\nCORE BEHAVIOR: Produce structured, clinical-grade summary. \n\nSTRUCTURE REQUIREMENTS (MANDATORY): Presenting Complaint, Symptom Characteristics, Key Findings, Risk Indicators, Relevant Responses, (Optional) Medical History if enabled. \n\nTONE: Strictly professional and clinical. No empathy, no conversational language. Use precise medical terminology where appropriate. \n\nCONTENT & COMPRESSION RULES: Preserve accuracy and completeness. Avoid interpretation beyond provided triage data. Ensure clarity for healthcare professionals. If any mandatory section is empty, state that it was not reported. Prioritize signal over volume; remove redundant phrasing. Keep each section concise while preserving key clinical details. \n\nPERFORMANCE ENHANCEMENT: Order sections logically from most to least clinically relevant. Use clear visual separation for section headers (when output format allows). Keep bullet points parallel in structure. \n\nNO EXCITEMENT — this is a clinical document.",
            inputSchema: {
                triageData: zod_1.z.object({
                    symptom: zod_1.z.string(),
                    normalizedSymptom: zod_1.z.string(),
                    category: zod_1.z.string(),
                    severity: zod_1.z.string(),
                    riskLevel: zod_1.z.string(),
                    decision: zod_1.z.string(),
                    findings: zod_1.z.array(zod_1.z.string()),
                    reasoning: zod_1.z.array(zod_1.z.string()),
                    responses: zod_1.z.array(zod_1.z.object({ question: zod_1.z.string(), answer: zod_1.z.string() })),
                }).describe("Data from SymptomTriage tool"),
                includeHistory: zod_1.z.boolean().optional().describe("Include patient's medical history in summary"),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ triageData, includeHistory }) {
            try {
                let patientId = fhir_utilities_1.FhirUtilities.getPatientIdIfContextExists(req);
                if (!patientId) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                        error: true,
                        message: "No patient context",
                        requiresPatient: true,
                    }));
                }
                const patientContext = yield this.fetchPatientContext(req, patientId);
                if (!patientContext) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                        error: true,
                        message: "Could not fetch patient data",
                        patientId: patientId,
                    }));
                }
                const summary = this.generateSummary(triageData, includeHistory !== null && includeHistory !== void 0 ? includeHistory : true, patientContext);
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify(summary));
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    error: true,
                    message: errorMessage,
                }));
            }
        }));
    }
    fetchPatientContext(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const patient = yield fhir_client_1.FhirClientInstance.read(req, `Patient/${patientId}`);
            if (!patient)
                return null;
            const conditions = yield this.fetchConditions(req, patientId);
            const medications = yield this.fetchMedications(req, patientId);
            const allergies = yield this.fetchAllergies(req, patientId);
            let age;
            if (patient.birthDate) {
                const birthDate = new Date(patient.birthDate);
                const today = new Date();
                age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            }
            return { conditions, medications, allergies, age, birthDate: patient.birthDate, gender: patient.gender };
        });
    }
    fetchConditions(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield fhir_client_1.FhirClientInstance.search(req, "Condition", [`patient=${patientId}`]);
                return ((_a = response === null || response === void 0 ? void 0 : response.entry) === null || _a === void 0 ? void 0 : _a.map((e) => { var _a, _b, _c, _d; return ((_c = (_b = (_a = e.resource.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.display) || ((_d = e.resource.code) === null || _d === void 0 ? void 0 : _d.text) || "Unknown"; }).filter(Boolean)) || [];
            }
            catch (_b) {
                return [];
            }
        });
    }
    fetchMedications(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield fhir_client_1.FhirClientInstance.search(req, "MedicationRequest", [`patient=${patientId}`]);
                return ((_a = response === null || response === void 0 ? void 0 : response.entry) === null || _a === void 0 ? void 0 : _a.map((e) => { var _a, _b, _c, _d; return ((_c = (_b = (_a = e.resource.medication) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.display) || ((_d = e.resource.medicationCodeableConcept) === null || _d === void 0 ? void 0 : _d.text) || "Unknown"; }).filter(Boolean)) || [];
            }
            catch (_b) {
                return [];
            }
        });
    }
    fetchAllergies(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield fhir_client_1.FhirClientInstance.search(req, "AllergyIntolerance", [`patient=${patientId}`]);
                return ((_a = response === null || response === void 0 ? void 0 : response.entry) === null || _a === void 0 ? void 0 : _a.map((e) => { var _a, _b, _c, _d; return ((_c = (_b = (_a = e.resource.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.display) || ((_d = e.resource.code) === null || _d === void 0 ? void 0 : _d.text) || "Unknown"; }).filter(Boolean)) || [];
            }
            catch (_b) {
                return [];
            }
        });
    }
    generateSummary(triageData, includeHistory, context) {
        const sections = {
            header: {
                title: "Medical Consultation Summary",
                generatedAt: new Date().toISOString(),
                patientId: null,
            },
            presentingConcern: null,
            symptomCharacteristics: null,
            clinicalAssessment: null,
            relevantHistory: null,
            medications: null,
            allergies: null,
            recommendations: null,
        };
        if (triageData) {
            sections.presentingConcern = {
                chiefComplaint: triageData.symptom,
                category: triageData.category,
                duration: this.extractDuration(triageData.responses),
                severity: triageData.severity,
            };
            sections.symptomCharacteristics = {
                assessment: triageData.responses.map((r) => `${r.question}: ${r.answer}`),
                findings: triageData.findings,
            };
            sections.clinicalAssessment = {
                riskLevel: triageData.riskLevel,
                recommendation: this.mapDecisionToRecommendation(triageData.decision),
                clinicalReasoning: triageData.reasoning,
            };
        }
        if (includeHistory && context) {
            sections.relevantHistory = {
                conditions: context.conditions,
                age: context.age,
                gender: context.gender,
            };
            sections.medications = {
                currentMedications: context.medications,
            };
            sections.allergies = {
                knownAllergies: context.allergies,
            };
            sections.recommendations = {
                actions: this.generateRecommendations(triageData, context),
            };
        }
        return sections;
    }
    extractDuration(responses) {
        const durationResponse = responses.find(r => r.question.toLowerCase().includes("how long") ||
            r.question.toLowerCase().includes("when did it start"));
        return (durationResponse === null || durationResponse === void 0 ? void 0 : durationResponse.answer) || "Not specified";
    }
    mapDecisionToRecommendation(decision) {
        const decisionMap = {
            self_care: "Self-care recommended. Monitor symptoms.",
            monitor: "Monitor closely. Seek care if worsens.",
            escalate: "Seek medical attention promptly.",
            urgent: "Urgent medical attention required.",
        };
        return decisionMap[decision] || "Refer for evaluation.";
    }
    generateRecommendations(triageData, context) {
        const recommendations = [];
        if ((triageData === null || triageData === void 0 ? void 0 : triageData.riskLevel) === "high" || (triageData === null || triageData === void 0 ? void 0 : triageData.decision) === "escalate") {
            recommendations.push("Immediate medical evaluation recommended");
            recommendations.push("Consider emergency services if severe");
        }
        if ((triageData === null || triageData === void 0 ? void 0 : triageData.riskLevel) === "moderate" || (triageData === null || triageData === void 0 ? void 0 : triageData.decision) === "monitor") {
            recommendations.push("Schedule outpatient appointment");
            recommendations.push("Monitor symptoms daily");
            recommendations.push("Return if symptoms worsen");
        }
        if ((triageData === null || triageData === void 0 ? void 0 : triageData.riskLevel) === "low") {
            recommendations.push("Self-care measures");
            recommendations.push("Over-the-counter options if appropriate");
            recommendations.push("Rest and hydration");
        }
        if (context.medications.length > 0) {
            recommendations.push("Review current medications for interactions");
        }
        if (context.allergies.length > 0) {
            recommendations.push("Note known allergies when prescribing");
        }
        return recommendations;
    }
}
exports.MedicalSummaryToolInstance = new MedicalSummaryTool();
