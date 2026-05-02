"""Blindspot v2.0 — Updated API with Gemini + Real SSE Streaming"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse, FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sse_starlette.sse import EventSourceResponse
import asyncio
import json
from typing import AsyncGenerator, Dict, Any

from src.state.schema import BlindspotState, DealContext, CounterpartyInfo
from src.orchestration.graph import BlindspotGraph
from src.config import settings


app = FastAPI(title="Blindspot v2.0", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"service": "Blindspot v2.0", "status": "running", "models": {
        "jurist": settings.gemini_pro_model,
        "adversary": settings.gemini_flash_model,
    }}


@app.post("/api/v1/analyze")
async def analyze_contract(
    file: UploadFile = File(...),
    metadata: str = Form("{}")
):
    """Analyze uploaded contract. Returns SSE stream of agent events."""

    # Parse metadata
    try:
        meta = json.loads(metadata)
    except Exception:
        meta = {}

    # Read file content
    content = await file.read()
    source_format = file.filename.split(".")[-1].lower() if file.filename else "txt"

    # Initialize state
    state = BlindspotState(
        contract_text=content.decode("utf-8", errors="ignore"),
        source_format=source_format,
        user_role=meta.get("role", "freelancer"),
        deal_context=DealContext(**meta.get("deal_context", {})),
        counterparty_info=CounterpartyInfo(**meta.get("counterparty_info", {})),
    )

    # Create orchestration graph
    graph = BlindspotGraph()

    async def event_generator() -> AsyncGenerator[Dict[str, Any], None]:
        """Stream events from LangGraph execution."""
        try:
            async for event in graph.arun_with_events(state):
                if isinstance(event, dict):
                    event_type = event.get("event", "update")
                    event_data = event.get("data", {})
                    yield {
                        "event": event_type,
                        "data": json.dumps(event_data)
                    }

            # Final event
            yield {
                "event": "final_report",
                "data": json.dumps({
                    "status": "complete",
                    "processing_ms": state.processing_ms,
                })
            }

        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(event_generator())


@app.post("/api/v1/negotiate/start")
async def start_negotiation(body: Dict[str, Any]):
    """Start negotiation mode with user parameters."""
    return {
        "negotiation_id": "neg_" + str(hash(str(body)))[-8:],
        "initial_outbound_email_id": "email_001",
        "status": "awaiting_counterparty"
    }


@app.post("/api/v1/negotiate/{negotiation_id}/inbound")
async def inbound_email(negotiation_id: str, body: Dict[str, Any]):
    """Inject inbound email for negotiation round."""
    return {
        "round_number": 1,
        "decision": "auto_respond",
        "status": "responding"
    }


@app.get("/api/v1/negotiate/{negotiation_id}/stream")
async def negotiate_stream(negotiation_id: str):
    """SSE stream for negotiation updates."""

    async def event_generator() -> AsyncGenerator[Dict[str, Any], None]:
        yield {
            "event": "round_received",
            "data": json.dumps({"round": 1})
        }
        await asyncio.sleep(0.3)
        yield {
            "event": "analysis_complete",
            "data": json.dumps({"decision": "auto_respond"})
        }
        yield {
            "event": "outbound_sent",
            "data": json.dumps({"round": 1, "status": "sent"})
        }

    return EventSourceResponse(event_generator())


@app.post("/api/v1/negotiate/{negotiation_id}/respond_to_escalation")
async def respond_escalation(negotiation_id: str, body: Dict[str, Any]):
    """User responds to escalation."""
    return {"status": "resumed", "decision": body.get("user_decision", "counter")}


@app.get("/api/v1/download/{redline_id}")
async def download_redline(redline_id: str):
    """Download redlined .docx file."""
    return {"message": "redline download endpoint - to be implemented"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.api.main:app", host="0.0.0.0", port=8000, reload=True)
