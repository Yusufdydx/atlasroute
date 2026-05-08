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
  birthDate?: string;
  gender?: string;
}

class MedicalSummaryTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
server.registerTool(
      "GenerateMedicalSummary",
      {
        description:
          "Generates a structured, comprehensive summary of the patient's current health issue and relevant medical context for healthcare professionals. \n\nCORE BEHAVIOR: Produce structured, clinical-grade summary. \n\nSTRUCTURE REQUIREMENTS (MANDATORY): Presenting Complaint, Symptom Characteristics, Key Findings, Risk Indicators, Relevant Responses, (Optional) Medical History if enabled. \n\nTONE: Strictly professional and clinical. No empathy, no conversational language. Use precise medical terminology where appropriate. \n\nCONTENT & COMPRESSION RULES: Preserve accuracy and completeness. Avoid interpretation beyond provided triage data. Ensure clarity for healthcare professionals. If any mandatory section is empty, state that it was not reported. Prioritize signal over volume; remove redundant phrasing. Keep each section concise while preserving key clinical details. \n\nPERFORMANCE ENHANCEMENT: Order sections logically from most to least clinically relevant. Use clear visual separation for section headers (when output format allows). Keep bullet points parallel in structure. \n\nNO EXCITEMENT — this is a clinical document.",
        inputSchema: {
          triageData: z.object({
            symptom: z.string(),
            normalizedSymptom: z.string(),
            category: z.string(),
            severity: z.string(),
            riskLevel: z.string(),
            decision: z.string(),
            findings: z.array(z.string()),
            reasoning: z.array(z.string()),
            responses: z.array(z.object({ question: z.string(), answer: z.string() })),
          }).describe("Data from SymptomTriage tool"),
          includeHistory: z.boolean().optional().describe("Include patient's medical history in summary"),
        },
      },
     
      async ({ triageData, includeHistory }) => {
        try {
          let patientId = FhirUtilities.getPatientIdIfContextExists(req);

          if (!patientId) {
            return McpUtilities.createTextResponse(
              JSON.stringify({
                error: true,
                message: "No patient context",
                requiresPatient: true,
              })
            );
          }

          const patientContext = await this.fetchPatientContext(req, patientId);

          if (!patientContext) {
            return McpUtilities.createTextResponse(
              JSON.stringify({
                error: true,
                message: "Could not fetch patient data",
                patientId: patientId,
              })
            );
          }

          const summary = this.generateSummary(
            triageData,
            includeHistory ?? true,
            patientContext
          );

          return McpUtilities.createTextResponse(JSON.stringify(summary));
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          return McpUtilities.createTextResponse(
            JSON.stringify({
              error: true,
              message: errorMessage,
            })
          );
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
      const today = new Date();
      age = Math.floor((today.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    }

    return { conditions, medications, allergies, age, birthDate: patient.birthDate, gender: patient.gender };
  }

  private async fetchConditions(req: Request, patientId: string): Promise<string[]> {
    try {
      const response = await FhirClientInstance.search(req, "Condition", [`patient=${patientId}`]);
      return response?.entry?.map((e: any) => e.resource.code?.coding?.[0]?.display || e.resource.code?.text || "Unknown").filter(Boolean) || [];
    } catch { return []; }
  }

  private async fetchMedications(req: Request, patientId: string): Promise<string[]> {
    try {
      const response = await FhirClientInstance.search(req, "MedicationRequest", [`patient=${patientId}`]);
      return response?.entry?.map((e: any) => e.resource.medication?.coding?.[0]?.display || e.resource.medicationCodeableConcept?.text || "Unknown").filter(Boolean) || [];
    } catch { return []; }
  }

  private async fetchAllergies(req: Request, patientId: string): Promise<string[]> {
    try {
      const response = await FhirClientInstance.search(req, "AllergyIntolerance", [`patient=${patientId}`]);
      return response?.entry?.map((e: any) => e.resource.code?.coding?.[0]?.display || e.resource.code?.text || "Unknown").filter(Boolean) || [];
    } catch { return []; }
  }

  private generateSummary(
    triageData: any,
    includeHistory: boolean,
    context: PatientContext
  ): any {
    const sections: any = {
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
        assessment: triageData.responses.map((r: any) => `${r.question}: ${r.answer}`),
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

  private extractDuration(responses: Array<{ question: string; answer: string }>): string {
    const durationResponse = responses.find(r => 
      r.question.toLowerCase().includes("how long") || 
      r.question.toLowerCase().includes("when did it start")
    );
    return durationResponse?.answer || "Not specified";
  }

  private mapDecisionToRecommendation(decision: string): string {
    const decisionMap: Record<string, string> = {
      self_care: "Self-care recommended. Monitor symptoms.",
      monitor: "Monitor closely. Seek care if worsens.",
      escalate: "Seek medical attention promptly.",
      urgent: "Urgent medical attention required.",
    };
    return decisionMap[decision] || "Refer for evaluation.";
  }

  private generateRecommendations(triageData: any, context: PatientContext): string[] {
    const recommendations: string[] = [];

    if (triageData?.riskLevel === "high" || triageData?.decision === "escalate") {
      recommendations.push("Immediate medical evaluation recommended");
      recommendations.push("Consider emergency services if severe");
    }

    if (triageData?.riskLevel === "moderate" || triageData?.decision === "monitor") {
      recommendations.push("Schedule outpatient appointment");
      recommendations.push("Monitor symptoms daily");
      recommendations.push("Return if symptoms worsen");
    }

    if (triageData?.riskLevel === "low") {
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

export const MedicalSummaryToolInstance = new MedicalSummaryTool();
