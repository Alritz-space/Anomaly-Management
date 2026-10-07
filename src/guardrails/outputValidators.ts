import {
  GroundingValidationResult,
  ToneFormatValidationResult,
} from '../types/guardrails';

// PII Regex Patterns
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
const PHONE_REGEX = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const BANK_ACCOUNT_REGEX = /\b(routing|acct|account|iban)[\s#:]+\d{6,16}\b/gi;

// Unhedged / Advice certainty patterns forbidden in AI output
const UNHEDGED_ADVICE_PATTERNS = [
  /\b(you\s+must|legally\s+required\s+to|strictly\s+illegal|guaranteed\s+tax\s+deduction)\b/i,
  /\b(this\s+is\s+definitely\s+(fraud|illegal|a\s+crime))\b/i,
  /\b(our\s+legal\s+counsel\s+confirms)\b/i,
  /\b(as\s+a\s+certified\s+legal\s+opinion)\b/i,
  /\b(must\s+file\s+criminal\s+charges)\b/i,
];

// Defamatory or accusatory language replacements with neutral enterprise wording
const DEFAMATORY_REPLACEMENTS: Array<{ regex: RegExp; replacement: string }> = [
  { regex: /\b(fraudulent\s+vendor|corrupt\s+vendor)\b/gi, replacement: 'vendor with billing variance' },
  { regex: /\b(suspicious\s+employee|dishonest\s+worker)\b/gi, replacement: 'unmatched transaction author' },
  { regex: /\b(embezzlement|theft|criminal\s+fraud)\b/gi, replacement: 'unreconciled variance' },
  { regex: /\b(guilty\s+of\s+fraud)\b/gi, replacement: 'flagged for manual reconciliation' },
  { regex: /\b(fake\s+invoice|bogus\s+bill)\b/gi, replacement: 'unverified transaction' },
];

// Markdown headings & links check
const HEADING_REGEX = /(?:^|\n)\s*#{1,6}\s+/;
const LINK_REGEX = /\[[^\]]+\]\([^)]+\)|https?:\/\/[^\s]+/i;

// A3: PII Masking
export function maskPII(text: string): { maskedText: string; hasPII: boolean; piiMatches: string[] } {
  let masked = text;
  const piiMatches: string[] = [];

  // Mask emails
  masked = masked.replace(EMAIL_REGEX, (match) => {
    piiMatches.push(`Email: ${match}`);
    return '***@***.***';
  });

  // Mask phones
  masked = masked.replace(PHONE_REGEX, (match) => {
    piiMatches.push(`Phone: ${match}`);
    return '***-***-****';
  });

  // Mask SSN
  masked = masked.replace(SSN_REGEX, (match) => {
    piiMatches.push(`SSN: ${match}`);
    return '***-**-****';
  });

  // Mask bank accounts
  masked = masked.replace(BANK_ACCOUNT_REGEX, (match) => {
    piiMatches.push(`Account/Routing: ${match}`);
    return '[ACCOUNT-REDACTED]';
  });

  return {
    maskedText: masked,
    hasPII: piiMatches.length > 0,
    piiMatches,
  };
}

// A3: Format & Tone Validator
export function validateFormatAndTone(
  summaryText: string,
  nextActions: string[] = [],
  maxChars = 600
): ToneFormatValidationResult {
  const violations: string[] = [];
  let cleanText = summaryText;

  // 1. Replace defamatory/accusatory language with neutral phrasing
  for (const item of DEFAMATORY_REPLACEMENTS) {
    if (item.regex.test(cleanText)) {
      violations.push(`Neutral tone enforced: replaced accusatory language matching "${item.regex.source}".`);
      cleanText = cleanText.replace(item.regex, item.replacement);
    }
  }

  // 2. Check headings
  if (HEADING_REGEX.test(cleanText)) {
    violations.push('Markdown headings (#) are prohibited in summary text.');
    cleanText = cleanText.replace(/(?:^|\n)\s*#{1,6}\s+/g, '\n').trim();
  }

  // 3. Check links
  if (LINK_REGEX.test(cleanText)) {
    violations.push('External URLs or markdown links are prohibited.');
    cleanText = cleanText.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/https?:\/\/[^\s]+/g, '[link removed]');
  }

  // 4. Length check
  if (cleanText.length > maxChars) {
    violations.push(`Text exceeded maximum length of ${maxChars} chars (length: ${cleanText.length}).`);
    cleanText = cleanText.substring(0, maxChars);
  }

  // 5. PII check & masking
  const piiResult = maskPII(cleanText);
  if (piiResult.hasPII) {
    violations.push(`PII detected and masked: ${piiResult.piiMatches.join(', ')}`);
    cleanText = piiResult.maskedText;
  }

  // 6. Unhedged advice certainty check
  let hasUnhedgedClaims = false;
  for (const pattern of UNHEDGED_ADVICE_PATTERNS) {
    if (pattern.test(cleanText)) {
      hasUnhedgedClaims = true;
      violations.push(`Unhedged certainty/advice phrasing detected matching pattern "${pattern.source}".`);
      // Replace with hedged phrasing
      cleanText = cleanText.replace(pattern, 'may indicate a potential variance that requires review');
      break;
    }
  }

  // 7. Next actions bullet cap (max 3)
  const bulletCount = nextActions.length;
  if (bulletCount > 3) {
    violations.push(`Action bullets exceeded maximum cap of 3 (current: ${bulletCount}).`);
  }

  return {
    isValid: violations.length === 0,
    hasUnhedgedClaims,
    hasPII: piiResult.hasPII,
    maskedText: cleanText,
    bulletCount: Math.min(3, bulletCount),
    characterCount: cleanText.length,
    violations,
  };
}

// A3: Grounding Validator (Extracts facts from AI text and checks if source record supports them)
export interface GroundingSourceRecord {
  tranId?: string;
  amount?: number;
  impactedAmount?: number;
  entity?: string;
  account?: string;
  detectedAccount?: string;
  expectedAccount?: string;
  location?: string;
  sku?: string;
  date?: string;
  comparisonTransactions?: Array<{
    amount?: number;
    account?: string;
    tranId?: string;
    entity?: string;
  }>;
}

export function validateGrounding(
  generatedText: string,
  sourceRecord: GroundingSourceRecord,
  fallbackTemplate: string
): GroundingValidationResult {
  const unsupportedClaims: string[] = [];

  // Collect all known numbers from source record
  const knownNumbers = new Set<string>();
  const addNumber = (n?: number | string) => {
    if (n !== undefined && n !== null) {
      const parsed = Math.round(Number(n));
      if (!isNaN(parsed) && parsed > 0) {
        knownNumbers.add(parsed.toString());
        knownNumbers.add(parsed.toLocaleString());
      }
    }
  };

  addNumber(sourceRecord.amount);
  addNumber(sourceRecord.impactedAmount);
  if (sourceRecord.comparisonTransactions) {
    sourceRecord.comparisonTransactions.forEach((c) => addNumber(c.amount));
  }

  // Collect known entity/account substrings
  const knownTokens: string[] = [];
  const addToken = (str?: string) => {
    if (str) {
      knownTokens.push(str.toLowerCase());
      str.split(/[\s-]+/).forEach((w) => {
        if (w.length > 3) knownTokens.push(w.toLowerCase());
      });
    }
  };

  addToken(sourceRecord.entity);
  addToken(sourceRecord.tranId);
  addToken(sourceRecord.account);
  addToken(sourceRecord.detectedAccount);
  addToken(sourceRecord.expectedAccount);
  addToken(sourceRecord.location);
  addToken(sourceRecord.sku);

  // Extract dollar amounts from generated text (e.g. $184,500, $45,000)
  const dollarMatches = generatedText.match(/\$\s*[\d,]+(?:\.\d+)?/g) || [];
  const extractedNumbers: string[] = [];

  for (const dm of dollarMatches) {
    const rawDigits = dm.replace(/[^\d]/g, '');
    const numVal = parseInt(rawDigits, 10);
    extractedNumbers.push(dm);

    // If it's a significant dollar figure (> $500), verify it is grounded in source
    if (numVal >= 500) {
      let isGrounded = false;
      for (const known of knownNumbers) {
        const knownVal = parseInt(known.replace(/[^\d]/g, ''), 10);
        // Allow close match (within 5% for rounding or exact)
        if (Math.abs(knownVal - numVal) <= Math.max(50, knownVal * 0.05)) {
          isGrounded = true;
          break;
        }
      }
      if (!isGrounded) {
        unsupportedClaims.push(`Unsupported monetary figure "${dm}" not found in source record.`);
      }
    }
  }

  // Extract date matches
  const dateMatches = generatedText.match(/\b(?:\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4})\b/g) || [];

  const isFaithful = unsupportedClaims.length === 0;

  return {
    isFaithful,
    unsupportedClaims,
    extractedEntities: knownTokens.slice(0, 10),
    extractedNumbers,
    extractedDates: dateMatches,
    actionTaken: isFaithful ? 'passed' : 'fallback_used',
    cleanText: isFaithful ? generatedText : fallbackTemplate,
  };
}

// A3: Rate / Loop Guard (Sliding window: max 20 calls per minute)
export class ClientRateLimiter {
  private callTimestamps: number[] = [];
  private readonly maxCallsPerMinute: number;

  constructor(maxCalls = 20) {
    this.maxCallsPerMinute = maxCalls;
  }

  tryAcquire(): { allowed: boolean; remaining: number; retryAfterSeconds?: number } {
    const now = Date.now();
    const oneMinuteAgo = now - 60_000;

    // Prune timestamps older than 1 minute
    this.callTimestamps = this.callTimestamps.filter((t) => t > oneMinuteAgo);

    if (this.callTimestamps.length >= this.maxCallsPerMinute) {
      const oldestCall = this.callTimestamps[0];
      const waitTimeMs = 60_000 - (now - oldestCall);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil(waitTimeMs / 1000),
      };
    }

    this.callTimestamps.push(now);
    return {
      allowed: true,
      remaining: this.maxCallsPerMinute - this.callTimestamps.length,
    };
  }

  reset(): void {
    this.callTimestamps = [];
  }
}

export const globalRateLimiter = new ClientRateLimiter(20);
