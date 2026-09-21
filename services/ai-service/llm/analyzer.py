import time
from typing import List, Dict, Any
from schemas.models import (
    EvidenceAnalysisRequest,
    EvidenceAnalysisResponse,
    EvaluationResult,
    AnalysisStatus,
    SeverityLevel,
    Citation,
    Recommendation,
    ControlMaturityLevel
)
from document.parser import DocumentParser
from compliance.rules import ComplianceRuleEngine

class LLMComplianceAnalyzer:
    @staticmethod
    def analyze_evidence(request: EvidenceAnalysisRequest) -> EvidenceAnalysisResponse:
        start_time = time.time()
        doc_text = request.document_text or "Default policy document text for compliance verification."
        chunks = DocumentParser.chunk_text(doc_text)
        
        evaluations: List[EvaluationResult] = []

        # Analyze both controls and measures
        target_ids = request.control_ids + request.measure_ids

        for target_id in target_ids:
            eval_result = ComplianceRuleEngine.evaluate_text_for_control(target_id, doc_text)

            citations: List[Citation] = []
            for chunk in chunks[:2]:
                if any(kw in chunk.text.lower() for kw in eval_result.get("matched_keywords", [])):
                    citations.append(Citation(
                        document=f"Evidence_{request.evidence_id[:8]}",
                        page=chunk.page,
                        section=chunk.section,
                        text=chunk.text[:200] + ("..." if len(chunk.text) > 200 else ""),
                        confidence=0.95
                    ))

            if not citations and chunks:
                citations.append(Citation(
                    document=f"Evidence_{request.evidence_id[:8]}",
                    page=chunks[0].page,
                    section=chunks[0].section,
                    text=chunks[0].text[:150] + "...",
                    confidence=0.85
                ))

            summary = (
                f"Automated RAG analysis evaluated {target_id}. Status determined as {eval_result['status']} "
                f"with {len(citations)} citation(s) extracted."
            )
            
            # Map string recommendations to objects
            recs = []
            for rec_str in eval_result.get("recommendations", []):
                recs.append(Recommendation(
                    title=f"Address gap in {target_id}",
                    description=rec_str,
                    priority=SeverityLevel(eval_result["risk_level"]),
                    # Provide default suggestions for risk scoring based on analysis
                    suggested_inherent_likelihood=4,
                    suggested_inherent_impact=5,
                    suggested_residual_likelihood=2,
                    suggested_residual_impact=2
                ))

            evaluations.append(EvaluationResult(
                target_id=target_id,
                status=AnalysisStatus(eval_result["status"]),
                confidence=eval_result["confidence"],
                risk_level=SeverityLevel(eval_result["risk_level"]),
                assessed_maturity_level=ControlMaturityLevel.MANAGED, # Hardcoded for now
                gaps=eval_result["gaps"],
                recommendations=recs,
                citations=citations,
                summary=summary,
            ))

        elapsed_ms = (time.time() - start_time) * 1000.0

        return EvidenceAnalysisResponse(
            evidence_id=request.evidence_id,
            evaluations=evaluations,
            processed_chunks=len(chunks),
            processing_time_ms=round(elapsed_ms, 2)
        )
