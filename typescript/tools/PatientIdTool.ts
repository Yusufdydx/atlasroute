import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { fhirR4 } from "@smile-cdr/fhirts";
import { FhirClientInstance } from "../fhir-client";
import { McpUtilities } from "../mcp-utilities";
import { NullUtilities } from "../null-utilities";

class PatientIdTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
server.registerTool(
      "FindPatientId",
      {
        description:
          "Finds a patient id given a first name and last name. \n\nCORE BEHAVIOR: Resolve identity clearly. \n\nDISAMBIGUATION: If multiple matches, present clear, non-sensitive distinguishing attributes. Request confirmation before proceeding. Never output full sensitive identifiers; use partial masking. \n\nCLARITY: Keep response minimal and precise. If no match, state zero results and suggest alternative identifiers. \n\nADDITIONAL RULES: After confirmation, confirm back that the correct record has been selected. \n\nNO EXCITEMENT — purely administrative.",
        inputSchema: {
          firstName: z.string().describe("The patient's first name").nonempty(),
          lastName: z.string().describe("The patient's last name. This is optional").optional(),
        },
      },
      async ({ firstName, lastName }) => {
        let patients = await this._patientSearcher(req, firstName, lastName);
        if (!patients?.length) {
          patients = await this._patientSearcher(req, lastName, firstName);
        }

        if (patients && patients.length > 1) {
          return McpUtilities.createTextResponse(
            JSON.stringify({
              error: true,
              message: "Multiple patients found",
              patients: patients.map((p) => ({
                id: p.id,
                name: p.name?.[0]
                  ? `${p.name[0].given?.join(" ")} ${p.name[0].family}`
                  : "Unknown",
              })),
              suggestion: "Provide more details like date of birth or middle name",
            })
          );
        }

        if (patients?.[0]) {
          const patient = patients[0];
          return McpUtilities.createTextResponse(
            JSON.stringify({
              patientId: NullUtilities.getOrThrow(patient.id),
              name: patient.name?.[0]
                ? `${patient.name[0].given?.join(" ")} ${patient.name[0].family}`
                : "Unknown",
            })
          );
        }

        return McpUtilities.createTextResponse(
          JSON.stringify({
            error: true,
            message: "No patient found",
            searchParams: { firstName, lastName },
          })
        );
      },
    );
  }

  private async _patientSearcher(
    req: Request,
    searchFirstName: string | null | undefined,
    searchLastName: string | null | undefined,
  ): Promise<fhirR4.Patient[] | null> {
    const searchParameters: string[] = [];
    if (searchFirstName) {
      searchParameters.push(`given=${searchFirstName}`);
    }

    if (searchLastName) {
      searchParameters.push(`family=${searchLastName}`);
    }

    const response = await FhirClientInstance.search(
      req,
      "Patient",
      searchParameters,
    );
    return response?.entry?.length
      ? response.entry
          .filter((x) => !!x.resource)
          .map((x) => x.resource as fhirR4.Patient)
      : null;
  }
}

export const PatientIdToolInstance = new PatientIdTool();
