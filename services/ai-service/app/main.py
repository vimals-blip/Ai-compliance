from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="AI Compliance Engine",
    description="Automated multi-framework compliance verification, RAG gap analysis, and auditor reasoning engine.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

@app.get("/")
async def root():
    return {
        "message": "AI Compliance Engine API is running.",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
