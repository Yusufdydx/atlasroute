import { DomainResource } from "@smile-cdr/fhirts/dist/FHIR-R4/classes/domainResource";
import axios, { AxiosRequestConfig, isAxiosError } from "axios";
import { FhirUtilities } from "./fhir-utilities";
import { Request } from "express";
import { FhirContext } from "./fhir-context";
import { fhirR4 } from "@smile-cdr/fhirts";
import { AuditLogger } from "./audit-logger";

class FhirClient {
  async read<T extends DomainResource>(req: Request, path: string) {
    const fhirContext = this._getFhirContextOrThrow(req);

    return await this._callAxios<T>(
      {
        method: "get",
        url: this._addPath(fhirContext, path),
      },
      req,
      'read'
    );
  }

  async search(req: Request, resourceType: string, searchParameters: string[]) {
    const fhirContext = this._getFhirContextOrThrow(req);

    return await this._callAxios<fhirR4.Bundle>(
      {
        method: "get",
        url: this._addPath(
          fhirContext,
          `${resourceType}?${searchParameters.join("&")}`,
        ),
      },
      req,
      'search'
    );
  }

  async getPatientAllergies(req: Request, patientId: string) {
    const fhirContext = this._getFhirContextOrThrow(req);
    return await this._callAxios<fhirR4.Bundle>(
      {
        method: "get",
        url: this._addPath(fhirContext, `AllergyIntolerance?patient=${patientId}`),
      },
      req,
      'search'
    );
  }

  async getPatientCoverage(req: Request, patientId: string) {
    const fhirContext = this._getFhirContextOrThrow(req);
    return await this._callAxios<fhirR4.Bundle>(
      {
        method: "get",
        url: this._addPath(fhirContext, `Coverage?beneficiary=Patient/${patientId}`),
      },
      req,
      'search'
    );
  }

  async getPatientConditions(req: Request, patientId: string) {
    const fhirContext = this._getFhirContextOrThrow(req);
    return await this._callAxios<fhirR4.Bundle>(
      {
        method: "get",
        url: this._addPath(fhirContext, `Condition?patient=${patientId}&clinical-status=active`),
      },
      req,
      'search'
    );
  }

  async getPatientRecentEncounters(req: Request, patientId: string) {
    const fhirContext = this._getFhirContextOrThrow(req);
    return await this._callAxios<fhirR4.Bundle>(
      {
        method: "get",
        url: this._addPath(fhirContext, `Encounter?patient=${patientId}&status=finished&_sort=-date&_count=5`),
      },
      req,
      'search'
    );
  }

  private async _callAxios<T>(config: AxiosRequestConfig, req: Request, action: 'read' | 'search' | 'create' | 'update' = 'read') {
    const fhirContext = this._getFhirContextOrThrow(req);
    const patientId = FhirUtilities.getPatientIdIfContextExists(req);
    const urlPath = config.url || '';
    const urlParts = urlPath.split('?');
    const pathSegment = urlParts[0]?.split('/') || [];
    const resourceType = pathSegment[pathSegment.length - 1] || 'Unknown';
    
    if (fhirContext.token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${fhirContext.token}`,
      };
    }

    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios(config);
        AuditLogger.logFHIRAccess({
          patientId: patientId || undefined,
          action,
          resourceType,
          success: true,
          requestId: AuditLogger.getRequestId(req),
          ipAddress: AuditLogger.getClientIp(req)
        });
        return response.data as T;
      } catch (error) {
        const isRetryable = isAxiosError(error) && (
          !error.response?.status ||
          error.response.status >= 500 ||
          error.code === 'ECONNREFUSED' ||
          error.code === 'ETIMEDOUT'
        );
        
        if (attempt === maxRetries || !isRetryable) {
          const errorMsg = error instanceof Error ? error.message : String(error);
          AuditLogger.logFHIRAccess({
            patientId: patientId || undefined,
            action,
            resourceType,
            success: false,
            errorMessage: errorMsg,
            requestId: AuditLogger.getRequestId(req),
            ipAddress: AuditLogger.getClientIp(req)
          });
          if (isAxiosError(error) && error.response?.status === 404) {
            return null;
          }
          throw error;
        }
        
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(r => setTimeout(r, delay));
      }
    }
    return null;
  }

  private _getFhirContextOrThrow(req: Request) {
    const fhirContext = FhirUtilities.getFhirContext(req);
    if (!fhirContext) {
      throw new Error("The fhir context could not be retrieved");
    }

    return fhirContext;
  }

  private _addPath(fhirContext: FhirContext, path: string) {
    if (path.startsWith("/")) {
      path = path.substring(1);
    }

    return `${fhirContext.url}/${path}`;
  }
}

export const FhirClientInstance = new FhirClient();
