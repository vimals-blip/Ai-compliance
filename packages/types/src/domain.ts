// Core Domain Types for AI-Compliance Platform

export type RoleType =
  | 'ADMIN'
  | 'COMPLIANCE_MANAGER'
  | 'AUDITOR'
  | 'CONTRIBUTOR'
  | 'VIEWER';

export type ControlStatus =
  | 'EFFECTIVE'
  | 'ISSUE'
  | 'NOT_OPERATING'
  | 'NOT_APPLICABLE'
  | 'NOT_TESTED';

export type EvidenceStatus =
  | 'VALID'
  | 'EXPIRED'
  | 'UNDER_REVIEW'
  | 'REJECTED'
  | 'PENDING_REVIEW';

export type RiskSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RiskStatus = 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';

export type FindingSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type FindingStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED' | 'ACCEPTED';

export type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED' | 'ARCHIVED';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

// Entity Interfaces
export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Framework {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  version: string;
  description?: string;
  source?: string;
  sourceVersion?: string;
  retrievedAt?: Date | string;
  licenseOrUsageNote?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Control {
  id: string;
  frameworkId: string;
  code: string;
  title: string;
  description: string;
  category: string;
  status: ControlStatus;
  maturityLevel: number;
  isApplicable: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Evidence {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  type: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  status: EvidenceStatus;
  collectedAt: Date | string;
  expiresAt?: Date | string;
  uploadedById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Risk {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  category: string;
  likelihood: number; // 1..5
  impact: number;     // 1..5
  riskScore: number;  // likelihood * impact (1..25)
  severity: RiskSeverity;
  status: RiskStatus;
  ownerId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Audit {
  id: string;
  organizationId: string;
  frameworkId: string;
  title: string;
  description?: string;
  status: AuditStatus;
  startDate: Date | string;
  endDate?: Date | string;
  leadAuditorId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Finding {
  id: string;
  organizationId: string;
  auditId: string;
  controlId?: string;
  title: string;
  description: string;
  severity: FindingSeverity;
  status: FindingStatus;
  assignedToId?: string;
  identifiedAt: Date | string;
  dueDate?: Date | string;
  resolutionNotes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Task {
  id: string;
  organizationId: string;
  findingId?: string;
  controlId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId?: string;
  dueAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ComplianceSnapshot {
  id: string;
  organizationId: string;
  snapshotMonth: string; // YYYY-MM
  score: number;
  effectiveControls: number;
  applicableControls: number;
  openRisks: number;
  auditFindings: number;
  createdAt: Date | string;
}

// Dashboard Specific Types
export interface RiskHeatmapCell {
  likelihood: number;
  impact: number;
  count: number;
}

export interface ComplianceTrendPoint {
  month: string;
  score: number;
}

export interface ControlsStatusSummary {
  status: ControlStatus;
  count: number;
  percentage: number;
}

export interface DashboardSummaryResponse {
  openRisks: number;
  controlsTested: number;
  auditFindings: number;
  complianceScore: number;
  previousComplianceScore: number;
  riskHeatmap: RiskHeatmapCell[];
  complianceTrend: ComplianceTrendPoint[];
  controlsStatus: ControlsStatusSummary[];
  recentFindings: Finding[];
}
