"""Blindspot v2.0 — Investigator Agent

Counterparty intelligence using publicly available data sources.
Supports mock_mode for hackathon demo reliability.
"""

import json
import random
from typing import Dict, Any
from src.agents.base import BaseAgent
from src.state.schema import CounterpartyProfile, RiskTier, BlindspotState
from src.config import settings


class InvestigatorAgent(BaseAgent):
    """Builds counterparty profile from public data sources."""

    name = "investigator"
    description = "Counterparty intelligence — risk profiling"

    def run(self) -> Dict[str, Any]:
        if not self.state:
            raise ValueError("State not set")

        counterparty = self.state.counterparty_info
        demo_mode = settings.demo_mode

        if demo_mode:
            profile = self._mock_profile(counterparty.name)
        else:
            profile = self._investigate(counterparty)

        return {"investigator_profile": profile}

    def _mock_profile(self, name: str) -> CounterpartyProfile:
        """Generate realistic mock profile for demo."""
        # Deterministic based on name hash for consistency
        name_hash = hash(name) % 100

        if "acme" in name.lower():
            return CounterpartyProfile(
                risk_tier=RiskTier.CAUTION,
                risk_score=65,
                litigation_summary=[
                    "2 prior disputes in court records (2022, 2023)",
                    "Dispute regarding IP assignment clause invocation (2023)",
                ],
                pattern_flags=[
                    "History of invoking IP assignment clauses against contractors",
                    "3 Reddit threads in past 12 months about payment delays",
                    "Glassdoor reviews mention contract overreach",
                ],
                data_confidence="medium",
                sources_consulted=[
                    "Indian Kanoon API (mock)",
                    "Glassdoor reviews (mock)",
                    "Reddit threads (mock)",
                ],
            )
        elif name_hash < 30:
            return CounterpartyProfile(
                risk_tier=RiskTier.TRUSTED,
                risk_score=25,
                litigation_summary=[],
                pattern_flags=[],
                data_confidence="high",
                sources_consulted=["MCA Portal (mock)", "Public records (mock)"],
            )
        elif name_hash < 70:
            return CounterpartyProfile(
                risk_tier=RiskTier.STANDARD,
                risk_score=45,
                litigation_summary=[],
                pattern_flags=["Standard contract terms observed"],
                data_confidence="medium",
                sources_consulted=["Public records (mock)"],
            )
        else:
            return CounterpartyProfile(
                risk_tier=RiskTier.HIGH_RISK,
                risk_score=85,
                litigation_summary=[
                    f"3 disputes found in court records",
                    "Pattern of non-payment allegations",
                ],
                pattern_flags=[
                    "Multiple complaints about IP grab clauses",
                    "History of aggressive non-compete enforcement",
                ],
                data_confidence="medium",
                sources_consulted=["Indian Kanoon API (mock)", "News mentions (mock)"],
            )

    def _investigate(self, counterparty_info) -> CounterpartyProfile:
        """Real investigation using external APIs (placeholder for v2.0 post-hackathon)."""
        # TODO: Implement real API calls to:
        # - Indian Kanoon API for court records
        # - MCA portal for corporate filings
        # - News API for recent mentions
        # For now, return a standard profile
        return CounterpartyProfile(
            risk_tier=RiskTier.STANDARD,
            risk_score=40,
            litigation_summary=[],
            pattern_flags=[],
            data_confidence="low",
            sources_consulted=[],
        )
