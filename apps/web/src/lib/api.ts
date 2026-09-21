export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.trim() !== '')
  ? process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '')
  : '/api';

async function fetchJSON<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      cache: 'no-store',
    });
    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(`API error ${res.status}: ${errorBody || res.statusText}`);
    }
    return await res.json();
  } catch (err: any) {
    throw err;
  }
}

export const api = {
  // Dashboard
  getDashboardSummary: async () => {
    return fetchJSON<any>('/dashboard/summary');
  },

  // Frameworks
  getFrameworks: async () => {
    return fetchJSON<any[]>('/frameworks');
  },
  getFrameworkById: async (id: string) => {
    return fetchJSON<any>(`/frameworks/${id}`);
  },
  createFramework: async (data: any) => {
    return fetchJSON<any>('/frameworks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Controls
  getControls: async (params?: { frameworkId?: string; status?: string; category?: string }) => {
    const query = new URLSearchParams();
    if (params?.frameworkId) query.append('frameworkId', params.frameworkId);
    if (params?.status) query.append('status', params.status);
    if (params?.category) query.append('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJSON<any[]>(`/controls${qs}`);
  },
  getControlById: async (id: string) => {
    return fetchJSON<any>(`/controls/${id}`);
  },
  updateControlStatus: async (id: string, status: string) => {
    return fetchJSON<any>(`/controls/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Risks
  getRisks: async (params?: { severity?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJSON<any[]>(`/risks${qs}`);
  },
  createRisk: async (data: any) => {
    return fetchJSON<any>('/risks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateRisk: async (id: string, data: any) => {
    return fetchJSON<any>(`/risks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Audits
  getAudits: async () => {
    return fetchJSON<any[]>('/audits');
  },
  getAuditById: async (id: string) => {
    return fetchJSON<any>(`/audits/${id}`);
  },
  createAudit: async (data: any) => {
    return fetchJSON<any>('/audits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Findings
  getFindings: async (params?: { auditId?: string; severity?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.auditId) query.append('auditId', params.auditId);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.status) query.append('status', params.status);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJSON<any[]>(`/findings${qs}`);
  },
  createFinding: async (data: any) => {
    return fetchJSON<any>('/findings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Evidence
  getEvidenceList: async () => {
    return fetchJSON<any[]>('/evidence');
  },
  getEvidenceById: async (id: string) => {
    return fetchJSON<any>(`/evidence/${id}`);
  },
  createEvidence: async (data: any) => {
    return fetchJSON<any>('/evidence', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // AI Analysis
  analyzeEvidence: async (evidenceId: string, controlIds: string[], documentText?: string) => {
    return fetchJSON<any>('/ai/analyze-evidence', {
      method: 'POST',
      body: JSON.stringify({ evidence_id: evidenceId, control_ids: controlIds, document_text: documentText }),
    });
  },
  getAIAnalyses: async (params?: { evidenceId?: string; controlId?: string }) => {
    const query = new URLSearchParams();
    if (params?.evidenceId) query.append('evidenceId', params.evidenceId);
    if (params?.controlId) query.append('controlId', params.controlId);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return fetchJSON<any[]>(`/ai/analyses${qs}`);
  },
  reviewAIAnalysis: async (id: string, reviewStatus: string, reviewerNotes?: string) => {
    return fetchJSON<any>(`/ai/analyses/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ reviewStatus, reviewerNotes }),
    });
  },

  // Policy Generation
  generatePolicy: async (data: { company_name: string; policy_type: string; cloud_provider: string; mfa_tool: string }) => {
    return fetchJSON<any>('/ai/generate-policy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  getPolicyTemplates: async () => {
    return fetchJSON<any>('/ai/policy-templates');
  },

  // Integrations - Evidence Collection
  collectEvidence: async (source: string) => {
    return fetchJSON<any>(`/ai/integrations/collect?source=${source}`);
  },
  collectAllEvidence: async () => {
    return fetchJSON<any>('/ai/integrations/collect-all');
  },

  // Export
  exportAuditorPackage: async (data: { company_name: string; cloud_provider: string; mfa_tool: string }) => {
    const url = `${API_BASE_URL}/export/auditor-package`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Export failed');
    return res.blob();
  },

  // Measures (Test Once, Comply Many)
  getMeasures: async () => {
    return fetchJSON<any[]>('/measures');
  },
  createMeasure: async (data: any) => {
    return fetchJSON<any>('/measures', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Statement of Applicability
  getStatementOfApplicability: async () => {
    return fetchJSON<any[]>('/soa');
  },
  createSoA: async (data: any) => {
    return fetchJSON<any>('/soa', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Integrations Hub
  getIntegrations: async () => {
    return fetchJSON<any>('/integrations');
  },

  // Automated Tests
  getAutomatedTests: async () => {
    return fetchJSON<any>('/tests');
  },
  runAutomatedTest: async (testId: string) => {
    return fetchJSON<any>('/tests', {
      method: 'POST',
      body: JSON.stringify({ testId }),
    });
  },
};
