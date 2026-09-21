# AI-Compliance Platform: Product Architecture, Use Cases & End-to-End Flow

**Document Version:** 1.0  
**Target Audience:** Customers, Leadership, Compliance Officers, DevOps Engineers, and Auditors  
**Scope:** Multi-Framework Automated GRC (SOC 2 Type II, ISO/IEC 27001:2022, NIST CSF v2.0, HIPAA, GDPR)

---

## 1. Executive Summary

**AI-Compliance** is an enterprise autonomous Governance, Risk, and Compliance (GRC) platform. Traditional compliance audits require 6 to 12 months of manual consultant interviews, spreadsheet trackers, and repetitive screenshot collection. 

AI-Compliance transforms this process into a **continuous, automated, AI-driven workflow**:
1. **Zero Third-Party LLM Data Leakage:** Powered by an air-gapped, local fine-tuned **Meta Llama 3.1 8B Instruct** model running on sovereign infrastructure.
2. **Real-Time Telemetry Harvesting:** Direct read-only connectors to AWS, GitHub, Google Workspace, and Slack eliminate manual evidence gathering.
3. **153 Continuous Programmatic Tests:** Evaluates security posture 24/7 and generates instant 1-click **Terraform** and **AWS CLI** remediation code for failing controls.
4. **Scrut-Style Official PDF Artifacts:** Generates formal compliance policies and evidence dossiers styled with corporate letterheads, version history, and cryptographic sign-off seals.
5. **1-Click Auditor Package (.ZIP):** Packages 10 policies, 6 signed telemetry evidence JSONs, `MANIFEST.json`, and auditor `README.md` into an instant binary archive for CPA sign-off.

---

## 2. Product Use Case Diagram

```mermaid
flowchart LR
    %% Primary Actors
    ADMIN["👤 Compliance Officer / GRC Lead"]
    ENG["👨‍💻 DevOps & Cloud Engineer"]
    AUDITOR["🕵️‍♂️ External CPA Auditor"]
    AI["🤖 Autonomous AI Engine (Llama 3.1)"]

    subgraph Product["🛡️ AI-Compliance Platform Ecosystem"]
        subgraph Mod_Setup["1. Workspace & Framework Setup"]
            UC_Scope["Select Framework Scope\n(SOC 2, ISO 27001, NIST CSF, HIPAA)"]
            UC_Connect["Connect Cloud Integrations\n(AWS, GitHub, Google WS, Slack)"]
        end

        subgraph Mod_Policies["2. Autonomous Policy Center"]
            UC_GenPol["AI-Generated Compliance Policies\n(10 Tailored Core Policies)"]
            UC_Approve["3-Step Workflow & Attestation\n(Draft -> Approve -> Publish)"]
            UC_PDF["Export Official Signed PDF / DOCX"]
        end

        subgraph Mod_Testing["3. Continuous Monitoring & Remediation"]
            UC_Tests["153 Continuous Automated Tests\n(Pass / Fail / Warn Telemetry)"]
            UC_Remediate["1-Click AI Auto-Remediation\n(Terraform & AWS CLI Fixes)"]
            UC_Risk["Enterprise Risk Register\n(Inherent vs Residual Scoring)"]
        end

        subgraph Mod_Evidence["4. Evidence Collection & RAG Gap Analysis"]
            UC_Collect["Automated Real-Time Telemetry Harvest"]
            UC_RAG["RAG Document Verification\n(pgvector Semantic Analysis)"]
        end

        subgraph Mod_Audit["5. Audit Attestation & Package Export"]
            UC_Criteria["Common Criteria Tracking (CC1.0 - CC6.0)"]
            UC_Dossier["Executive Audit Readiness Dossier"]
            UC_ExportZip["Download Auditor Package (.ZIP)\n(18 Bundled Policies & JSON Artifacts)"]
        end
    end

    %% User Connections
    ADMIN --> UC_Scope
    ADMIN --> UC_Connect
    ADMIN --> UC_Approve
    ADMIN --> UC_PDF
    ADMIN --> UC_Risk
    ADMIN --> UC_Dossier
    ADMIN --> UC_ExportZip

    ENG --> UC_Connect
    ENG --> UC_Tests
    ENG --> UC_Remediate
    ENG --> UC_Risk

    AUDITOR --> UC_Approve
    AUDITOR --> UC_Criteria
    AUDITOR --> UC_Dossier
    AUDITOR --> UC_ExportZip

    %% Autonomous AI Connections
    AI -.->|Synthesizes| UC_GenPol
    AI -.->|Executes Hourly| UC_Tests
    AI -.->|Generates Code Fixes| UC_Remediate
    AI -.->|Harvests Telemetry| UC_Collect
    AI -.->|Evaluates Documents| UC_RAG
    AI -.->|Bundles 18-File Archive| UC_ExportZip
```

---

## 3. End-to-End Product Flowchart

```mermaid
flowchart TD
    %% Phase 1
    subgraph P1["Phase 1: Quick Onboarding (5 Minutes)"]
        A1["User Enters Organization Details\n(Company Name, Cloud Provider, Identity Provider)"] --> A2["Select Regulatory Frameworks\n(SOC 2 Type II, ISO 27001, NIST CSF)"]
        A2 --> A3["Autonomous AI Engine Activates\n(Fine-Tuned Llama 3.1 8B Model)"]
        A3 --> A4["AI Generates Initial 10 Compliance Policies\n(Tailored to Tech Stack & Cloud Infrastructure)"]
    end

    %% Phase 2
    subgraph P2["Phase 2: Cloud Telemetry & Automated Evidence"]
        B1["Connect Integrations via Read-Only APIs\n(AWS IAM/S3, GitHub, Google WS, Slack)"] --> B2["Autonomous Background Scanners\n(Hourly & On-Demand Telemetry Ingestion)"]
        B2 --> B3["153 Continuous Automated Security Tests\n(S3 Encryption, IAM MFA, Branch Protection, 2FA)"]
    end

    %% Phase 3
    subgraph P3["Phase 3: AI Gap Analysis & Instant Remediation"]
        C1{"Test Result Evaluation"}
        C1 -->|PASS| C2["Store Cryptographic Evidence\n(SHA-256 Digest & Timestamp)"]
        C1 -->|FAIL / WARN| C3["Alert in Compliance Dashboard"]
        C3 --> C4["Click 'Resolve with AI'\n(Instant Terraform Script & AWS CLI Commands)"]
        C4 --> C5["Engineer Deploys Fix -> Retest Automatically Passes"]
        C5 --> C2
    end

    %% Phase 4
    subgraph P4["Phase 4: Policy & Evidence Room Review"]
        D1["Review Official Policy Attachments\n(Formatted PDF Document Cards)"] --> D2["Executive Document Viewer\n(Digital Signatures & Attestation Seals)"]
        D2 --> D3["Evidence Room Verification\n(RAG Analysis with Control Citations)"]
    end

    %% Phase 5
    subgraph P5["Phase 5: Auditor Examination & 1-Click Export"]
        E1["Auditor Inspects Audit Center\n(Common Criteria CC1.0 - CC6.0 & Corrective Actions)"] --> E2["1-Click 'Download Auditor Package'"]
        E2 --> E3["System Streams Binary .ZIP Archive\n(10 Policies + 6 Signed JSONs + MANIFEST + README)"]
        E3 --> E4["Generate Executive Audit Dossier (.PDF / .MD)"]
        E4 --> E5["CPA Signs Off Clean SOC 2 / ISO 27001 Attestation"]
    end

    %% Inter-Phase Transitions
    P1 --> P2
    P2 --> P3
    P3 --> P4
    P4 --> P5
```

---

## 4. User Journey: Step-by-Step Breakdown

### Step 1: Onboarding & Instant AI Policy Generation
1. The user logs into `/onboarding` and selects their company profile (e.g. Acme Corp), infrastructure (`AWS`), identity provider (`Okta`), and version control (`GitHub`).
2. Selects target compliance frameworks (**SOC 2 Type II, ISO/IEC 27001:2022, NIST CSF v2.0**).
3. The platform invokes the local fine-tuned **Llama 3.1 8B** model, which writes 10 customized compliance policies:
   - Information Security (IS) Policy
   - Access Control & Identity Management Policy
   - Incident Response & Disaster Recovery Plan
   - Data Classification & Handling Policy
   - Mobile Device & Teleworking (MDM) Policy
   - Threat Intelligence & Vulnerability Management Policy
   - Vendor & Third-Party Risk Management Policy
   - Business Continuity Plan (BCP)
   - Change Management Policy
   - Encryption and Key Management Policy
4. Policies appear in `/policies` as official PDF document cards with version tags, approval steps, and corporate letterheads.

### Step 2: Zero-Touch Telemetry Ingestion
1. Under `/integrations`, the user connects external systems with read-only permissions:
   - **AWS Cloud:** Evaluates S3 bucket encryption, KMS key policies, IAM password policies, and security groups.
   - **GitHub:** Checks branch protection on main repositories, mandatory peer PR review counts, and commit signature requirements.
   - **Google Workspace:** Verifies 2FA enforcement across accounts, offboarding de-provisioning, and public drive sharing restrictions.
   - **Slack:** Audits message retention periods, DLP settings, and dedicated `#incident-response` channels.
2. Ingestion runs continuously in the background on an hourly schedule or immediately via **"Run Live Audit Scan"**.

### Step 3: Continuous Monitoring & AI Auto-Remediation
1. The platform executes **153 continuous automated tests** accessible on `/tests`.
2. Telemetry results are categorized into `PASSED`, `WARNING`, and `FAILED`.
3. If an issue is flagged (e.g., IAM users without MFA active):
   - The engineer clicks **"Resolve with AI"**.
   - A modal provides step-by-step remediation:
     - **Live Inspection:** View the flagged accounts and risk impact.
     - **AI Terraform Fix:** Copy-paste ready-to-apply Infrastructure-as-Code.
     - **AWS CLI Command:** 1-line shell script to immediately patch the vulnerability.
   - Once executed, the continuous scanner re-evaluates the environment and flips the test to `PASSED`.

### Step 4: Auditor Attestation & 1-Click Package Export
1. The external CPA auditor (e.g. KPMG, PwC, EY, BSI) accesses `/audits` to inspect:
   - **Common Criteria Mapping:** `CC1.0` (Control Environment) through `CC6.0` (Logical Access).
   - **Readiness Bars:** Separate progress meters for Policies (100%), Automated Tests (92%), and Evidence Artifacts (84%).
   - **Corrective Action Plan:** Non-conformity tracking with criticality, assignees, and deadlines.
2. The user clicks **"Download Auditor Package (.ZIP)"** on `/export`:
   - Streams an instant binary archive: `Acme_Corp_SOC2_Auditor_Package.zip`.
   - Contains **18 verified files**: 10 Markdown/PDF policies, 6 live telemetry JSON evidence files, `MANIFEST.json`, and auditor `README.md`.
3. The user downloads the **Executive Audit Dossier (.PDF)**.
4. The auditor certifies clean compliance attestation.

---

## 5. Technology Stack & Local AI Architecture

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Web App** | Next.js 15 (App Router), React 19, Tailwind CSS, Lucide | Modern Scrut-style compliance cockpit, interactive terminal drawers, and PDF viewer. |
| **API & Enterprise Layer** | NestJS, TypeScript, Prisma ORM | Business logic, organization governance, JWT auth, and test-once-comply-many measures. |
| **AI & Telemetry Engine** | Python 3.11+, FastAPI, Uvicorn (Port 8000) | Local fine-tuned LLM inference, RAG gap analysis, cloud collectors, and binary ZIP generation. |
| **Open-Source LLM** | Meta Llama 3.1 8B Instruct (Fine-Tuned GRC) | Air-gapped, host-local policy generation and remediation without OpenAI or external API fees. |
| **RAG Vector Engine** | pgvector / Embeddings Service | Semantic search against control requirements and evidence documents. |
| **Document Engine** | Client-Side PDF-1.4 Generator (`pdfGenerator.ts`) | Generates genuine binary `.pdf` documents and print layouts directly in the browser. |

---

## 6. Accessing & Running the Platform

- **Dashboard:** `http://localhost:3000/dashboard`
- **Policies:** `http://localhost:3000/policies`
- **Automated Tests:** `http://localhost:3000/tests`
- **Integrations:** `http://localhost:3000/integrations`
- **Audit Center:** `http://localhost:3000/audits`
- **Auditor Export (.ZIP):** `http://localhost:3000/export`
- **FastAPI AI Docs:** `http://localhost:8000/docs`
