from typing import Dict, Any, List
import json

class ComplianceRuleEngine:
    CONTROL_PATTERNS: Dict[str, Dict[str, Any]] = {
        "CC1.1": {
            "title": "Integrity and Ethical Values",
            "keywords": ["conduct", "ethics", "integrity", "whistleblower", "governance", "acknowledgment"],
            "required_criteria": ["code of conduct", "annual signoff"],
        },
        "CC2.1": {
            "title": "Security Objective Communication",
            "keywords": ["training", "communication", "awareness", "briefing", "security culture"],
            "required_criteria": ["security awareness training", "quarterly briefings"],
        },
        "CC3.1": {
            "title": "Risk Assessment Process",
            "keywords": ["risk register", "risk assessment", "threat", "vulnerability", "impact", "likelihood"],
            "required_criteria": ["formal risk assessment", "annual review"],
        },
        "CC5.1": {
            "title": "Control Activities & CI/CD Validation",
            "keywords": ["ci/cd", "pipeline", "automated tests", "iac", "terraform", "linting", "static analysis"],
            "required_criteria": ["automated quality gates", "iac security scan"],
        },
        "CC6.1": {
            "title": "Logical Access Security & MFA",
            "keywords": ["mfa", "password", "authentication", "sso", "identity", "rbac", "access control", "two-step", "2sv"],
            "required_criteria": ["multi-factor authentication", "least privilege"],
        },
        "CC6.2": {
            "title": "User Registration, Authorization & Deprovisioning",
            "keywords": ["onboarding", "offboarding", "suspension", "deprovisioning", "user directory", "sla"],
            "required_criteria": ["automated offboarding", "account suspension"],
        },
        "CC6.3": {
            "title": "Role-Based Access Control",
            "keywords": ["role", "least privilege", "permission", "authorization", "segregation of duties", "admin"],
            "required_criteria": ["least privilege enforcement", "rbac matrix"],
        },
        "CC6.6": {
            "title": "Boundary Protection & Firewalls",
            "keywords": ["firewall", "vpc", "security group", "segmentation", "tls", "public access block", "waf"],
            "required_criteria": ["network perimeter protection", "traffic inspection"],
        },
        "CC6.7": {
            "title": "Data Transmission & Encryption at Rest",
            "keywords": ["encryption", "aes-256", "kms", "at rest", "in transit", "s3 encryption", "tls 1.2", "tls 1.3"],
            "required_criteria": ["cryptographic protection", "key rotation"],
        },
        "CC6.8": {
            "title": "Software Development & Branch Protection Security",
            "keywords": ["branch_protected", "branch protection", "pull request", "code review", "force push", "codeowners", "github", "vcs", "commit"],
            "required_criteria": ["peer review approval", "disallow force push"],
        },
        "CC7.1": {
            "title": "Vulnerability Management & Pen Testing",
            "keywords": ["penetration test", "vulnerability scan", "cve", "remediation", "bishop fox", "snyk"],
            "required_criteria": ["annual penetration testing", "cve remediation sla"],
        },
        "CC7.2": {
            "title": "Security Monitoring & Incident Detection",
            "keywords": ["siem", "monitoring", "alerting", "audit logs", "datadog", "cloudwatch", "guardduty", "security hub"],
            "required_criteria": ["centralized logging", "anomaly detection"],
        },
        "CC7.3": {
            "title": "Security Incident Coordination & Channels",
            "keywords": ["incident", "channel", "slack", "pagerduty", "security-alerts", "incident-response", "triage"],
            "required_criteria": ["dedicated incident channel", "incident responder team"],
        },
        "CC7.4": {
            "title": "Incident Containment & Post-Mortem",
            "keywords": ["incident response", "post-mortem", "root cause", "containment", "sla", "retention"],
            "required_criteria": ["documented post-mortem", "audit retention"],
        },
        "CC7.5": {
            "title": "Backup Integrity & Disaster Recovery",
            "keywords": ["backup", "snapshot", "retention", "disaster recovery", "rpo", "rto", "replication"],
            "required_criteria": ["automated daily backups", "point in time recovery"],
        },
        "CC8.1": {
            "title": "Change Management & Code Review Approval",
            "keywords": ["branch_protected", "branch protection", "pull request", "code review", "peer review", "force push", "approval", "github", "commit", "signoff"],
            "required_criteria": ["mandatory pull request reviews", "prohibit force push"],
        },
        "A.8.20": {
            "title": "Network Security (ISO 27001)",
            "keywords": ["network", "firewall", "tls", "vpc", "perimeter"],
            "required_criteria": ["network boundary controls"],
        },
        "A.8.24": {
            "title": "Use of Cryptography (ISO 27001)",
            "keywords": ["encryption", "kms", "crypto", "aes-256", "tls"],
            "required_criteria": ["key management"],
        },
        "A.8.32": {
            "title": "Change Management (ISO 27001)",
            "keywords": ["change management", "pull request", "branch protection", "approval"],
            "required_criteria": ["controlled software changes"],
        },
        "A.9.1.1": {
            "title": "Access Control Policy (ISO 27001)",
            "keywords": ["access policy", "authorization", "segregation of duties", "least privilege"],
            "required_criteria": ["documented access control"],
        },
        "A.9.2.1": {
            "title": "User Registration and Access Provisioning (ISO 27001)",
            "keywords": ["user registration", "mfa", "2sv", "deprovisioning", "offboarding"],
            "required_criteria": ["access provisioning process"],
        },
        "A.16.1.2": {
            "title": "Reporting Information Security Events (ISO 27001)",
            "keywords": ["incident", "slack", "alert", "reporting", "channels"],
            "required_criteria": ["incident reporting mechanism"],
        },
        "PR.IP-1": {
            "title": "Baseline Configuration & Change Control (NIST CSF)",
            "keywords": ["change control", "baseline", "branch protection", "pr approval"],
            "required_criteria": ["configuration change management"],
        },
        "PR.DS-1": {
            "title": "Data-at-Rest Protection (NIST CSF)",
            "keywords": ["encryption", "aes-256", "kms", "at rest", "s3 encryption"],
            "required_criteria": ["cryptographic protection of stored data"],
        },
    }

    @classmethod
    def evaluate_text_for_control(cls, control_code: str, text: str) -> Dict[str, Any]:
        # 1. Attempt structured JSON telemetry evaluation first
        try:
            cleaned_text = text.strip()
            if cleaned_text.startswith("{") and cleaned_text.endswith("}"):
                data = json.loads(cleaned_text)
                return cls._evaluate_structured_telemetry(control_code, data)
        except Exception:
            pass

        # 2. Text / RAG keyword pattern evaluation
        rule = cls.CONTROL_PATTERNS.get(control_code, {
            "title": "Standard Compliance Control",
            "keywords": ["policy", "procedure", "control", "security", "evidence", "compliance"],
            "required_criteria": ["standard adherence"],
        })

        lower_text = text.lower()
        matched_keywords = [k for k in rule["keywords"] if k in lower_text]
        score = len(matched_keywords) / max(len(rule["keywords"]), 1)

        if score >= 0.35:
            status = "COMPLIANT"
            risk = "LOW"
            confidence = min(0.88 + (score * 0.12), 0.99)
            gaps = []
            recs = [f"Maintain continuous automated monitoring of {rule['title']}."]
        elif score >= 0.15:
            status = "PARTIAL"
            risk = "MEDIUM"
            confidence = 0.85
            gaps = [f"Incomplete technical verification for {rule['title']}. Missing markers: {', '.join([k for k in rule['keywords'] if k not in matched_keywords][:3])}"]
            recs = [f"Provide supplementary audit configuration logs or signed policy for {control_code}."]
        else:
            status = "NON_COMPLIANT"
            risk = "HIGH"
            confidence = 0.90
            gaps = [f"No supporting artifacts or compliance evidence found relating to {rule['title']}."]
            recs = [f"Establish foundational policy and collect verifiable telemetry for {control_code}."]

        return {
            "status": status,
            "confidence": round(confidence, 2),
            "risk_level": risk,
            "gaps": gaps,
            "recommendations": recs,
            "matched_keywords": matched_keywords,
        }

    @classmethod
    def _evaluate_structured_telemetry(cls, control_code: str, data: Dict[str, Any]) -> Dict[str, Any]:
        evidence_type = data.get("evidence_type", "")

        # ─── GITHUB TELEMETRY ────────────────────────────────────────────────
        if "github" in evidence_type:
            repo = data.get("repository", "repository")
            branch = data.get("branch", "main")
            is_protected = data.get("branch_protected", False)
            pr_reviews = data.get("required_pull_request_reviews", {})
            min_reviews = pr_reviews.get("required_approving_review_count", 0) if isinstance(pr_reviews, dict) else 0

            if is_protected and min_reviews >= 1:
                return {
                    "status": "COMPLIANT",
                    "confidence": 0.99,
                    "risk_level": "LOW",
                    "gaps": [],
                    "recommendations": [f"Maintain annual review of GitHub branch protection rules on {repo}:{branch}."],
                    "matched_keywords": ["branch_protected", "required_pull_request_reviews", "allow_force_pushes"],
                }
            else:
                return {
                    "status": "PARTIAL",
                    "confidence": 0.98,
                    "risk_level": "MEDIUM",
                    "gaps": [
                        f"Branch protection is currently disabled on branch '{branch}' for repository '{repo}'. Pull requests do not require mandatory peer review approvals before merging."
                    ],
                    "recommendations": [
                        f"Enable branch protection on branch '{branch}' in GitHub repository settings (Require at least 1 pull request review approval, dismiss stale approvals on new pushes, block force pushes) to satisfy SOC 2 {control_code}."
                    ],
                    "matched_keywords": ["github_branch_protection", "repository", "branch"],
                }

        # ─── AWS S3 ENCRYPTION TELEMETRY ─────────────────────────────────────
        if "aws_s3" in evidence_type:
            total = data.get("total_buckets", 0)
            encrypted = data.get("buckets_encrypted", 0)
            if total > 0 and encrypted >= total:
                return {
                    "status": "COMPLIANT",
                    "confidence": 0.99,
                    "risk_level": "LOW",
                    "gaps": [],
                    "recommendations": ["Ensure AWS KMS customer master key rotation is verified annually."],
                    "matched_keywords": ["encryption_algorithm", "kms_customer_master_key", "public_access_block"],
                }

        # ─── GOOGLE WORKSPACE TELEMETRY ──────────────────────────────────────
        if "google_workspace" in evidence_type:
            mfa_enforced = data.get("mfa_enforced_org_wide", False)
            if mfa_enforced:
                return {
                    "status": "COMPLIANT",
                    "confidence": 0.98,
                    "risk_level": "LOW",
                    "gaps": [],
                    "recommendations": ["Conduct quarterly reviews of suspended user accounts in Google Workspace."],
                    "matched_keywords": ["mfa_enforced_org_wide", "suspension_of_non_compliant_users"],
                }

        # ─── SLACK INCIDENT TELEMETRY ────────────────────────────────────────
        if "slack" in evidence_type:
            channels = data.get("dedicated_incident_channels", [])
            if len(channels) > 0:
                return {
                    "status": "COMPLIANT",
                    "confidence": 0.97,
                    "risk_level": "LOW",
                    "gaps": [],
                    "recommendations": ["Verify active on-call responders in dedicated incident channels."],
                    "matched_keywords": ["dedicated_incident_channels", "message_retention_days", "sso_required"],
                }

        # Default fallback to standard keyword matching
        return cls.evaluate_text_for_control(control_code, json.dumps(data))
