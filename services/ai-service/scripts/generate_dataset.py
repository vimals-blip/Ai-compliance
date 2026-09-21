import json
import random

# Mock data for compliance controls and evidence
CONTROLS = [
    {"code": "CC6.1", "description": "Logical access to systems is restricted to authorized users."},
    {"code": "CC6.7", "description": "Data transmission is encrypted over public networks (TLS/SSL)."},
    {"code": "CC7.2", "description": "Security incidents are logged, monitored, and escalated."},
]

EVIDENCE_SAMPLES = [
    ("AWS S3 bucket policy shows 'Effect: Allow, Principal: *, Action: s3:GetObject'", "Failed", "Bucket is publicly accessible. Restrict Principal or add condition keys."),
    ("GitHub branch protection requires 1 reviewer and blocks force pushes to main.", "Compliant", "Code changes are peer-reviewed before merge."),
    ("Nginx config lacks ssl_certificate directive on port 443.", "Failed", "TLS not configured. Add ssl_certificate and ssl_certificate_key."),
    ("Okta logs show MFA enforced for all users in 'Engineering' group.", "Compliant", "MFA is successfully enforced for engineers."),
]

def generate_instruction(control, evidence):
    return (
        f"You are an expert SOC 2 Compliance Auditor. Evaluate the following evidence against the control.\n\n"
        f"Control ({control['code']}): {control['description']}\n\n"
        f"Evidence Provided:\n{evidence[0]}"
    )

def generate_response(evidence):
    status, remediation = evidence[1], evidence[2]
    if status == "Compliant":
        return f"Status: COMPLIANT\nAnalysis: {remediation}"
    else:
        return f"Status: NON-COMPLIANT\nRemediation Plan: {remediation}"

def main():
    dataset = []
    for _ in range(500):
        control = random.choice(CONTROLS)
        evidence = random.choice(EVIDENCE_SAMPLES)
        
        # Format for Llama 3 / Alpaca instruction fine-tuning
        dataset.append({
            "instruction": generate_instruction(control, evidence),
            "input": "",
            "output": generate_response(evidence)
        })

    with open("compliance_finetuning_dataset.jsonl", "w") as f:
        for entry in dataset:
            f.write(json.dumps(entry) + "\n")
            
    print(f"Generated {len(dataset)} training examples in compliance_finetuning_dataset.jsonl")

if __name__ == "__main__":
    main()
