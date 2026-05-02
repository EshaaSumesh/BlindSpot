# Blindspot v2.0

Autonomous legal agent for contract review and negotiation. Upload a contract, set your terms, and watch six AI specialists negotiate with the counterparty on your behalf.

## Quickstart

### Prerequisites
- Python >= 3.10
- Node.js >= 18
- Docker (optional)

### Backend Setup
```bash
cd blindspot/backend
pip install -e .
uvicorn src.api.main:app --reload --port 8000
```

### Frontend Setup
```bash
cd blindspot/frontend
npm install
npm run dev
```

### Full Stack with Docker
```bash
docker-compose up --build
```

## Architecture

- **Backend**: FastAPI + LangGraph-style orchestration + Chroma vector DB
- **Frontend**: React with streaming SSE updates
- **Agents**: 7 specialized agents (Scout, Investigator, Jurist, Benchmarker, Adversary, Negotiator, Chief Counsel)

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed design decisions.

## Demo

```bash
./scripts/run_demo.sh
```

See [DEMO.md](DEMO.md) for the 90-second demo script.

## Project Structure

```
blindspot/
├── backend/          # FastAPI backend
├── frontend/         # React frontend
├── data/             # Curated corpora (legal rules, benchmarks, statutes)
├── scripts/          # Setup and demo scripts
└── docker-compose.yml
```
