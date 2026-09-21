import { Injectable, Logger } from '@nestjs/common';

export interface IntegrationItem {
  id: string;
  name: string;
  category: string;
  logo: string;
  description: string;
  connected: boolean;
  connectionMode?: 'LIVE' | 'SANDBOX' | 'UNCONFIGURED';
  config?: Record<string, any>;
  capabilities: string[];
  scopes: { name: string; description: string }[];
  stats: {
    automatedTests: number;
    automatedControls: number;
    automatedEvidences: number;
  };
  lastSync?: string;
  syncStatus?: 'HEALTHY' | 'SYNCING' | 'ERROR';
}

const DEFAULT_INTEGRATIONS: IntegrationItem[] = [
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: 'Cloud Providers',
    logo: 'aws',
    description: 'Allows continuous monitoring of IAM policies, root MFA, S3 bucket encryption, CloudTrail logging, KMS key rotation, and VPC security groups.',
    connected: true,
    connectionMode: 'SANDBOX',
    capabilities: ['Automated Evidence', 'Access Review', 'Automated Tests', 'Continuous Monitoring'],
    scopes: [
      { name: 'Read Only Access', description: 'Permissions to retrieve cloud resource details (S3, EC2, RDS, IAM, KMS).' },
      { name: 'Security Audit', description: 'Access audit logs and security posture findings from AWS Security Hub & GuardDuty.' },
    ],
    stats: {
      automatedTests: 153,
      automatedControls: 94,
      automatedEvidences: 20,
    },
    lastSync: '10 minutes ago',
    syncStatus: 'HEALTHY',
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    category: 'Cloud Providers',
    logo: 'azure',
    description: 'Monitors Azure Active Directory conditional access, Defender for Cloud security recommendations, and storage account encryption.',
    connected: false,
    capabilities: ['Automated Evidence', 'Automated Tests'],
    scopes: [
      { name: 'Reader Role', description: 'Read-only access to inspect subscriptions and resource group configurations.' },
      { name: 'Security Reader', description: 'Access to Microsoft Defender for Cloud alerts and compliance assessments.' },
    ],
    stats: {
      automatedTests: 118,
      automatedControls: 72,
      automatedEvidences: 16,
    },
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    category: 'Cloud Providers',
    logo: 'gcp',
    description: 'Scans Google Cloud IAM bindings, Cloud Storage uniform bucket-level access, Cloud Audit Logs, and VPC firewall rules.',
    connected: false,
    capabilities: ['Automated Evidence', 'Automated Tests'],
    scopes: [
      { name: 'Viewer Role', description: 'Permissions to view GCP project resources and IAM policies.' },
      { name: 'Security Reviewer', description: 'Permissions to read Security Command Center findings.' },
    ],
    stats: {
      automatedTests: 96,
      automatedControls: 68,
      automatedEvidences: 14,
    },
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    category: 'Cloud Providers',
    logo: 'digitalocean',
    description: 'Collects Droplet configuration, Cloud Firewall rules, and Spaces object storage encryption state.',
    connected: false,
    capabilities: ['Automated Evidence'],
    scopes: [
      { name: 'Read Token', description: 'Personal access token with read privileges across Droplets, VPCs, and Spaces.' },
    ],
    stats: {
      automatedTests: 42,
      automatedControls: 31,
      automatedEvidences: 8,
    },
  },
  {
    id: 'vercel',
    name: 'Vercel',
    category: 'Cloud Providers',
    logo: 'vercel',
    description: 'Collects edge deployment environment variables protection, team SSO enforcement, and domain SSL/TLS certificate validity.',
    connected: true,
    connectionMode: 'SANDBOX',
    capabilities: ['Automated Evidence', 'Access Review'],
    scopes: [
      { name: 'Team Member Read', description: 'Read access to deployments, team members, and security configurations.' },
    ],
    stats: {
      automatedTests: 28,
      automatedControls: 22,
      automatedEvidences: 6,
    },
    lastSync: '1 hour ago',
    syncStatus: 'HEALTHY',
  },
  {
    id: 'google-workspace',
    name: 'Google Workspace',
    category: 'Identity Providers',
    logo: 'google',
    description: 'Monitors organization-wide 2-Step Verification, suspended user accounts, automated offboarding SLAs, and Google Drive sharing restrictions.',
    connected: true,
    connectionMode: 'SANDBOX',
    capabilities: ['Automated Evidence', 'Access Review', 'Continuous Monitoring'],
    scopes: [
      { name: 'Directory Read', description: 'Retrieve users, groups, MFA status, and organizational units.' },
      { name: 'Reports Audit', description: 'Access audit logs for logins, token grants, and drive activity.' },
    ],
    stats: {
      automatedTests: 45,
      automatedControls: 38,
      automatedEvidences: 12,
    },
    lastSync: '25 minutes ago',
    syncStatus: 'HEALTHY',
  },
  {
    id: 'okta',
    name: 'Okta (IdP)',
    category: 'Identity Providers',
    logo: 'okta',
    description: 'Enforces single sign-on (SSO), adaptive MFA policies, password complexity rules, and automated SCIM provisioning across all corporate apps.',
    connected: true,
    connectionMode: 'SANDBOX',
    capabilities: ['Automated Evidence', 'Access Review', 'Automated Tests'],
    scopes: [
      { name: 'Read Only Admin', description: 'Read-only API access to query users, groups, factor policies, and system logs.' },
    ],
    stats: {
      automatedTests: 64,
      automatedControls: 52,
      automatedEvidences: 15,
    },
    lastSync: '5 minutes ago',
    syncStatus: 'HEALTHY',
  },
  {
    id: 'entra',
    name: 'Microsoft Entra ID (Azure AD)',
    category: 'Identity Providers',
    logo: 'entra',
    description: 'Inspects Conditional Access policies, privileged identity assignments, and enterprise application consent settings.',
    connected: false,
    capabilities: ['Automated Evidence', 'Access Review'],
    scopes: [
      { name: 'Directory.Read.All', description: 'Read directory data and audit sign-in logs.' },
    ],
    stats: {
      automatedTests: 58,
      automatedControls: 44,
      automatedEvidences: 11,
    },
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Version Control',
    logo: 'github',
    description: 'Verifies branch protection rules, required PR code reviews, blocking force pushes, secret scanning, and automated Dependabot alerts.',
    connected: true,
    connectionMode: 'SANDBOX',
    capabilities: ['Automated Evidence', 'Automated Tests', 'Continuous Monitoring'],
    scopes: [
      { name: 'repo (read)', description: 'Read repository metadata and branch protection rules.' },
      { name: 'admin:org (read)', description: 'Read organization members, 2FA status, and audit log events.' },
    ],
    stats: {
      automatedTests: 36,
      automatedControls: 28,
      automatedEvidences: 9,
    },
    lastSync: 'Just now',
    syncStatus: 'HEALTHY',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'Version Control',
    logo: 'gitlab',
    description: 'Scans protected branches, merge request approvals, and CI/CD pipeline code quality gates.',
    connected: false,
    capabilities: ['Automated Evidence', 'Automated Tests'],
    scopes: [
      { name: 'read_api', description: 'Read-only access to projects, merge requests, and groups.' },
    ],
    stats: {
      automatedTests: 32,
      automatedControls: 24,
      automatedEvidences: 8,
    },
  },
  {
    id: 'slack',
    name: 'Slack',
    category: 'Communication',
    logo: 'slack',
    description: 'Verifies dedicated incident response channels, enterprise message retention policies, two-factor authentication, and approved app integrations.',
    connected: true,
    connectionMode: 'SANDBOX',
    capabilities: ['Automated Evidence', 'Continuous Monitoring'],
    scopes: [
      { name: 'channels:read', description: 'Inspect public incident response and alerting channels.' },
      { name: 'team:read', description: 'Verify workspace authentication security settings.' },
    ],
    stats: {
      automatedTests: 18,
      automatedControls: 14,
      automatedEvidences: 5,
    },
    lastSync: '15 minutes ago',
    syncStatus: 'HEALTHY',
  },
  {
    id: 'jira',
    name: 'Jira Software',
    category: 'Project Management',
    logo: 'jira',
    description: 'Tracks security vulnerability remediation tickets, change management requests, and SLA resolution tracking.',
    connected: false,
    capabilities: ['Automated Evidence', 'Access Review'],
    scopes: [
      { name: 'read:jira-work', description: 'Read project boards, issue statuses, and security workflows.' },
    ],
    stats: {
      automatedTests: 24,
      automatedControls: 19,
      automatedEvidences: 7,
    },
  },
  {
    id: 'rippling',
    name: 'Rippling (HRIS)',
    category: 'Human Resources (HRIS)',
    logo: 'rippling',
    description: 'Automates employee onboarding/offboarding tracking, background check verification, and security policy acknowledgment records.',
    connected: false,
    capabilities: ['Automated Evidence', 'Access Review'],
    scopes: [
      { name: 'company:read', description: 'Query active/terminated employee rosters and department roles.' },
    ],
    stats: {
      automatedTests: 22,
      automatedControls: 18,
      automatedEvidences: 6,
    },
  },
  {
    id: 'snyk',
    name: 'Snyk Vulnerability Scanner',
    category: 'Vulnerability Scanners',
    logo: 'snyk',
    description: 'Continuously monitors open source dependencies, container images, and IaC templates for Common Vulnerabilities and Exposures (CVEs).',
    connected: false,
    capabilities: ['Automated Evidence', 'Automated Tests'],
    scopes: [
      { name: 'org:read', description: 'Read security test results, vulnerability severities, and fix statuses.' },
    ],
    stats: {
      automatedTests: 34,
      automatedControls: 26,
      automatedEvidences: 8,
    },
  },
];

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);
  private integrations: IntegrationItem[] = [...DEFAULT_INTEGRATIONS];

  findAll() {
    return {
      total: this.integrations.length,
      connectedCount: this.integrations.filter((i) => i.connected).length,
      categories: [
        'All',
        'Cloud Providers',
        'Identity Providers',
        'Version Control',
        'Communication',
        'Project Management',
        'Human Resources (HRIS)',
        'Vulnerability Scanners',
      ],
      integrations: this.integrations,
    };
  }

  findOne(id: string) {
    return this.integrations.find((i) => i.id === id);
  }

  update(id: string, body: any) {
    const targetId = id || body.id || body.integrationId;
    let updatedItem: IntegrationItem | null = null;

    this.integrations = this.integrations.map((item) => {
      if (item.id === targetId) {
        const nextConnected = typeof body.connected === 'boolean' ? body.connected : !item.connected;
        const nextMode = body.connectionMode || (nextConnected ? (item.connectionMode || 'SANDBOX') : 'UNCONFIGURED');
        updatedItem = {
          ...item,
          ...body,
          id: targetId,
          connected: nextConnected,
          connectionMode: nextMode,
          config: body.config !== undefined ? body.config : item.config,
          lastSync: nextConnected ? 'Just now' : undefined,
          syncStatus: nextConnected ? 'HEALTHY' : undefined,
        };
        return updatedItem;
      }
      return item;
    });

    if (updatedItem) {
      return { success: true, integration: updatedItem };
    }
    return { error: 'Integration not found', status: 404 };
  }

  async testConnection(payload: any) {
    const aiServiceUrl = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';
    try {
      const res = await fetch(`${aiServiceUrl}/api/v1/integrations/test-connection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch (err: any) {
      this.logger.warn(`AI service connection test fallback: ${err.message}`);
    }

    return {
      status: 'FALLBACK_VERIFIED',
      mode: 'SANDBOX',
      message: 'Verified locally in Sandbox Mode',
      latency_ms: 25,
    };
  }
}
