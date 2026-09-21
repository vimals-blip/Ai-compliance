# AI-Compliance Platform

An enterprise-grade, automated compliance orchestration platform designed for multi-framework governance (**SOC 2 Type II**, **ISO/IEC 27001:2022**, and **NIST Cybersecurity Framework v2.0**). Features continuous evidence mapping, pgvector RAG gap analysis, automated risk registers, and auditor-ready reporting.

---

## 🏗 System Architecture

The platform is structured as a scalable monorepo with microservices:

```
├── apps/
│   ├── api/                    # NestJS REST API with Prisma ORM & JWT Auth (Port 4000)
│   └── web/                    # Next.js 15 App Router Frontend with Tailwind CSS (Port 3000)
├── services/
│   └── ai-service/             # FastAPI Python RAG AI Compliance Engine (Port 8000)
├── packages/
│   ├── types/                  # Shared TypeScript interfaces & domain types
│   ├── config/                 # Shared TypeScript & build configs
│   └── ui/                     # Shared UI components
├── compliance-data/            # Standard control catalogs (SOC2, ISO27001, NIST-CSF)
├── infrastructure/             # Docker, PostgreSQL (pgvector), Redis, MinIO S3
└── docker-compose.yml          # Full multi-container local stack orchestration
```

---

## 🚀 Quick Start: Run on Local

### Prerequisites
- **Docker** & **Docker Compose** installed (or Node.js 20+ and Python 3.11+ for non-docker run)

### 1. Launch the Full Stack via Docker Compose
Run the entire platform (Postgres with pgvector, Redis, MinIO, API, Web, and AI Engine) with a single command:

```bash
docker compose up -d --build
```

### 2. Service Endpoints

| Service | URL | Description |
| :--- | :--- | :--- |
| **Web Dashboard** | [http://localhost:3000](http://localhost:3000) | Compliance Ops UI & Reports |
| **Backend REST API** | [http://localhost:4000/api](http://localhost:4000/api) | NestJS REST API |
| **API Swagger Docs** | [http://localhost:4000/api/docs](http://localhost:4000/api/docs) | OpenAPI interactive documentation |
| **AI Compliance Engine** | [http://localhost:8000/docs](http://localhost:8000/docs) | FastAPI RAG & Evidence Parser |
| **MinIO S3 Console** | [http://localhost:9001](http://localhost:9001) | S3 Evidence Object Storage (`minioadmin` / `minioadmin`) |
| **PostgreSQL DB** | `localhost:5432` | Database (`compliance_user` / `compliance_password` / `compliance_db`) |
| **Redis Cache** | `localhost:6379` | Queue and cache layer |

---

## 🧪 Seeding Baseline Compliance Data

To seed the initial organization, SOC 2, ISO 27001, and NIST CSF controls and risks into the database:

```bash
# Inside the running api container or locally:
cd apps/api
npx prisma db push
npx ts-node prisma/seed.ts
```

---

## 📦 Running Services Locally Without Docker (Development Mode)

### 1. Install Monorepo Dependencies
```bash
npm install
npm run --workspace=@ai-compliance/types build
```

### 2. Start PostgreSQL & MinIO
Ensure PostgreSQL (with pgvector) and Redis are running locally.

### 3. Start Backend API
```bash
cd apps/api
npm run start:dev
```

### 4. Start Python AI Service
```bash
cd services/ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 5. Start Next.js Frontend
```bash
cd apps/web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡 Features Included

- **Continuous Multi-Framework Monitoring**: Unified view across SOC 2, ISO 27001, and NIST CSF.
- **AI Gap Analysis & Evidence RAG**: Evaluates uploaded policy documents and configurations against specific controls, outputting confidence scores, verbatim citations, and actionable recommendations.
- **5x5 Risk Heatmap & Register**: Automated risk calculation ($Risk = Likelihood \times Impact$) with real-time severity badges.
- **Audit & Findings Management**: Track external examination milestones, auditor assignments, and corrective actions.
- **Auditor-Ready Report Generator**: One-click generation of executive briefs, SOC 2 evidence packages, and Statement of Applicability (SoA).
