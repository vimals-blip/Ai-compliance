-- ==============================================
-- AI-Compliance Platform - MySQL Database Schema
-- ==============================================

CREATE DATABASE IF NOT EXISTS `ai_compliance_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ai_compliance_db`;

-- -----------------------------------------------
-- Organizations
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `organizations` (
  `id`         VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `name`       VARCHAR(255) NOT NULL,
  `slug`       VARCHAR(255) NOT NULL,
  `created_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_organizations_slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Users
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id`              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id` VARCHAR(36)  NOT NULL,
  `email`           VARCHAR(255) NOT NULL,
  `password_hash`   VARCHAR(255) NOT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  INDEX `idx_users_org` (`organization_id`),
  CONSTRAINT `fk_users_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Roles
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
  `id`          VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `name`        ENUM('ADMIN','COMPLIANCE_MANAGER','AUDITOR','CONTRIBUTOR','VIEWER') NOT NULL,
  `description` TEXT         NULL,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- User Roles (many-to-many)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id`         VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `user_id`    VARCHAR(36) NOT NULL,
  `role_id`    VARCHAR(36) NOT NULL,
  `created_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_roles` (`user_id`, `role_id`),
  INDEX `idx_user_roles_user` (`user_id`),
  INDEX `idx_user_roles_role` (`role_id`),
  CONSTRAINT `fk_user_roles_user` FOREIGN KEY (`user_id`)
    REFERENCES `users`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_roles_role` FOREIGN KEY (`role_id`)
    REFERENCES `roles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Frameworks
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `frameworks` (
  `id`                  VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id`     VARCHAR(36)  NOT NULL,
  `name`                VARCHAR(255) NOT NULL,
  `code`                VARCHAR(50)  NOT NULL,
  `version`             VARCHAR(50)  NOT NULL,
  `description`         TEXT         NULL,
  `source`              VARCHAR(500) NULL,
  `source_version`      VARCHAR(100) NULL,
  `retrieved_at`        DATETIME     NULL,
  `license_or_usage_note` TEXT       NULL,
  `created_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_frameworks_org_code_ver` (`organization_id`, `code`, `version`),
  INDEX `idx_frameworks_org` (`organization_id`),
  INDEX `idx_frameworks_code` (`code`),
  CONSTRAINT `fk_frameworks_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Controls
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `controls` (
  `id`                  VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `framework_id`        VARCHAR(36)  NOT NULL,
  `code`                VARCHAR(50)  NOT NULL,
  `title`               VARCHAR(500) NOT NULL,
  `description`         TEXT         NOT NULL,
  `category`            VARCHAR(255) NOT NULL,
  `status`              ENUM('EFFECTIVE','ISSUE','NOT_OPERATING','NOT_APPLICABLE','NOT_TESTED') NOT NULL DEFAULT 'NOT_TESTED',
  `maturity_level`      INT          NOT NULL DEFAULT 1,
  `is_applicable`       TINYINT(1)   NOT NULL DEFAULT 1,
  `common_control_code` VARCHAR(100) NULL,
  `created_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`          DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_controls_framework_code` (`framework_id`, `code`),
  INDEX `idx_controls_framework` (`framework_id`),
  INDEX `idx_controls_status` (`status`),
  INDEX `idx_controls_category` (`category`),
  INDEX `idx_controls_common_code` (`common_control_code`),
  CONSTRAINT `fk_controls_framework` FOREIGN KEY (`framework_id`)
    REFERENCES `frameworks`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Evidence
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `evidence` (
  `id`              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id` VARCHAR(36)  NOT NULL,
  `name`            VARCHAR(255) NOT NULL,
  `description`     TEXT         NULL,
  `type`            VARCHAR(50)  NOT NULL COMMENT 'POLICY, CONFIG, LOG, REPORT, SCREENSHOT',
  `storage_key`     VARCHAR(500) NOT NULL,
  `mime_type`       VARCHAR(100) NOT NULL,
  `file_size`       INT          NOT NULL,
  `status`          ENUM('VALID','EXPIRED','UNDER_REVIEW','REJECTED','PENDING_REVIEW') NOT NULL DEFAULT 'PENDING_REVIEW',
  `collected_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at`      DATETIME     NULL,
  `uploaded_by_id`  VARCHAR(36)  NOT NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_evidence_org` (`organization_id`),
  INDEX `idx_evidence_status` (`status`),
  INDEX `idx_evidence_created` (`created_at`),
  CONSTRAINT `fk_evidence_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_evidence_uploader` FOREIGN KEY (`uploaded_by_id`)
    REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Control-Evidence mapping (many-to-many)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `control_evidence` (
  `id`          VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `control_id`  VARCHAR(36) NOT NULL,
  `evidence_id` VARCHAR(36) NOT NULL,
  `assigned_at` DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes`       TEXT        NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_control_evidence` (`control_id`, `evidence_id`),
  INDEX `idx_ce_control` (`control_id`),
  INDEX `idx_ce_evidence` (`evidence_id`),
  CONSTRAINT `fk_ce_control` FOREIGN KEY (`control_id`)
    REFERENCES `controls`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ce_evidence` FOREIGN KEY (`evidence_id`)
    REFERENCES `evidence`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Risks
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `risks` (
  `id`              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id` VARCHAR(36)  NOT NULL,
  `control_id`      VARCHAR(36)  NULL,
  `title`           VARCHAR(500) NOT NULL,
  `description`     TEXT         NOT NULL,
  `category`        VARCHAR(255) NOT NULL,
  `likelihood`      INT          NOT NULL COMMENT 'Scale 1..5',
  `impact`          INT          NOT NULL COMMENT 'Scale 1..5',
  `risk_score`      INT          NOT NULL COMMENT 'likelihood * impact (1..25)',
  `severity`        ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
  `status`          ENUM('OPEN','MITIGATED','ACCEPTED','CLOSED') NOT NULL DEFAULT 'OPEN',
  `owner_id`        VARCHAR(36)  NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_risks_org` (`organization_id`),
  INDEX `idx_risks_control` (`control_id`),
  INDEX `idx_risks_status` (`status`),
  INDEX `idx_risks_severity` (`severity`),
  INDEX `idx_risks_created` (`created_at`),
  CONSTRAINT `fk_risks_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_risks_control` FOREIGN KEY (`control_id`)
    REFERENCES `controls`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_risks_owner` FOREIGN KEY (`owner_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Audits
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `audits` (
  `id`              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id` VARCHAR(36)  NOT NULL,
  `framework_id`    VARCHAR(36)  NOT NULL,
  `title`           VARCHAR(500) NOT NULL,
  `description`     TEXT         NULL,
  `status`          ENUM('PLANNED','IN_PROGRESS','REVIEW','COMPLETED','ARCHIVED') NOT NULL DEFAULT 'PLANNED',
  `start_date`      DATETIME     NOT NULL,
  `end_date`        DATETIME     NULL,
  `lead_auditor_id` VARCHAR(36)  NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_audits_org` (`organization_id`),
  INDEX `idx_audits_framework` (`framework_id`),
  INDEX `idx_audits_status` (`status`),
  CONSTRAINT `fk_audits_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audits_framework` FOREIGN KEY (`framework_id`)
    REFERENCES `frameworks`(`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_audits_lead` FOREIGN KEY (`lead_auditor_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Findings
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `findings` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id`  VARCHAR(36)  NOT NULL,
  `audit_id`         VARCHAR(36)  NOT NULL,
  `control_id`       VARCHAR(36)  NULL,
  `title`            VARCHAR(500) NOT NULL,
  `description`      TEXT         NOT NULL,
  `severity`         ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
  `status`           ENUM('OPEN','IN_PROGRESS','CLOSED','ACCEPTED') NOT NULL DEFAULT 'OPEN',
  `assigned_to_id`   VARCHAR(36)  NULL,
  `identified_at`    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `due_date`         DATETIME     NULL,
  `resolution_notes` TEXT         NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_findings_org` (`organization_id`),
  INDEX `idx_findings_audit` (`audit_id`),
  INDEX `idx_findings_control` (`control_id`),
  INDEX `idx_findings_status` (`status`),
  INDEX `idx_findings_severity` (`severity`),
  INDEX `idx_findings_created` (`created_at`),
  CONSTRAINT `fk_findings_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_findings_audit` FOREIGN KEY (`audit_id`)
    REFERENCES `audits`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_findings_control` FOREIGN KEY (`control_id`)
    REFERENCES `controls`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_findings_assignee` FOREIGN KEY (`assigned_to_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Tasks
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `tasks` (
  `id`              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id` VARCHAR(36)  NOT NULL,
  `finding_id`      VARCHAR(36)  NULL,
  `control_id`      VARCHAR(36)  NULL,
  `title`           VARCHAR(500) NOT NULL,
  `description`     TEXT         NULL,
  `priority`        ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `status`          ENUM('TODO','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'TODO',
  `assigned_to_id`  VARCHAR(36)  NULL,
  `due_at`          DATETIME     NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tasks_org` (`organization_id`),
  INDEX `idx_tasks_finding` (`finding_id`),
  INDEX `idx_tasks_control` (`control_id`),
  INDEX `idx_tasks_status` (`status`),
  CONSTRAINT `fk_tasks_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_tasks_finding` FOREIGN KEY (`finding_id`)
    REFERENCES `findings`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_control` FOREIGN KEY (`control_id`)
    REFERENCES `controls`(`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_assignee` FOREIGN KEY (`assigned_to_id`)
    REFERENCES `users`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- Compliance Snapshots (monthly trend data)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `compliance_snapshots` (
  `id`                  VARCHAR(36) NOT NULL DEFAULT (UUID()),
  `organization_id`     VARCHAR(36) NOT NULL,
  `snapshot_month`      VARCHAR(7)  NOT NULL COMMENT 'Format: YYYY-MM',
  `score`               DOUBLE      NOT NULL,
  `effective_controls`  INT         NOT NULL,
  `applicable_controls` INT         NOT NULL,
  `open_risks`          INT         NOT NULL,
  `audit_findings`      INT         NOT NULL,
  `created_at`          DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_snapshot_org_month` (`organization_id`, `snapshot_month`),
  INDEX `idx_snapshot_org` (`organization_id`),
  INDEX `idx_snapshot_month` (`snapshot_month`),
  CONSTRAINT `fk_snapshot_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- AI Analyses
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_analyses` (
  `id`              VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id` VARCHAR(36)  NOT NULL,
  `evidence_id`     VARCHAR(36)  NOT NULL,
  `control_id`      VARCHAR(36)  NOT NULL,
  `status`          ENUM('COMPLIANT','PARTIAL','NON_COMPLIANT','INSUFFICIENT_EVIDENCE') NOT NULL,
  `confidence`      DOUBLE       NOT NULL,
  `risk_level`      ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL,
  `gaps`            JSON         NOT NULL COMMENT 'List of identified gaps',
  `summary`         TEXT         NOT NULL,
  `model`           VARCHAR(100) NOT NULL,
  `model_version`   VARCHAR(50)  NULL,
  `prompt_version`  VARCHAR(50)  NULL,
  `citations`       JSON         NOT NULL COMMENT 'List of citations with doc, page, snippet',
  `review_status`   ENUM('PENDING_HUMAN_REVIEW','ACCEPTED','REJECTED','MODIFIED') NOT NULL DEFAULT 'PENDING_HUMAN_REVIEW',
  `reviewed_by_id`  VARCHAR(36)  NULL,
  `reviewed_at`     DATETIME     NULL,
  `created_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ai_analysis_org` (`organization_id`),
  INDEX `idx_ai_analysis_evidence` (`evidence_id`),
  INDEX `idx_ai_analysis_control` (`control_id`),
  INDEX `idx_ai_analysis_review` (`review_status`),
  INDEX `idx_ai_analysis_created` (`created_at`),
  CONSTRAINT `fk_ai_analysis_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_analysis_evidence` FOREIGN KEY (`evidence_id`)
    REFERENCES `evidence`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ai_analysis_control` FOREIGN KEY (`control_id`)
    REFERENCES `controls`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- AI Recommendations
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_recommendations` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `analysis_id`      VARCHAR(36)  NOT NULL,
  `title`            VARCHAR(500) NOT NULL,
  `description`      TEXT         NOT NULL,
  `priority`         ENUM('LOW','MEDIUM','HIGH','CRITICAL') NOT NULL DEFAULT 'MEDIUM',
  `suggested_action` TEXT         NULL,
  `owner_role`       VARCHAR(100) NULL,
  `due_in_days`      INT          NULL,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_ai_rec_analysis` (`analysis_id`),
  CONSTRAINT `fk_ai_rec_analysis` FOREIGN KEY (`analysis_id`)
    REFERENCES `ai_analyses`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------
-- AI Jobs (background processing queue)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS `ai_jobs` (
  `id`               VARCHAR(36)  NOT NULL DEFAULT (UUID()),
  `organization_id`  VARCHAR(36)  NOT NULL,
  `job_type`         ENUM('DOCUMENT_PROCESSING','EVIDENCE_ANALYSIS','EMBEDDING_GENERATION','COMPLIANCE_ANALYSIS') NOT NULL,
  `status`           ENUM('QUEUED','PROCESSING','COMPLETED','FAILED') NOT NULL DEFAULT 'QUEUED',
  `payload`          JSON         NOT NULL,
  `result`           JSON         NULL,
  `error_message`    TEXT         NULL,
  `idempotency_key`  VARCHAR(255) NULL,
  `retries`          INT          NOT NULL DEFAULT 0,
  `created_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ai_jobs_idempotency` (`idempotency_key`),
  INDEX `idx_ai_jobs_org` (`organization_id`),
  INDEX `idx_ai_jobs_status` (`status`),
  INDEX `idx_ai_jobs_type` (`job_type`),
  CONSTRAINT `fk_ai_jobs_org` FOREIGN KEY (`organization_id`)
    REFERENCES `organizations`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ==============================================
-- SEED DATA
-- ==============================================

-- Organization
INSERT INTO `organizations` (`id`, `name`, `slug`) VALUES
('11111111-1111-1111-1111-111111111111', 'Acme Corporation', 'acme-corp');

-- Roles
INSERT INTO `roles` (`id`, `name`, `description`) VALUES
('aaaa0001-0001-0001-0001-000000000001', 'ADMIN', 'Full system administrator'),
('aaaa0001-0001-0001-0001-000000000002', 'COMPLIANCE_MANAGER', 'Manages compliance frameworks and controls'),
('aaaa0001-0001-0001-0001-000000000003', 'AUDITOR', 'Conducts audits and reviews evidence'),
('aaaa0001-0001-0001-0001-000000000004', 'CONTRIBUTOR', 'Uploads evidence and manages tasks'),
('aaaa0001-0001-0001-0001-000000000005', 'VIEWER', 'Read-only access to dashboards');

-- Users (password hash is bcrypt of 'AdminPassword123!')
INSERT INTO `users` (`id`, `organization_id`, `email`, `password_hash`, `name`) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'admin@acme-corp.com',
 '$2b$10$dummyhashfordevmodeonlynotforproduction000000000000', 'Admin User'),
('22222222-2222-2222-2222-222222222233', '11111111-1111-1111-1111-111111111111', 'manager@acme-corp.com',
 '$2b$10$dummyhashfordevmodeonlynotforproduction000000000000', 'Compliance Manager'),
('22222222-2222-2222-2222-222222222244', '11111111-1111-1111-1111-111111111111', 'auditor@acme-corp.com',
 '$2b$10$dummyhashfordevmodeonlynotforproduction000000000000', 'Lead Auditor');

-- User Roles
INSERT INTO `user_roles` (`id`, `user_id`, `role_id`) VALUES
(UUID(), '22222222-2222-2222-2222-222222222222', 'aaaa0001-0001-0001-0001-000000000001'),
(UUID(), '22222222-2222-2222-2222-222222222233', 'aaaa0001-0001-0001-0001-000000000002'),
(UUID(), '22222222-2222-2222-2222-222222222244', 'aaaa0001-0001-0001-0001-000000000003');

-- Frameworks
INSERT INTO `frameworks` (`id`, `organization_id`, `name`, `code`, `version`, `description`, `source`) VALUES
('33333333-3333-3333-3333-333333333301', '11111111-1111-1111-1111-111111111111',
 'SOC 2 Type II', 'SOC2', '2017',
 'Service Organization Control 2 - Trust Services Criteria for Security, Availability, Processing Integrity, Confidentiality, and Privacy.',
 'AICPA TSP Section 100'),
('33333333-3333-3333-3333-333333333302', '11111111-1111-1111-1111-111111111111',
 'ISO/IEC 27001:2022', 'ISO27001', '2022',
 'International standard for information security management systems (ISMS).',
 'ISO/IEC 27001:2022'),
('33333333-3333-3333-3333-333333333303', '11111111-1111-1111-1111-111111111111',
 'NIST Cybersecurity Framework', 'NIST-CSF', '2.0',
 'Framework for improving critical infrastructure cybersecurity.',
 'NIST CSF 2.0');

-- SOC2 Controls (sample)
INSERT INTO `controls` (`id`, `framework_id`, `code`, `title`, `description`, `category`, `status`, `maturity_level`, `common_control_code`) VALUES
('44444444-4444-4444-4444-444444440101', '33333333-3333-3333-3333-333333333301',
 'CC1.1', 'COSO Principle 1: Integrity and Ethical Values',
 'The entity demonstrates a commitment to integrity and ethical values.',
 'Control Environment', 'EFFECTIVE', 3, 'GOV-ETHICS'),
('44444444-4444-4444-4444-444444440102', '33333333-3333-3333-3333-333333333301',
 'CC1.2', 'COSO Principle 2: Board Independence',
 'The board of directors demonstrates independence from management and exercises oversight.',
 'Control Environment', 'EFFECTIVE', 2, 'GOV-OVERSIGHT'),
('44444444-4444-4444-4444-444444440103', '33333333-3333-3333-3333-333333333301',
 'CC5.1', 'COSO Principle 10: Risk Assessment Activities',
 'The entity selects and develops control activities that contribute to the mitigation of risks.',
 'Control Activities', 'ISSUE', 2, 'RISK-ASSESS'),
('44444444-4444-4444-4444-444444440104', '33333333-3333-3333-3333-333333333301',
 'CC6.1', 'Logical and Physical Access Controls',
 'The entity implements logical access security software, infrastructure, and architectures over protected information assets.',
 'Logical and Physical Access Controls', 'NOT_TESTED', 1, 'ACCESS-CTRL'),
('44444444-4444-4444-4444-444444440105', '33333333-3333-3333-3333-333333333301',
 'CC6.2', 'User Access Provisioning',
 'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.',
 'Logical and Physical Access Controls', 'EFFECTIVE', 3, 'ACCESS-PROV'),
('44444444-4444-4444-4444-444444440106', '33333333-3333-3333-3333-333333333301',
 'CC6.3', 'Access Revocation',
 'The entity removes access to protected information assets when appropriate.',
 'Logical and Physical Access Controls', 'NOT_OPERATING', 1, 'ACCESS-REVOKE'),
('44444444-4444-4444-4444-444444440107', '33333333-3333-3333-3333-333333333301',
 'CC7.1', 'Infrastructure Monitoring',
 'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations that result in the introduction of new vulnerabilities.',
 'System Operations', 'EFFECTIVE', 3, 'MONITOR-INFRA'),
('44444444-4444-4444-4444-444444440108', '33333333-3333-3333-3333-333333333301',
 'CC7.2', 'Security Incident Response',
 'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts.',
 'System Operations', 'ISSUE', 2, 'INCIDENT-RESP'),
('44444444-4444-4444-4444-444444440109', '33333333-3333-3333-3333-333333333301',
 'CC8.1', 'Change Management',
 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.',
 'Change Management', 'EFFECTIVE', 4, 'CHANGE-MGMT'),
('44444444-4444-4444-4444-444444440110', '33333333-3333-3333-3333-333333333301',
 'CC9.1', 'Risk Mitigation',
 'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.',
 'Risk Mitigation', 'NOT_TESTED', 1, 'RISK-MITIGATE');

-- ISO 27001 Controls (sample)
INSERT INTO `controls` (`id`, `framework_id`, `code`, `title`, `description`, `category`, `status`, `maturity_level`, `common_control_code`) VALUES
('44444444-4444-4444-4444-444444440201', '33333333-3333-3333-3333-333333333302',
 'A.5.1', 'Information Security Policies',
 'A set of policies for information security shall be defined, approved by management, published and communicated.',
 'Organizational Controls', 'EFFECTIVE', 3, 'GOV-POLICY'),
('44444444-4444-4444-4444-444444440202', '33333333-3333-3333-3333-333333333302',
 'A.6.1', 'Screening',
 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws.',
 'People Controls', 'EFFECTIVE', 2, 'HR-SCREEN'),
('44444444-4444-4444-4444-444444440203', '33333333-3333-3333-3333-333333333302',
 'A.8.1', 'User Endpoint Devices',
 'Information stored on, processed by or accessible via user endpoint devices shall be protected.',
 'Technological Controls', 'ISSUE', 2, 'ENDPOINT-PROT'),
('44444444-4444-4444-4444-444444440204', '33333333-3333-3333-3333-333333333302',
 'A.8.5', 'Secure Authentication',
 'Secure authentication technologies and procedures shall be established and implemented.',
 'Technological Controls', 'EFFECTIVE', 3, 'AUTH-SECURE'),
('44444444-4444-4444-4444-444444440205', '33333333-3333-3333-3333-333333333302',
 'A.8.9', 'Configuration Management',
 'Configurations, including security configurations, of hardware, software, services and networks shall be established and managed.',
 'Technological Controls', 'NOT_TESTED', 1, 'CONFIG-MGMT');

-- NIST CSF Controls (sample)
INSERT INTO `controls` (`id`, `framework_id`, `code`, `title`, `description`, `category`, `status`, `maturity_level`, `common_control_code`) VALUES
('44444444-4444-4444-4444-444444440301', '33333333-3333-3333-3333-333333333303',
 'GV.OC-01', 'Organizational Context',
 'The organizational mission is understood and informs cybersecurity risk management.',
 'Govern', 'EFFECTIVE', 3, 'GOV-CONTEXT'),
('44444444-4444-4444-4444-444444440302', '33333333-3333-3333-3333-333333333303',
 'ID.AM-01', 'Asset Inventory',
 'Inventories of hardware managed by the organization are maintained.',
 'Identify', 'ISSUE', 2, 'ASSET-INV'),
('44444444-4444-4444-4444-444444440303', '33333333-3333-3333-3333-333333333303',
 'PR.AC-01', 'Identity Management and Access Control',
 'Identities and credentials for authorized users, services, and hardware are managed by the organization.',
 'Protect', 'EFFECTIVE', 3, 'ACCESS-CTRL'),
('44444444-4444-4444-4444-444444440304', '33333333-3333-3333-3333-333333333303',
 'DE.CM-01', 'Continuous Monitoring',
 'Networks and network services are monitored to find potentially adverse events.',
 'Detect', 'NOT_TESTED', 1, 'MONITOR-NET'),
('44444444-4444-4444-4444-444444440305', '33333333-3333-3333-3333-333333333303',
 'RS.AN-01', 'Incident Analysis',
 'Investigations are conducted to ensure effective response and support forensics and recovery activities.',
 'Respond', 'NOT_OPERATING', 1, 'INCIDENT-RESP');

-- Risks
INSERT INTO `risks` (`id`, `organization_id`, `control_id`, `title`, `description`, `category`, `likelihood`, `impact`, `risk_score`, `severity`, `status`, `owner_id`) VALUES
('55555555-5555-5555-5555-555555550001', '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444440104', 'Unauthorized Access to Production Systems',
 'Lack of robust logical access controls may lead to unauthorized access to production databases and services.',
 'Information Security', 4, 5, 20, 'CRITICAL', 'OPEN', '22222222-2222-2222-2222-222222222233'),
('55555555-5555-5555-5555-555555550002', '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444440106', 'Stale User Accounts',
 'Failure to revoke access for terminated employees creates risk of unauthorized system access.',
 'Access Management', 3, 4, 12, 'HIGH', 'OPEN', '22222222-2222-2222-2222-222222222233'),
('55555555-5555-5555-5555-555555550003', '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444440108', 'Delayed Incident Response',
 'Insufficient incident response procedures may lead to prolonged security breaches.',
 'Operations', 3, 3, 9, 'MEDIUM', 'OPEN', '22222222-2222-2222-2222-222222222244'),
('55555555-5555-5555-5555-555555550004', '11111111-1111-1111-1111-111111111111',
 '44444444-4444-4444-4444-444444440203', 'Unmanaged Endpoint Devices',
 'Personal devices accessing corporate data without proper endpoint protection.',
 'Technology', 2, 4, 8, 'MEDIUM', 'MITIGATED', NULL),
('55555555-5555-5555-5555-555555550005', '11111111-1111-1111-1111-111111111111',
 NULL, 'Third-Party Data Processing',
 'Third-party vendors processing sensitive data without adequate compliance verification.',
 'Third Party Risk', 3, 5, 15, 'CRITICAL', 'OPEN', '22222222-2222-2222-2222-222222222222');

-- Audits
INSERT INTO `audits` (`id`, `organization_id`, `framework_id`, `title`, `description`, `status`, `start_date`, `end_date`, `lead_auditor_id`) VALUES
('66666666-6666-6666-6666-666666660001', '11111111-1111-1111-1111-111111111111',
 '33333333-3333-3333-3333-333333333301', 'SOC 2 Type II Annual Audit 2025',
 'Annual SOC 2 Type II audit covering all trust service criteria.',
 'IN_PROGRESS', '2025-01-15', '2025-06-30', '22222222-2222-2222-2222-222222222244'),
('66666666-6666-6666-6666-666666660002', '11111111-1111-1111-1111-111111111111',
 '33333333-3333-3333-3333-333333333302', 'ISO 27001 Certification Audit',
 'Initial certification audit for ISO/IEC 27001:2022.',
 'PLANNED', '2025-07-01', NULL, '22222222-2222-2222-2222-222222222244');

-- Findings
INSERT INTO `findings` (`id`, `organization_id`, `audit_id`, `control_id`, `title`, `description`, `severity`, `status`, `assigned_to_id`, `due_date`) VALUES
('77777777-7777-7777-7777-777777770001', '11111111-1111-1111-1111-111111111111',
 '66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444440104',
 'MFA Not Enforced for Admin Access',
 'Multi-factor authentication is not enforced for administrative access to production systems. This violates CC6.1 requirements.',
 'CRITICAL', 'OPEN', '22222222-2222-2222-2222-222222222233', '2025-03-15'),
('77777777-7777-7777-7777-777777770002', '11111111-1111-1111-1111-111111111111',
 '66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444440106',
 'Access Review Process Incomplete',
 'Quarterly access reviews are not being conducted consistently. Several user accounts remain active after employee departure.',
 'HIGH', 'IN_PROGRESS', '22222222-2222-2222-2222-222222222233', '2025-04-01'),
('77777777-7777-7777-7777-777777770003', '11111111-1111-1111-1111-111111111111',
 '66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444440108',
 'Incident Response Plan Outdated',
 'The incident response plan has not been updated in over 12 months and does not cover cloud-specific scenarios.',
 'MEDIUM', 'OPEN', '22222222-2222-2222-2222-222222222244', '2025-05-01'),
('77777777-7777-7777-7777-777777770004', '11111111-1111-1111-1111-111111111111',
 '66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444440103',
 'Risk Assessment Not Documented',
 'Annual risk assessment process is performed informally without documented methodology or results.',
 'HIGH', 'OPEN', '22222222-2222-2222-2222-222222222222', '2025-04-15');

-- Tasks
INSERT INTO `tasks` (`id`, `organization_id`, `finding_id`, `control_id`, `title`, `description`, `priority`, `status`, `assigned_to_id`, `due_at`) VALUES
(UUID(), '11111111-1111-1111-1111-111111111111',
 '77777777-7777-7777-7777-777777770001', '44444444-4444-4444-4444-444444440104',
 'Implement MFA for all admin accounts',
 'Deploy and enforce MFA across all administrative access points including AWS console, database admin, and CI/CD pipelines.',
 'CRITICAL', 'IN_PROGRESS', '22222222-2222-2222-2222-222222222233', '2025-03-01'),
(UUID(), '11111111-1111-1111-1111-111111111111',
 '77777777-7777-7777-7777-777777770002', '44444444-4444-4444-4444-444444440106',
 'Automate quarterly access reviews',
 'Set up automated user access review process with manager approvals and automatic deprovisioning.',
 'HIGH', 'TODO', '22222222-2222-2222-2222-222222222233', '2025-03-15'),
(UUID(), '11111111-1111-1111-1111-111111111111',
 '77777777-7777-7777-7777-777777770003', '44444444-4444-4444-4444-444444440108',
 'Update Incident Response Plan',
 'Review and update IR plan to include cloud-specific runbooks, escalation matrices, and tabletop exercises.',
 'MEDIUM', 'TODO', '22222222-2222-2222-2222-222222222244', '2025-04-15'),
(UUID(), '11111111-1111-1111-1111-111111111111',
 '77777777-7777-7777-7777-777777770004', '44444444-4444-4444-4444-444444440103',
 'Document Risk Assessment Methodology',
 'Create formal risk assessment methodology document and conduct initial documented assessment.',
 'HIGH', 'TODO', '22222222-2222-2222-2222-222222222222', '2025-04-01');

-- Compliance Snapshots (trend data)
INSERT INTO `compliance_snapshots` (`id`, `organization_id`, `snapshot_month`, `score`, `effective_controls`, `applicable_controls`, `open_risks`, `audit_findings`) VALUES
(UUID(), '11111111-1111-1111-1111-111111111111', '2024-07', 42.0, 5, 12, 8, 6),
(UUID(), '11111111-1111-1111-1111-111111111111', '2024-08', 48.0, 6, 12, 7, 5),
(UUID(), '11111111-1111-1111-1111-111111111111', '2024-09', 52.0, 7, 13, 6, 5),
(UUID(), '11111111-1111-1111-1111-111111111111', '2024-10', 55.0, 8, 14, 6, 4),
(UUID(), '11111111-1111-1111-1111-111111111111', '2024-11', 60.0, 9, 15, 5, 4),
(UUID(), '11111111-1111-1111-1111-111111111111', '2024-12', 64.0, 10, 16, 4, 4);

-- Evidence
INSERT INTO `evidence` (`id`, `organization_id`, `name`, `description`, `type`, `storage_key`, `mime_type`, `file_size`, `status`, `uploaded_by_id`) VALUES
(UUID(), '11111111-1111-1111-1111-111111111111',
 'Information Security Policy v3.2', 'Corporate information security policy document covering all aspects of the ISMS.',
 'POLICY', 'policies/infosec-policy-v3.2.pdf', 'application/pdf', 2458000, 'VALID', '22222222-2222-2222-2222-222222222222'),
(UUID(), '11111111-1111-1111-1111-111111111111',
 'AWS IAM Configuration Export', 'Export of all IAM policies, roles, and user configurations from AWS.',
 'CONFIG', 'configs/aws-iam-export-2025-01.json', 'application/json', 156000, 'VALID', '22222222-2222-2222-2222-222222222233'),
(UUID(), '11111111-1111-1111-1111-111111111111',
 'Q4 2024 Access Review Report', 'Quarterly access review report showing user access certifications.',
 'REPORT', 'reports/q4-2024-access-review.pdf', 'application/pdf', 890000, 'UNDER_REVIEW', '22222222-2222-2222-2222-222222222244'),
(UUID(), '11111111-1111-1111-1111-111111111111',
 'Firewall Configuration Backup', 'Production firewall rules and configuration backup.',
 'CONFIG', 'configs/firewall-config-2025-01.xml', 'application/xml', 45000, 'PENDING_REVIEW', '22222222-2222-2222-2222-222222222233'),
(UUID(), '11111111-1111-1111-1111-111111111111',
 'Penetration Test Report 2024', 'Annual penetration test results conducted by external security firm.',
 'REPORT', 'reports/pentest-2024-final.pdf', 'application/pdf', 3200000, 'VALID', '22222222-2222-2222-2222-222222222244');
