"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FhirUtilities = void 0;
const jose = __importStar(require("jose"));
const mcp_constants_1 = require("./mcp-constants");
exports.FhirUtilities = {
    getFhirContext: (req) => {
        var _a, _b;
        const headers = req.headers;
        const url = (_a = headers[mcp_constants_1.McpConstants.FhirServerUrlHeaderName]) === null || _a === void 0 ? void 0 : _a.toString();
        if (!url) {
            return null;
        }
        const token = (_b = headers[mcp_constants_1.McpConstants.FhirAccessTokenHeaderName]) === null || _b === void 0 ? void 0 : _b.toString();
        return { url, token };
    },
    getPatientIdIfContextExists: (req) => {
        var _a, _b, _c;
        const fhirToken = (_a = req.headers[mcp_constants_1.McpConstants.FhirAccessTokenHeaderName]) === null || _a === void 0 ? void 0 : _a.toString();
        if (fhirToken) {
            const claims = jose.decodeJwt(fhirToken);
            if (claims["patient"]) {
                return (_b = claims["patient"]) === null || _b === void 0 ? void 0 : _b.toString();
            }
        }
        return ((_c = req.headers[mcp_constants_1.McpConstants.PatientIdHeaderName]) === null || _c === void 0 ? void 0 : _c.toString()) || null;
    },
    toFhirLocation(facility) {
        const typeCode = facility.type === 'hospital' ? 'HOSP' : 'SITE';
        const typeDisplay = facility.type.charAt(0).toUpperCase() + facility.type.slice(1);
        return {
            resourceType: "Location",
            id: String(facility.id),
            status: "active",
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
                    system: "phone",
                    value: facility.phone
                }] : undefined
        };
    }
};
