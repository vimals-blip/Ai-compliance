# Complete Tech Stack & Packages Learning Guide
## Engineering Roadmap for Scaling AI-Compliance Platform to Millions of Users

**Document Target:** Developers, Engineers & Technical Leads  
**Location:** `/home/cis/Desktop/AI-Comliance/docs/TECH_STACK_AND_PACKAGES_LEARNING_GUIDE.md`  
**Core Technologies:** React / Next.js, Node.js / NestJS, Python (FastAPI & PyTorch), Redis, AI/RAG Inference (vLLM & Qdrant)

---

## 1. Complete Technology Stack Overview

```
+-----------------------------------------------------------------------------------------+
|                              AI-COMPLIANCE PRODUCT TECH STACK                           |
+-------------------+---------------------------------------------------------------------+
| 1. Frontend       | React 19, Next.js 15 (App Router), Zustand, TanStack Query, Tailwind|
| 2. Backend (Node) | NestJS (Enterprise TypeScript), TypeORM/Prisma, BullMQ, Passport JWT|
| 3. Backend (Py)   | Python 3.11+, FastAPI, Pydantic v2, vLLM, LangChain, Celery, PyTorch |
| 4. Caching & Bus  | Redis Cluster, Redis Streams, Redlock, Redis Vector Search          |
| 5. Databases      | PostgreSQL (with Citus sharding), ClickHouse (Audit logs), Qdrant   |
| 6. DevOps & Cloud | Docker, Kubernetes (EKS/GKE), Terraform, Envoy Gateway, OpenTelemetry|
+-------------------+---------------------------------------------------------------------+
```

---

## 2. Frontend Ecosystem (React & Next.js)

### Primary Frameworks & Libraries
* **Next.js 15 & React 19**: Modern hybrid rendering (Server Components, Client Components `'use client'`, Server Actions, Streaming with Suspense, Route Handlers).
* **State Management**:
  * **Zustand (`zustand`)**: Lightweight global state management for persisted compliance items (Controls, Risks, Evidence, Policies) with `localStorage` middleware.
  * **Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)**: Enterprise predictable state container with slice architecture and RTK Query for data caching.
* **Server State & Data Fetching**:
  * **TanStack Query (`@tanstack/react-query`)**: Declarative remote data fetching, caching, deduplication, and optimistic updates.
* **Forms & Validation**:
  * **React Hook Form (`react-hook-form`)**: High-performance form handling.
  * **Zod (`zod`)**: TypeScript-first schema declaration and validation (`@hookform/resolvers/zod`).
* **UI & Styling**:
  * **Tailwind CSS (`tailwindcss`)**: Utility-first CSS framework.
  * **Radix UI (`@radix-ui/react-*`)** / **Headless UI**: Unstyled accessible UI primitives (Dialogs, Dropdowns, Tooltips, Tabs).
  * **Lucide React (`lucide-react`)**: Clean enterprise icon set.
  * **Framer Motion (`framer-motion`)**: Smooth dashboard animations and transitions.
* **Data Visualization**:
  * **Recharts (`recharts`)**: Declarative chart library for compliance posture scores, risk matrices, and control distributions.
* **PDF & Client-Side Export**:
  * **jsPDF (`jspdf`)** / Custom Stream Generator: Native client-side PDF compilation with corporate headers and signatures.

---

## 3. Backend Ecosystem: Node.js & NestJS (Enterprise Multi-Tenant APIs)

### Core Framework Packages
* **`@nestjs/core` & `@nestjs/common`**: Enterprise modular architecture with Inversion of Control (IoC) and Dependency Injection (DI).
* **`@nestjs/microservices`**: Building decoupled microservices communicating via TCP, gRPC, Redis, or Kafka.
* **`@nestjs/jwt` & `@nestjs/passport` + `passport-jwt`**: Multi-tenant authentication, token verification, and role-based access control (RBAC).
* **`@nestjs/swagger` & `swagger-ui-express`**: Automated OpenAPI/Swagger documentation generation from DTO classes.

### Database, ORM & Caching in NestJS
* **Prisma (`@prisma/client`)** or **TypeORM (`typeorm`)**: Multi-tenant schema migrations, relationship mapping, and Row-Level Security (`RLS`) integration.
* **BullMQ (`bullmq` & `@nestjs/bullmq`)**: Asynchronous background job processing for heavy evidence collection, PDF generation, and batch telemetry scans.
* **`ioredis`**: Robust async Redis client with support for Redis Cluster, Sentinel, and pipelining.
* **Security Middleware**: `helmet`, `csurf`, `cors`, `express-rate-limit`, `bcryptjs`.

---

## 4. AI & Python Ecosystem: FastAPI, LLMs & High-Throughput RAG

### Web Framework & Serialization
* **FastAPI (`fastapi`) & `uvicorn`**: High-throughput asynchronous Python web framework powered by Starlette.
* **Pydantic v2 (`pydantic` & `pydantic-settings`)**: Rust-powered high-speed data parsing and strict JSON schema contracts.

### Production LLM Serving & Inference
* **vLLM (`vllm`)**: State-of-the-art open-source LLM serving engine featuring:
  * **PagedAttention**: Memory-efficient KV cache management.
  * **Continuous Batching**: Maximizes GPU compute utilization across concurrent compliance evaluation requests.
  * **Quantization**: FP8, AWQ, and GPTQ support for hosting Llama 3.1 70B / DeepSeek models on standard GPUs.
* **NVIDIA Triton Inference Server (`tritonclient`)**: Multi-model enterprise inference server supporting ONNX, TensorRT-LLM, and PyTorch.

### Vector Search, Hybrid Retrieval & RAG
* **Qdrant (`qdrant-client`)** / **Milvus (`pymilvus`)**: Production vector search engines supporting payload filtering (by `tenant_id`, `framework`), HNSW indexing, and distributed clustering.
* **LangChain (`langchain`) & LlamaIndex**: Frameworks for document parsing, intelligent semantic chunking, and retrieval orchestration.
* **Sentence-Transformers (`sentence-transformers`)**: Generating dense embeddings (`bge-large-en-v1.5`, `all-MiniLM-L6-v2`).
* **`rank_bm25`**: Sparse keyword search engine to enable **Hybrid Search (Dense Vector + BM25)** for finding specific compliance control codes (e.g. `CC6.1`, `A.8.24`).
* **Cross-Encoder Re-Ranking (`cohere` / BAAI Reranker)**: Re-ranking candidate evidence chunks before passing them to the LLM.

### Structured Output & RAG Evaluation
* **Instructor (`instructor`) & Outlines (`outlines`)**: Enforcing strict Pydantic JSON schema generation from LLMs (eliminates JSON syntax errors).
* **Ragas (`ragas`) & TruLens (`trulens-eval`)**: Frameworks for programmatic RAG evaluation:
  * **Faithfulness**: Mathematically verifying that claims are 100% grounded in retrieved evidence (0% hallucination).
  * **Answer Relevance**: Evaluating if recommendations directly address compliance gaps.
  * **Context Recall & Precision**: Measuring search retrieval quality against compliance standards.

---

## 5. Redis Hyperscale Architecture

```
                                [ Redis Cluster Backbone ]
                                             │
      ┌───────────────────────────┬──────────┴────────────────┬──────────────────────────┐
      │                           │                           │                          │
[ Redis Streams ]         [ Redlock Mutex ]         [ Semantic Cache ]         [ Token Bucket ]
(Async Telemetry Bus)   (Exact-Once Remediation)   (RediSearch <5ms Verdict)  (DDoS & Rate Limiting)
```

1. **Redis Streams (`XADD`, `XREADGROUP`, `XACK`)**: High-throughput telemetry ingestion pipeline decoupling cloud collectors from evaluation workers.
2. **Distributed Locking (`Redlock`)**: Prevents race conditions during automated remediations across multiple parallel worker pods.
3. **Semantic Vector Cache (Redis Stack / RediSearch)**: Caches prior LLM compliance evaluations to return recurring verdicts in <5ms without re-running GPU inference.
4. **Sliding Window Rate Limiter**: Protects public APIs and webhooks using atomic Lua scripts.

---

## 6. Step-by-Step Learning Roadmap

### Month 1: Modern Full-Stack Foundations
* Master TypeScript, React 19, and Next.js 15 App Router (`page.tsx`, `layout.tsx`, `route.ts`, Server Actions).
* Learn state management with **Zustand** and **Redux Toolkit**.
* Build backend APIs with **NestJS** (Modules, Controllers, Services, Dependency Injection, DTOs with `class-validator`).

### Month 2: Distributed Queues, Caching & Relational Databases
* Master **PostgreSQL** (Indexes, Transactions, Connection Pooling with PgBouncer, Row-Level Security).
* Implement **Redis Cluster**, **Redis Streams**, and distributed locks (**Redlock**).
* Implement background job queues with **BullMQ** in NestJS.

### Month 3: Python, FastAPI & Production RAG Pipelines
* Master **FastAPI** with **Pydantic v2** asynchronous endpoints.
* Deploy **Qdrant Vector DB** and implement **Hybrid Search (BM25 + Dense Embeddings)**.
* Build multi-stage RAG pipelines with **LangChain / LlamaIndex** and **Cross-Encoder Re-ranking**.

### Month 4: High-Scale AI Inference, Evaluation & Kubernetes
* Deploy self-hosted open-source LLMs (Llama 3.1 70B) with **vLLM** and PagedAttention.
* Implement structured JSON output enforcement with **Instructor / Outlines**.
* Implement automated RAG evaluation metrics using **Ragas (Faithfulness, Precision, Recall)**.
* Learn **Docker, Kubernetes (EKS/GKE), Terraform**, and database sharding (**Citus Data / ClickHouse**).

---

## 7. Recommended Practice Project (To Master the Entire Stack)

Build a full-stack **"Automated Cloud Security Scanner & AI Auditor"**:
1. **Frontend (Next.js + Tailwind + Zustand)**: A dashboard showing connected GitHub/AWS integrations, passing/failing security tests, and a 1-click remediation button.
2. **Backend API (NestJS + BullMQ + Redis)**: Authenticates to GitHub REST API, pulls branch protection posture, and pushes raw JSON into a Redis Stream.
3. **AI Worker (Python + FastAPI + Qdrant + vLLM)**: Retrieves SOC 2 `CC8.1` guidelines from Qdrant, runs Llama 3.1 evaluation, validates the output with Pydantic, and verifies faithfulness using Ragas.
4. **Audit Export**: Generates a downloadable branded PDF and SHA-256 verified ZIP file containing the full audit package.

---

*Document created and maintained by CIS Enterprise Solutions &bull; Version 1.0*
