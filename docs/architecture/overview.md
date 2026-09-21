# AI-Compliance Architecture Overview

The AI-Compliance system is architected as a modular distributed platform to handle compliance evidence collection, automated gap analysis using Retrieval-Augmented Generation (RAG), and continuous multi-framework audit tracking.

## Components

1. **`apps/web` (Next.js 15 App Router)**
   - Client dashboard with real-time compliance metrics, risk matrix, evidence viewer, and reporting widgets.
   - Built with Tailwind CSS, Lucide icons, and React Query.

2. **`apps/api` (NestJS REST API)**
   - Central business logic service managing organizations, controls, audits, risks, and evidence metadata.
   - Integrated with Prisma ORM for type-safe PostgreSQL interactions.

3. **`services/ai-service` (FastAPI Python Engine)**
   - RAG and document chunking service.
   - Vector similarity search using pgvector embeddings (1536-dim).
   - Generates confidence scores, identified gaps, citations with document/page references, and remediation recommendations.

4. **`infrastructure` (Docker Compose Stack)**
   - **PostgreSQL 16 + pgvector**: Relational storage and vector embeddings.
   - **Redis**: Queue and caching.
   - **MinIO**: S3-compatible evidence artifact object storage.
