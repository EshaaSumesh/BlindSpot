from fastapi import FastAPI
from pydantic import BaseModel
from schema import BlindspotState, DealContext, CounterpartyInfo, ScoutResult, ClauseResult

app = FastAPI(title="Blindspot API v2.0")

class AnalyzeRequest(BaseModel):
    contract_text: str
    user_role: str
    deal_context: DealContext
    counterparty_info: CounterpartyInfo

@app.post("/analyze", response_model=BlindspotState)
async def analyze_contract(request: AnalyzeRequest):
    """
    Mock endpoint that simulates the 6-agent initial review pipeline.
    Returns a populated BlindspotState object.
    """
    # Create a mock response
    state = BlindspotState(
        contract_text=request.contract_text,
        user_role=request.user_role,
        deal_context=request.deal_context,
        counterparty_info=request.counterparty_info
    )
    
    # Mock Scout Output
    state.scout_output = ScoutResult(
        document_type="Freelance Agreement",
        clauses=[
            ClauseResult(clause_id="C1", text="Non-compete...", confidence_score=0.98),
            ClauseResult(clause_id="C2", text="IP Assignment...", confidence_score=0.95)
        ]
    )
    
    return state

@app.post("/negotiate")
async def start_negotiation():
    """
    Mock endpoint to initiate live negotiation mode.
    """
    return {"status": "Negotiation started", "round": 1}
