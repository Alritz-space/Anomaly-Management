export interface BulkActionPolicyResult {
  allowed: boolean;
  requiresConfirmation: boolean;
  itemCount: number;
  reason?: string;
}

const BULK_ACTION_HARD_CAP = 100;
const BULK_ACTION_CONFIRM_THRESHOLD = 5;

export function evaluateBulkActionPolicy(selectedCount: number): BulkActionPolicyResult {
  if (selectedCount <= 0) {
    return {
      allowed: false,
      requiresConfirmation: false,
      itemCount: 0,
      reason: 'No anomalies selected.',
    };
  }

  if (selectedCount > BULK_ACTION_HARD_CAP) {
    return {
      allowed: false,
      requiresConfirmation: false,
      itemCount: selectedCount,
      reason: `Action Guardrail Blocked: Hard cap of ${BULK_ACTION_HARD_CAP} items per bulk action exceeded (selected: ${selectedCount}). Please reduce your selection.`,
    };
  }

  return {
    allowed: true,
    requiresConfirmation: selectedCount > BULK_ACTION_CONFIRM_THRESHOLD,
    itemCount: selectedCount,
    reason:
      selectedCount > BULK_ACTION_CONFIRM_THRESHOLD
        ? `Bulk action on ${selectedCount} items requires confirmation dialog before execution.`
        : undefined,
  };
}

// A2: High Impact Resolution Note Requirement
export const DEFAULT_HIGH_IMPACT_THRESHOLD = 25000;

export function validateHighImpactResolutionNote(
  impactedAmount: number,
  resolutionType: 'Resolved' | 'No Action Needed',
  resolutionNote?: string,
  threshold = DEFAULT_HIGH_IMPACT_THRESHOLD
): {
  isValid: boolean;
  error?: string;
  isHighImpact: boolean;
} {
  const isHighImpact = impactedAmount >= threshold;

  if (isHighImpact && resolutionType === 'No Action Needed') {
    const trimmedNote = resolutionNote?.trim() || '';
    if (trimmedNote.length < 10) {
      return {
        isValid: false,
        isHighImpact: true,
        error: `High-Impact Guardrail: Dismissing an anomaly with financial exposure of $${impactedAmount.toLocaleString()} as "No Action Needed" requires a documented Resolution Note of at least 10 characters (current: ${trimmedNote.length} chars).`,
      };
    }
  }

  return {
    isValid: true,
    isHighImpact,
  };
}

// A2: No-Action Abuse Tracker
class NoActionTracker {
  // key: "anomalyType:::entity" -> count
  private counts: Map<string, number> = new Map();

  recordNoAction(anomalyType: string, entity: string): {
    count: number;
    triggerNudge: boolean;
    message?: string;
  } {
    const key = `${anomalyType.trim().toLowerCase()}:::${entity.trim().toLowerCase()}`;
    const current = (this.counts.get(key) || 0) + 1;
    this.counts.set(key, current);

    if (current >= 3) {
      return {
        count: current,
        triggerNudge: true,
        message: `Recommendation Nudge: You have marked "${anomalyType}" for entity "${entity}" as "No Action Needed" ${current} times. Consider raising the minimum amount threshold in Configuration or excluding this entity/type to prevent noisy recurring alerts.`,
      };
    }

    return {
      count: current,
      triggerNudge: false,
    };
  }

  reset() {
    this.counts.clear();
  }
}

export const globalNoActionTracker = new NoActionTracker();
