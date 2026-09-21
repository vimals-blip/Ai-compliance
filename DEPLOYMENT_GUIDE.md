# Cloud Deployment & Live Architecture Guide

This project is architected as a decoupled production system:
1. **Frontend**: Next.js 15 App Router (`apps/web`) → Deploy on **Vercel**
2. **Backend**: Python FastAPI AI & Compliance Engine (`services/ai-service`) → Deploy on **Render**
3. **Database**: PostgreSQL (with vector support) → Deploy on **Supabase**, **Neon**, or **Render Managed Postgres**

---

## 1. Step 1: Database Setup (Choose One)

### Option A: Supabase (Recommended - Free & Fast)
1. Go to [Supabase](https://supabase.com) and create a new project.
2. Under **Project Settings** > **Database**, copy your **URI Connection String** (format: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`).

### Option B: Neon Serverless Postgres (Free)
1. Go to [Neon.tech](https://neon.tech) and create a database.
2. Copy the pooled connection string (`postgresql://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/neondb?sslmode=require`).

### Option C: Render PostgreSQL
- Render can automatically provision PostgreSQL alongside your backend using the included [`render.yaml`](/render.yaml).

---

## 2. Step 2: Deploy Backend on Render

1. Push your repository to **GitHub**.
2. Log into [Render.com](https://render.com) and click **New +** > **Blueprint** (or **Web Service**).
   - If using Blueprint: Connect your repo and Render will detect [`render.yaml`](/render.yaml) automatically.
   - If using Web Service manually:
     - **Root Directory**: `services/ai-service`
     - **Runtime**: `Python 3`
     - **Build Command**: `pip install -r requirements.txt`
     - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. In the **Environment Variables** tab, set:
   - `DATABASE_URL`: Your PostgreSQL connection string (from Step 1)
   - `LLM_PROVIDER`: `local` (or `openai` / `deepseek` if providing API keys)
   - `OPENAI_API_KEY`: *(Optional)* Your API key if using OpenAI.
4. Click **Deploy**. Render will generate a live URL:
   `https://ai-compliance-backend-xxxx.onrender.com`

---

## 3. Step 3: Deploy Frontend on Vercel

1. Log into [Vercel.com](https://vercel.com) and click **Add New...** > **Project**.
2. Import your GitHub repository.
3. In the project configuration:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click *Edit* and select **`apps/web`** (or leave root and let Next.js build).
4. Expand **Environment Variables** and add:
   - `AI_SERVICE_URL`: `https://ai-compliance-backend-xxxx.onrender.com` (Your Render backend URL from Step 2)
   - `NEXT_PUBLIC_APP_URL`: `https://your-project-name.vercel.app` (Your Vercel URL)
5. Click **Deploy**. Vercel will build and launch your live URL:
   `https://your-project-name.vercel.app`

---

## 4. Live Verification Checklist

Once deployed, visit your live Vercel URL:
1. **Integrations tab (`/integrations`)**: Connect your GitHub PAT and verify that all repositories (`vimals-blip/VLN`, `vimals-blip/HomeHERO-UPDATED`) are discovered.
2. **Evidence Vault (`/evidence`)**: Click **Collect All Live Telemetry** and verify artifacts are created. Click **AI Analysis** to test the live Render FastAPI connection.
3. **Continuous Tests (`/tests`)**: Verify real-time SOC 2 CC8.1 / CC6.8 tests run against your repositories.
4. **Settings (`/settings`)**: Test the AI Engine Status indicator (which pings `${AI_SERVICE_URL}/api/v1/health`).
