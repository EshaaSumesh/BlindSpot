"""Blindspot v2.0 — Negotiator Agent

Synthesizes all prior agent outputs into actionable counter-proposals.
Generates rewrites, redlined .docx, and negotiation email draft.
"""

import json
from typing import Dict, Any, List
from src.agents.base import BaseAgent
from src.state.schema import (
    BlindspotState, Rewrite, Clause, LegalVerdict,
    BenchmarkResult, ExploitScenario
)
from src.tools.docx_generator import DocxRedliner
from src.tools.email_renderer import EmailRenderer
from src.config import settings


class NegotiatorAgent(BaseAgent):
    """Counter-proposal drafting — synthesizes all agent outputs."""

    name = "negotiator"
    description = "Counter-proposal drafting — rewrites, redline, email"

    def run(self) -> Dict[str, Any]:
        if not self.state:
            raise ValueError("State not set")

        clauses = self.state.scout_output.clauses if self.state.scout_output else []
        jurist_verdicts = self.state.jurist_verdicts
        benchmark_scores = self.state.benchmark_scores
        exploits = self.state.exploits

        rewrites = {}
        for clause in clauses:
            rewrite = self._synthesize_rewrite(
                clause,
                jurist_verdicts.get(clause.id),
                benchmark_scores.get(clause.id),
                exploits.get(clause.id, []),
            )
            rewrites[clause.id] = rewrite

        # Generate redlined .docx
        redline_path = self._generate_redline(clauses, rewrites)

        # Generate negotiation email draft
        email_draft = self._generate_email(rewrites)

        return {
            "rewrites": rewrites,
            "redlined_docx_path": redline_path,
            "negotiation_email_draft": email_draft,
        }

    def _synthesize_rewrite(
        self,
        clause: Clause,
        verdict: LegalVerdict,
        score: BenchmarkResult,
        exploit_scenarios: List[ExploitScenario],
    ) -> Rewrite:
        """Create rewrite based on all prior analysis."""

        if verdict and verdict.verdict_label in ["predatory", "unenforceable"]:
            return self._rewrite_predatory(clause, verdict)
        elif verdict and verdict.verdict_label == "non_standard":
            return self._rewrite_nonstandard(clause, verdict, score)
        else:
            # Standard clause — no rewrite needed
            return Rewrite(
                original_text=clause.text,
                proposed_text=clause.text,
                rationale="Clause is market standard. No rewrite needed.",
                fallback_text=clause.text,
                walk_away_threshold="Not applicable — standard clause",
            )

    def _rewrite_predatory(self, clause: Clause, verdict: LegalVerdict) -> Rewrite:
        """Rewrite a predatory/unenforceable clause."""

        if clause.clause_type == "ip_assignment":
            proposed = "Contractor assigns to Client all work product created specifically during the term of this engagement. Pre-existing IP, tools, and frameworks remain the property of the Contractor."
            rationale = "Narrow IP assignment to engagement-specific deliverables only, excluding pre-existing works."
            fallback = "Contractor assigns work product created for Client during this engagement. All pre-existing IP is expressly excluded."
            walk_away = "Any assignment of pre-existing IP, tools, or frameworks"
        elif clause.clause_type == "non_compete":
            proposed = "During the term of this engagement, Contractor shall not compete directly with Client's specific product lines. This restriction expires upon contract termination."
            rationale = "Non-compete void under Indian Contract Act §27 beyond engagement term. Limited to term only."
            fallback = "Contractor shall not solicit Client's direct customers during engagement term."
            walk_away = "Any post-term non-compete obligation"
        elif clause.clause_type == "termination":
            proposed = "Either party may terminate this agreement with 30 days' written notice. Upon termination for convenience, Client shall pay for all work completed plus 20% of remaining contract value."
            rationale = "Symmetric notice period with kill fee for termination without cause."
            fallback = "Either party may terminate with 30 days' notice. Payment due for all work completed."
            walk_away = "Asymmetric notice periods or no kill fee on convenience termination"
        else:
            proposed = f"[REVISED] {clause.text[:100]}..."
            rationale = verdict.reasons[0] if verdict.reasons else "Clause requires revision per legal analysis."
            fallback = clause.text
            walk_away = "Unacceptable clause terms per legal verdict"

        return Rewrite(
            original_text=clause.text,
            proposed_text=proposed,
            rationale=rationale[:200],
            fallback_text=fallback,
            walk_away_threshold=walk_away,
        )

    def _rewrite_nonstandard(self, clause: Clause, verdict: LegalVerdict, score: BenchmarkResult) -> Rewrite:
        """Rewrite a non-standard clause to align with market norms."""

        if clause.clause_type == "termination":
            proposed = "Either party may terminate this agreement with 30 days' written notice. Notice periods shall be identical for both parties."
            rationale = "Standardize notice period to 30 days, symmetric for both parties."
            fallback = "Contractor may terminate with 30 days' notice, matching client's notice period."
            walk_away = "Notice period exceeding 45 days for contractor"
        elif clause.clause_type == "payment":
            proposed = "Client shall pay Contractor within 30 days of invoice approval. Late payments accrue interest at 18% per annum."
            rationale = "Align payment terms to 30 days with statutory interest for delays."
            fallback = "Payment within 30 days of invoice. Late fees apply per MSMED Act."
            walk_away = "Payment terms exceeding 45 days"
        else:
            proposed = f"[REVISED] {clause.text[:100]}..."
            rationale = f"Deviation score {score.deviation_score:.1f}x market median. Align with standard practice."
            fallback = clause.text
            walk_away = "Refusal to align with market standards"

        return Rewrite(
            original_text=clause.text,
            proposed_text=proposed,
            rationale=rationale[:200],
            fallback_text=fallback,
            walk_away_threshold=walk_away,
        )

    def _generate_redline(self, clauses: List[Clause], rewrites: Dict[str, Rewrite]) -> str:
        """Generate redlined .docx file."""
        try:
            generator = DocxRedliner()
            return generator.create_redline(
                clauses, rewrites,
                output_path="./generated/redlined_contract.docx"
            )
        except Exception as e:
            print(f"Redline generation failed: {e}")
            return None

    def _generate_email(self, rewrites: Dict[str, Rewrite]) -> str:
        """Generate negotiation email draft."""
        renderer = EmailRenderer()
        return renderer.render_email(
            rewrites,
            user_role=self.state.user_role,
            counterparty=self.state.counterparty_info.name,
        )
