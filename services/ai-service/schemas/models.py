from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class AnalysisStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    PARTIAL = "PARTIAL"
    NON_COMPLIANT = "NON_COMPLIANT"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"

class SeverityLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class ControlMaturityLevel(str, Enum):
    NONE = "NONE"
    INITIAL = "INITIAL"
    MANAGED = "MANAGED"
    DEFINED = "DEFINED"
    QUANTITATIVELY_MANAGED = "QUANTITATIVELY_MANAGED"
    OPTIMIZING = "OPTIMIZING"

class Citation(BaseModel):
    document: str
    page: Optional[int] = None
    section: Optional[str] = None
    text: str
    confidence: Optional[float] = 1.0

class Recommendation(BaseModel):
    title: str
    description: str
    priority: SeverityLevel = SeverityLevel.MEDIUM
    suggested_action: Optional[str] = None
    owner_role: Optional[str] = None
    due_in_days: Optional[int] = 30
    
    # New fields for risk modeling recommendation
    suggested_inherent_likelihood: Optional[int] = Field(None, ge=1, le=5)
    suggested_inherent_impact: Optional[int] = Field(None, ge=1, le=5)
    suggested_residual_likelihood: Optional[int] = Field(None, ge=1, le=5)
    suggested_residual_impact: Optional[int] = Field(None, ge=1, le=5)

class EvidenceAnalysisRequest(BaseModel):
    evidence_id: str
    organization_id: Optional[str] = "org-default"
    measure_ids: List[str] = []   # Adapted to Test Once, Comply Many
    control_ids: List[str] = []
    document_text: Optional[str] = None
    document_url: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

class EvaluationResult(BaseModel):
    target_id: str   # Could be measure_id or control_id
    status: AnalysisStatus
    confidence: float = Field(ge=0.0, le=1.0)
    risk_level: SeverityLevel
    assessed_maturity_level: Optional[ControlMaturityLevel] = None
    gaps: List[str] = []
    recommendations: List[Recommendation] = []
    citations: List[Citation] = []
    summary: str
    model: str = "compliance-rag-v1"
    model_version: Optional[str] = "2026.1"
    prompt_version: Optional[str] = "v3"

class EvidenceAnalysisResponse(BaseModel):
    evidence_id: str
    evaluations: List[EvaluationResult]
    processed_chunks: int = 0
    processing_time_ms: float = 0.0

class PolicyGenerationRequest(BaseModel):
    company_name: str
    policy_type: str = "Information Security Policy"
    cloud_provider: str = "AWS"
    mfa_tool: str = "Okta"
    version: str = "1.0"

class PolicyGenerationResponse(BaseModel):
    policy_type: str
    content_markdown: str
    generated_at: str
