import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { FhirUtilities } from "../fhir-utilities";
import { McpUtilities } from "../mcp-utilities";
import { differenceInYears, parseISO } from "date-fns";
import { NullUtilities } from "../null-utilities";
import { FhirClientInstance } from "../fhir-client";
import { fhirR4 } from "@smile-cdr/fhirts";

class PatientAgeTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
server.registerTool(
      "GetPatientAge",
      {
        description:
          "Gets the age of a patient. \n\nCORE BEHAVIOR: Provide age clearly. \n\nUSAGE: Integrate age into context only if relevant to the current task. If age is at an extreme (very young or very old), note implications carefully. \n\nTONE: Neutral and concise. \n\nADDITIONAL RULES: If age conflicts with reported symptoms or typical patterns, highlight the discrepancy for review. \n\nEXCITEMENT: Not applicable.",
        inputSchema: {
          patientId: z.string().describe("The id of the patient. This is optional if patient context already exists").optional(),
        },
      },
      async ({ patientId }) => {
        if (!patientId) {
          patientId = NullUtilities.getOrThrow(
            FhirUtilities.getPatientIdIfContextExists(req),
          );
        }

        const patient = await FhirClientInstance.read<fhirR4.Patient>(
          req,
          `Patient/${patientId}`,
        );
        if (!patient) {
          return McpUtilities.createTextResponse(
            JSON.stringify({
              error: true,
              message: "Patient not found",
              patientId: patientId,
            })
          );
        }

        if (!patient.birthDate) {
          return McpUtilities.createTextResponse(
            JSON.stringify({
              error: true,
              message: "Birth date not found",
              patientId: patientId,
            })
          );
        }

        try {
          const date = parseISO(patient.birthDate);
          const age = differenceInYears(new Date(), date);

          return McpUtilities.createTextResponse(
            JSON.stringify({
              patientId: patientId,
              birthDate: patient.birthDate,
              age: age,
            })
          );
        } catch {
          return McpUtilities.createTextResponse(
            JSON.stringify({
              error: true,
              message: "Could not parse birth date",
              birthDate: patient.birthDate,
            })
          );
        }
      },
    );
  }
}

export const PatientAgeToolInstance = new PatientAgeTool();
