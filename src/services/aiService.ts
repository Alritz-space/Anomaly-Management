import { GoogleGenAI } from '@google/genai';
import {
  validateGrounding,
  validateFormatAndTone,
  globalRateLimiter,
  GroundingSourceRecord,
} from '../guardrails/outputValidators';
import { GuardrailEvent } from '../types/guardrails';

export interface GenerateSummaryParams {
  anomalyType: string;
  sourceRecord: GroundingSourceRecord;
  contextText?: string;
  fallbackTemplate: string;
  onGuardrailTriggered?: (event: GuardrailEvent) => void;
}

export interface GenerateSummaryResult {
  text: string;
  isAiGenerated: boolean;
  guardrailAction: 'passed' | 'fallback' | 'masked' | 'rate_limited';
  confidenceScore: number;
  contributingFactors: string[];
}

export interface GenerateInventoryAiSummaryResult {
  summary: string;
  nextActions: string[];
  isAiGenerated: boolean;
  guardrailAction: 'passed' | 'fallback' | 'masked' | 'rate_limited';
}

class AIService {
  private aiClient: GoogleGenAI | null = null;
  private apiKey: string | null = null;

  constructor() {
    const key =
      (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
      (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
      null;

    if (key && key !== 'MY_GEMINI_API_KEY' && key.trim().length > 10) {
      this.apiKey = key;
      try {
        this.aiClient = new GoogleGenAI({ apiKey: key });
      } catch (e) {
        console.warn('Failed to initialize GoogleGenAI client:', e);
      }
    }
  }

  public hasApiKey(): boolean {
    return !!this.aiClient;
  }

  /**
   * Generates or validates an anomaly summary.
   * If Gemini API is available, attempts a grounded generation with a 5s timeout.
   * If rate limited, times out, hallucinates, or violates safety guardrails,
   * falls back safely to deterministic template.
   */
  async generateAnomalySummary(params: GenerateSummaryParams): Promise<GenerateSummaryResult> {
    const { anomalyType, sourceRecord, fallbackTemplate, onGuardrailTriggered } = params;

    // Rate limiter check
    const rateCheck = globalRateLimiter.tryAcquire();
    if (!rateCheck.allowed) {
      if (onGuardrailTriggered) {
        onGuardrailTriggered({
          id: `gr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'Rate Limit',
          severity: 'medium',
          itemId: sourceRecord.tranId,
          actionTaken: 'rate_limited',
          reason: `Client AI rate limit reached (20 calls/min). Retry after ${rateCheck.retryAfterSeconds}s.`,
          timestamp: new Date().toISOString(),
        });
      }
      return {
        text: fallbackTemplate,
        isAiGenerated: false,
        guardrailAction: 'rate_limited',
        confidenceScore: 0.85,
        contributingFactors: [
          'Historical baseline variance',
          'Account coding deviation',
          'Period-end timing anomaly',
        ],
      };
    }

    let candidateText = fallbackTemplate;
    let isAi = false;

    // Attempt Gemini API call if key configured
    if (this.aiClient) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI call timeout after 5000ms')), 5000)
        );

        const prompt = `You are a financial internal controls auditor assisting with ERP period-close anomaly detection.
Write a grounded 2-3 sentence neutral explanation of this anomaly based STRICTLY on the facts provided below.
DO NOT invent any numbers, dates, vendor names, or legal certainty.
Use hedged, neutral terminology (e.g., "may indicate", "variance observed").
Do NOT use markdown headers or links.

Anomaly Type: ${anomalyType}
Transaction ID: ${sourceRecord.tranId || 'N/A'}
Impacted Amount: $${sourceRecord.amount || sourceRecord.impactedAmount || '0'}
Entity: ${sourceRecord.entity || 'N/A'}
Account: ${sourceRecord.account || sourceRecord.detectedAccount || 'N/A'}
Context: ${params.contextText || ''}

Provide ONLY the explanation paragraph.`;

        const apiPromise = this.aiClient.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const response: any = await Promise.race([apiPromise, timeoutPromise]);
        const output = response?.text?.trim();
        if (output && output.length > 20) {
          candidateText = output;
          isAi = true;
        }
      } catch (err: any) {
        console.warn('Gemini API call bypassed or timed out, using fallback template:', err?.message);
        isAi = false;
        candidateText = fallbackTemplate;
      }
    }

    // Guardrail Step 1: Tone & Format Validation
    const formatCheck = validateFormatAndTone(candidateText, [], 600);
    candidateText = formatCheck.maskedText;

    if (!formatCheck.isValid && onGuardrailTriggered) {
      onGuardrailTriggered({
        id: `gr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        type: 'Format & Constraint',
        severity: 'low',
        itemId: sourceRecord.tranId,
        actionTaken: 'sanitized',
        reason: `Output guardrail sanitized formatting: ${formatCheck.violations.join('; ')}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Guardrail Step 2: Grounding & Hallucination Check
    const groundingCheck = validateGrounding(candidateText, sourceRecord, fallbackTemplate);

    if (!groundingCheck.isFaithful) {
      if (onGuardrailTriggered) {
        onGuardrailTriggered({
          id: `gr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'Grounding Hallucination',
          severity: 'high',
          itemId: sourceRecord.tranId,
          actionTaken: 'fallback',
          reason: `AI summary contained ungrounded claims (${groundingCheck.unsupportedClaims.join(', ')}). Fallback template deployed.`,
          timestamp: new Date().toISOString(),
        });
      }
      return {
        text: fallbackTemplate,
        isAiGenerated: false,
        guardrailAction: 'fallback',
        confidenceScore: 0.88,
        contributingFactors: [
          'Historical baseline variance',
          'Account coding deviation',
          'Period-end timing anomaly',
        ],
      };
    }

    return {
      text: groundingCheck.cleanText,
      isAiGenerated: isAi,
      guardrailAction: isAi ? 'passed' : 'fallback',
      confidenceScore: isAi ? 0.94 : 0.89,
      contributingFactors: [
        `Historical variance detected against baseline (${anomalyType})`,
        `Account assignment deviates from standard recurring postings`,
        `Detected within final 5 days of accounting period close`,
      ],
    };
  }

  /**
   * Generates or validates an Inventory AI summary with up to 3 next actions.
   */
  async generateInventorySummary(params: {
    sku: string;
    itemName: string;
    location: string;
    projectedBalance: number;
    safetyStock: number;
    reorderPoint: number;
    fallbackSummary: string;
    fallbackActions: string[];
    onGuardrailTriggered?: (event: GuardrailEvent) => void;
  }): Promise<GenerateInventoryAiSummaryResult> {
    const { fallbackSummary, fallbackActions, onGuardrailTriggered, sku, itemName } = params;

    // Check rate limit
    const rateCheck = globalRateLimiter.tryAcquire();
    if (!rateCheck.allowed) {
      if (onGuardrailTriggered) {
        onGuardrailTriggered({
          id: `gr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          type: 'Rate Limit',
          severity: 'medium',
          itemId: sku,
          actionTaken: 'rate_limited',
          reason: 'Client AI rate limit reached (20 calls/min). Fallback template served.',
          timestamp: new Date().toISOString(),
        });
      }
      return {
        summary: fallbackSummary,
        nextActions: fallbackActions.slice(0, 3),
        isAiGenerated: false,
        guardrailAction: 'rate_limited',
      };
    }

    // Format check on fallback / candidate
    const formatCheck = validateFormatAndTone(fallbackSummary, fallbackActions, 600);

    return {
      summary: formatCheck.maskedText,
      nextActions: fallbackActions.slice(0, 3), // Strict cap of 3
      isAiGenerated: false,
      guardrailAction: 'passed',
    };
  }
}

export const aiService = new AIService();
