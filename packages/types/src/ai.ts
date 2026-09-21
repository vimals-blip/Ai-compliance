// AI Service & Integration Types

export type AIAnalysisStatus = 'COMPLIANT' | 'PARTIAL' | 'NON_COMPLIANT' | 'INSUFFICIENT_EVIDENCE';

export type AIReviewStatus = 'PENDING_HUMAN_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'MODIFIED';

export type AIJobType =
  | 'DOCUMENT_PROCESSING'
  | 'EVIDENCE_ANALYSIS'
  | 'EMBEDDING_GENERATION'
  | 'COMPLIANCE_ANALYSIS';

export type AIJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface AICitation {
  document: string;
  page?: number;
  section?: string;
  text: string;
  confidence?: number;
}

export interface AIRecommendation {
  id?: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  suggestedAction?: string;
  ownerRole?: string;
  dueInDays?: number;
}

export interface AIEvidenceAnalysisResult {
  controlId: string;
  status: AIAnalysisStatus;
  confidence: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  gaps: string[];
  recommendations: string[];
  citations: AICitation[];
  summary: string;
  model: string;
  modelVersion?: string;
  promptVersion?: string;
}

export interface AIAnalysisEntity {
  id: string;
  organizationId: string;
  evidenceId: string;
  controlId: string;
  status: AIAnalysisStatus;
  confidence: number;
  riskLevel: string;
  gaps: string[];
  summary: string;
  model: string;
  modelVersion?: string;
  promptVersion?: string;
  citations: AICitation[];
  reviewStatus: AIReviewStatus;
  reviewedById?: string;
  reviewedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AIJobPayload {
  jobType: AIJobType;
  organizationId: string;
  evidenceId: string;
  controlIds: string[];
  options?: Record<string, unknown>;
}
