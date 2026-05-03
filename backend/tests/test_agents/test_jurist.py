import pytest
from src.agents.jurist import JuristAgent
from src.state.schema import BlindspotState, Clause, ScoutOutput, DocType

def test_jurist_agent_evaluation(monkeypatch):
    agent = JuristAgent()
    
    def mock_call_llm(prompt, system="", temperature=0.1):
        return '''{
            "verdict_label": "standard",
            "severity": "low",
            "reasons": ["Standard payment terms"],
            "citations": ["corpus_123"]
        }'''
    
    monkeypatch.setattr(agent, "call_llm", mock_call_llm)
    
    clause = Clause(id="c1", text="Payment in 30 days.", position={"start":0,"end":10}, clause_type="payment")
    scout_output = ScoutOutput(doc_type=DocType.FREELANCE, doc_type_confidence=0.9, clauses=[clause])
    state = BlindspotState(contract_text="", scout_output=scout_output)
    agent.set_state(state)
    
    # Mock retriever
    class MockRetriever:
        def search_legal_rules(self, *args, **kwargs): return [{"id": "corpus_123"}]
        def lookup_indian_statute(self, *args, **kwargs): return []
        def all_citation_ids(self): return ["corpus_123"]
        
    import src.agents.jurist as jurist_module
    monkeypatch.setattr(jurist_module, "get_retriever", lambda: MockRetriever())
    
    result = agent.run()
    
    assert "jurist_verdicts" in result
    assert "c1" in result["jurist_verdicts"]
    verdict = result["jurist_verdicts"]["c1"]
    assert verdict.verdict_label == "standard"
    assert verdict.severity == "low"
