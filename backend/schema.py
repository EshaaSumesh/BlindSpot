from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Literal

# ----- Inputs -----

class DealContext(BaseModel):
    size: float
    location: str
    urgency: str

class CounterpartyInfo(BaseModel):
    name: str
    email: Optional[str] = None
    registration_number: Optional[str] = None

# ----- Shared State Artifacts -----

class ClauseResult(BaseModel):
    clause_id: str
    text: str
    confidence_score: float

class ScoutResult(BaseModel):
    document_type: str
    clauses: List[ClauseResult]

class LegalVerdict(BaseModel):
    is_valid: bool
    risk_level: Literal["Low", "Medium", "High", "Critical"]
    explanation: str
    citation: Optional[str] = None

class BenchmarkResult(BaseModel):
    deviation_score: float
    comparison_summary: str
    reference_clauses: List[str]

class ExploitScenario(BaseModel):
    scenario_description: str
    severity: Literal["Low", "Medium", "High", "Critical"]

class Rewrite(BaseModel):
    original_text: str
    suggested_text: str
    reasoning: str

class CounterpartyProfile(BaseModel):
    risk_score: int
    tier: Literal["Trusted", "Standard", "Caution", "High Risk"]
    litigation_history_summary: str
    pattern_flags: List[str]
    confidence_indicator: str

# ----- Orchestration Artifacts -----

class ExecutionPlan(BaseModel):
    steps: List[str]

class Conflict(BaseModel):
    clause_id: str
    description: str
    agents_involved: List[str]

class Synthesis(BaseModel):
    overall_summary: str
    critical_issues: List[str]

# ----- Negotiation Artifacts -----

class NegotiationParameters(BaseModel):
    must_haves: List[str]
    preferences: List[str]
    walk_away_points: List[str]
    authority_level: Literal["Conservative", "Balanced", "Aggressive"]
    counterparty_contact: str

class NegotiationRound(BaseModel):
    round_number: int
    inbound_email: Optional[str] = None
    outbound_email: Optional[str] = None
    status: Literal["auto-handled", "escalated", "closed"]
    notes: Optional[str] = None

class Escalation(BaseModel):
    reason: str
    recommended_action: str

class ContractState(BaseModel):
    status: Literal["closed", "escalated", "abandoned"]
    final_document_url: Optional[str] = None

# ----- Master State Object -----

class BlindspotState(BaseModel):
    # Inputs
    contract_text: str
    user_role: str
    deal_context: DealContext
    counterparty_info: CounterpartyInfo

    # Initial Review (V1)
    scout_output: Optional[ScoutResult] = None
    jurist_verdicts: Dict[str, LegalVerdict] = Field(default_factory=dict)
    benchmark_scores: Dict[str, BenchmarkResult] = Field(default_factory=dict)
    exploits: Dict[str, List[ExploitScenario]] = Field(default_factory=dict)
    rewrites: Dict[str, Rewrite] = Field(default_factory=dict)
    investigator_profile: Optional[CounterpartyProfile] = None

    # Chief Counsel
    plan: Optional[ExecutionPlan] = None
    inter_agent_conflicts: List[Conflict] = Field(default_factory=list)
    final_synthesis: Optional[Synthesis] = None

    # Negotiation Mode (V2 — NEW)
    negotiation_active: bool = False
    negotiation_params: Optional[NegotiationParameters] = None
    rounds: List[NegotiationRound] = Field(default_factory=list)
    current_round: Optional[NegotiationRound] = None
    escalations_needed: List[Escalation] = Field(default_factory=list)
    final_contract_state: Optional[ContractState] = None
