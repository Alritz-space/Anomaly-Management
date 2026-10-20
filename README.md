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

#### B. Action Guardrails & Review Workflow
- **Bulk Action Confirmation & Comments**: Interactive confirmation modal ("Are you sure?") with an optional justification comment box, Cancel and Continue action buttons, and a "Do not show this message again" preference checkbox.
- **Bulk Exception Removal**: Added bulk action to remove/discard exceptions that users do not agree with.
- **Not an Error Classification**: Uses "Not an Error" (with thumbs down icon) in place of "No Action Needed" across bulk bars and drawers.
- **Details Drawer Actions**:
  - **Mark Resolved** with Thumbs Up icon.
  - **Not an Error** with Thumbs Down icon.
  - **Discard** button with a Bin icon to completely remove the exception from the system.
- **Undo Toast**: 10-second rollback window for review actions.
- **No-Action Abuse Nudge**: Detects when an entity + anomaly type is dismissed with *Not an Error* 3+ times and recommends adjusting thresholds.
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

### 6. 🏛️ Enterprise User Research & Guided Learning
- **Prototype Research Mode**: Specifically structured for enterprise UX testing with CFOs, controllers, and internal audit managers.
- **Pre-Configured Evaluation Scenarios**:
  1. *Quarter-End Financial Close & SOX 404 Audit*: Outlier inspection, materiality sensitivity, and auditor justify notes.
  2. *Procure-to-Pay (P2P) Duplicate Bill & Vendor Fraud*: Detecting identical amounts on disparate invoice numbers with automated flow cross-referencing.
  3. *Continuous Accrual & Missing Liability Detection*: Flagging omitted cyclical vendor disbursements before general ledger lock.
  4. *Physical Inventory Discrepancy & Valuation Reconciliation*: Safety stock buffer alerts and negative on-hand projected trends.
- **Top-of-Screen Guided Step Banner**: Walk participants step-by-step through triage protocols, explaining the compliance justification behind each decision.
- **Interactive Guided Learning Callouts**: In-context explanations explaining *why* statistical models flag items and how to resolve them compliant with GAAP/SOX.
- **Participant Usability & Trust Feedback**: Integrated research feedback drawer capturing qualitative friction points, explainability scores, and enterprise readiness ratings.

### 7. 🎨 Redwood Enterprise ERP Design System
- Warm Redwood primary palette (`#8d3c26`, `#592215`, `#fbf5f2`, `#ebdcd3`) replacing high-contrast clashing colors.
- Generous spacing, decluttered collapsable filter drawers, and intuitive segmented buttons.
- Standardized action iconography:
  - **Mark Resolved**: Thumbs Up (`ThumbsUp`)
  - **Not an Error**: Thumbs Down (`ThumbsDown`)
  - **Discard Exception**: Trash Bin (`Trash2`)

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS with Redwood ERP design system
- **Icons**: Lucide React
- **Animation**: Motion
- **Architecture**: In-memory mock database with modular contexts, guardrails, and evals engines

---

## 🚀 Development & Deployment

- `npm run dev`: Starts the local development server on port 3000.
- `npm run build`: Compiles TypeScript and builds the production bundle with Vite.
- `npm run lint`: Runs `tsc --noEmit` to validate all TypeScript types and imports.

### Vercel / CI Peer Dependencies Resolution
If deploying through automated CI or Vercel with strict peer dependency resolution, use:
```json
// In .npmrc or build settings:
legacy-peer-deps=true
```
Or run `npm install --legacy-peer-deps` to ensure flawless resolution across Vite and Tailwind plugins.
