import { GroundingSourceRecord } from '../guardrails/outputValidators';

export interface SummaryGroundingTestCase {
  id: string;
  name: string;
  sourceRecord: GroundingSourceRecord;
  candidateSummary: string;
  expectedFaithful: boolean;
  expectedHallucinationsCount: number;
  expectedUnsupportedClaims?: string[];
  description: string;
}

export const SUMMARY_GROUNDING_CASES: SummaryGroundingTestCase[] = [
  {
    id: 'sg-01',
    name: 'Faithful summary with exact amounts and accounts',
    sourceRecord: {
      tranId: 'INV-40912',
      amount: 184500.0,
      entity: 'Vertex Cloud Services',
      account: '6120 - Cloud Infrastructure',
      date: '2026-10-02',
    },
    candidateSummary:
      'Invoice INV-40912 for Vertex Cloud Services totaled $184,500 in account 6120 - Cloud Infrastructure. This represents a significant variance against prior monthly averages and was flagged for period-end reconciliation.',
    expectedFaithful: true,
    expectedHallucinationsCount: 0,
    description: 'Fully faithful summary containing verified numbers, entity name, and account.',
  },
  {
    id: 'sg-02',
    name: 'Hallucinated fabricated penalty dollar figure',
    sourceRecord: {
      tranId: 'BILL-88201',
      amount: 64200.0,
      entity: 'Apex Legal Partners',
      account: '6810 - Legal Fees',
      date: '2026-10-04',
    },
    candidateSummary:
      'Vendor Bill BILL-88201 from Apex Legal Partners totaled $64,200. Additionally, a late penalty surcharge of $12,750 was assessed under clause 4.2 without contract attachment.',
    expectedFaithful: false,
    expectedHallucinationsCount: 1,
    expectedUnsupportedClaims: ['$12,750'],
    description: 'Contains a hallucinated $12,750 penalty figure nowhere in the source ERP invoice record.',
  },
  {
    id: 'sg-03',
    name: 'Faithful inventory safety stock summary',
    sourceRecord: {
      sku: 'SKU-7729',
      location: 'Dallas Central Logistics',
      amount: 45000.0,
      entity: 'Apex Parts Distribution',
    },
    candidateSummary:
      'Inventory item SKU-7729 at Dallas Central Logistics holds a valuation of $45,000. Current projected balance threatens stockout risk before the next scheduled replenishment.',
    expectedFaithful: true,
    expectedHallucinationsCount: 0,
    description: 'Grounded in known SKU, location, and balance valuation.',
  },
  {
    id: 'sg-04',
    name: 'Hallucinated phantom foreign currency and ungrounded bank routing',
    sourceRecord: {
      tranId: 'JE-10992',
      amount: 98000.0,
      entity: 'Global Shipping Ltd',
      account: '1010 - Operating Cash',
    },
    candidateSummary:
      'Journal Entry JE-10992 of $98,000 in account 1010 - Operating Cash was converted at a fictitious rate resulting in a secondary debit of $245,000 to offshore Cayman account.',
    expectedFaithful: false,
    expectedHallucinationsCount: 1,
    expectedUnsupportedClaims: ['$245,000'],
    description: 'Hallucinated $245,000 secondary debit ungrounded by source GL voucher.',
  },
  {
    id: 'sg-05',
    name: 'Faithful journal reclassification summary',
    sourceRecord: {
      tranId: 'JE-88124',
      amount: 540000.0,
      account: '1410 - Inventory Asset',
      entity: 'US - West Subsidiary',
    },
    candidateSummary:
      'Journal Entry JE-88124 adjusts account 1410 - Inventory Asset by $540,000 for US - West Subsidiary. The entry lacks warehouse segment allocation and requires reviewer sign-off.',
    expectedFaithful: true,
    expectedHallucinationsCount: 0,
    description: 'All facts grounded in the GL adjustment voucher.',
  },
];
