export interface ResearchScenario {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  objective: string;
  targetTab: 'transactions' | 'expected-missing' | 'inventory' | 'custom';
  suggestedThresholdStep: number;
  targetEntityFilter?: string;
  keyAnomalyId?: string;
  checklist: string[];
}

export interface GuidedTask {
  id: string;
  stepNumber: number;
  title: string;
  shortDescription: string;
  detailedGuidance: string;
  complianceStandard: string; // e.g. "SOX 404.B - Management Assessment of Internal Controls"
  targetTab: 'transactions' | 'expected-missing' | 'inventory' | 'custom';
  targetAnomalyId?: string;
  actionHint: string;
}

export interface UserFeedbackEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  scenarioId?: string;
  rating?: number; // 1-5
  category?: string;
  easeRating?: number; // 1-5
  explainabilityRating?: number; // 1-5
  guardrailsTrustRating?: number; // 1-5
  primaryFrictionPoint?: string;
  frictionPoints?: string;
  whatWorkedWell?: string;
  suggestions?: string;
  comments?: string;
}
