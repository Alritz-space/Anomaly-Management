export type UserRole = 'Admin' | 'Finance Manager' | 'Viewer';

export type GuardrailSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export type GuardrailType =
  | 'Input Validation'
  | 'Prompt Injection'
  | 'Bulk Action Limit'
  | 'RBAC Restriction'
  | 'No-Action Abuse'
  | 'High-Impact Note'
  | 'Grounding Hallucination'
  | 'Format & Constraint'
  | 'Safety & Tone'
  | 'Cold-Start / Confidence'
  | 'Tenant Isolation'
  | 'Rate Limit';

export type GuardrailActionTaken =
  | 'passed'
  | 'blocked'
  | 'warned'
  | 'masked'
  | 'fallback'
  | 'rate_limited'
  | 'sanitized';

export interface GuardrailEvent {
  id: string;
  type: GuardrailType;
  severity: GuardrailSeverity;
  itemId?: string;
  actionTaken: GuardrailActionTaken;
  reason: string;
  details?: string;
  timestamp: string;
  tenantId?: string;
  user?: string;
}

export type AuditLogCategory =
  | 'Status Change'
  | 'Bulk Action'
  | 'Rule Management'
  | 'Configuration'
  | 'Guardrail Bypass Attempt'
  | 'AI Evaluation'
  | 'User Research / Feedback';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  category: AuditLogCategory;
  entityId?: string;
  before?: string;
  after?: string;
  details?: string;
  tenantId?: string;
}

export interface GroundingValidationResult {
  isFaithful: boolean;
  unsupportedClaims: string[];
  extractedEntities: string[];
  extractedNumbers: string[];
  extractedDates: string[];
  actionTaken: 'passed' | 'fallback_used';
  cleanText: string;
}

export interface ToneFormatValidationResult {
  isValid: boolean;
  hasUnhedgedClaims: boolean;
  hasPII: boolean;
  maskedText: string;
  bulletCount: number;
  characterCount: number;
  violations: string[];
}
