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
exports.SymptomTriageToolInstance = void 0;
const zod_1 = require("zod");
const fhir_utilities_1 = require("../fhir-utilities");
const mcp_utilities_1 = require("../mcp-utilities");
const fhir_client_1 = require("../fhir-client");
const RED_FLAG_PATTERNS = {
    chest: ["chest pain", "chest pressure", "chest tightness", "arm pain"],
    breathing: ["shortness breath", "difficulty breathing", "cant breathe"],
    bleeding: ["bleeding uncontrolled", "blood cough", "blood vomit"],
    neurological: ["seizure", "convulsion", "faint", "unconscious", "stroke"],
    severe: ["high fever", "severe pain", "cant move"],
};
class SymptomTriageTool {
    registerTool(server, req) {
        server.registerTool("SymptomTriage", {
            description: "Evaluates symptoms through adaptive questioning. Returns data for AI to generate responses. \n\nCORE BEHAVIOR: Translate triage output into clear, user-friendly language. Do not expose internal classification fields directly. \n\nINTERPRETATION RULES: Convert clinical categories into understandable descriptions without using category labels directly. Frame outputs as possibilities, not conclusions. Emphasize uncertainty where appropriate (e.g., 'it's possible that', 'one interpretation is'). Present likely explanations proportionate to confidence: one if dominant, two or more if uncertainty is meaningful. \n\nTONE RULES: Apply empathy when symptoms imply discomfort or distress — reflect the user's state when reasonably clear; do not infer emotions that were not expressed. Maintain calm, non-alarming language even for higher urgency signals. For mild symptoms, keep tone light but respectful. \n\nQUESTION HANDLING RULES: If a follow-up question is available from the triage engine, integrate it naturally into the response flow. Avoid abrupt or interrogative tone. Frame the question as helpful clarification rather than a system prompt. \n\nSAFETY & ESCALATION RULES: Do not diagnose. Do not escalate unnecessarily. Highlight concerning signals without causing panic; use measured language. ESCALATION RULE: If symptoms suggest a possible emergency (e.g., chest pain, difficulty breathing, sudden severe headache): Clearly recommend urgent medical attention. Keep tone calm but direct — do not rely only on a generic disclaimer. Recommend contacting local emergency services or going to the nearest emergency facility. Use region-neutral phrasing unless location is confirmed. For lower urgency but still concerning symptoms, suggest timely professional evaluation without alarm. \n\nCONTINUITY RULES: Incorporate prior responses into reasoning naturally by referencing earlier details. Maintain conversational flow across turns without repeating verbatim. \n\nEXCITEMENT FACTOR: When triage suggests low urgency and simple self-care, frame it as empowering. When the user provides a helpful detail, acknowledge its value.",
            inputSchema: {
                symptom: zod_1.z.string().describe("User's symptom or health concern").nonempty(),
                previousResponses: zod_1.z.array(zod_1.z.object({ question: zod_1.z.string(), answer: zod_1.z.string() })).optional().describe("Previous Q&A"),
                currentQuestion: zod_1.z.string().optional().describe("Follow-up question to answer"),
                userAnswer: zod_1.z.string().optional().describe("User's answer"),
                intent: zod_1.z.enum(["evaluate", "askQuestion", "classify"]).optional().describe("Intent"),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ symptom, previousResponses, currentQuestion, userAnswer, intent }) {
            try {
                const patientId = fhir_utilities_1.FhirUtilities.getPatientIdIfContextExists(req);
                if (!patientId) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, requiresPatient: true }));
                }
                const patientContext = yield this.fetchPatientContext(req, patientId);
                if (!patientContext) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, patientId }));
                }
                let responses = previousResponses || [];
                if (currentQuestion && userAnswer) {
                    responses = [...responses, { question: currentQuestion, answer: userAnswer }];
                }
                const assessment = this.assessSymptom(symptom, responses, patientContext);
                const nextQuestion = this.generateFollowUpQuestion(symptom, assessment, responses);
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    intent: intent || "evaluate",
                    symptom,
                    assessment,
                    responses,
                    nextQuestion,
                    patientContext: {
                        conditions: patientContext.conditions,
                        medications: patientContext.medications,
                        allergies: patientContext.allergies,
                        age: patientContext.age,
                    },
                    conversationHints: this.getConversationHints(assessment, responses, patientContext),
                }));
            }
            catch (error) {
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" }));
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
                age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
            }
            return { conditions, medications, allergies, age };
        });
    }
    fetchConditions(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const response = yield fhir_client_1.FhirClientInstance.search(req, "Condition", [`patient=${patientId}`]);
                return ((_a = response === null || response === void 0 ? void 0 : response.entry) === null || _a === void 0 ? void 0 : _a.map((e) => { var _a, _b, _c, _d; return ((_c = (_b = (_a = e.resource.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.display) || ((_d = e.resource.code) === null || _d === void 0 ? void 0 : _d.text); }).filter(Boolean)) || [];
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
                return ((_a = response === null || response === void 0 ? void 0 : response.entry) === null || _a === void 0 ? void 0 : _a.map((e) => { var _a, _b, _c, _d; return ((_c = (_b = (_a = e.resource.medication) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.display) || ((_d = e.resource.medicationCodeableConcept) === null || _d === void 0 ? void 0 : _d.text); }).filter(Boolean)) || [];
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
                return ((_a = response === null || response === void 0 ? void 0 : response.entry) === null || _a === void 0 ? void 0 : _a.map((e) => { var _a, _b, _c, _d; return ((_c = (_b = (_a = e.resource.code) === null || _a === void 0 ? void 0 : _a.coding) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.display) || ((_d = e.resource.code) === null || _d === void 0 ? void 0 : _d.text); }).filter(Boolean)) || [];
            }
            catch (_b) {
                return [];
            }
        });
    }
    checkRedFlags(symptom) {
        const normalized = symptom.toLowerCase();
        const found = [];
        for (const [category, patterns] of Object.entries(RED_FLAG_PATTERNS)) {
            if (patterns.some(p => normalized.includes(p))) {
                found.push(category);
            }
        }
        return found;
    }
    assessSymptom(symptom, responses, context) {
        const normalized = symptom.toLowerCase();
        const redFlags = this.checkRedFlags(symptom);
        let severity = "mild";
        let riskLevel = "low";
        let decision = "self_care";
        const dataPoints = [];
        if (redFlags.length > 0) {
            severity = "severe";
            riskLevel = "high";
            decision = "escalate";
            dataPoints.push("red_flags_present");
        }
        const conditions = context.conditions.map(c => c.toLowerCase());
        if (conditions.some(c => c.includes("heart") || c.includes("hypertension") || c.includes("cardiac"))) {
            if (normalized.includes("chest") || normalized.includes("heart") || normalized.includes("pain")) {
                riskLevel = riskLevel === "low" ? "moderate" : riskLevel;
                dataPoints.push("cardiac_history");
            }
        }
        if (conditions.some(c => c.includes("asthma") || c.includes("copd") || c.includes("lung"))) {
            if (normalized.includes("breath") || normalized.includes("wheezing")) {
                riskLevel = riskLevel === "low" ? "moderate" : riskLevel;
                dataPoints.push("respiratory_history");
            }
        }
        if (context.age !== undefined && context.age > 65) {
            if (normalized.includes("dizziness") || normalized.includes("faint")) {
                riskLevel = riskLevel === "low" ? "moderate" : riskLevel;
                dataPoints.push("age_risk");
            }
        }
        for (const response of responses) {
            const answer = response.answer.toLowerCase();
            if (answer.includes("severe") || answer.includes("high") || answer.includes("worst")) {
                if (severity !== "severe") {
                    severity = "moderate";
                    riskLevel = riskLevel === "low" ? "moderate" : riskLevel;
                }
            }
            if (answer.includes("worsening") || answer.includes("getting worse")) {
                if (decision === "self_care")
                    decision = "monitor";
                dataPoints.push("progression");
            }
        }
        return { severity, riskLevel, decision, dataPoints };
    }
    generateFollowUpQuestion(_symptom, assessment, responses) {
        if (responses.length >= 3 || assessment.riskLevel === "high" || assessment.decision === "escalate") {
            return null;
        }
        const answered = responses.map(r => r.question.toLowerCase().substring(0, 15));
        const topics = ["duration", "severity", "onset", "triggers", "associated"];
        for (const topic of topics) {
            if (!answered.some(a => a.includes(topic))) {
                return topic;
            }
        }
        return null;
    }
    getConversationHints(assessment, responses, _context) {
        return {
            askLocationIfUrgent: assessment.riskLevel === "high" || assessment.decision === "escalate",
            askMoreQuestions: responses.length < 3 && assessment.riskLevel !== "high",
            suggestSummary: responses.length >= 3,
            suggestNearby: assessment.riskLevel === "high" || assessment.decision === "escalate",
        };
    }
}
exports.SymptomTriageToolInstance = new SymptomTriageTool();
