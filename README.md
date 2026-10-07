# Anomaly Management – Enterprise ERP Financial Audit Suite

A single-page web application prototype built for financial controllers, internal auditors, and accounting managers. It proactively surfaces general ledger transaction outliers, duplicate entries, expected/missing recurring transactions, inventory imbalances, and custom rule-based anomalies before period close.

---

## 🌟 Key Capabilities

### 1. Anomaly Dashboard & Period-Close Controls
- **Transaction Anomalies**: Identifies statistical outliers including *Unusual Account*, *Unusual Amount*, *Incorrect/Missing Segment*, *Duplicate*, and *Vendor/Customer Alert*.
  - 9-step sensitivity/importance slider (Top 10% to 100%) to focus on high-impact items first.
  - Interactive multi-parameter filters: Transaction Type, Anomaly Type, Account, Accounting Period, Entity, Status, and Subsidiary.
  - Dedicated **Account column** and **Account filter** for direct GL attribution.
  - Transaction flow grouping (e.g., PO → Sales Order → Invoice → Payment batch).
- **Expected / Missing Transactions**: Predictive cadence engine that tracks cyclical recurring entries (vendor bills, milestone billings, tax accruals).
  - Highlights upcoming due transactions and alerts on omitted/overdue entries.
  - Features dedicated **Account column** and **Account filter**.
  - One-click record creation draft flow.
- **Inventory Anomalies**: Monitors stockout velocity, lead-time variance, safety stock thresholds, and excess surplus holding risks.
  - Projections timeline and next-action recommendations.
- **Custom Anomalies**: Real-time evaluation of user-defined internal audit rules.

### 2. Custom Rule Builder
- **Step 1: Details**:
  - Configure Rule Name, Description, Owner, and Priority.
  - **Subsidiaries**: Multi-select dropdown with an **"All" option** and search filtering.
  - **Target Transaction Types**: Multi-select dropdown with an **"All" option** and search filtering.
- **Step 2: Conditions**:
  - Match ALL (AND) or Match ANY (OR) evaluation logic.
  - Numeric inputs for `Amount` (with range support for *is between*).
  - Date inputs for `Date` (with range support for *is between*).
  - **Multi-select dropdown with "All" option** for all other fields (`Account`, `Account Type`, `Approval Status`, `Class`, `Currency`, `Subsidiary`, `Transaction Type`, `Entity`).
- **Step 3: 90-Day Simulation & Noise Gate**:
  - Simulates rule execution over 2,410 historical records.
  - Flags over-broad rules matching >50% of ERP volume to prevent alert fatigue.
- **Step 4: Activation & Notifications**:
  - In-app notification and email alert preferences.

### 3. Comprehensive Guardrails

#### A. Input Guardrails
- **Threshold Validation**: Reject negative amounts, NaN, scientific notation, and values above $1B.
- **Text Sanitization & Prompt Injection Defense**: 500-character ceiling, HTML tag stripping, and regex-based prompt injection pattern blocking.
- **Over-Broad Rule Guard**: Requires explicit user acknowledgement if a rule matches >50% of transactions.

#### B. Action Guardrails
- **Bulk Confirmation**: Mandatory confirmation dialog for bulk actions affecting more than 5 records (hard cap of 100 items).
- **Undo Toast**: 10-second rollback window for *Mark Resolved*, *No Action Needed*, and *Reopen* actions.
- **No-Action Abuse Nudge**: Detects when an entity + anomaly type is dismissed with *No Action* 3+ times and recommends adjusting thresholds.
- **Mandatory Resolution Notes**: High-impact items require at least 10 characters of explanation before dismissal.
- **Role-Based Access Control (RBAC)**:
  - **Admin**: Full access to global configuration, rules activation/pausal, and anomaly review.
  - **Finance Manager**: Create rules, review anomalies, and assign items.
  - **Viewer**: Read-only access across all tables and audit trails.
- **Tenant Isolation**: Guarantees cross-tenant boundary validation on all queries.

#### C. AI Output Guardrails
- **Grounding Verification**: Validates numbers, dates, accounts, and entity names against the source ERP record; discards ungrounded claims and falls back to deterministic templates.
- **PII Redaction**: Automatic masking of emails, phone numbers, and account credentials.
- **Format & Hedging Constraints**: Strict character limits, structured bullets, and hedged accounting language.

### 4. Model Evals & Quality Monitoring
- **Detection Accuracy**: Evaluates Precision, Recall, and F1 Score against gold-labeled ERP datasets.
- **Summary Grounding**: Hallucination detection and claim-faithfulness metrics.
- **Adversarial Robustness**: Prompt injection attack resilience tests.
- **Rule Coverage**: Identifies over-broad vs. precise rule logic.
- **Quality Drift**: 30-day tracking of user approval rates, false positive ratios, and guardrail trigger frequency.

### 5. Audit Logging
- Immutable change logs recording actor, action, previous state, new state, and timestamp for all configuration changes, rule updates, and anomaly status transitions.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animation**: Motion
- **Architecture**: In-memory mock database with modular contexts, guardrails, and evals engines

---

## 🚀 Development & Scripts

- `npm run dev`: Starts the local development server on port 3000.
- `npm run build`: Compiles TypeScript and builds the production bundle with Vite.
- `npm run lint`: Runs `tsc --noEmit` to validate all TypeScript types and imports.
