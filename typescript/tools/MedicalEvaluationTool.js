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
exports.MedicalEvaluationToolInstance = void 0;
const zod_1 = require("zod");
const fhir_utilities_1 = require("../fhir-utilities");
const mcp_utilities_1 = require("../mcp-utilities");
const fhir_client_1 = require("../fhir-client");
const CATEGORY_KEYWORDS = {
    food: ["garri", "indomie", "rice", "bread", "fried rice", "eba", "fufu", "yam", "cassava", "beans", "meat", "fish", "egg", "chicken", "vegetables", "fruits", "spicy", "pepper", "soup", "stew", "sugar", "salt", "coke", "juice"],
    medicine: ["paracetamol", "ibuprofen", "aspirin", "amoxicillin", "ciprofloxacin", "metronidazole", "azithromycin", "cephalexin", "diclofenac", "tramadol", "panadol", "advil", "tylenol", "drug", "medication"],
    cream: ["cream", "lotion", "ointment", "body cream", "skin cream", "soap", "shampoo", "antifungal", "steroid cream", "moisturizer"],
    drink: ["coca cola", "coke", "pepsi", "alcohol", "wine", "beer", "spirit", "coffee", "tea", "energy drink", "juice", "water", "herbal tea"],
    supplement: ["vitamin", "supplement", "protein", "multivitamin", "iron", "calcium", "zinc", "magnesium", "fish oil", "omega", "herbs", "agbo"],
    activity: ["gym", "running", "jogging", "football", "basketball", "tennis", "swimming", "cycling", "yoga", "exercise", "workout", "lifting weights", "heavy lifting", "skipping", "boxing"],
    lifestyle: ["fasting", "skip meals", "sleep late", "night shift", "travel", "long distance", "stress", "smoking", "weed"],
    clothing: ["shoes", "heels", "tight shoes", "compression socks", "tight clothes", "belt", "footwear", "sneakers", "boots"],
    device: ["blood pressure monitor", "bp monitor", "glucometer", "glucose meter", "thermometer", "pulse oximeter", "weighing scale"],
    herbal: ["agbo", "herbal", "bitter leaf", "herbal mixture", "local remedy", "traditional medicine", "herbs", "concoction"],
};
class MedicalEvaluationTool {
    registerTool(server, req) {
        server.registerTool("EvaluateMedicalSuitability", {
            description: "Evaluates items against patient medical context. Returns data for AI response generation. \n\nCORE BEHAVIOR: Assess based on patient context without giving directives. \n\nINTERPRETATION RULES: Explain reasoning using conditions, medications, allergies without prescribing. Present suitability as a range or with conditional language (e.g., 'likely suitable with precautions'). \n\nTONE: Cautious and informative, not authoritative. Use guideline-oriented phrasing (e.g., 'would typically be considered', 'guidelines suggest'). \n\nCONSTRAINTS: Do not issue medical advice. Do not present evaluation as final decision; always defer to an in-person clinician. \n\nUNCERTAINTY: Clearly reflect limitations of the evaluation based on reported data. If information is missing, state that and suggest confirmation. \n\nEXCITEMENT: NONE — maintain a serious and careful tone.",
            inputSchema: {
                target: zod_1.z.string().describe("Item to evaluate").nonempty(),
                targetDescription: zod_1.z.string().optional().describe("Additional details"),
                userQuestion: zod_1.z.string().optional().describe("User's question"),
                intent: zod_1.z.enum(["appropriateness", "necessity", "risk", "safety"]).optional().describe("Evaluation type"),
            },
        }, (_a) => __awaiter(this, [_a], void 0, function* ({ target, targetDescription, userQuestion, intent }) {
            try {
                const patientId = fhir_utilities_1.FhirUtilities.getPatientIdIfContextExists(req);
                if (!patientId) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, requiresPatient: true }));
                }
                const patientContext = yield this.fetchPatientContext(req, patientId);
                if (!patientContext) {
                    return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({ error: true, patientId }));
                }
                const category = this.detectCategory(target);
                const userIntent = intent || this.inferIntent(userQuestion || target);
                const evaluation = this.evaluateTarget(target, category, patientContext);
                return mcp_utilities_1.McpUtilities.createTextResponse(JSON.stringify({
                    target,
                    targetDescription,
                    category,
                    intent: userIntent,
                    evaluation,
                    patientContext: {
                        conditions: patientContext.conditions,
                        medications: patientContext.medications,
                        allergies: patientContext.allergies,
                        age: patientContext.age,
                    },
                    conversationHints: this.getConversationHints(category, evaluation, patientContext),
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
    detectCategory(target) {
        const normalized = target.toLowerCase();
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(k => normalized.includes(k)))
                return category;
        }
        return "general";
    }
    inferIntent(input) {
        const normalized = input.toLowerCase();
        if (normalized.includes("can i") || normalized.includes("is it okay"))
            return "appropriateness";
        if (normalized.includes("do i need") || normalized.includes("should i buy"))
            return "necessity";
        if (normalized.includes("safe") || normalized.includes("dangerous"))
            return "safety";
        return "appropriateness";
    }
    evaluateTarget(target, category, context) {
        const normalized = target.toLowerCase();
        const conditions = context.conditions.map(c => c.toLowerCase());
        const medications = context.medications.map(m => m.toLowerCase());
        const allergies = context.allergies.map(a => a.toLowerCase());
        let decision = "unknown";
        let riskLevel = "unknown";
        const relevantConditions = [];
        const dataPoints = [];
        if (allergies.some(a => normalized.includes(a))) {
            decision = "avoid";
            riskLevel = "high";
            dataPoints.push("allergy_match");
        }
        if (category === "alcohol" && medications.length > 0) {
            decision = "caution";
            riskLevel = riskLevel === "high" ? "high" : "moderate";
            dataPoints.push("medication_interaction_risk");
        }
        if (category === "activity") {
            if (conditions.some(c => c.includes("heart") || c.includes("hypertension") || c.includes("cardiac"))) {
                decision = decision === "unknown" ? "caution" : decision;
                riskLevel = riskLevel === "unknown" ? "moderate" : riskLevel;
                relevantConditions.push("cardiovascular");
            }
            if (conditions.some(c => c.includes("diabetes"))) {
                decision = decision === "unknown" ? "caution" : decision;
                riskLevel = riskLevel === "unknown" ? "moderate" : riskLevel;
                relevantConditions.push("diabetes");
            }
        }
        if (category === "food") {
            if (conditions.some(c => c.includes("diabetes")) && normalized.includes("sugar")) {
                decision = decision === "unknown" ? "caution" : decision;
                riskLevel = riskLevel === "unknown" ? "moderate" : riskLevel;
            }
            if (conditions.some(c => c.includes("hypertension")) && (normalized.includes("salt") || normalized.includes("processed"))) {
                decision = decision === "unknown" ? "caution" : decision;
                riskLevel = riskLevel === "unknown" ? "moderate" : riskLevel;
            }
        }
        if (category === "device") {
            if ((normalized.includes("blood pressure") || normalized.includes("bp")) && conditions.some(c => c.includes("hypertension"))) {
                decision = "recommended";
                riskLevel = "low";
            }
            if (normalized.includes("glucometer") && conditions.some(c => c.includes("diabetes"))) {
                decision = "recommended";
                riskLevel = "low";
            }
        }
        if (context.age !== undefined && context.age > 65 && category === "activity") {
            if (normalized.includes("heavy") || normalized.includes("intense")) {
                decision = decision === "unknown" ? "caution" : decision;
                dataPoints.push("age_factor");
            }
        }
        if (decision === "unknown") {
            decision = "safe";
            riskLevel = "low";
        }
        return { decision, riskLevel, relevantConditions, dataPoints };
    }
    getConversationHints(category, evaluation, context) {
        return {
            askLocationIfUrgent: evaluation.riskLevel === "high" || evaluation.decision === "avoid",
            askMoreContext: context.conditions.length === 0 || context.medications.length === 0,
            suggestSummary: evaluation.riskLevel === "high",
            suggestNearby: category === "medicine" || category === "device" || evaluation.decision === "avoid",
        };
    }
}
exports.MedicalEvaluationToolInstance = new MedicalEvaluationTool();
