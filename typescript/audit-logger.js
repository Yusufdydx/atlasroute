"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditLogger = void 0;
class AuditLogger {
    static logFHIRAccess(params) {
        const entry = Object.assign({ timestamp: new Date().toISOString(), service: this.serviceName }, params);
        console.log('[AUDIT]', JSON.stringify(entry));
        return entry;
    }
    static logToolInvocation(params) {
        const entry = {
            timestamp: new Date().toISOString(),
            service: this.serviceName,
            action: 'search',
            resourceType: `Tool.${params.toolName}`,
            patientId: params.patientId,
            success: params.success,
            errorMessage: params.errorMessage
        };
        console.log('[AUDIT]', JSON.stringify(entry));
        return entry;
    }
    static getRequestId(req) {
        return req.headers['x-request-id'] ||
            Math.random().toString(36).substring(2, 15);
    }
    static getClientIp(req) {
        var _a, _b, _c;
        return ((_b = (_a = req.headers['x-forwarded-for']) === null || _a === void 0 ? void 0 : _a.split(',')[0]) === null || _b === void 0 ? void 0 : _b.trim()) ||
            ((_c = req.socket) === null || _c === void 0 ? void 0 : _c.remoteAddress) ||
            'unknown';
    }
}
exports.AuditLogger = AuditLogger;
AuditLogger.serviceName = 'PO-MCP-Server';
