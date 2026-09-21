import { PrismaClient, RoleType, ControlStatus, SeverityLevel, RiskStatus, AuditStatus, EvidenceStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AI-Compliance database...');

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'acme-corp' },
    update: {},
    create: {
      name: 'Acme Corporation',
      slug: 'acme-corp',
    },
  });
  console.log(`Organization created: ${org.name} (${org.id})`);

  // 2. Create Roles
  const roles = [
    RoleType.ADMIN,
    RoleType.COMPLIANCE_MANAGER,
    RoleType.AUDITOR,
    RoleType.CONTRIBUTOR,
    RoleType.VIEWER,
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r },
      update: {},
      create: { name: r, description: `Role for ${r}` },
    });
  }

  // 3. Create Admin User
  const adminRole = await prisma.role.findUnique({ where: { name: RoleType.ADMIN } });
  const user = await prisma.user.upsert({
    where: { email: 'compliance.lead@acme.com' },
    update: {},
    create: {
      email: 'compliance.lead@acme.com',
      name: 'Alex Rivera',
      passwordHash: '$2b$10$epGk9pXQ/h1N47qBf35gke4GzJ9Yq3M0W9/hD0E8t.7.K08YvI0kG', // hash for testing
      organizationId: org.id,
      userRoles: adminRole ? {
        create: {
          roleId: adminRole.id,
        },
      } : undefined,
    },
  });
  console.log(`User created: ${user.name}`);

  // 4. Load & Seed Frameworks and Controls
  const frameworksConfig = [
    {
      name: 'SOC 2 Type II',
      code: 'SOC2',
      version: '2022',
      description: 'AICPA Trust Services Criteria for Security, Availability, and Confidentiality',
      dataFile: 'compliance-data/soc2/controls.json',
    },
    {
      name: 'ISO/IEC 27001:2022',
      code: 'ISO27001',
      version: '2022',
      description: 'International Information Security Management Standard (Annex A controls)',
      dataFile: 'compliance-data/iso27001/controls.json',
    },
    {
      name: 'NIST Cybersecurity Framework',
      code: 'NIST-CSF',
      version: 'v2.0',
      description: 'NIST Cybersecurity Framework 2.0 covering Govern, Identify, Protect, Detect, Respond, Recover',
      dataFile: 'compliance-data/nist-csf/controls.json',
    },
  ];

  for (const fwConfig of frameworksConfig) {
    const fw = await prisma.framework.upsert({
      where: {
        organizationId_code_version: {
          organizationId: org.id,
          code: fwConfig.code,
          version: fwConfig.version,
        },
      },
      update: {},
      create: {
        organizationId: org.id,
        name: fwConfig.name,
        code: fwConfig.code,
        version: fwConfig.version,
        description: fwConfig.description,
      },
    });

    const filePath = path.resolve(process.cwd(), '../../', fwConfig.dataFile);
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      for (const ctrl of data.controls) {
        await prisma.control.upsert({
          where: {
            frameworkId_code: {
              frameworkId: fw.id,
              code: ctrl.code,
            },
          },
          update: {
            title: ctrl.title,
            description: ctrl.description,
            category: ctrl.category,
            maturityLevel: ctrl.maturityLevel || 3,
            status: ControlStatus.EFFECTIVE,
          },
          create: {
            frameworkId: fw.id,
            code: ctrl.code,
            title: ctrl.title,
            description: ctrl.description,
            category: ctrl.category,
            maturityLevel: ctrl.maturityLevel || 3,
            status: ControlStatus.EFFECTIVE,
          },
        });
      }
      console.log(`Seeded ${data.controls.length} controls for ${fwConfig.name}`);
    }
  }

  // 5. Seed Risks
  const ciso = user;
  const complianceManager = user;
  const risks = [
    {
      organizationId: org.id,
      ownerId: ciso.id,
      title: 'Unauthorized Database Access',
      description: 'Risk of unauthorized access to the production database due to misconfigured IAM roles.',
      category: 'Security',
      inherentLikelihood: 4,
      inherentImpact: 5,
      inherentRiskScore: 20,
      residualLikelihood: 2,
      residualImpact: 3,
      residualRiskScore: 6,
      severity: SeverityLevel.CRITICAL,
      status: RiskStatus.OPEN,
    },
    {
      organizationId: org.id,
      ownerId: complianceManager.id,
      title: 'Vendor Data Breach',
      description: 'Risk of a third-party vendor experiencing a data breach exposing our customer data.',
      category: 'Third-Party',
      inherentLikelihood: 3,
      inherentImpact: 4,
      inherentRiskScore: 12,
      residualLikelihood: 3,
      residualImpact: 4,
      residualRiskScore: 12,
      severity: SeverityLevel.HIGH,
      status: RiskStatus.OPEN,
    },
    {
      organizationId: org.id,
      ownerId: ciso.id,
      title: 'Lack of Employee Security Training',
      description: 'Employees falling for phishing attacks.',
      category: 'Human Resources',
      inherentLikelihood: 5,
      inherentImpact: 3,
      inherentRiskScore: 15,
      residualLikelihood: 2,
      residualImpact: 2,
      residualRiskScore: 4,
      severity: SeverityLevel.CRITICAL,
      status: RiskStatus.MITIGATED,
    },
  ];

  for (const r of risks) {
    await prisma.risk.create({
      data: {
        ...r,
        ownerId: user.id,
      },
    });
  }
  console.log(`Seeded ${risks.length} risks.`);

  console.log('Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
