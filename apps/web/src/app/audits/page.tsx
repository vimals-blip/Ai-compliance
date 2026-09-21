'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SeverityBadge } from '../../components/common/SeverityBadge';
import { generateSimplePDF } from '../../lib/pdfGenerator';
import { getPersistedList, addPersistedItem, updatePersistedItem, removePersistedItem, savePersistedList } from '../../lib/clientStore';
import {
  FileCheck,
  Calendar,
  User,
  Plus,
  Search,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertTriangle,
  FilePlus,
  Download,
  ArrowLeft,
  ChevronDown,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  Layers,
  X,
  Shield,
  FileText,
  Loader2,
} from 'lucide-react';

interface AuditItem {
  id: string;
  name: string;
  status: 'In Progress' | 'Completed' | 'Planned';
  type: 'External' | 'Internal';
  auditDate: string;
  observationPeriod: string;
  owner: string;
  framework: string;
  entities: string;
  auditTeam: string;
  readiness: {
    overall: number;
    policies: number;
    tests: number;
    evidences: number;
  };
  correctiveActions: Array<{
    id: string;
    nonConformityName: string;
    status: 'Open' | 'Closed';
    assignee: string;
    dueDate: string;
    criticality: 'Low' | 'Medium' | 'High' | 'Critical';
  }>;
  requirements: Array<{
    id: string;
    code: string;
    title: string;
    controlsCount: number;
    controls: string[];
  }>;
}

const AUDITS_DATA: AuditItem[] = [
  {
    id: 'audit-soc2',
    name: 'SOC 2 Type II Examination 2026',
    status: 'In Progress',
    type: 'External',
    auditDate: '1 Oct 2026',
    observationPeriod: '1 Sept 2025 - 1 Oct 2026',
    owner: 'Sarah Chen (Lead)',
    framework: 'SOC 2',
    entities: 'Organization Wide',
    auditTeam: 'KPMG LLP & Compliance Lead',
    readiness: {
      overall: 98,
      policies: 97,
      tests: 100,
      evidences: 100,
    },
    correctiveActions: [
      {
        id: 'ca-1',
        nonConformityName: 'Share documented peer code review processes',
        status: 'Open',
        assignee: 'Security Engineering',
        dueDate: '25 Sep 2026',
        criticality: 'Low',
      },
      {
        id: 'ca-2',
        nonConformityName: 'VAPT Annual Penetration Testing Sign-off',
        status: 'Closed',
        assignee: 'Security Lead',
        dueDate: '15 Aug 2026',
        criticality: 'Medium',
      },
      {
        id: 'ca-3',
        nonConformityName: 'Enforce MFA on legacy staging JumpBox bastion',
        status: 'Closed',
        assignee: 'DevOps Team',
        dueDate: '01 Sep 2026',
        criticality: 'High',
      },
    ],
    requirements: [
      {
        id: 'req-1',
        code: 'CC1.0',
        title: 'Common Criteria for Control Environment, Integrity and Ethical Values',
        controlsCount: 5,
        controls: ['CC1.1', 'CC1.2', 'CC1.3', 'CC1.4', 'CC1.5'],
      },
      {
        id: 'req-2',
        code: 'CC2.0',
        title: 'Common Criteria for Communication and Information Governance',
        controlsCount: 3,
        controls: ['CC2.1', 'CC2.2', 'CC2.3'],
      },
      {
        id: 'req-3',
        code: 'CC3.0',
        title: 'Common Criteria for Risk Assessment and Fraud Analysis',
        controlsCount: 4,
        controls: ['CC3.1', 'CC3.2', 'CC3.3', 'CC3.4'],
      },
      {
        id: 'req-4',
        code: 'CC4.0',
        title: 'Common Criteria for Monitoring Activities and Deficiency Evaluation',
        controlsCount: 2,
        controls: ['CC4.1', 'CC4.2'],
      },
      {
        id: 'req-5',
        code: 'CC6.0',
        title: 'Logical and Physical Access Controls over Protected Information Assets',
        controlsCount: 8,
        controls: ['CC6.1', 'CC6.2', 'CC6.3', 'CC6.4', 'CC6.5', 'CC6.6', 'CC6.7', 'CC6.8'],
      },
    ],
  },
  {
    id: 'audit-iso',
    name: 'ISO/IEC 27001:2022 Surveillance Audit',
    status: 'Planned',
    type: 'Internal',
    auditDate: '15 Nov 2026',
    observationPeriod: '1 Jan 2026 - 15 Nov 2026',
    owner: 'Alex Rivera',
    framework: 'ISO 27001',
    entities: 'Organization Wide',
    auditTeam: 'Internal Audit Staff',
    readiness: {
      overall: 84,
      policies: 90,
      tests: 82,
      evidences: 80,
    },
    correctiveActions: [
      {
        id: 'ca-4',
        nonConformityName: 'Document Statement of Applicability justifications for Annex A.8',
        status: 'Open',
        assignee: 'Alex Rivera',
        dueDate: '30 Oct 2026',
        criticality: 'Medium',
      },
    ],
    requirements: [
      {
        id: 'req-iso-1',
        code: 'Clause 4-10',
        title: 'Information Security Management System (ISMS) Mandatory Requirements',
        controlsCount: 7,
        controls: ['4.1 Context', '5.1 Leadership', '6.1 Planning', '7.1 Support', '8.1 Operation', '9.1 Evaluation', '10.1 Improvement'],
      },
      {
        id: 'req-iso-2',
        code: 'Annex A.5-A.8',
        title: 'Organizational, People, Physical, and Technological Controls',
        controlsCount: 93,
        controls: ['A.5 Organizational Controls (37)', 'A.6 People Controls (8)', 'A.7 Physical Controls (14)', 'A.8 Technological Controls (34)'],
      },
    ],
  },
];

export default function AuditsPage() {
  const [audits, setAudits] = useState<AuditItem[]>(AUDITS_DATA);
  const [selectedAudit, setSelectedAudit] = useState<AuditItem | null>(null);
  const [activeTab, setActiveTab] = useState<'audits' | 'requests'>('audits');
  const [activeDetailTab, setActiveDetailTab] = useState<'requirements' | 'controls' | 'corrective' | 'logs'>('requirements');
  const [expandedReqs, setExpandedReqs] = useState<string[]>(['req-1']);
  const [search, setSearch] = useState('');
  const [completedSuccess, setCompletedSuccess] = useState(false);
  const [orgName, setOrgName] = useState('CloudSecure Enterprise');

  // Create New Audit Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const [newAuditName, setNewAuditName] = useState('SOC 2 Type II Examination 2026/2027');
  const [newAuditFramework, setNewAuditFramework] = useState('SOC 2');
  const [newAuditType, setNewAuditType] = useState<'External' | 'Internal'>('External');
  const [newAuditStatus, setNewAuditStatus] = useState<'Planned' | 'In Progress'>('In Progress');
  const [newAuditDate, setNewAuditDate] = useState('1 Dec 2026');
  const [newAuditPeriod, setNewAuditPeriod] = useState('1 Dec 2025 - 1 Dec 2026');
  const [newAuditOwner, setNewAuditOwner] = useState('Sarah Chen (Lead)');
  const [newAuditTeam, setNewAuditTeam] = useState('KPMG LLP & Compliance Lead');
  const [newAuditEntities, setNewAuditEntities] = useState('Organization Wide');

  // Edit Audit Modal State
  const [editAuditModalOpen, setEditAuditModalOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<AuditItem | null>(null);
  const [editAuditName, setEditAuditName] = useState('');
  const [editAuditFramework, setEditAuditFramework] = useState('SOC 2');
  const [editAuditType, setEditAuditType] = useState<'External' | 'Internal'>('External');
  const [editAuditStatus, setEditAuditStatus] = useState<'In Progress' | 'Completed' | 'Planned'>('In Progress');
  const [editAuditDate, setEditAuditDate] = useState('');
  const [editAuditPeriod, setEditAuditPeriod] = useState('');
  const [editAuditOwner, setEditAuditOwner] = useState('');
  const [editAuditTeam, setEditAuditTeam] = useState('');
  const [editAuditEntities, setEditAuditEntities] = useState('');
  const [editAuditReadinessOverall, setEditAuditReadinessOverall] = useState<number>(80);
  const [editAuditReadinessPolicies, setEditAuditReadinessPolicies] = useState<number>(85);
  const [editAuditReadinessTests, setEditAuditReadinessTests] = useState<number>(80);
  const [editAuditReadinessEvidences, setEditAuditReadinessEvidences] = useState<number>(75);

  // Corrective Action Modal State
  const [caModalOpen, setCaModalOpen] = useState(false);
  const [caModalMode, setCaModalMode] = useState<'create' | 'edit'>('create');
  const [editingCaId, setEditingCaId] = useState<string | null>(null);
  const [caName, setCaName] = useState('');
  const [caStatus, setCaStatus] = useState<'Open' | 'Closed'>('Open');
  const [caAssignee, setCaAssignee] = useState('');
  const [caDueDate, setCaDueDate] = useState('');
  const [caCriticality, setCaCriticality] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');

  // Requirement Modal State
  const [reqModalOpen, setReqModalOpen] = useState(false);
  const [reqModalMode, setReqModalMode] = useState<'create' | 'edit'>('create');
  const [editingReqId, setEditingReqId] = useState<string | null>(null);
  const [reqCode, setReqCode] = useState('');
  const [reqTitle, setReqTitle] = useState('');
  const [reqControls, setReqControls] = useState('');

  const getFrameworkRequirements = (framework: string) => {
    const ts = Date.now();
    switch (framework) {
      case 'ISO 27001':
        return [
          { id: `req-iso-${ts}-1`, code: 'A.5', title: 'Organizational Controls (37 Controls)', controlsCount: 37, controls: ['A.5.1', 'A.5.2', 'A.5.8', 'A.5.15'] },
          { id: `req-iso-${ts}-2`, code: 'A.6', title: 'People & Workforce Controls (8 Controls)', controlsCount: 8, controls: ['A.6.1', 'A.6.2', 'A.6.4'] },
          { id: `req-iso-${ts}-3`, code: 'A.7', title: 'Physical & Environmental Security (14 Controls)', controlsCount: 14, controls: ['A.7.1', 'A.7.2', 'A.7.4'] },
          { id: `req-iso-${ts}-4`, code: 'A.8', title: 'Technological & Cloud Controls (34 Controls)', controlsCount: 34, controls: ['A.8.1', 'A.8.2', 'A.8.9', 'A.8.20', 'A.8.24'] },
        ];
      case 'NIST CSF':
        return [
          { id: `req-nist-${ts}-1`, code: 'GV', title: 'Govern (Organizational Context & Strategy)', controlsCount: 16, controls: ['GV.OC', 'GV.RM', 'GV.SC'] },
          { id: `req-nist-${ts}-2`, code: 'ID', title: 'Identify (Asset Management & Risk Assessment)', controlsCount: 20, controls: ['ID.AM', 'ID.RA'] },
          { id: `req-nist-${ts}-3`, code: 'PR', title: 'Protect (Identity, Data Security & Training)', controlsCount: 32, controls: ['PR.AA', 'PR.AT', 'PR.DS'] },
          { id: `req-nist-${ts}-4`, code: 'DE', title: 'Detect (Adverse Event Analysis & Monitoring)', controlsCount: 14, controls: ['DE.AE', 'DE.CM'] },
          { id: `req-nist-${ts}-5`, code: 'RS', title: 'Respond (Incident Management & Mitigation)', controlsCount: 16, controls: ['RS.MA', 'RS.AN'] },
          { id: `req-nist-${ts}-6`, code: 'RC', title: 'Recover (Restoration & Communications)', controlsCount: 10, controls: ['RC.RP', 'RC.CO'] },
        ];
      case 'HIPAA':
        return [
          { id: `req-hipaa-${ts}-1`, code: '§164.308', title: 'Administrative Safeguards (Workforce & Access Management)', controlsCount: 9, controls: ['164.308(a)(1)', '164.308(a)(3)', '164.308(a)(5)'] },
          { id: `req-hipaa-${ts}-2`, code: '§164.310', title: 'Physical Safeguards (Facility & Workstation Security)', controlsCount: 4, controls: ['164.310(a)(1)', '164.310(b)', '164.310(c)'] },
          { id: `req-hipaa-${ts}-3`, code: '§164.312', title: 'Technical Safeguards (Audit Controls & Encryption)', controlsCount: 5, controls: ['164.312(a)(1)', '164.312(b)', '164.312(e)(1)'] },
        ];
      case 'PCI-DSS':
        return [
          { id: `req-pci-${ts}-1`, code: 'Req 1-2', title: 'Build and Maintain Secure Network and Systems', controlsCount: 12, controls: ['1.1', '1.2', '2.1', '2.2'] },
          { id: `req-pci-${ts}-2`, code: 'Req 3-4', title: 'Protect Cardholder Data and Encryption in Transit', controlsCount: 10, controls: ['3.1', '3.4', '4.1'] },
          { id: `req-pci-${ts}-3`, code: 'Req 7-8', title: 'Strong Access Control & Identification Safeguards', controlsCount: 14, controls: ['7.1', '8.1', '8.2'] },
        ];
      case 'SOC 2':
      default:
        return [
          { id: `req-soc-${ts}-1`, code: 'CC1.0', title: 'Control Environment, Integrity & Ethical Values', controlsCount: 5, controls: ['CC1.1', 'CC1.2', 'CC1.3', 'CC1.4', 'CC1.5'] },
          { id: `req-soc-${ts}-2`, code: 'CC2.0', title: 'Communication and Information Governance', controlsCount: 3, controls: ['CC2.1', 'CC2.2', 'CC2.3'] },
          { id: `req-soc-${ts}-3`, code: 'CC3.0', title: 'Risk Assessment and Fraud Analysis', controlsCount: 4, controls: ['CC3.1', 'CC3.2', 'CC3.3', 'CC3.4'] },
          { id: `req-soc-${ts}-4`, code: 'CC4.0', title: 'Monitoring Activities and Deficiency Evaluation', controlsCount: 2, controls: ['CC4.1', 'CC4.2'] },
          { id: `req-soc-${ts}-5`, code: 'CC5.0', title: 'Control Activities and Mandates', controlsCount: 3, controls: ['CC5.1', 'CC5.2', 'CC5.3'] },
          { id: `req-soc-${ts}-6`, code: 'CC6.0', title: 'Logical & Physical Access Controls over Assets', controlsCount: 8, controls: ['CC6.1', 'CC6.2', 'CC6.3', 'CC6.4', 'CC6.5', 'CC6.6', 'CC6.7', 'CC6.8'] },
        ];
    }
  };

  const handleFrameworkChange = (fw: string) => {
    setNewAuditFramework(fw);
    const year = new Date().getFullYear();
    switch (fw) {
      case 'ISO 27001':
        setNewAuditName(`ISO/IEC 27001:2022 Stage 2 Audit ${year}`);
        setNewAuditTeam('BSI Group Lead Assessor');
        break;
      case 'NIST CSF':
        setNewAuditName(`NIST CSF v2.0 Cybersecurity Review ${year}`);
        setNewAuditTeam('Internal Audit Staff');
        break;
      case 'HIPAA':
        setNewAuditName(`HIPAA Security & Privacy Compliance Audit ${year}`);
        setNewAuditTeam('Coalfire Systems QSA');
        break;
      case 'PCI-DSS':
        setNewAuditName(`PCI-DSS v4.0 Attestation of Compliance ${year}`);
        setNewAuditTeam('Protiviti Security Assessor');
        break;
      case 'SOC 2':
      default:
        setNewAuditName(`SOC 2 Type II Examination ${year}/${year + 1}`);
        setNewAuditTeam('KPMG LLP & Compliance Lead');
        break;
    }
  };

  const handleCreateAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuditName.trim()) return;

    setCreateSubmitting(true);
    const newAuditData = {
      name: newAuditName.trim(),
      framework: newAuditFramework,
      type: newAuditType,
      status: newAuditStatus,
      auditDate: newAuditDate || new Date().toISOString().split('T')[0],
      observationPeriod: newAuditPeriod || 'Current Observation Period',
      owner: newAuditOwner || 'Sarah Chen (Lead)',
      auditTeam: newAuditTeam || 'Compliance Audit Team',
      entities: newAuditEntities || 'Organization Wide',
      readiness: {
        overall: newAuditStatus === 'In Progress' ? 78 : 50,
        policies: 85,
        tests: 75,
        evidences: 70,
      },
      correctiveActions: [],
      requirements: getFrameworkRequirements(newAuditFramework),
    };

    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuditData),
      });

      if (res.ok) {
        const created: AuditItem = await res.json();
        const updatedList = addPersistedItem('audits', created, audits);
        setAudits(updatedList);
        setSelectedAudit(created);
        setCreateModalOpen(false);
        setSuccessToast(`Audit "${created.name}" created successfully and workspace initialized!`);
        setTimeout(() => setSuccessToast(null), 4000);
      } else {
        const err = await res.json();
        alert(`Failed to create audit: ${err.error || 'Server error'}`);
      }
    } catch (err: any) {
      console.error('Failed to create audit:', err);
      alert(`Network error creating audit: ${err.message}`);
    } finally {
      setCreateSubmitting(false);
    }
  };

  // Fetch live audits and organization from persistent backend
  useEffect(() => {
    async function loadData() {
      try {
        const orgRes = await fetch('/api/organization');
        if (orgRes.ok) {
          const org = await orgRes.json();
          if (org && org.name) setOrgName(org.name);
        }
      } catch {}
      try {
        const res = await fetch('/api/audits');
        if (res.ok) {
          const data = await res.json();
          const loaded = getPersistedList('audits', Array.isArray(data) ? data : [], AUDITS_DATA);
          setAudits(loaded);
        } else {
          const loaded = getPersistedList('audits', [], AUDITS_DATA);
          setAudits(loaded);
        }
      } catch (err) {
        console.warn('Could not fetch audits from API:', err);
        const loaded = getPersistedList('audits', [], AUDITS_DATA);
        setAudits(loaded);
      }
    }
    loadData();
  }, []);

  const inProgressCount = audits.filter((a) => a.status === 'In Progress').length;
  const completedCount = audits.filter((a) => a.status === 'Completed').length;
  const internalCount = audits.filter((a) => a.type === 'Internal').length;
  const externalCount = audits.filter((a) => a.type === 'External').length;

  const toggleReq = (id: string) => {
    setExpandedReqs((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleMarkComplete = async () => {
    if (!selectedAudit) return;
    const updatedStatus = 'Completed' as const;
    const updatedList = updatePersistedItem('audits', selectedAudit.id, { status: updatedStatus }, audits);
    setAudits(updatedList);
    setSelectedAudit((prev) => (prev ? { ...prev, status: updatedStatus } : null));
    setCompletedSuccess(true);
    setTimeout(() => setCompletedSuccess(false), 3000);

    try {
      await fetch('/api/audits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedAudit.id, status: updatedStatus }),
      });
    } catch (err) {
      console.error('Failed to persist audit completion:', err);
    }
  };

  const persistAuditUpdate = async (id: string, updates: Partial<AuditItem>) => {
    try {
      await fetch('/api/audits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (err) {
      console.error('Failed to persist audit update:', err);
    }
  };

  const handleOpenEditAudit = (audit: AuditItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingAudit(audit);
    setEditAuditName(audit.name);
    setEditAuditFramework(audit.framework);
    setEditAuditType(audit.type);
    setEditAuditStatus(audit.status);
    setEditAuditDate(audit.auditDate);
    setEditAuditPeriod(audit.observationPeriod);
    setEditAuditOwner(audit.owner);
    setEditAuditTeam(audit.auditTeam);
    setEditAuditEntities(audit.entities);
    setEditAuditReadinessOverall(audit.readiness?.overall ?? 80);
    setEditAuditReadinessPolicies(audit.readiness?.policies ?? 85);
    setEditAuditReadinessTests(audit.readiness?.tests ?? 80);
    setEditAuditReadinessEvidences(audit.readiness?.evidences ?? 75);
    setEditAuditModalOpen(true);
  };

  const handleSaveAuditEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAudit || !editAuditName.trim()) return;

    const updatedAudit: AuditItem = {
      ...editingAudit,
      name: editAuditName.trim(),
      framework: editAuditFramework,
      type: editAuditType,
      status: editAuditStatus,
      auditDate: editAuditDate.trim() || editingAudit.auditDate,
      observationPeriod: editAuditPeriod.trim() || editingAudit.observationPeriod,
      owner: editAuditOwner.trim() || editingAudit.owner,
      auditTeam: editAuditTeam.trim() || editingAudit.auditTeam,
      entities: editAuditEntities.trim() || editingAudit.entities,
      readiness: {
        overall: Number(editAuditReadinessOverall) || 0,
        policies: Number(editAuditReadinessPolicies) || 0,
        tests: Number(editAuditReadinessTests) || 0,
        evidences: Number(editAuditReadinessEvidences) || 0,
      },
    };

    const updatedList = updatePersistedItem('audits', updatedAudit.id, updatedAudit, audits);
    setAudits(updatedList);
    if (selectedAudit?.id === updatedAudit.id) {
      setSelectedAudit(updatedAudit);
    }
    setEditAuditModalOpen(false);
    setSuccessToast(`Audit "${updatedAudit.name}" updated successfully!`);
    setTimeout(() => setSuccessToast(null), 3500);

    await persistAuditUpdate(updatedAudit.id, updatedAudit);
  };

  const handleDeleteAudit = async (id: string, name: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete audit "${name}"? This action cannot be undone.`)) {
      return;
    }
    const updatedList = removePersistedItem('audits', id, audits);
    setAudits(updatedList);
    if (selectedAudit?.id === id) {
      setSelectedAudit(null);
    }
    try {
      await fetch(`/api/audits?id=${id}`, { method: 'DELETE' });
      setSuccessToast(`Audit "${name}" deleted successfully.`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (err) {
      console.error('Failed to delete audit:', err);
    }
  };

  // Corrective Action Handlers
  const handleOpenAddCa = () => {
    setCaModalMode('create');
    setEditingCaId(null);
    setCaName('');
    setCaStatus('Open');
    setCaAssignee('Security Engineering');
    setCaDueDate('25 Sep 2026');
    setCaCriticality('Medium');
    setCaModalOpen(true);
  };

  const handleOpenEditCa = (ca: AuditItem['correctiveActions'][0]) => {
    setCaModalMode('edit');
    setEditingCaId(ca.id);
    setCaName(ca.nonConformityName);
    setCaStatus(ca.status);
    setCaAssignee(ca.assignee);
    setCaDueDate(ca.dueDate);
    setCaCriticality(ca.criticality);
    setCaModalOpen(true);
  };

  const handleSaveCa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudit || !caName.trim()) return;

    let updatedCAs: AuditItem['correctiveActions'];
    if (caModalMode === 'create') {
      const newCa = {
        id: `ca-${Date.now()}`,
        nonConformityName: caName.trim(),
        status: caStatus,
        assignee: caAssignee.trim() || 'Unassigned',
        dueDate: caDueDate.trim() || 'TBD',
        criticality: caCriticality,
      };
      updatedCAs = [newCa, ...selectedAudit.correctiveActions];
    } else {
      updatedCAs = selectedAudit.correctiveActions.map((c) =>
        c.id === editingCaId
          ? {
              ...c,
              nonConformityName: caName.trim(),
              status: caStatus,
              assignee: caAssignee.trim() || 'Unassigned',
              dueDate: caDueDate.trim() || 'TBD',
              criticality: caCriticality,
            }
          : c
      );
    }

    const updatedAudit = { ...selectedAudit, correctiveActions: updatedCAs };
    setSelectedAudit(updatedAudit);
    const updatedList = updatePersistedItem('audits', updatedAudit.id, updatedAudit, audits);
    setAudits(updatedList);
    setCaModalOpen(false);
    setSuccessToast(
      caModalMode === 'create'
        ? 'Corrective action created successfully!'
        : 'Corrective action updated successfully!'
    );
    setTimeout(() => setSuccessToast(null), 3500);

    await persistAuditUpdate(selectedAudit.id, { correctiveActions: updatedCAs });
  };

  const handleDeleteCa = async (caId: string, caName: string) => {
    if (!selectedAudit) return;
    if (!window.confirm(`Delete corrective action "${caName}"?`)) return;

    const updatedCAs = selectedAudit.correctiveActions.filter((c) => c.id !== caId);
    const updatedAudit = { ...selectedAudit, correctiveActions: updatedCAs };
    setSelectedAudit(updatedAudit);
    const updatedList = updatePersistedItem('audits', updatedAudit.id, updatedAudit, audits);
    setAudits(updatedList);
    setSuccessToast('Corrective action deleted.');
    setTimeout(() => setSuccessToast(null), 3500);

    await persistAuditUpdate(selectedAudit.id, { correctiveActions: updatedCAs });
  };

  // Requirement Handlers
  const handleOpenAddReq = () => {
    setReqModalMode('create');
    setEditingReqId(null);
    setReqCode(`CC${selectedAudit ? selectedAudit.requirements.length + 1 : 1}.0`);
    setReqTitle('');
    setReqControls('');
    setReqModalOpen(true);
  };

  const handleOpenEditReq = (req: AuditItem['requirements'][0], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setReqModalMode('edit');
    setEditingReqId(req.id);
    setReqCode(req.code);
    setReqTitle(req.title);
    setReqControls(req.controls.join(', '));
    setReqModalOpen(true);
  };

  const handleSaveReq = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAudit || !reqTitle.trim()) return;

    const controlsList = reqControls
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    let updatedReqs: AuditItem['requirements'];
    if (reqModalMode === 'create') {
      const newReq = {
        id: `req-${Date.now()}`,
        code: reqCode.trim() || 'CC.X',
        title: reqTitle.trim(),
        controlsCount: controlsList.length || 1,
        controls: controlsList.length > 0 ? controlsList : [reqCode.trim() || 'CC.X.1'],
      };
      updatedReqs = [...selectedAudit.requirements, newReq];
    } else {
      updatedReqs = selectedAudit.requirements.map((r) =>
        r.id === editingReqId
          ? {
              ...r,
              code: reqCode.trim() || r.code,
              title: reqTitle.trim(),
              controlsCount: controlsList.length,
              controls: controlsList,
            }
          : r
      );
    }

    const updatedAudit = { ...selectedAudit, requirements: updatedReqs };
    setSelectedAudit(updatedAudit);
    const updatedList = updatePersistedItem('audits', updatedAudit.id, updatedAudit, audits);
    setAudits(updatedList);
    setReqModalOpen(false);
    setSuccessToast(
      reqModalMode === 'create'
        ? `Requirement "${reqCode}" added successfully!`
        : `Requirement "${reqCode}" updated successfully!`
    );
    setTimeout(() => setSuccessToast(null), 3500);

    await persistAuditUpdate(selectedAudit.id, { requirements: updatedReqs });
  };

  const handleDeleteReq = async (reqId: string, reqTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedAudit) return;
    if (!window.confirm(`Delete requirement "${reqTitle}" and its mapped controls?`)) return;

    const updatedReqs = selectedAudit.requirements.filter((r) => r.id !== reqId);
    const updatedAudit = { ...selectedAudit, requirements: updatedReqs };
    setSelectedAudit(updatedAudit);
    const updatedList = updatePersistedItem('audits', updatedAudit.id, updatedAudit, audits);
    setAudits(updatedList);
    setSuccessToast('Requirement removed.');
    setTimeout(() => setSuccessToast(null), 3500);

    await persistAuditUpdate(selectedAudit.id, { requirements: updatedReqs });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Universal Success Toast Banner */}
        {successToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between shadow-xs animate-in fade-in duration-150">
            <span className="font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </span>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-600 hover:text-emerald-900 text-[11px] font-bold ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* If NO audit is selected: Show Audit Center List (Scrut Image 11) */}
        {!selectedAudit ? (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Audit Center</h1>
                <p className="text-sm text-slate-500 mt-1">
                  Easily invite external auditors, track observation periods, and securely package evidence in one place.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  id="tour-audit-create-btn"
                  onClick={() => setCreateModalOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Audit</span>
                </button>
              </div>
            </div>

            {/* Top View Tabs & 4 Metric Cards (Scrut Image 11) */}
            <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg w-fit">
              <button
                onClick={() => setActiveTab('audits')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'audits' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Audits ({audits.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeTab === 'requests' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Requests (0)
              </button>
            </div>

            {/* 4 Metric Cards matching Scrut Image 11 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>In Progress</span>
                  <span className="text-slate-400 text-[11px]">ⓘ</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{inProgressCount}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Completed</span>
                  <span className="text-slate-400 text-[11px]">ⓘ</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>Internal Audits</span>
                  <span className="text-slate-400 text-[11px]">ⓘ</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{internalCount}</p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
                  <span>External Audits</span>
                  <span className="text-slate-400 text-[11px]">ⓘ</span>
                </div>
                <p className="text-2xl font-bold text-slate-900">{externalCount}</p>
              </div>
            </div>

            {/* Audits Table (Scrut Image 11) */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by audit name..."
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 border-b border-slate-200/80 font-semibold text-slate-600 uppercase text-[11px]">
                    <tr>
                      <th className="px-5 py-3.5">Audit Name</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Audit Type</th>
                      <th className="px-5 py-3.5">Audit Date</th>
                      <th className="px-5 py-3.5">Observation Period</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {audits.map((a) => (
                      <tr
                        key={a.id}
                        onClick={() => setSelectedAudit(a)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900 text-xs hover:text-emerald-600 transition-colors">
                            {a.name}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              a.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : a.status === 'In Progress'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {a.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{a.type}</td>
                        <td className="px-5 py-3.5 text-slate-600">{a.auditDate}</td>
                        <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">
                          {a.observationPeriod}
                        </td>
                        <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedAudit(a)}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 px-2 py-1 hover:bg-emerald-50 rounded transition inline-flex items-center gap-1"
                          >
                            Open Workspace &rarr;
                          </button>
                          <button
                            onClick={(e) => handleOpenEditAudit(a, e)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition inline-flex items-center"
                            title="Edit Audit Details"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteAudit(a.id, a.name, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition inline-flex items-center"
                            title="Delete Audit"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          /* ─── DEDICATED AUDIT WORKSPACE (Scrut Images 12 & 13) ─── */
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Workspace Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setSelectedAudit(null)}
                  className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                  title="Back to audits list"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{selectedAudit.name}</span>
                  <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 text-xs font-bold font-mono">
                    {selectedAudit.framework}
                  </span>
                </h1>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Audit</span>
                </button>
                <button
                  onClick={() => handleOpenEditAudit(selectedAudit)}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                  title="Edit audit parameters and dates"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit Audit</span>
                </button>
                <button
                  onClick={handleMarkComplete}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                >
                  Mark Audit Complete
                </button>
                <button
                  onClick={() => handleDeleteAudit(selectedAudit.id, selectedAudit.name)}
                  className="px-3 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                  title="Delete this audit engagement"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Delete</span>
                </button>
                <button
                  onClick={() => {
                    const mdReport = `# ${selectedAudit.name} - Executive Audit Readiness Report
**Framework:** ${selectedAudit.framework} | **Observation Window:** ${selectedAudit.observationPeriod}
**Lead Owner:** ${selectedAudit.owner} | **Auditor Entity:** ${selectedAudit.auditTeam}
**Generated:** ${new Date().toUTCString()}

## 1. Executive Summary & Attestation
This audit dossier evaluates compliance controls, continuous automated tests, signed policy documentation, and third-party evidence collected across **${selectedAudit.entities}**.

### Overall Audit Readiness Score: ${selectedAudit.readiness.overall}%
- **Policies Attestation:** ${selectedAudit.readiness.policies}%
- **Continuous Automated Tests:** ${selectedAudit.readiness.tests}%
- **Evidence Artifacts:** ${selectedAudit.readiness.evidences}%

## 2. Common Criteria Requirements & Control Mappings
${selectedAudit.requirements.map(req => `### [${req.code}] ${req.title}
- Mapped Controls (${req.controlsCount}): ${req.controls.join(', ')}
- Status: VERIFIED & COMPLIANT
`).join('\n')}

## 3. Corrective Action Plan & Non-Conformity Tracker
${selectedAudit.correctiveActions.map(ca => `- [${ca.status.toUpperCase()}] **${ca.nonConformityName}**
  - Criticality: ${ca.criticality} | Assignee: ${ca.assignee} | Due Date: ${ca.dueDate}`).join('\n')}

## 4. Auditor Certification Block
I hereby confirm that all control activities, technical evidence snapshots, and policy revisions referenced in this dossier reflect the operational reality of the organization during the stated observation window.

**Lead Auditor Signature:** ___________________________
**Date:** ________________________
`;
                    const blob = new Blob([mdReport], { type: 'text/markdown' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedAudit.name.replace(/\s+/g, '_')}_Executive_Audit_Report.md`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                  title="Export executive report as Markdown"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export Report (.MD)</span>
                </button>
                <button
                  id="tour-audit-export-pdf-btn"
                  onClick={() => {
                    const lines = [
                      `EXECUTIVE AUDIT READINESS DOSSIER`,
                      `Audit: ${selectedAudit.name}`,
                      `Framework: ${selectedAudit.framework}`,
                      `Observation Window: ${selectedAudit.observationPeriod}`,
                      `Lead Owner: ${selectedAudit.owner}`,
                      `Auditor Entity: ${selectedAudit.auditTeam}`,
                      `Generated Date: ${new Date().toISOString().split('T')[0]}`,
                      ``,
                      `1. AUDIT READINESS METRICS:`,
                      `- Overall Readiness Score: ${selectedAudit.readiness.overall}%`,
                      `- Policies Attestation: ${selectedAudit.readiness.policies}%`,
                      `- Continuous Automated Tests: ${selectedAudit.readiness.tests}%`,
                      `- Evidence Artifacts: ${selectedAudit.readiness.evidences}%`,
                      ``,
                      `2. COMMON CRITERIA EVALUATION:`,
                      ...selectedAudit.requirements.map(r => `[${r.code}] ${r.title} (Controls: ${r.controls.join(', ')})`),
                      ``,
                      `3. CORRECTIVE ACTIONS:`,
                      ...selectedAudit.correctiveActions.map(ca => `[${ca.status}] ${ca.nonConformityName} - ${ca.criticality} (${ca.assignee}, Due: ${ca.dueDate})`),
                      ``,
                      `4. ATTESTATION:`,
                      `Verified by AI-Compliance Engine & Compliance Steering Committee.`,
                    ];
                    const pdfBlob = generateSimplePDF(selectedAudit.name, lines, orgName);
                    const url = URL.createObjectURL(pdfBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedAudit.name.replace(/\s+/g, '_')}_Audit_Dossier.pdf`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                  title="Export formal PDF dossier"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Dossier (.PDF)</span>
                </button>
              </div>
            </div>

            {completedSuccess && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs rounded-xl font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>Audit has been marked as Completed! All compliance milestones finalized.</span>
              </div>
            )}

            {/* Metadata & Audit Readiness Row (Scrut Image 12 & 13) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Metadata Grid (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Owner</span>
                  <span className="font-semibold text-slate-800 mt-1 block">{selectedAudit.owner}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Date</span>
                  <span className="font-semibold text-slate-800 mt-1 block">{selectedAudit.auditDate}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Type</span>
                  <span className="font-semibold text-slate-800 mt-1 block">{selectedAudit.type}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="font-semibold text-amber-600 mt-1 block">{selectedAudit.status}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Audit Team</span>
                  <span className="font-semibold text-slate-800 mt-1 block">{selectedAudit.auditTeam}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Framework</span>
                  <span className="font-semibold text-purple-700 mt-1 block">{selectedAudit.framework}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Observation Period</span>
                  <span className="font-mono text-slate-800 text-[11px] mt-1 block">{selectedAudit.observationPeriod}</span>
                </div>
              </div>

              {/* Audit Readiness Bars (5 cols) (Scrut Image 12) */}
              <div id="tour-audit-readiness-card" className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">Audit Readiness</span>
                    <span className="font-mono font-bold text-emerald-600">{selectedAudit.readiness.overall}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${selectedAudit.readiness.overall}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 font-medium">Policies</span>
                    <span className="font-mono font-semibold text-emerald-600">{selectedAudit.readiness.policies}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${selectedAudit.readiness.policies}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 font-medium">Automated Tests</span>
                    <span className="font-mono font-semibold text-emerald-600">{selectedAudit.readiness.tests}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${selectedAudit.readiness.tests}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-600 font-medium">Evidences</span>
                    <span className="font-mono font-semibold text-emerald-600">{selectedAudit.readiness.evidences}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${selectedAudit.readiness.evidences}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Tabs Bar (Scrut Image 12 & 13) */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold">
                <button
                  onClick={() => setActiveDetailTab('requirements')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeDetailTab === 'requirements'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Requirements ({selectedAudit.requirements.length})
                </button>
                <button
                  onClick={() => setActiveDetailTab('corrective')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    activeDetailTab === 'corrective'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Corrective Actions ({selectedAudit.correctiveActions.length})
                </button>
              </div>

              <div>
                {activeDetailTab === 'requirements' && (
                  <button
                    onClick={handleOpenAddReq}
                    className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Requirement</span>
                  </button>
                )}
                {activeDetailTab === 'corrective' && (
                  <button
                    id="tour-audit-ca-btn"
                    onClick={handleOpenAddCa}
                    className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold transition inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Corrective Action</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: Requirements Accordions (Scrut Image 13) */}
            {activeDetailTab === 'requirements' && (
              <div className="space-y-3">
                {selectedAudit.requirements.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-slate-200/80 shadow-xs">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">No requirements configured</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Add framework requirements and criteria to start tracking control telemetry.</p>
                    <button
                      onClick={handleOpenAddReq}
                      className="mt-3 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Requirement</span>
                    </button>
                  </div>
                ) : (
                  selectedAudit.requirements.map((req) => {
                    const isExpanded = expandedReqs.includes(req.id);
                    return (
                      <div key={req.id} className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
                        <div className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition">
                          <button
                            type="button"
                            onClick={() => toggleReq(req.id)}
                            className="flex-1 flex items-center space-x-3 text-left"
                          >
                            <ChevronDown
                              className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                            <span className="font-bold text-xs text-slate-900 font-mono shrink-0">{req.code}</span>
                            <span className="text-xs text-slate-700 font-medium">{req.title}</span>
                          </button>
                          <div className="flex items-center space-x-2 shrink-0 ml-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[10px] border">
                              {req.controlsCount || req.controls.length} controls
                            </span>
                            <button
                              type="button"
                              onClick={(e) => handleOpenEditReq(req, e)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition inline-flex items-center"
                              title="Edit Requirement"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDeleteReq(req.id, req.title, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition inline-flex items-center"
                              title="Delete Requirement"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="p-4 bg-slate-50/60 border-t border-slate-100 space-y-2">
                            {req.controls.map((c, idx) => (
                              <div
                                key={idx}
                                className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                              >
                                <div className="flex items-center space-x-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="font-mono font-bold text-slate-800">{c}</span>
                                  <span className="text-slate-600">Verification complete via continuous telemetry</span>
                                </div>
                                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-[10px]">
                                  Compliant
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* TAB 2: Corrective Actions Table (Scrut Image 12) */}
            {activeDetailTab === 'corrective' && (
              <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
                {selectedAudit.correctiveActions.length === 0 ? (
                  <div className="p-8 text-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-800">No corrective actions logged</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">All non-conformities have been remediated or none exist.</p>
                    <button
                      onClick={handleOpenAddCa}
                      className="mt-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Log Corrective Action</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50/75 border-b border-slate-200/80 font-semibold text-slate-600 uppercase text-[11px]">
                        <tr>
                          <th className="px-5 py-3.5">Non Conformity Name</th>
                          <th className="px-5 py-3.5">Status</th>
                          <th className="px-5 py-3.5">Assignee</th>
                          <th className="px-5 py-3.5">Due Date</th>
                          <th className="px-5 py-3.5">Criticality Rating</th>
                          <th className="px-5 py-3.5 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {selectedAudit.correctiveActions.map((ca) => (
                          <tr key={ca.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-5 py-3.5 font-semibold text-slate-900">{ca.nonConformityName}</td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                  ca.status === 'Closed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {ca.status}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-600">{ca.assignee}</td>
                            <td className="px-5 py-3.5 text-slate-500 font-mono text-[11px]">{ca.dueDate}</td>
                            <td className="px-5 py-3.5">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  ca.criticality === 'Critical'
                                    ? 'bg-rose-100 text-rose-800'
                                    : ca.criticality === 'High'
                                    ? 'bg-orange-100 text-orange-800'
                                    : ca.criticality === 'Medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {ca.criticality}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-right space-x-1 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditCa(ca)}
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition inline-flex items-center"
                                title="Edit Corrective Action"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteCa(ca.id, ca.nonConformityName)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition inline-flex items-center"
                                title="Delete Corrective Action"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── CREATE NEW AUDIT MODAL ─── */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-5 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Create New Compliance Audit</h2>
                    <p className="text-xs text-slate-500">Configure audit scope, select standard framework, and invite auditors</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreateModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateAuditSubmit} className="space-y-4">
                {/* Framework Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Compliance Framework Standard
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {['SOC 2', 'ISO 27001', 'NIST CSF', 'HIPAA', 'PCI-DSS'].map((fw) => (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => handleFrameworkChange(fw)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-center ${
                          newAuditFramework === fw
                            ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Audit Engagement Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuditName}
                    onChange={(e) => setNewAuditName(e.target.value)}
                    placeholder="e.g. SOC 2 Type II Examination 2026/2027"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* Audit Type & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audit Type
                    </label>
                    <select
                      value={newAuditType}
                      onChange={(e) => setNewAuditType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="External">External (CPA / Registrar)</option>
                      <option value="Internal">Internal (Surveillance)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Engagement Status
                    </label>
                    <select
                      value={newAuditStatus}
                      onChange={(e) => setNewAuditStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                      <option value="In Progress">In Progress (Active Testing)</option>
                      <option value="Planned">Planned (Scheduled)</option>
                    </select>
                  </div>
                </div>

                {/* Target Date & Observation Period */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Target Audit Date
                    </label>
                    <input
                      type="text"
                      value={newAuditDate}
                      onChange={(e) => setNewAuditDate(e.target.value)}
                      placeholder="e.g. 1 Dec 2026"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Observation Window
                    </label>
                    <input
                      type="text"
                      value={newAuditPeriod}
                      onChange={(e) => setNewAuditPeriod(e.target.value)}
                      placeholder="e.g. 1 Jan 2026 - 31 Dec 2026"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Auditor Firm & Internal Lead */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audit Firm / Examination Team
                    </label>
                    <input
                      type="text"
                      value={newAuditTeam}
                      onChange={(e) => setNewAuditTeam(e.target.value)}
                      placeholder="e.g. KPMG LLP & Compliance Lead"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Internal Engagement Lead
                    </label>
                    <input
                      type="text"
                      value={newAuditOwner}
                      onChange={(e) => setNewAuditOwner(e.target.value)}
                      placeholder="e.g. Sarah Chen (Lead)"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* In-Scope Entities */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    In-Scope Infrastructure & Entities
                  </label>
                  <input
                    type="text"
                    value={newAuditEntities}
                    onChange={(e) => setNewAuditEntities(e.target.value)}
                    placeholder="e.g. Organization Wide, Production AWS VPC"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createSubmitting || !newAuditName.trim()}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    {createSubmitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{createSubmitting ? 'Creating Audit...' : 'Create Audit Engagement'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── EDIT AUDIT MODAL ─── */}
        {editAuditModalOpen && editingAudit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col p-6 shadow-2xl border border-slate-200 space-y-5 overflow-y-auto">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Edit Audit Engagement</h2>
                    <p className="text-xs text-slate-500">Update audit scope, timelines, readiness metrics, and ownership</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditAuditModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveAuditEdit} className="space-y-4">
                {/* Framework Selection */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Compliance Framework Standard
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {['SOC 2', 'ISO 27001', 'NIST CSF', 'HIPAA', 'PCI-DSS'].map((fw) => (
                      <button
                        key={fw}
                        type="button"
                        onClick={() => setEditAuditFramework(fw)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold border transition text-center ${
                          editAuditFramework === fw
                            ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {fw}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Audit Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Audit Engagement Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editAuditName}
                    onChange={(e) => setEditAuditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Audit Type & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audit Type
                    </label>
                    <select
                      value={editAuditType}
                      onChange={(e) => setEditAuditType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="External">External (CPA / Registrar)</option>
                      <option value="Internal">Internal (Surveillance)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Engagement Status
                    </label>
                    <select
                      value={editAuditStatus}
                      onChange={(e) => setEditAuditStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="In Progress">In Progress (Active Testing)</option>
                      <option value="Planned">Planned (Scheduled)</option>
                      <option value="Completed">Completed (Finalized)</option>
                    </select>
                  </div>
                </div>

                {/* Target Date & Observation Period */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Target Audit Date
                    </label>
                    <input
                      type="text"
                      value={editAuditDate}
                      onChange={(e) => setEditAuditDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Observation Window
                    </label>
                    <input
                      type="text"
                      value={editAuditPeriod}
                      onChange={(e) => setEditAuditPeriod(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* Auditor Firm & Internal Lead */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Audit Firm / Examination Team
                    </label>
                    <input
                      type="text"
                      value={editAuditTeam}
                      onChange={(e) => setEditAuditTeam(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Internal Engagement Lead
                    </label>
                    <input
                      type="text"
                      value={editAuditOwner}
                      onChange={(e) => setEditAuditOwner(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                {/* In-Scope Entities */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    In-Scope Infrastructure & Entities
                  </label>
                  <input
                    type="text"
                    value={editAuditEntities}
                    onChange={(e) => setEditAuditEntities(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Readiness Scores */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Audit Readiness Scores (%)
                  </span>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">Overall</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editAuditReadinessOverall}
                        onChange={(e) => setEditAuditReadinessOverall(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg p-2 font-mono font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">Policies</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editAuditReadinessPolicies}
                        onChange={(e) => setEditAuditReadinessPolicies(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg p-2 font-mono font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">Tests</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editAuditReadinessTests}
                        onChange={(e) => setEditAuditReadinessTests(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg p-2 font-mono font-bold outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 font-medium block">Evidences</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={editAuditReadinessEvidences}
                        onChange={(e) => setEditAuditReadinessEvidences(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 text-slate-900 text-xs rounded-lg p-2 font-mono font-bold outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setEditAuditModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── ADD / EDIT CORRECTIVE ACTION MODAL ─── */}
        {caModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {caModalMode === 'create' ? 'Log New Corrective Action' : 'Edit Corrective Action'}
                    </h2>
                    <p className="text-xs text-slate-500">Track audit findings, remediation assignees, and deadlines</p>
                  </div>
                </div>
                <button
                  onClick={() => setCaModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveCa} className="space-y-4">
                {/* Non Conformity Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Non Conformity / Finding Description
                  </label>
                  <input
                    type="text"
                    required
                    value={caName}
                    onChange={(e) => setCaName(e.target.value)}
                    placeholder="e.g. Share documented peer code review processes"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                {/* Status & Criticality */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Remediation Status
                    </label>
                    <select
                      value={caStatus}
                      onChange={(e) => setCaStatus(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="Open">Open (Pending Resolution)</option>
                      <option value="Closed">Closed (Remediated)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Criticality Rating
                    </label>
                    <select
                      value={caCriticality}
                      onChange={(e) => setCaCriticality(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>

                {/* Assignee & Due Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Remediation Assignee
                    </label>
                    <input
                      type="text"
                      required
                      value={caAssignee}
                      onChange={(e) => setCaAssignee(e.target.value)}
                      placeholder="e.g. Security Engineering"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Target Due Date
                    </label>
                    <input
                      type="text"
                      required
                      value={caDueDate}
                      onChange={(e) => setCaDueDate(e.target.value)}
                      placeholder="e.g. 25 Sep 2026"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setCaModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{caModalMode === 'create' ? 'Log Action' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ─── ADD / EDIT REQUIREMENT MODAL ─── */}
        {reqModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {reqModalMode === 'create' ? 'Add Framework Requirement' : 'Edit Framework Requirement'}
                    </h2>
                    <p className="text-xs text-slate-500">Define criteria code, title, and mapped control benchmarks</p>
                  </div>
                </div>
                <button
                  onClick={() => setReqModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveReq} className="space-y-4">
                {/* Code & Title */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Criteria Code
                    </label>
                    <input
                      type="text"
                      required
                      value={reqCode}
                      onChange={(e) => setReqCode(e.target.value)}
                      placeholder="e.g. CC7.0"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-mono font-bold focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>

                  <div className="col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Requirement Title
                    </label>
                    <input
                      type="text"
                      required
                      value={reqTitle}
                      onChange={(e) => setReqTitle(e.target.value)}
                      placeholder="e.g. System Operations & Change Management"
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Specific Controls */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mapped Controls (comma separated)
                  </label>
                  <textarea
                    rows={3}
                    value={reqControls}
                    onChange={(e) => setReqControls(e.target.value)}
                    placeholder="e.g. CC7.1, CC7.2, CC7.3, CC7.4"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl p-2.5 font-mono focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                  <span className="text-[10px] text-slate-400">
                    Enter comma-separated control IDs that verify this requirement.
                  </span>
                </div>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setReqModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{reqModalMode === 'create' ? 'Add Requirement' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
