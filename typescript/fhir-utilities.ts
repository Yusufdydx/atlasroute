import { Request } from "express";
import { FhirContext } from "./fhir-context";
import { FacilityResult } from "./overpass";
import * as jose from "jose";
import { McpConstants } from "./mcp-constants";

export const FhirUtilities = {
  getFhirContext: (req: Request): FhirContext | null => {
    const headers = req.headers;
    const url = headers[McpConstants.FhirServerUrlHeaderName]?.toString();

    if (!url) {
      return null;
    }

    const token = headers[McpConstants.FhirAccessTokenHeaderName]?.toString();
    return { url, token };



    
  },
  getPatientIdIfContextExists: (req: Request) => {
    const fhirToken =
      req.headers[McpConstants.FhirAccessTokenHeaderName]?.toString();

    if (fhirToken) {
      const claims = jose.decodeJwt(fhirToken);
      if (claims["patient"]) {
        return claims["patient"]?.toString();
      }
    }

    return req.headers[McpConstants.PatientIdHeaderName]?.toString() || null;
  },

  toFhirLocation(facility: FacilityResult) {
    const typeCode = facility.type === 'hospital' ? 'HOSP' : 'SITE';
    const typeDisplay = facility.type.charAt(0).toUpperCase() + facility.type.slice(1);
    
    return {
      resourceType: "Location" as const,
      id: String(facility.id),
      status: "active" as const,
      name: facility.name,
      physicalType: {
        coding: [{
          system: "http://terminology.hl7.org/CodeSystem/location-type",
          code: typeCode,
          display: typeDisplay
        }]
      },
      position: {
        latitude: facility.latitude,
        longitude: facility.longitude
      },
      address: facility.address ? [{
        text: facility.address
      }] : undefined,
      telecom: facility.phone ? [{
        system: "phone" as const,
        value: facility.phone
      }] : undefined
    };
  }
};
