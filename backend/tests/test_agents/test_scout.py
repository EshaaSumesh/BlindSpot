import pytest
from src.agents.scout import ScoutAgent
from src.state.schema import BlindspotState, DocType

def test_scout_agent_parsing(monkeypatch):
    agent = ScoutAgent()
    
    # Mock LLM call
    def mock_call_llm(prompt, system="", temperature=0.1):
        return '''{
            "doc_type": "freelance_services_agreement",
            "doc_type_confidence": 0.95,
            "clauses": [
                {
                    "id": "clause_1",
                    "section_header": "1. SERVICES",
                    "text": "The Contractor agrees to provide services.",
                    "clause_type": "other"
                }
            ]
        }'''
    
    monkeypatch.setattr(agent, "call_llm", mock_call_llm)
    
    state = BlindspotState(contract_text="The Contractor agrees to provide services.")
    agent.set_state(state)
    
    result = agent.run()
    
    assert "scout_output" in result
    output = result["scout_output"]
    assert output.doc_type == DocType.FREELANCE
    assert len(output.clauses) == 1
    assert output.clauses[0].text == "The Contractor agrees to provide services."
