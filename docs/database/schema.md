# Database Schema & Entity Relationships

The relational model is maintained in PostgreSQL with the following core entities:

- **`Organization`**: Multi-tenant boundary entity.
- **`User` / `Role` / `UserRole`**: RBAC role hierarchy (`ADMIN`, `COMPLIANCE_MANAGER`, `AUDITOR`, `CONTRIBUTOR`, `VIEWER`).
- **`Framework`**: Standards catalog (`SOC2`, `ISO27001`, `NIST-CSF`).
- **`Control`**: Specific requirements mapped to frameworks with maturity ratings (1..5) and status (`EFFECTIVE`, `ISSUE`, `NOT_OPERATING`, `NOT_APPLICABLE`, `NOT_TESTED`).
- **`Evidence` / `ControlEvidence`**: Uploaded evidence objects with S3 storage keys and many-to-many control mappings.
- **`Risk`**: Risk register with Likelihood (1..5), Impact (1..5), calculated risk score (1..25), and severity level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).
- **`Audit` & `Finding`**: Formal audits and identified non-conformities.
- **`AIAnalysis` & `AIRecommendation`**: Structured output of RAG evidence evaluations with confidence, citations, and status.
