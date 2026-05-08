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
exports.FhirClientInstance = void 0;
const axios_1 = __importStar(require("axios"));
const fhir_utilities_1 = require("./fhir-utilities");
const audit_logger_1 = require("./audit-logger");
class FhirClient {
    read(req, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const fhirContext = this._getFhirContextOrThrow(req);
            return yield this._callAxios({
                method: "get",
                url: this._addPath(fhirContext, path),
            }, req, 'read');
        });
    }
    search(req, resourceType, searchParameters) {
        return __awaiter(this, void 0, void 0, function* () {
            const fhirContext = this._getFhirContextOrThrow(req);
            return yield this._callAxios({
                method: "get",
                url: this._addPath(fhirContext, `${resourceType}?${searchParameters.join("&")}`),
            }, req, 'search');
        });
    }
    getPatientAllergies(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fhirContext = this._getFhirContextOrThrow(req);
            return yield this._callAxios({
                method: "get",
                url: this._addPath(fhirContext, `AllergyIntolerance?patient=${patientId}`),
            }, req, 'search');
        });
    }
    getPatientCoverage(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fhirContext = this._getFhirContextOrThrow(req);
            return yield this._callAxios({
                method: "get",
                url: this._addPath(fhirContext, `Coverage?beneficiary=Patient/${patientId}`),
            }, req, 'search');
        });
    }
    getPatientConditions(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fhirContext = this._getFhirContextOrThrow(req);
            return yield this._callAxios({
                method: "get",
                url: this._addPath(fhirContext, `Condition?patient=${patientId}&clinical-status=active`),
            }, req, 'search');
        });
    }
    getPatientRecentEncounters(req, patientId) {
        return __awaiter(this, void 0, void 0, function* () {
            const fhirContext = this._getFhirContextOrThrow(req);
            return yield this._callAxios({
                method: "get",
                url: this._addPath(fhirContext, `Encounter?patient=${patientId}&status=finished&_sort=-date&_count=5`),
            }, req, 'search');
        });
    }
    _callAxios(config_1, req_1) {
        return __awaiter(this, arguments, void 0, function* (config, req, action = 'read') {
            var _a, _b, _c;
            const fhirContext = this._getFhirContextOrThrow(req);
            const patientId = fhir_utilities_1.FhirUtilities.getPatientIdIfContextExists(req);
            const urlPath = config.url || '';
            const urlParts = urlPath.split('?');
            const pathSegment = ((_a = urlParts[0]) === null || _a === void 0 ? void 0 : _a.split('/')) || [];
            const resourceType = pathSegment[pathSegment.length - 1] || 'Unknown';
            if (fhirContext.token) {
                config.headers = Object.assign(Object.assign({}, config.headers), { Authorization: `Bearer ${fhirContext.token}` });
            }
            const maxRetries = 3;
            for (let attempt = 1; attempt <= maxRetries; attempt++) {
                try {
                    const response = yield (0, axios_1.default)(config);
                    audit_logger_1.AuditLogger.logFHIRAccess({
                        patientId: patientId || undefined,
                        action,
                        resourceType,
                        success: true,
                        requestId: audit_logger_1.AuditLogger.getRequestId(req),
                        ipAddress: audit_logger_1.AuditLogger.getClientIp(req)
                    });
                    return response.data;
                }
                catch (error) {
                    const isRetryable = (0, axios_1.isAxiosError)(error) && (!((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) ||
                        error.response.status >= 500 ||
                        error.code === 'ECONNREFUSED' ||
                        error.code === 'ETIMEDOUT');
                    if (attempt === maxRetries || !isRetryable) {
                        const errorMsg = error instanceof Error ? error.message : String(error);
                        audit_logger_1.AuditLogger.logFHIRAccess({
                            patientId: patientId || undefined,
                            action,
                            resourceType,
                            success: false,
                            errorMessage: errorMsg,
                            requestId: audit_logger_1.AuditLogger.getRequestId(req),
                            ipAddress: audit_logger_1.AuditLogger.getClientIp(req)
                        });
                        if ((0, axios_1.isAxiosError)(error) && ((_c = error.response) === null || _c === void 0 ? void 0 : _c.status) === 404) {
                            return null;
                        }
                        throw error;
                    }
                    const delay = Math.pow(2, attempt) * 1000;
                    yield new Promise(r => setTimeout(r, delay));
                }
            }
            return null;
        });
    }
    _getFhirContextOrThrow(req) {
        const fhirContext = fhir_utilities_1.FhirUtilities.getFhirContext(req);
        if (!fhirContext) {
            throw new Error("The fhir context could not be retrieved");
        }
        return fhirContext;
    }
    _addPath(fhirContext, path) {
        if (path.startsWith("/")) {
            path = path.substring(1);
        }
        return `${fhirContext.url}/${path}`;
    }
}
exports.FhirClientInstance = new FhirClient();
