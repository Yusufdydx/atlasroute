import { Request } from "express";

export interface AuditEntry {
  timestamp: string;
  service: string;
  action: 'read' | 'search' | 'create' | 'update' | 'delete';
  resourceType: string;
  patientId?: string;
  userId?: string;
  success: boolean;
  errorMessage?: string;
  requestId?: string;
  ipAddress?: string;
}

export class AuditLogger {
  private static serviceName = 'PO-MCP-Server';

  static logFHIRAccess(params: {
    patientId?: string;
    action: AuditEntry['action'];
    resourceType: string;
    success: boolean;
    errorMessage?: string;
    requestId?: string;
    ipAddress?: string;
  }) {
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      ...params
    };
    console.log('[AUDIT]', JSON.stringify(entry));
    return entry;
  }

  static logToolInvocation(params: {
    toolName: string;
    parameters?: Record<string, unknown>;
    resultCount?: number;
    success: boolean;
    errorMessage?: string;
    patientId?: string;
  }) {
    const entry = {
      timestamp: new Date().toISOString(),
      service: this.serviceName,
      action: 'search' as const,
      resourceType: `Tool.${params.toolName}`,
      patientId: params.patientId,
      success: params.success,
      errorMessage: params.errorMessage
    };
    console.log('[AUDIT]', JSON.stringify(entry));
    return entry;
  }

  static getRequestId(req: Request): string {
    return req.headers['x-request-id'] as string || 
           Math.random().toString(36).substring(2, 15);
  }

  static getClientIp(req: Request): string {
    return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
           req.socket?.remoteAddress ||
           'unknown';
  }
}