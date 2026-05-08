import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { FhirUtilities } from "../fhir-utilities";
import { McpUtilities } from "../mcp-utilities";
import { FhirClientInstance } from "../fhir-client";
import { fhirR4 } from "@smile-cdr/fhirts";

interface PatientContext {
  conditions: string[];
  medications: string[];
  allergies: string[];
  age?: number;
}

const RED_FLAG_PATTERNS: Record<string, string[]> = {
  chest: ["chest pain", "chest pressure", "chest tightness", "arm pain"],
  breathing: ["shortness breath", "difficulty breathing", "cant breathe"],
  bleeding: ["bleeding uncontrolled", "blood cough", "blood vomit"],
  neurological: ["seizure", "convulsion", "faint", "unconscious", "stroke"],
  severe: ["high fever", "severe pain", "cant move"],
};

class SymptomTriageTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.registerTool(
      "SymptomTriage",
      {
        description:
          "Evaluates symptoms through adaptive questioning. Returns data for AI to generate responses. \n\nCORE BEHAVIOR: Translate triage output into clear, user-friendly language. Do not expose internal classification fields directly. \n\nINTERPRETATION RULES: Convert clinical categories into understandable descriptions without using category labels directly. Frame outputs as possibilities, not conclusions. Emphasize uncertainty where appropriate (e.g., 'it's possible that', 'one interpretation is'). Present likely explanations proportionate to confidence: one if dominant, two or more if uncertainty is meaningful. \n\nTONE RULES: Apply empathy when symptoms imply discomfort or distress — reflect the user's state when reasonably clear; do not infer emotions that were not expressed. Maintain calm, non-alarming language even for higher urgency signals. For mild symptoms, keep tone light but respectful. \n\nQUESTION HANDLING RULES: If a follow-up question is available from the triage engine, integrate it naturally into the response flow. Avoid abrupt or interrogative tone. Frame the question as helpful clarification rather than a system prompt. \n\nSAFETY & ESCALATION RULES: Do not diagnose. Do not escalate unnecessarily. Highlight concerning signals without causing panic; use measured language. ESCALATION RULE: If symptoms suggest a possible emergency (e.g., chest pain, difficulty breathing, sudden severe headache): Clearly recommend urgent medical attention. Keep tone calm but direct — do not rely only on a generic disclaimer. Recommend contacting local emergency services or going to the nearest emergency facility. Use region-neutral phrasing unless location is confirmed. For lower urgency but still concerning symptoms, suggest timely professional evaluation without alarm. \n\nCONTINUITY RULES: Incorporate prior responses into reasoning naturally by referencing earlier details. Maintain conversational flow across turns without repeating verbatim. \n\nEXCITEMENT FACTOR: When triage suggests low urgency and simple self-care, frame it as empowering. When the user provides a helpful detail, acknowledge its value.",
        inputSchema: {
          symptom: z.string().describe("User's symptom or health concern").nonempty(),
          previousResponses: z.array(z.object({ question: z.string(), answer: z.string() })).optional().describe("Previous Q&A"),
          currentQuestion: z.string().optional().describe("Follow-up question to answer"),
          userAnswer: z.string().optional().describe("User's answer"),
          intent: z.enum(["evaluate", "askQuestion", "classify"]).optional().describe("Intent"),
        },
      },
      async ({ symptom, previousResponses, currentQuestion, userAnswer, intent }) => {
        try {
          const patientId = FhirUtilities.getPatientIdIfContextExists(req);
          if (!patientId) {
            return McpUtilities.createTextResponse(JSON.stringify({ error: true, requiresPatient: true }));
          }

          const patientContext = await this.fetchPatientContext(req, patientId);
          if (!patientContext) {
            return McpUtilities.createTextResponse(JSON.stringify({ error: true, patientId }));
          }

          let responses = previousResponses || [];
          if (currentQuestion && userAnswer) {
            responses = [...responses, { question: currentQuestion, answer: userAnswer }];
          }

          const assessment = this.assessSymptom(symptom, responses, patientContext);
          const nextQuestion = this.generateFollowUpQuestion(symptom, assessment, responses);

          return McpUtilities.createTextResponse(JSON.stringify({
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
        } catch (error) {
          return McpUtilities.createTextResponse(JSON.stringify({ error: true, message: error instanceof Error ? error.message : "Unknown error" }));
        }
      }
    );
  }

  private async fetchPatientContext(req: Request, patientId: string): Promise<PatientContext | null> {
    const patient = await FhirClientInstance.read<fhirR4.Patient>(req, `Patient/${patientId}`);
    if (!patient) return null;

    const conditions = await this.fetchConditions(req, patientId);
    const medications = await this.fetchMedications(req, patientId);
    const allergies = await this.fetchAllergies(req, patientId);

    let age: number | undefined;
    if (patient.birthDate) {
      const birthDate = new Date(patient.birthDate);
      age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    return { conditions, medications, allergies, age };
  }

  private async fetchConditions(req: Request, patientId: string): Promise<string[]> {
    try {
      const response = await FhirClientInstance.search(req, "Condition", [`patient=${patientId}`]);
      return response?.entry?.map((e: any) => e.resource.code?.coding?.[0]?.display || e.resource.code?.text).filter(Boolean) || [];
    } catch { return []; }
  }

  private async fetchMedications(req: Request, patientId: string): Promise<string[]> {
    try {
      const response = await FhirClientInstance.search(req, "MedicationRequest", [`patient=${patientId}`]);
      return response?.entry?.map((e: any) => e.resource.medication?.coding?.[0]?.display || e.resource.medicationCodeableConcept?.text).filter(Boolean) || [];
    } catch { return []; }
  }

  private async fetchAllergies(req: Request, patientId: string): Promise<string[]> {
    try {
      const response = await FhirClientInstance.search(req, "AllergyIntolerance", [`patient=${patientId}`]);
      return response?.entry?.map((e: any) => e.resource.code?.coding?.[0]?.display || e.resource.code?.text).filter(Boolean) || [];
    } catch { return []; }
  }

  private checkRedFlags(symptom: string): string[] {
    const normalized = symptom.toLowerCase();
    const found: string[] = [];
    for (const [category, patterns] of Object.entries(RED_FLAG_PATTERNS)) {
      if (patterns.some(p => normalized.includes(p))) {
        found.push(category);
      }
    }
    return found;
  }

  private assessSymptom(symptom: string, responses: any[], context: PatientContext): any {
    const normalized = symptom.toLowerCase();
    const redFlags = this.checkRedFlags(symptom);
    
    let severity = "mild";
    let riskLevel = "low";
    let decision = "self_care";
    const dataPoints: string[] = [];

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
        if (decision === "self_care") decision = "monitor";
        dataPoints.push("progression");
      }
    }

    return { severity, riskLevel, decision, dataPoints };
  }

  private generateFollowUpQuestion(_symptom: string, assessment: any, responses: any[]): string | null {
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

  private getConversationHints(assessment: any, responses: any[], _context: PatientContext): any {
    return {
      askLocationIfUrgent: assessment.riskLevel === "high" || assessment.decision === "escalate",
      askMoreQuestions: responses.length < 3 && assessment.riskLevel !== "high",
      suggestSummary: responses.length >= 3,
      suggestNearby: assessment.riskLevel === "high" || assessment.decision === "escalate",
    };
  }
}

export const SymptomTriageToolInstance = new SymptomTriageTool();
