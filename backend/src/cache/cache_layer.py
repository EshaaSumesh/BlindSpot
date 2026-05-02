"""Blindspot v2.0 — Cache Layer

Demo mode fallback and caching for reliability.
Returns cached responses if LLM API fails or demo mode is enabled.
"""

import json
import hashlib
from typing import Dict, Any, Optional
from src.config import settings


class CacheLayer:
    """Handles demo mode fallback and similarity-based caching."""

    def __init__(self):
        self.cache: Dict[str, Any] = {}
        self.demo_cache: Dict[str, Any] = {}

    def get_cache_key(self, inputs: Dict[str, Any]) -> str:
        """Generate cache key from inputs."""
        key_str = json.dumps(inputs, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()

    def get_cached_response(
        self,
        cache_key: str,
        similarity_threshold: float = 0.95
    ) -> Optional[Dict[str, Any]]:
        """Get cached response if available and similar enough."""
        if cache_key in self.cache:
            return self.cache[cache_key]
        return None

    def set_cached_response(self, cache_key: str, response: Dict[str, Any]):
        """Cache a response."""
        self.cache[cache_key] = response

    def get_demo_response(self, contract_hash: str) -> Optional[Dict[str, Any]]:
        """Get hard-coded demo response if demo mode enabled."""
        if not settings.demo_mode:
            return None

        # Return pre-computed demo outputs
        return self._get_demo_outputs(contract_hash)

    def _get_demo_outputs(self, contract_hash: str) -> Dict[str, Any]:
        """Pre-computed demo contract analysis."""
        return {
            "scout_output": {
                "doc_type": "freelance_services_agreement",
                "doc_type_confidence": 0.92,
                "clauses": [
                    {"id": "clause_1", "clause_type": "payment", "text": "Client shall pay..."},
                    {"id": "clause_7", "clause_type": "ip_assignment", "text": "Contractor assigns all..."},
                    {"id": "clause_11", "clause_type": "non_compete", "text": "Contractor shall not compete..."},
                    {"id": "clause_14", "clause_type": "termination", "text": "Either party may terminate..."},
                ]
            },
            "investigator_profile": {
                "risk_tier": "caution",
                "risk_score": 65,
                "litigation_summary": ["2 prior disputes"],
                "pattern_flags": ["History of IP grabs"],
            },
            "jurist_verdicts": {
                "clause_7": {"verdict_label": "non_standard", "severity": "high"},
                "clause_11": {"verdict_label": "unenforceable", "severity": "high"},
            },
            "benchmark_scores": {
                "clause_7": {"deviation_score": 3.2, "verdict": "outlier"},
                "clause_11": {"deviation_score": 2.5, "verdict": "non_standard"},
            },
            "exploits": {
                "clause_7": [{"scenario_description": "Could claim pre-existing IP"}],
            },
            "rewrites": {
                "clause_7": {"proposed_text": "Narrowed IP assignment..."},
            },
            "inter_agent_conflicts": [
                {"clause_id": "clause_11", "agent_a": "Jurist", "agent_b": "Benchmarker"}
            ],
        }

    def precompute_demo_cache(self, demo_contracts: list):
        """Pre-compute and store demo contract responses."""
        for contract in demo_contracts:
            contract_hash = hashlib.md5(contract["text"].encode()).hexdigest()
            self.demo_cache[contract_hash] = self._get_demo_outputs(contract_hash)
