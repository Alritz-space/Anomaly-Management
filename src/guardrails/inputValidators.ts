import { RuleCondition, TransactionType } from '../types/anomaly';

export interface ValidationOutcome {
  isValid: boolean;
  error?: string;
  sanitized?: any;
}

// A1: Amount threshold guardrail
export function validateAmountThreshold(val: string | number): {
  isValid: boolean;
  error?: string;
  parsedValue?: number;
} {
  const strVal = String(val).trim();

  if (!strVal) {
    return { isValid: false, error: 'Threshold cannot be empty.' };
  }

  // Reject scientific notation (e.g. 1e5, 2e-3)
  if (/[eE]/.test(strVal)) {
    return {
      isValid: false,
      error: 'Scientific notation (e.g. 1e5) is prohibited. Enter a standard number.',
    };
  }

  // Check valid numerical format (allow digits with optional single decimal point)
  if (!/^\d+(\.\d+)?$/.test(strVal)) {
    return {
      isValid: false,
      error: 'Threshold must be a valid non-negative number (no symbols, negatives, or letters).',
    };
  }

  const num = Number(strVal);
  if (isNaN(num)) {
    return { isValid: false, error: 'Threshold is not a valid number.' };
  }

  if (num < 0) {
    return { isValid: false, error: 'Threshold cannot be negative ($0 minimum).' };
  }

  const MAX_THRESHOLD = 1_000_000_000; // 1e9 sane maximum
  if (num > MAX_THRESHOLD) {
    return {
      isValid: false,
      error: `Threshold exceeds maximum allowed limit ($${MAX_THRESHOLD.toLocaleString()}).`,
    };
  }

  return { isValid: true, parsedValue: num };
}

// A1: Anomaly types enabled guardrail
export function validateAnomalyTypesConfig(enabledTypes: Record<string, boolean>): {
  isValid: boolean;
  error?: string;
} {
  const count = Object.values(enabledTypes).filter(Boolean).length;
  if (count === 0) {
    return {
      isValid: false,
      error: 'At least one anomaly type must remain enabled. Disabling all models is prohibited.',
    };
  }
  return { isValid: true };
}

// A1: Transaction types included guardrail
export function validateTransactionTypesConfig(types: TransactionType[]): {
  isValid: boolean;
  error?: string;
} {
  if (!types || types.length === 0) {
    return {
      isValid: false,
      error: 'Cannot exclude all transaction types. At least one type must be selected.',
    };
  }
  return { isValid: true };
}

// A1: Prompt injection patterns
export const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above)\s+(instructions|prompts|directions)/i,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions|prompts|rules)/i,
  /system\s+prompt/i,
  /jailbreak/i,
  /override\s+(all\s+)?(safety|rules|instructions)/i,
  /you\s+are\s+now\s+(in\s+)?(developer\s+mode|dan|unrestricted)/i,
  /forget\s+(everything|all\s+rules)/i,
  /reveal\s+(internal|secret|system)\s+(instructions|prompt)/i,
];

// A1: Free text sanitization & prompt injection guardrail
export function sanitizeFreeText(
  rawText: string,
  maxLength = 500,
  fieldName = 'Text'
): {
  isValid: boolean;
  sanitizedText: string;
  error?: string;
  hasPromptInjection: boolean;
} {
  if (!rawText) {
    return { isValid: true, sanitizedText: '', hasPromptInjection: false };
  }

  // 1. Strip HTML/Script tags
  let cleaned = rawText
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();

  // 2. Length limit check (500-char limit)
  if (cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength);
  }

  // 3. Prompt injection detection
  let hasPromptInjection = false;
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(cleaned)) {
      hasPromptInjection = true;
      return {
        isValid: false,
        sanitizedText: cleaned,
        error: `Security Guardrail: Potential prompt injection attempt detected in ${fieldName}. Suspicious phrasing was rejected.`,
        hasPromptInjection: true,
      };
    }
  }

  return {
    isValid: true,
    sanitizedText: cleaned,
    hasPromptInjection: false,
  };
}

// A1: Rule Builder Conditions Validator
export function validateRuleBuilderConditions(conditions: RuleCondition[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Max 10 conditions
  if (conditions.length === 0) {
    errors.push('At least one condition is required.');
  }
  if (conditions.length > 10) {
    errors.push(`Maximum condition limit exceeded. A rule may contain at most 10 conditions (current: ${conditions.length}).`);
  }

  // Duplicate condition detection
  const seenSignatures = new Set<string>();
  conditions.forEach((c, idx) => {
    const signature = `${c.field}:::${c.operator}:::${c.value?.trim().toLowerCase() || ''}:::${c.value2?.trim().toLowerCase() || ''}`;
    if (seenSignatures.has(signature)) {
      errors.push(`Condition #${idx + 1} is identical to an earlier condition. Duplicate conditions are not permitted.`);
    }
    seenSignatures.add(signature);

    // Operator validation per field type
    if (c.field === 'Amount') {
      const allowedOps = [
        'greater than',
        'less than',
        'equals',
        'does not equal',
        'greater than or equal',
        'less than or equal',
        'between',
      ];
      if (!allowedOps.includes(c.operator)) {
        errors.push(`Condition #${idx + 1}: Operator "${c.operator}" is not valid for numeric Amount.`);
      }
      if (c.value && isNaN(Number(c.value))) {
        errors.push(`Condition #${idx + 1}: Amount value "${c.value}" must be a valid number.`);
      }
    } else if (c.field === 'Date') {
      const allowedOps = ['is between', 'is before', 'is after', 'is today', 'in past 30 days'];
      if (!allowedOps.includes(c.operator)) {
        errors.push(`Condition #${idx + 1}: Operator "${c.operator}" is not valid for Date.`);
      }
      if (c.operator === 'is between') {
        if (!c.value || !c.value2) {
          errors.push(`Condition #${idx + 1}: "is between" requires both start and end dates.`);
        } else if (new Date(c.value) > new Date(c.value2)) {
          errors.push(`Condition #${idx + 1}: Start date must be earlier than or equal to end date (${c.value} > ${c.value2}).`);
        }
      }
    } else {
      // String/Dropdown fields
      const noValueOps = ['is empty', 'is not empty'];
      if (!noValueOps.includes(c.operator) && (!c.value || !c.value.trim())) {
        errors.push(`Condition #${idx + 1}: Field "${c.field}" requires a target value.`);
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// A1: Over-broad rule check (>50% of transactions)
export function checkOverBroadRule(
  matchingCount: number,
  totalTransactionsCount: number
): {
  isOverBroad: boolean;
  matchPercentage: number;
  warningMessage?: string;
} {
  if (totalTransactionsCount <= 0) return { isOverBroad: false, matchPercentage: 0 };
  const percentage = (matchingCount / totalTransactionsCount) * 100;
  const isOverBroad = percentage > 50;

  return {
    isOverBroad,
    matchPercentage: Math.round(percentage * 10) / 10,
    warningMessage: isOverBroad
      ? `Over-broad Rule Alert: This rule matches ${matchingCount} of ${totalTransactionsCount} transactions (${percentage.toFixed(1)}%). Rules matching >50% of the ERP volume generate excessive false positives and require explicit manager confirmation to activate.`
      : undefined,
  };
}
