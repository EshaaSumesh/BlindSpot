import pytest
from src.agents.benchmarker import BenchmarkerAgent
from src.agents.adversary import AdversaryAgent
from src.agents.negotiator import NegotiatorAgent
from src.agents.chief_counsel import ChiefCounselAgent
from src.state.schema import BlindspotState, Clause, ScoutOutput, DocType, LegalVerdict, Severity, BenchmarkResult, CounterpartyProfile, RiskTier

def test_benchmarker_agent(monkeypatch):
    agent = BenchmarkerAgent()
    
    def mock_call_llm(prompt, system="", temperature=0.1):
        return '''{
            "verdict": "market_standard",
            "reasoning": "Aligns with market."
        }'''
    
    monkeypatch.setattr(agent, "call_llm", mock_call_llm)
    
    clause = Clause(id="c1", text="Payment in 30 days.", position={"start":0,"end":10}, clause_type="payment")
    scout_output = ScoutOutput(doc_type=DocType.FREELANCE, doc_type_confidence=0.9, clauses=[clause])
    state = BlindspotState(contract_text="", scout_output=scout_output)
    agent.set_state(state)
    
    class MockRetriever:
        def find_similar_clauses(self, *args, **kwargs): return []
        
    import src.agents.benchmarker as b_module
    monkeypatch.setattr(b_module, "get_retriever", lambda: MockRetriever())
    
    result = agent.run()
    assert "benchmark_scores" in result
    assert "c1" in result["benchmark_scores"]
    assert result["benchmark_scores"]["c1"].verdict == "market_standard"

def test_adversary_agent(monkeypatch):
    agent = AdversaryAgent()
    
    def mock_call_llm(prompt, system="", temperature=0.1):
        return '''[
            {
                "scenario_description": "Exploit 1",
                "severity": "high",
                "precedent_link": "link1"
            }
        ]'''
    
    monkeypatch.setattr(agent, "call_llm", mock_call_llm)
    
    clause = Clause(id="c1", text="Payment in 30 days.", position={"start":0,"end":10}, clause_type="payment")
    scout_output = ScoutOutput(doc_type=DocType.FREELANCE, doc_type_confidence=0.9, clauses=[clause])
    verdict = LegalVerdict(verdict_label="predatory", severity=Severity.HIGH, reasons=[], citations=[])
    state = BlindspotState(
        contract_text="",
        scout_output=scout_output,
        jurist_verdicts={"c1": verdict},
        investigator_profile=CounterpartyProfile(risk_tier=RiskTier.CAUTION, risk_score=50, litigation_summary=[], pattern_flags=[], data_confidence="high", sources_consulted=[])
    )
    agent.set_state(state)
    
    result = agent.run()
    assert "exploits" in result
    assert "c1" in result["exploits"]
    assert len(result["exploits"]["c1"]) == 1

def test_chief_counsel_agent(monkeypatch):
    agent = ChiefCounselAgent()
    
    def mock_call_llm(prompt, system="", temperature=0.1):
        if "ExecutionPlan" in system or "plan" in system.lower():
            return '{"reasoning": "Standard plan."}'
        if "Router" in system:
            return '{"clauses_for_adversary": ["c1"], "reasoning": "High risk."}'
        if "Reconciler" in system:
            return '{"conflicts": [], "synthesis_summary": "All good."}'
        return "{}"
    
    monkeypatch.setattr(agent, "call_llm", mock_call_llm)
    
    clause = Clause(id="c1", text="Payment in 30 days.", position={"start":0,"end":10}, clause_type="payment")
    scout_output = ScoutOutput(doc_type=DocType.FREELANCE, doc_type_confidence=0.9, clauses=[clause])
    state = BlindspotState(contract_text="", scout_output=scout_output)
    agent.set_state(state)
    
    plan_result = agent.run_planner()
    assert len(plan_result.agents_to_run) > 0
    
    router_result = agent.run_router()
    assert len(router_result.clauses_for_adversary) == 0 # no verdicts set in state
