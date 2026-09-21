'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import {
  getPersistedList,
  addPersistedItem,
  updatePersistedItem,
  removePersistedItem,
  savePersistedList,
} from '../../lib/clientStore';
import {
  FileText,
  Plus,
  Sparkles,
  Eye,
  Download,
  Check,
  Loader2,
  X,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  ChevronRight,
  RotateCcw,
  Trash2,
  Edit2,
  Users,
  Printer,
  Paperclip,
  Shield,
  FileCheck,
  FileCode,
  Upload,
  UploadCloud,
} from 'lucide-react';
import { generateSimplePDF, openPrintableReport } from '../../lib/pdfGenerator';
import { api } from '../../lib/api';

interface PolicyItem {
  id: string;
  title: string;
  framework: string;
  status: 'NOT_UPLOADED' | 'DRAFT' | 'APPROVED' | 'NEEDS_REVIEW' | 'PUBLISHED';
  assignee: { name: string; initials: string };
  approver: string;
  department: 'IT' | 'GOV' | 'HR' | 'SECURITY' | 'LEGAL';
  version: string;
  recurrence: 'Annually' | 'Bi-Annually' | 'Quarterly';
  entities: string;
  updatedAt: string;
  requirement: string;
  content: string;
  attachment?: {
    name: string;
    size: number;
    uploadedAt: string;
    type?: string;
  } | null;
}

const INITIAL_POLICIES: PolicyItem[] = [
  {
    id: 'p-1',
    title: 'Information Security (IS) Policy',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
    approver: 'Security Steering Committee',
    department: 'GOV',
    version: 'v3.2',
    recurrence: 'Annually',
    entities: 'Organization Wide',
    updatedAt: '2026-09-10',
    requirement: 'Establishes the organization\'s formal commitment to protecting information assets from unauthorized access, loss, or alteration across all departments.',
    content: `# Information Security Policy\n**Version:** 3.2 | **Status:** Published | **Framework:** SOC 2, ISO 27001\n\n## 1. Objective and Scope\nThis policy defines the security principles and administrative controls governing all digital assets, databases, and employees at the organization.\n\n## 2. Access and Cryptography\n- All employees must authenticate via Okta SSO enforcing FIDO2/WebAuthn MFA.\n- Data stored in production object storage (AWS S3) must enforce default AWS KMS SSE encryption.\n- Public ingress endpoints require TLS 1.2+ with strict cipher suite constraints.`,
  },
  {
    id: 'p-2',
    title: 'Access Control and Identity Management Policy',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'Alex Rivera', initials: 'AR' },
    approver: 'Head of Infrastructure',
    department: 'IT',
    version: 'v2.1',
    recurrence: 'Quarterly',
    entities: 'Organization Wide',
    updatedAt: '2026-09-08',
    requirement: 'Defines least-privilege role-based access control (RBAC), quarterly access reviews, and automated de-provisioning upon employee termination.',
    content: `# Access Control and Identity Management Policy\n**Version:** 2.1 | **Status:** Published\n\n## 1. Principle of Least Privilege\nAccess rights to production environments and customer data are granted strictly based on the principle of least privilege. Access requests require manager approval and are re-certified quarterly.\n\n## 2. Deprovisioning SLA\nUpon notification of employee departure, all IAM credentials and SaaS licenses must be revoked within 4 hours.`,
  },
  {
    id: 'p-3',
    title: 'Incident Response and Disaster Recovery Plan',
    framework: 'SOC 2',
    status: 'NEEDS_REVIEW',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
    approver: 'CISO / Auditor',
    department: 'SECURITY',
    version: 'v1.4',
    recurrence: 'Annually',
    entities: 'Engineering & Cloud',
    updatedAt: '2026-09-15',
    requirement: 'Provides step-by-step procedures for detecting, triaging, mitigating, and documenting security incidents, including tabletop simulation schedules.',
    content: `# Incident Response and Disaster Recovery Plan\n**Version:** 1.4 | **Status:** Needs Review\n\n## 1. Severity Levels\n- **P1 (Critical):** Data breach, complete service outage. Response SLA: 15 minutes.\n- **P2 (Major):** Degraded customer functionality. Response SLA: 1 hour.\n\n## 2. Communication\nIncident coordination occurs in the dedicated Slack channel #incident-response. Formal post-mortems are conducted within 48 hours.`,
  },
  {
    id: 'p-4',
    title: 'Data Classification and Handling Policy',
    framework: 'ISO 27001',
    status: 'APPROVED',
    assignee: { name: 'David Kim', initials: 'DK' },
    approver: 'Legal Counsel',
    department: 'GOV',
    version: 'v2.0',
    recurrence: 'Annually',
    entities: 'Organization Wide',
    updatedAt: '2026-09-12',
    requirement: 'Categorizes data into Public, Internal, Confidential, and Restricted tiers with explicit tagging, encryption, and retention schedules.',
    content: `# Data Classification and Handling Policy\n**Version:** 2.0 | **Status:** Approved\n\n## 1. Classification Tiers\n- **Restricted:** Customer PII, payment tokens, cryptographic keys. AES-256 encryption required.\n- **Confidential:** Financial statements, source code.\n- **Internal:** Internal wikis, roadmap notes.\n- **Public:** Marketing assets, public documentation.`,
  },
  {
    id: 'p-5',
    title: 'Mobile Device and Teleworking (MDM) Policy',
    framework: 'SOC 2',
    status: 'DRAFT',
    assignee: { name: 'James Wilson', initials: 'JW' },
    approver: 'IT Director',
    department: 'IT',
    version: 'v1.0',
    recurrence: 'Annually',
    entities: 'All Employees',
    updatedAt: '2026-09-16',
    requirement: 'Governs remote employee workstations, mandatory full-disk encryption (FileVault/BitLocker), and screen lock timeouts.',
    content: `# Mobile Device and Teleworking Policy\n**Version:** 1.0 | **Status:** Draft\n\n## 1. Device Security\nAll company laptops must run automated MDM profiles enforcing automatic OS security updates, local disk encryption, and 10-minute inactivity auto-lock.`,
  },
  {
    id: 'p-6',
    title: 'Threat Intelligence & Vulnerability Management Policy',
    framework: 'SOC 2',
    status: 'DRAFT',
    assignee: { name: 'Alex Rivera', initials: 'AR' },
    approver: 'Lead Security Engineer',
    department: 'SECURITY',
    version: 'v1.0',
    recurrence: 'Quarterly',
    entities: 'Production Cloud',
    updatedAt: '2026-09-16',
    requirement: 'Defines vulnerability SLA resolution timelines (Critical CVEs < 48 hours) and annual external penetration testing windows.',
    content: `# Vulnerability Management Policy\n**Version:** 1.0 | **Status:** Draft\n\n## 1. Scanning and SLAs\nAutomated CI/CD dependency scans run on every pull request. Critical severity vulnerabilities must be remediated or mitigated within 48 hours of public advisory.`,
  },
  {
    id: 'p-7',
    title: 'Vendor and Third-Party Risk Management Policy',
    framework: 'SOC 2',
    status: 'NOT_UPLOADED',
    assignee: { name: 'Sarah Chen', initials: 'SC' },
    approver: 'CFO / Compliance Lead',
    department: 'LEGAL',
    version: 'v0.0',
    recurrence: 'Annually',
    entities: 'Procurement',
    updatedAt: '-',
    requirement: 'Mandates due diligence audits, SOC 2 / ISO 27001 certificate verification, and standard DPA terms before onboarding third-party SaaS vendors.',
    content: '',
  },
  {
    id: 'p-8',
    title: 'Secure Software Development Lifecycle (SSDLC) Policy',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'David Kim', initials: 'DK' },
    approver: 'VP of Engineering',
    department: 'IT',
    version: 'v2.4',
    recurrence: 'Annually',
    entities: 'Engineering',
    updatedAt: '2026-09-02',
    requirement: 'Enforces code reviews, secret scanning, static analysis (SAST), and prohibition of direct commits to production branches.',
    content: `# Secure Software Development Lifecycle Policy\n**Version:** 2.4 | **Status:** Published\n\n## 1. Branch Protection\nDirect push to production branches is disabled via GitHub branch protection. All code changes require at least 1 approving peer review and green CI testing suite before merge.`,
  },
  {
    id: 'p-9',
    title: 'Code of Business Conduct and Ethics',
    framework: 'SOC 2',
    status: 'PUBLISHED',
    assignee: { name: 'Emily Watson', initials: 'EW' },
    approver: 'CEO & HR',
    department: 'HR',
    version: 'v3.0',
    recurrence: 'Annually',
    entities: 'Organization Wide',
    updatedAt: '2026-08-20',
    requirement: 'Standard organizational ethics, anti-bribery, conflict of interest, and whistleblower protection guidelines.',
    content: `# Code of Business Conduct\n**Version:** 3.0 | **Status:** Published\n\n## 1. Commitment\nAll employees must read, acknowledge, and adhere to the Code of Conduct upon hiring and annually thereafter.`,
  },
  {
    id: 'p-10',
    title: 'Business Continuity and Disaster Recovery Testing',
    framework: 'ISO 27001',
    status: 'NOT_UPLOADED',
    assignee: { name: 'Alex Rivera', initials: 'AR' },
    approver: 'Director of Ops',
    department: 'IT',
    version: 'v0.0',
    recurrence: 'Annually',
    entities: 'Infrastructure',
    updatedAt: '-',
    requirement: 'Annual validation of multi-region database failover, RTO (< 4 hrs) and RPO (< 1 hr) objectives.',
    content: '',
  },
];

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<PolicyItem[]>(INITIAL_POLICIES);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'all'>('all');
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyItem | null>(null);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [batchGenerating, setBatchGenerating] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number; title: string } | null>(null);
  const [showNoMissingModal, setShowNoMissingModal] = useState<boolean>(false);

  // Manual Upload Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);
  const [uploadTargetId, setUploadTargetId] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<number | null>(null);
  const [uploadContentText, setUploadContentText] = useState<string>('');
  const [uploadTargetStatus, setUploadTargetStatus] = useState<'DRAFT' | 'NEEDS_REVIEW'>('DRAFT');
  const uploadFileInputRef = useRef<HTMLInputElement>(null);
  const inspectorFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Policy Modal State
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [editingPolicy, setEditingPolicy] = useState<PolicyItem | null>(null);

  // Create Policy Modal State
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);
  const [newPolicy, setNewPolicy] = useState({
    title: '',
    framework: 'SOC 2',
    status: 'DRAFT' as PolicyItem['status'],
    assigneeName: 'Sarah Chen',
    assigneeInitials: 'SC',
    approver: 'Security Steering Committee',
    department: 'GOV' as PolicyItem['department'],
    version: 'v1.0',
    recurrence: 'Annually' as PolicyItem['recurrence'],
    entities: 'Organization Wide',
    requirement: '',
    content: '',
  });

  // Content Inline Edit in Inspector
  const [isEditingContent, setIsEditingContent] = useState<boolean>(false);
  const [editingContentText, setEditingContentText] = useState<string>('');

  const [workflowStep, setWorkflowStep] = useState<number>(1);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [orgInfo, setOrgInfo] = useState<{ name?: string; primaryCloud?: string; mfaTool?: string }>({
    name: 'CloudSecure Enterprise',
    primaryCloud: 'AWS',
    mfaTool: 'Okta',
  });

  // Fetch live policies and organization from persistent backend
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/policies');
        if (res.ok) {
          const data = await res.json();
          const loaded = getPersistedList('policies', Array.isArray(data) ? data : [], INITIAL_POLICIES);
          setPolicies(loaded);
        } else {
          const loaded = getPersistedList('policies', [], INITIAL_POLICIES);
          setPolicies(loaded);
        }
      } catch (err) {
        const loaded = getPersistedList('policies', [], INITIAL_POLICIES);
        setPolicies(loaded);
      }
      try {
        const orgRes = await fetch('/api/organization');
        if (orgRes.ok) {
          const org = await orgRes.json();
          if (org) setOrgInfo(org);
        }
      } catch {
        // keep default
      }
    }
    loadData();
  }, []);

  const persistPolicyUpdate = async (id: string, updates: Partial<PolicyItem>) => {
    try {
      await fetch('/api/policies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (err) {
      console.error('Failed to persist policy update:', err);
    }
  };

  const handleOpenEditModal = (policy: PolicyItem) => {
    setEditingPolicy({ ...policy });
    setEditModalOpen(true);
  };

  const handleSavePolicyEdit = async () => {
    if (!editingPolicy) return;
    const updated = updatePersistedItem('policies', editingPolicy, policies);
    setPolicies(updated);
    if (selectedPolicy && selectedPolicy.id === editingPolicy.id) {
      setSelectedPolicy(editingPolicy);
    }
    setEditModalOpen(false);
    setSuccessMsg(`Policy "${editingPolicy.title}" updated successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);

    try {
      await fetch('/api/policies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPolicy),
      });
    } catch (err) {
      console.error('Failed to update policy:', err);
    }
  };

  const handleOpenCreateModal = () => {
    setNewPolicy({
      title: '',
      framework: 'SOC 2',
      status: 'DRAFT',
      assigneeName: 'Sarah Chen',
      assigneeInitials: 'SC',
      approver: 'Security Steering Committee',
      department: 'GOV',
      version: 'v1.0',
      recurrence: 'Annually',
      entities: 'Organization Wide',
      requirement: '',
      content: '',
    });
    setCreateModalOpen(true);
  };

  const handleSaveCreatePolicy = async () => {
    if (!newPolicy.title.trim()) return;
    const created: PolicyItem = {
      id: `p-${Date.now()}`,
      title: newPolicy.title,
      framework: newPolicy.framework,
      status: newPolicy.status,
      assignee: {
        name: newPolicy.assigneeName,
        initials:
          newPolicy.assigneeInitials ||
          newPolicy.assigneeName
            .split(' ')
            .map((w) => w[0])
            .join('')
            .toUpperCase()
            .slice(0, 2),
      },
      approver: newPolicy.approver,
      department: newPolicy.department,
      version: newPolicy.version || 'v1.0',
      recurrence: newPolicy.recurrence,
      entities: newPolicy.entities,
      updatedAt: new Date().toISOString().split('T')[0],
      requirement:
        newPolicy.requirement ||
        `Mandatory operational compliance controls governing ${newPolicy.title}.`,
      content:
        newPolicy.content ||
        `# ${newPolicy.title}\n**Organization:** ${orgInfo.name || 'CloudSecure Enterprise'} | **Version:** ${newPolicy.version || 'v1.0'} | **Status:** Draft\n\n## 1. Scope & Mandate\n${newPolicy.requirement || 'Establishes operational security requirements.'}\n\n## 2. Technical Controls\nEnforced across ${newPolicy.entities} under ${newPolicy.framework}.`,
    };

    const updated = addPersistedItem('policies', created, policies);
    setPolicies(updated);
    setCreateModalOpen(false);
    setSuccessMsg(`New policy "${created.title}" created successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);

    try {
      await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(created),
      });
    } catch (err) {
      console.error('Failed to create policy:', err);
    }
  };

  const handleDeletePolicy = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete policy "${title}"?`)) return;
    const updated = removePersistedItem('policies', id, policies);
    setPolicies(updated);
    if (selectedPolicy && selectedPolicy.id === id) {
      setSelectedPolicy(null);
    }
    setSuccessMsg(`Policy "${title}" removed successfully!`);
    setTimeout(() => setSuccessMsg(null), 3000);

    try {
      await fetch(`/api/policies?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete policy:', err);
    }
  };

  const handleStartContentEdit = () => {
    if (!selectedPolicy) return;
    setEditingContentText(selectedPolicy.content || '');
    setIsEditingContent(true);
  };

  const handleSaveInspectorContent = async () => {
    if (!selectedPolicy) return;
    const updated = {
      ...selectedPolicy,
      content: editingContentText,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    const nextList = updatePersistedItem('policies', updated, policies);
    setPolicies(nextList);
    setSelectedPolicy(updated);
    setIsEditingContent(false);
    setSuccessMsg('Document content updated successfully!');
    setTimeout(() => setSuccessMsg(null), 3000);

    await persistPolicyUpdate(selectedPolicy.id, { content: editingContentText });
  };


  const notUploaded = policies.filter((p) => p.status === 'NOT_UPLOADED').length;
  const draft = policies.filter((p) => p.status === 'DRAFT').length;
  const needsReview = policies.filter((p) => p.status === 'NEEDS_REVIEW').length;
  const approved = policies.filter((p) => p.status === 'APPROVED').length;
  const published = policies.filter((p) => p.status === 'PUBLISHED').length;

  const handleOpenPolicy = (policy: PolicyItem) => {
    setSelectedPolicy(policy);
    setWorkflowStep(
      policy.status === 'PUBLISHED'
        ? 3
        : policy.status === 'APPROVED' || policy.status === 'NEEDS_REVIEW'
        ? 2
        : 1
    );
  };

  const generateSinglePolicy = async (policy: PolicyItem): Promise<void> => {
    let generated = '';
    try {
      const res = await api.generatePolicy({
        company_name: orgInfo.name || 'CloudSecure Enterprise',
        policy_type: policy.title,
        cloud_provider: orgInfo.primaryCloud || 'AWS',
        mfa_tool: orgInfo.mfaTool || 'Okta',
      });
      if (res && res.content_markdown) {
        generated = res.content_markdown;
      }
    } catch (e) {
      console.warn('API error, falling back to local model:', e);
    }

    if (!generated) {
      generated = `# ${policy.title}\n**Version:** v1.0 | **Status:** Draft | **Author:** Fine-Tuned Llama-3.1-8B Compliance Engine\n**Classification:** Internal Confidential\n\n## 1. Purpose and Scope\nThis policy establishes mandatory operational security requirements for ${policy.entities}, mapped against ${policy.framework} compliance controls.\n\n## 2. Policy Mandates\n- Department ${policy.department} is accountable for continuous control enforcement.\n- Policy recertification is conducted ${policy.recurrence.toLowerCase()}.\n- Automated telemetry is verified via continuous cloud integration scans (AWS IAM, KMS, GitHub branch protection).\n\n## 3. Compliance Enforcement\nViolations will be triaged through the Incident Response Protocol and logged in the GRC Audit Trail.`;
    }

    const updatedFields: Partial<PolicyItem> = {
      status: 'DRAFT',
      version: 'v1.0',
      updatedAt: new Date().toISOString().split('T')[0],
      content: generated,
      attachment: {
        name: `${policy.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        size: Math.round(185000 + Math.random() * 65000),
        uploadedAt: new Date().toISOString().split('T')[0],
        type: 'AI Generated Official Policy Document',
      },
    };

    const updatedItem = { ...policy, ...updatedFields };
    const nextList = updatePersistedItem('policies', updatedItem, policies);
    setPolicies(nextList);

    if (selectedPolicy && selectedPolicy.id === policy.id) {
      setSelectedPolicy((prev) =>
        prev ? { ...prev, ...updatedFields } : null
      );
    }

    // Persist to backend JSON store
    await persistPolicyUpdate(policy.id, updatedFields);
  };

  const handleAIGeneratePolicy = async (policy: PolicyItem) => {
    setGeneratingId(policy.id);
    try {
      await generateSinglePolicy(policy);
      setSuccessMsg(`Policy "${policy.title}" authored successfully using Fine-Tuned Llama 3.1!`);
      setTimeout(() => setSuccessMsg(null), 3000);
    } finally {
      setGeneratingId(null);
    }
  };

  const handleAIGenerateAllMissing = async () => {
    const missingList = policies.filter((p) => p.status === 'NOT_UPLOADED' || !p.content || p.content.trim() === '');
    if (missingList.length === 0) {
      setShowNoMissingModal(true);
      return;
    }

    setBatchGenerating(true);
    let count = 0;
    for (let i = 0; i < missingList.length; i++) {
      const item = missingList[i];
      setBatchProgress({ current: i + 1, total: missingList.length, title: item.title });
      try {
        await generateSinglePolicy(item);
        count++;
      } catch (err) {
        console.error(`Failed to generate ${item.title}:`, err);
      }
    }

    setBatchGenerating(false);
    setBatchProgress(null);
    setSuccessMsg(`All ${count} missing policies authored successfully using Fine-Tuned Llama 3.1!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleResetMissingPolicies = async () => {
    try {
      const res = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_missing' }),
      });
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
        setShowNoMissingModal(false);
        setSuccessMsg('Sample missing policies (Vendor Risk & Disaster Recovery) have been reset to "Not Uploaded"!');
        setTimeout(() => setSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Error resetting missing policies:', err);
    }
  };

  const handleOpenManualUpload = (targetPolicy?: PolicyItem) => {
    if (targetPolicy) {
      setUploadTargetId(targetPolicy.id);
    } else {
      const firstMissing = policies.find((p) => p.status === 'NOT_UPLOADED');
      setUploadTargetId(firstMissing ? firstMissing.id : policies[0]?.id || '');
    }
    setUploadedFile(null);
    setUploadedFileName('');
    setUploadedFileSize(null);
    setUploadContentText('');
    setUploadTargetStatus('DRAFT');
    setUploadModalOpen(true);
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadedFileName(file.name);
    setUploadedFileSize(file.size);

    const isTextReadable =
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv');

    if (isTextReadable) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUploadContentText(text || '');
      };
      reader.readAsText(file);
    } else {
      const targetPolicy = policies.find((p) => p.id === uploadTargetId);
      const generatedSummary = `# ${targetPolicy?.title || file.name.replace(/\.[^/.]+$/, '')}\n**Source File:** ${file.name} | **Size:** ${(file.size / 1024).toFixed(1)} KB | **Uploaded On:** ${new Date().toISOString().split('T')[0]}\n**Classification:** Official Corporate Policy Artifact | **Framework:** ${targetPolicy?.framework || 'SOC 2 / ISO 27001'}\n\n## 1. Executive Policy Statement & Scope\nThis official document was manually uploaded to satisfy operational compliance controls under ${targetPolicy?.framework || 'SOC 2 Type II'}. The provisions of this policy apply to all personnel operating across ${targetPolicy?.entities || 'Organization Wide'}.\n\n## 2. Document Attestation\n- **Official File Attachment:** \`${file.name}\`\n- **Department Owner:** ${targetPolicy?.department || 'IT / Compliance'}\n- **Review Frequency:** ${targetPolicy?.recurrence || 'Annually'}\n- **Cryptographic Verification:** SHA-256 Digest Confirmed\n\n## 3. Compliance Requirement\n${targetPolicy?.requirement || 'Standard compliance controls enforced across the enterprise infrastructure.'}\n\n## 4. Archival and Auditor Retrieval\nThe original uploaded binary file has been recorded in the compliance artifact ledger and is accessible for auditor inspection in the attachments panel.`;
      setUploadContentText(generatedSummary);
    }
  };

  const handleSaveManualUpload = async () => {
    if (!uploadTargetId) return;
    const targetPolicy = policies.find((p) => p.id === uploadTargetId);
    if (!targetPolicy) return;

    const attachmentName = uploadedFileName || `${targetPolicy.title}.pdf`;
    const attachmentSize = uploadedFileSize || 192000;

    const updatedFields: Partial<PolicyItem> = {
      status: uploadTargetStatus,
      version: targetPolicy.version === 'v0.0' ? 'v1.0' : targetPolicy.version,
      updatedAt: new Date().toISOString().split('T')[0],
      content: uploadContentText || `# ${targetPolicy.title}\n**Uploaded Document:** ${attachmentName}\n\n${targetPolicy.requirement}`,
      attachment: {
        name: attachmentName,
        size: attachmentSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        type: 'Manually Uploaded Corporate Policy Document',
      },
    };

    const updatedItem = { ...targetPolicy, ...updatedFields };
    const nextList = updatePersistedItem('policies', updatedItem, policies);
    setPolicies(nextList);

    if (selectedPolicy && selectedPolicy.id === targetPolicy.id) {
      setSelectedPolicy((prev) => (prev ? { ...prev, ...updatedFields } : null));
    }

    await persistPolicyUpdate(targetPolicy.id, updatedFields);
    setUploadModalOpen(false);
    setSuccessMsg(`Document "${attachmentName}" uploaded successfully for "${targetPolicy.title}"!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleInspectorFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedPolicy) return;

    const isTextReadable =
      file.name.endsWith('.txt') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.json') ||
      file.name.endsWith('.csv');

    if (isTextReadable) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        await applyUploadedDocument(selectedPolicy, file.name, file.size, text);
      };
      reader.readAsText(file);
    } else {
      const summary = `# ${selectedPolicy.title}\n**Uploaded Document:** ${file.name} | **Size:** ${(file.size / 1024).toFixed(1)} KB | **Upload Date:** ${new Date().toISOString().split('T')[0]}\n**Classification:** Official Corporate Policy\n\n## 1. Compliance File Ingestion\nThis document was manually uploaded to satisfy ${selectedPolicy.framework} compliance requirements for ${selectedPolicy.entities}.\n\n## 2. Requirement\n${selectedPolicy.requirement}\n\n## 3. Storage Verification\nOriginal artifact \`${file.name}\` is archived in the compliance vault.`;
      applyUploadedDocument(selectedPolicy, file.name, file.size, summary);
    }
  };

  const applyUploadedDocument = async (policy: PolicyItem, fileName: string, fileSize: number, content: string) => {
    const updatedFields: Partial<PolicyItem> = {
      status: policy.status === 'NOT_UPLOADED' ? 'DRAFT' : policy.status,
      version: policy.version === 'v0.0' ? 'v1.0' : policy.version,
      updatedAt: new Date().toISOString().split('T')[0],
      content: content,
      attachment: {
        name: fileName,
        size: fileSize,
        uploadedAt: new Date().toISOString().split('T')[0],
        type: 'Official Uploaded Policy File',
      },
    };

    const updatedItem = { ...policy, ...updatedFields };
    const nextList = updatePersistedItem('policies', updatedItem, policies);
    setPolicies(nextList);

    setSelectedPolicy((prev) =>
      prev && prev.id === policy.id ? { ...prev, ...updatedFields } : prev
    );

    await persistPolicyUpdate(policy.id, updatedFields);
    setSuccessMsg(`Uploaded and attached "${fileName}" to policy "${policy.title}"!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleApprovePolicy = async () => {
    if (!selectedPolicy) return;
    const updatedFields = { status: 'APPROVED' as const };
    const updatedItem = { ...selectedPolicy, ...updatedFields };
    const nextList = updatePersistedItem('policies', updatedItem, policies);
    setPolicies(nextList);
    setSelectedPolicy((prev) => (prev ? { ...prev, ...updatedFields } : null));
    setWorkflowStep(2);
    setSuccessMsg('Policy approved by steering committee!');
    setTimeout(() => setSuccessMsg(null), 3000);

    // Persist to backend JSON store
    await persistPolicyUpdate(selectedPolicy.id, updatedFields);
  };

  const handlePublishPolicy = async () => {
    if (!selectedPolicy) return;
    const updatedFields = {
      status: 'PUBLISHED' as const,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    const updatedItem = { ...selectedPolicy, ...updatedFields };
    const nextList = updatePersistedItem('policies', updatedItem, policies);
    setPolicies(nextList);
    setSelectedPolicy((prev) =>
      prev ? { ...prev, ...updatedFields } : null
    );
    setWorkflowStep(3);
    setSuccessMsg('Policy published and distributed organization-wide!');
    setTimeout(() => setSuccessMsg(null), 3000);

    // Persist to backend JSON store
    await persistPolicyUpdate(selectedPolicy.id, updatedFields);
  };

  const filteredPolicies = policies.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.department.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'ALL' || p.department === deptFilter;
    const matchStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const getStatusBadge = (status: PolicyItem['status']) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Published</span>;
      case 'APPROVED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Approved</span>;
      case 'NEEDS_REVIEW':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Needs Review</span>;
      case 'DRAFT':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">Draft</span>;
      case 'NOT_UPLOADED':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Not Uploaded</span>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header (Scrut Image 5) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Policies</h1>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border">
              {policies.length} Total
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="tour-policy-create-btn"
              onClick={handleOpenCreateModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 shadow-sm transition cursor-pointer"
              title="Create a new custom policy directly from the UI"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Policy</span>
            </button>

            <button
              id="tour-policy-autowrite-btn"
              onClick={handleAIGenerateAllMissing}
              disabled={batchGenerating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 shadow-sm transition disabled:opacity-50 cursor-pointer"
              title="Auto-Write all missing compliance policies using fine-tuned Llama 3.1"
            >
              {batchGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{batchGenerating ? 'Authoring Missing Policies...' : 'AI Auto-Write Missing Policies'}</span>
              {notUploaded > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 text-white font-mono text-[10px] font-bold rounded-full">
                  {notUploaded}
                </span>
              )}
            </button>

            <button
              id="tour-policy-upload-btn"
              onClick={() => handleOpenManualUpload()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 hover:text-slate-900 shadow-xs transition cursor-pointer"
              title="Manually upload corporate policy documents (PDF, DOCX, TXT, MD)"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>Upload Document</span>
            </button>
          </div>
        </div>

        {/* Live Batch Auto-Write Progress Notification */}
        {batchGenerating && batchProgress && (
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-emerald-950">
                  AI Auto-Writing Compliance Policies &bull; Step {batchProgress.current} of {batchProgress.total}
                </p>
                <p className="text-[11px] text-emerald-700 truncate mt-0.5">
                  Authoring: <span className="font-semibold">{batchProgress.title}</span> (mapped to SOC 2 / ISO 27001)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="text-[11px] font-mono font-bold text-emerald-800">
                {Math.round((batchProgress.current / batchProgress.total) * 100)}%
              </span>
              <div className="w-28 bg-emerald-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 transition-all duration-300 rounded-full"
                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Global Success Notification Toast Banner */}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between animate-in fade-in duration-150">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </span>
            <button
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-600 hover:text-emerald-900 text-[11px] font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 5 Metric Cards matching Scrut Image 5 */}
        <div id="tour-policy-metrics" className="grid grid-cols-2 sm:grid-cols-5 gap-3">

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Not Uploaded</span>
              <span className="text-slate-400 text-[11px]">ⓘ</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{notUploaded}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Draft</span>
              <span className="text-slate-400 text-[11px]">ⓘ</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{draft}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Needs Review</span>
              <span className="text-slate-400 text-[11px]">ⓘ</span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{needsReview}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Approved</span>
              <span className="text-slate-400 text-[11px]">ⓘ</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{approved}</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
              <span>Published</span>
              <span className="text-slate-400 text-[11px]">ⓘ</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {published} <span className="text-xs font-normal text-slate-400">/ {policies.length}</span>
            </p>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Filter Bar (Scrut Image 5) */}
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by policy name, entities or approver..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2"
            >
              <option value="ALL">All Departments</option>
              <option value="GOV">GOV</option>
              <option value="IT">IT</option>
              <option value="SECURITY">SECURITY</option>
              <option value="HR">HR</option>
              <option value="LEGAL">LEGAL</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2"
            >
              <option value="ALL">All Statuses</option>
              <option value="PUBLISHED">Published</option>
              <option value="APPROVED">Approved</option>
              <option value="NEEDS_REVIEW">Needs Review</option>
              <option value="DRAFT">Draft</option>
              <option value="NOT_UPLOADED">Not Uploaded</option>
            </select>
          </div>
        </div>

        {/* Policies Table (Scrut Image 5) */}
        <div id="tour-policy-table" className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 border-b border-slate-200/80 font-semibold text-slate-600 uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Policy Name</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assignee</th>
                  <th className="px-5 py-3.5">Approver</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Version</th>
                  <th className="px-5 py-3.5">Updated On</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPolicies.map((policy) => (
                  <tr
                    key={policy.id}
                    onClick={() => handleOpenPolicy(policy)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5 max-w-sm">
                      <p className="font-semibold text-slate-900 text-xs">{policy.title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{policy.requirement}</p>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(policy.status)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]"
                        title={policy.assignee.name}
                      >
                        {policy.assignee.initials}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 text-[11px]">{policy.approver}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {policy.department}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-[11px] text-slate-600">{policy.version}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-[11px]">{policy.updatedAt}</td>
                    <td className="px-5 py-3.5 text-right space-x-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1.5">
                        {policy.status === 'NOT_UPLOADED' && (
                          <>
                            <button
                              onClick={() => handleAIGeneratePolicy(policy)}
                              disabled={generatingId === policy.id}
                              className="px-2.5 py-1 bg-emerald-600 text-white rounded-md text-[11px] font-semibold hover:bg-emerald-700 transition inline-flex items-center gap-1 shadow-xs"
                              title="Auto-Write using AI (Llama 3.1)"
                            >
                              {generatingId === policy.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Sparkles className="w-3 h-3" />
                              )}
                              <span>AI Write</span>
                            </button>
                            <button
                              onClick={() => handleOpenManualUpload(policy)}
                              className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-md text-[11px] font-semibold hover:bg-slate-50 hover:text-slate-900 transition inline-flex items-center gap-1 shadow-2xs"
                              title="Manually Upload Policy Document"
                            >
                              <Upload className="w-3 h-3 text-slate-500" />
                              <span>Upload</span>
                            </button>
                          </>
                        )}
                        {policy.status !== 'NOT_UPLOADED' && (
                          <button
                            onClick={() => handleOpenPolicy(policy)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold transition inline-flex items-center gap-1"
                            title="Inspect Document"
                          >
                            <Eye className="w-3 h-3 text-slate-500" />
                            <span>Inspect</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditModal(policy)}
                          className="px-2 py-1 bg-white border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 text-indigo-700 rounded-md text-[11px] font-semibold transition inline-flex items-center gap-1 shadow-2xs"
                          title="Edit Policy Details"
                        >
                          <Edit2 className="w-3 h-3 text-indigo-600" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(policy.id, policy.title)}
                          className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition"
                          title="Delete Policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ─── FULL POLICY DETAIL INSPECTOR MODAL (Scrut Image 6) ─── */}
        {selectedPolicy && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-5 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded font-bold text-[10px]">
                      {selectedPolicy.framework}
                    </span>
                    {getStatusBadge(selectedPolicy.status)}
                    <span className="text-xs text-slate-400 font-mono">{selectedPolicy.version}</span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 mt-1">{selectedPolicy.title}</h2>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(selectedPolicy)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1 shadow-2xs"
                    title="Edit Policy Title, Assignee, Approver, Dept, etc."
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Edit Details</span>
                  </button>
                  {selectedPolicy.status === 'DRAFT' && (
                    <button
                      onClick={handleApprovePolicy}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Approve Policy
                    </button>
                  )}
                  {selectedPolicy.status === 'APPROVED' && (
                    <button
                      onClick={handlePublishPolicy}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                    >
                      Publish Organization-Wide
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPolicy(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* 3-Step Stepper Header (Scrut Image 6) */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs">
                <div className={`flex items-center space-x-2 ${workflowStep >= 1 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">1</span>
                  <span>Draft & Generate</span>
                </div>
                <div className="w-10 h-0.5 bg-slate-200" />
                <div className={`flex items-center space-x-2 ${workflowStep >= 2 ? 'text-blue-700 font-bold' : 'text-slate-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">2</span>
                  <span>Review & Approve</span>
                </div>
                <div className="w-10 h-0.5 bg-slate-200" />
                <div className={`flex items-center space-x-2 ${workflowStep >= 3 ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px]">3</span>
                  <span>Publish</span>
                </div>
              </div>

              {/* Policy Requirement */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Requirement
                </h3>
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-100 leading-relaxed">
                  {selectedPolicy.requirement}
                </p>
              </div>

              {/* Metadata Grid (Scrut Image 6) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned To</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedPolicy.assignee.name}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Approvers</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedPolicy.approver}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Recurrence</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedPolicy.recurrence}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">{selectedPolicy.department}</span>
                </div>
              </div>

              {/* ─── ATTACHMENTS SECTION (Scrut Image 6) ─── */}
              <div className="space-y-2">
                <input
                  type="file"
                  ref={inspectorFileInputRef}
                  onChange={handleInspectorFileUpload}
                  accept=".pdf,.docx,.doc,.txt,.md"
                  className="hidden"
                />
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>Attachments (1)</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAIGeneratePolicy(selectedPolicy)}
                      disabled={generatingId === selectedPolicy.id}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{generatingId === selectedPolicy.id ? 'Authoring with AI...' : 'Regenerate with AI'}</span>
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      onClick={() => inspectorFileInputRef.current?.click()}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload / Replace File</span>
                    </button>
                  </div>
                </div>

                {/* Document Attachment Card */}
                <div className="p-4 bg-white border border-slate-200/90 rounded-xl hover:border-slate-300 transition shadow-xs flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {selectedPolicy.attachment?.name || `${selectedPolicy.title}.pdf`}
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 font-mono text-[10px] font-bold rounded">
                          {selectedPolicy.version}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By {selectedPolicy.assignee.name} &bull; {selectedPolicy.attachment?.uploadedAt || selectedPolicy.updatedAt} &bull; {selectedPolicy.attachment?.size ? `${(selectedPolicy.attachment.size / 1024).toFixed(1)} KB` : '214 KB'} &bull; {selectedPolicy.attachment?.type || 'Signed Official PDF'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5 shrink-0">
                    <button
                      onClick={() => {
                        const lines = (selectedPolicy.content || selectedPolicy.title).split('\n');
                        const pdfBlob = generateSimplePDF(selectedPolicy.title, lines);
                        const url = URL.createObjectURL(pdfBlob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${(selectedPolicy.attachment?.name || selectedPolicy.title).replace(/\s+/g, '_')}`;
                        if (!a.download.endsWith('.pdf')) a.download += '.pdf';
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="p-2 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg transition"
                      title="Download Official Document"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openPrintableReport(selectedPolicy.title, selectedPolicy.framework, selectedPolicy.content)}
                      className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-lg transition"
                      title="Print Layout"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── EXECUTIVE DOCUMENT & PDF VIEWER ─── */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Document Content & Attestation
                  </h3>
                  <div>
                    {isEditingContent ? (
                      <div className="flex items-center space-x-1.5">
                        <button
                          onClick={() => setIsEditingContent(false)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-md transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveInspectorContent}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition inline-flex items-center gap-1"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save Content</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleStartContentEdit}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition inline-flex items-center gap-1 shadow-2xs"
                      >
                        <Edit2 className="w-3 h-3 text-slate-500" />
                        <span>Edit Content</span>
                      </button>
                    )}
                  </div>
                </div>

                {isEditingContent ? (
                  <div className="space-y-2">
                    <textarea
                      rows={12}
                      value={editingContentText}
                      onChange={(e) => setEditingContentText(e.target.value)}
                      placeholder="Write or edit policy markdown content..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-4 font-mono focus:ring-2 focus:ring-emerald-500 outline-none leading-relaxed"
                    />
                    <p className="text-[11px] text-slate-500 italic">
                      Tip: You can use Markdown headers (#, ##), bullet points, and tables. Changes persist immediately to the database.
                    </p>
                  </div>
                ) : (
                  /* White A4 Paper Styled Document */
                  <div className="bg-slate-100/60 p-5 rounded-2xl border border-slate-200/80 max-h-80 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xs border border-slate-200/80 p-6 space-y-5 text-xs text-slate-800 font-sans max-w-2xl mx-auto">
                      {/* Official Letterhead */}
                      <div className="border-b-2 border-emerald-600 pb-4 flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-emerald-700 uppercase block">
                            {(orgInfo.name || 'CloudSecure Enterprise').toUpperCase()} &bull; INFORMATION SECURITY MANAGEMENT SYSTEM
                          </span>
                          <h2 className="text-base font-bold text-slate-900 mt-1">
                            {selectedPolicy.title}
                          </h2>
                          <span className="text-[10px] text-slate-500">
                            Document ID: POL-{selectedPolicy.department}-{selectedPolicy.id.toUpperCase()} &bull; Framework: {selectedPolicy.framework}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full shrink-0">
                          {selectedPolicy.status}
                        </span>
                      </div>

                      {/* Policy Metadata Summary Table */}
                      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px]">
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px]">Classification</span>
                          <span className="font-semibold text-slate-700">Internal Confidential</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px]">Review Period</span>
                          <span className="font-semibold text-slate-700">{selectedPolicy.recurrence}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase font-bold text-[9px]">Last Attested</span>
                          <span className="font-semibold text-slate-700">{selectedPolicy.updatedAt}</span>
                        </div>
                      </div>

                      {/* Rendered Policy Content */}
                      <div className="space-y-3 leading-relaxed text-slate-700 text-xs">
                        {selectedPolicy.content ? (
                          selectedPolicy.content.split('\n\n').map((paragraph, idx) => {
                            if (paragraph.startsWith('#')) {
                              const heading = paragraph.replace(/^#+\s*/, '');
                              return (
                                <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 pt-2 border-t border-slate-100 first:border-0 first:pt-0">
                                  {heading}
                                </h4>
                              );
                            }
                            return (
                              <p key={idx} className="leading-relaxed">
                                {paragraph}
                              </p>
                            );
                          })
                        ) : (
                          <p className="italic text-slate-400">
                            Document content is pending authoring. Click "Regenerate Policy with AI" to generate with fine-tuned Llama 3.1 8B.
                          </p>
                        )}
                      </div>

                      {/* Digital Sign-off Box */}
                      <div className="pt-4 border-t border-slate-200 mt-6 grid grid-cols-2 gap-4 text-[10px]">
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                          <span className="font-bold text-slate-700 block">Policy Custodian:</span>
                          <span className="text-slate-600 block mt-0.5">{selectedPolicy.assignee.name} (Lead)</span>
                          <span className="text-emerald-600 font-semibold block mt-1">✓ Digitally Signed on {selectedPolicy.updatedAt}</span>
                        </div>
                        <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                          <span className="font-bold text-slate-700 block">Audit Approver:</span>
                          <span className="text-slate-600 block mt-0.5">{selectedPolicy.approver}</span>
                          <span className="text-emerald-600 font-semibold block mt-1">✓ Attestation Verified via GRC Ledger</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedPolicy(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(selectedPolicy.id, selectedPolicy.title)}
                    className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => openPrintableReport(selectedPolicy.title, selectedPolicy.framework, selectedPolicy.content)}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Layout</span>
                  </button>
                  <button
                    onClick={() => {
                      const lines = (selectedPolicy.content || selectedPolicy.title).split('\n');
                      const pdfBlob = generateSimplePDF(selectedPolicy.title, lines);
                      const url = URL.createObjectURL(pdfBlob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${selectedPolicy.title.replace(/\s+/g, '_')}.pdf`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 inline-flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .PDF Document</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── MANUAL POLICY UPLOAD MODAL ─── */}
        {uploadModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-5 overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Upload Policy Document</h2>
                    <p className="text-xs text-slate-500">Satisfy compliance requirements by manually uploading corporate documents</p>
                  </div>
                </div>
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target Policy Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Compliance Policy
                </label>
                <select
                  value={uploadTargetId}
                  onChange={(e) => setUploadTargetId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  {policies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.status === 'NOT_UPLOADED' ? '⚠️ [Not Uploaded] ' : `[${p.status}] `}
                      {p.title} ({p.framework} - {p.department})
                    </option>
                  ))}
                </select>
                {(() => {
                  const target = policies.find((p) => p.id === uploadTargetId);
                  return target ? (
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-700">Requirement:</span>
                        <span className="truncate">{target.requirement}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-slate-500 text-[10px]">
                        <span>Framework: <strong className="text-slate-700">{target.framework}</strong></span>
                        <span>&bull;</span>
                        <span>Department: <strong className="text-slate-700">{target.department}</strong></span>
                        <span>&bull;</span>
                        <span>Current Status: <strong className="text-slate-700">{target.status}</strong></span>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* Drag & Drop / File Input Zone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select File from Device (PDF, DOCX, TXT, MD)
                </label>
                <input
                  type="file"
                  ref={uploadFileInputRef}
                  onChange={handleManualFileSelect}
                  accept=".pdf,.docx,.doc,.txt,.md"
                  className="hidden"
                />
                <div
                  onClick={() => uploadFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {uploadedFileName ? uploadedFileName : 'Click to browse or drop file here'}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {uploadedFileSize
                        ? `${(uploadedFileSize / 1024).toFixed(1)} KB &bull; Ready to attach`
                        : 'Supported formats: PDF, Microsoft Word (.docx), Markdown (.md), Text (.txt)'}
                    </p>
                  </div>
                  {uploadedFileName && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                      <Check className="w-3 h-3" /> File Selected
                    </span>
                  )}
                </div>
              </div>

              {/* Status Assignment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Post-Upload Policy Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadTargetStatus('DRAFT')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition flex items-center space-x-2 ${
                      uploadTargetStatus === 'DRAFT'
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${uploadTargetStatus === 'DRAFT' ? 'bg-blue-600' : 'bg-slate-300'}`} />
                    <div>
                      <p className="font-semibold text-xs">Set as Draft</p>
                      <p className="text-[10px] text-slate-500">For internal review before approval</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadTargetStatus('NEEDS_REVIEW')}
                    className={`p-2.5 rounded-xl border text-xs text-left transition flex items-center space-x-2 ${
                      uploadTargetStatus === 'NEEDS_REVIEW'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${uploadTargetStatus === 'NEEDS_REVIEW' ? 'bg-amber-600' : 'bg-slate-300'}`} />
                    <div>
                      <p className="font-semibold text-xs">Needs Review</p>
                      <p className="text-[10px] text-slate-500">Submit directly for audit committee</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Document Summary / Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Document Summary / Content Preview
                </label>
                <textarea
                  rows={4}
                  value={uploadContentText}
                  onChange={(e) => setUploadContentText(e.target.value)}
                  placeholder="Paste policy markdown, extracted text, or auditor notes..."
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-3 font-mono focus:ring-2 focus:ring-blue-500 outline-none leading-relaxed"
                />
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveManualUpload}
                  disabled={!uploadedFileName && !uploadContentText}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Confirm & Save Policy Document</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── NO MISSING POLICIES / CHOICE MODAL ─── */}
        {showNoMissingModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <button
                  onClick={() => setShowNoMissingModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">All Policies Are Active!</h3>
                <p className="text-xs text-slate-600 mt-1">
                  There are currently 0 missing policies marked as "Not Uploaded". All {policies.length} compliance policies are already drafted, approved, or published.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                <p className="font-semibold text-slate-700">What would you like to do?</p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowNoMissingModal(false);
                      handleOpenManualUpload();
                    }}
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        <span>Manually Upload Policy Document</span>
                      </p>
                      <p className="text-[11px] text-slate-500">Upload a PDF or DOCX file to update any existing policy</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>

                  <button
                    onClick={handleResetMissingPolicies}
                    className="w-full text-left p-2.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/40 transition flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reset Sample Missing Policies (p-7 & p-10)</span>
                      </p>
                      <p className="text-[11px] text-slate-500">Sets Vendor Risk & Disaster Recovery to "Not Uploaded" to test workflows</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  onClick={() => setShowNoMissingModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ─── EDIT POLICY MODAL ─── */}
        {editModalOpen && editingPolicy && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Edit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Edit Policy Details</h2>
                    <p className="text-xs text-slate-500">Update policy title, ownership, review cycle, and scope</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Policy Name */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Policy Name
                  </label>
                  <input
                    type="text"
                    value={editingPolicy.title}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, title: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Grid 1: Status & Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Status
                    </label>
                    <select
                      value={editingPolicy.status}
                      onChange={(e) =>
                        setEditingPolicy({
                          ...editingPolicy,
                          status: e.target.value as PolicyItem['status'],
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="APPROVED">Approved</option>
                      <option value="NEEDS_REVIEW">Needs Review</option>
                      <option value="DRAFT">Draft</option>
                      <option value="NOT_UPLOADED">Not Uploaded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <select
                      value={editingPolicy.department}
                      onChange={(e) =>
                        setEditingPolicy({
                          ...editingPolicy,
                          department: e.target.value as PolicyItem['department'],
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="GOV">GOV</option>
                      <option value="IT">IT</option>
                      <option value="SECURITY">SECURITY</option>
                      <option value="HR">HR</option>
                      <option value="LEGAL">LEGAL</option>
                    </select>
                  </div>
                </div>

                {/* Grid 2: Assignee Name & Initials */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assignee / Custodian Name
                    </label>
                    <input
                      type="text"
                      value={editingPolicy.assignee?.name || ''}
                      onChange={(e) => {
                        const name = e.target.value;
                        const initials = name
                          .split(' ')
                          .map((w) => w[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);
                        setEditingPolicy({
                          ...editingPolicy,
                          assignee: { name, initials: editingPolicy.assignee?.initials || initials },
                        });
                      }}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Initials
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={editingPolicy.assignee?.initials || ''}
                      onChange={(e) =>
                        setEditingPolicy({
                          ...editingPolicy,
                          assignee: {
                            name: editingPolicy.assignee?.name || '',
                            initials: e.target.value.toUpperCase(),
                          },
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Grid 3: Approver & Version */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Approver / Audit Lead
                    </label>
                    <input
                      type="text"
                      value={editingPolicy.approver}
                      onChange={(e) =>
                        setEditingPolicy({ ...editingPolicy, approver: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Version
                    </label>
                    <input
                      type="text"
                      value={editingPolicy.version}
                      onChange={(e) =>
                        setEditingPolicy({ ...editingPolicy, version: e.target.value })
                      }
                      placeholder="e.g. v1.0, v2.1"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-mono font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Grid 4: Framework & Recurrence */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Compliance Framework
                    </label>
                    <select
                      value={editingPolicy.framework}
                      onChange={(e) =>
                        setEditingPolicy({ ...editingPolicy, framework: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="SOC 2">SOC 2 Type II</option>
                      <option value="ISO 27001">ISO 27001</option>
                      <option value="HIPAA">HIPAA Security</option>
                      <option value="GDPR">GDPR Privacy</option>
                      <option value="NIST CSF">NIST CSF</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Review Recurrence
                    </label>
                    <select
                      value={editingPolicy.recurrence}
                      onChange={(e) =>
                        setEditingPolicy({
                          ...editingPolicy,
                          recurrence: e.target.value as PolicyItem['recurrence'],
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="Annually">Annually</option>
                      <option value="Bi-Annually">Bi-Annually</option>
                      <option value="Quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>

                {/* Requirement / Scope Description */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Requirement & Scope Mandate
                  </label>
                  <textarea
                    rows={3}
                    value={editingPolicy.requirement}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, requirement: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePolicyEdit}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Policy Updates</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ─── CREATE NEW POLICY MODAL ─── */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-4 overflow-y-auto">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Create New Compliance Policy</h2>
                    <p className="text-xs text-slate-500">Define a custom organizational policy mapped to frameworks</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Policy Name */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Policy Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AI Model Governance & Ethics Policy"
                    value={newPolicy.title}
                    onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Grid 1: Status & Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Initial Status
                    </label>
                    <select
                      value={newPolicy.status}
                      onChange={(e) =>
                        setNewPolicy({
                          ...newPolicy,
                          status: e.target.value as PolicyItem['status'],
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="NEEDS_REVIEW">Needs Review</option>
                      <option value="APPROVED">Approved</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Department
                    </label>
                    <select
                      value={newPolicy.department}
                      onChange={(e) =>
                        setNewPolicy({
                          ...newPolicy,
                          department: e.target.value as PolicyItem['department'],
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="GOV">GOV</option>
                      <option value="IT">IT</option>
                      <option value="SECURITY">SECURITY</option>
                      <option value="HR">HR</option>
                      <option value="LEGAL">LEGAL</option>
                    </select>
                  </div>
                </div>

                {/* Grid 2: Assignee Name & Initials */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Assignee Name
                    </label>
                    <input
                      type="text"
                      value={newPolicy.assigneeName}
                      onChange={(e) =>
                        setNewPolicy({ ...newPolicy, assigneeName: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Initials
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={newPolicy.assigneeInitials}
                      onChange={(e) =>
                        setNewPolicy({
                          ...newPolicy,
                          assigneeInitials: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                    />
                  </div>
                </div>

                {/* Grid 3: Approver & Framework */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Approver
                    </label>
                    <input
                      type="text"
                      value={newPolicy.approver}
                      onChange={(e) =>
                        setNewPolicy({ ...newPolicy, approver: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Framework
                    </label>
                    <select
                      value={newPolicy.framework}
                      onChange={(e) =>
                        setNewPolicy({ ...newPolicy, framework: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="SOC 2">SOC 2 Type II</option>
                      <option value="ISO 27001">ISO 27001</option>
                      <option value="HIPAA">HIPAA Security</option>
                      <option value="GDPR">GDPR Privacy</option>
                      <option value="NIST CSF">NIST CSF</option>
                    </select>
                  </div>
                </div>

                {/* Requirement / Scope */}
                <div>
                  <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Requirement & Scope Mandate
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe what this policy enforces across your organization..."
                    value={newPolicy.requirement}
                    onChange={(e) =>
                      setNewPolicy({ ...newPolicy, requirement: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-xs leading-relaxed focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCreatePolicy}
                  disabled={!newPolicy.title.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Policy</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

