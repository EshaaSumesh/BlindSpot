# Coding Agent Prompt — Build Blindspot v2.0

> **Purpose of this document.** You are a coding agent. Your task is to implement the Blindspot system described below. This document is the complete and self-contained specification — you should not need additional context. Where the specification is silent on an implementation detail, exercise sound engineering judgment consistent with the architectural principles stated in §3 and document your decision in code comments.
>
> **Platform agnosticism.** This prompt deliberately does not prescribe a specific LLM provider, agent framework, or vector database vendor unless a binding constraint requires it. You are expected to choose appropriate technologies that satisfy the requirements. Your selections must be justified in the `ARCHITECTURE.md` deliverable.

---

## 1. What You Are Building

**Blindspot** is an autonomous legal agent for contract review and negotiation. A user uploads a contract, identifies their role in the deal, and receives:

1. A complete review of the document with per-clause risk analysis grounded in legal rules and market benchmarks
2. Optionally, an autonomous negotiation flow in which a coordinated team of AI agents conducts back-and-forth negotiation with the counterparty over email until the deal closes or escalation is required

The system is composed of seven specialized AI agents collaborating over a shared mutable workspace, with retrieval-grounded reasoning and a streaming user interface.

The system targets freelance services agreements under Indian jurisdiction as the initial scope. The architecture must be extensible to additional contract types and jurisdictions.

---

## 2. Hard Constraints

These constraints are non-negotiable. Violating any of them is a failure of the build.

1. **Grounded reasoning.** No agent producing legal verdicts may generate citations not present in the curated retrieval corpora. All citations must be traceable to a corpus entry by ID. This is enforced at the agent-prompt level and validated at output time.

2. **Shared mutable state.** All seven agents must operate over a single shared state object. Inter-agent communication occurs through reading and writing to this state, not through direct message passing.

3. **Streaming output.** The frontend must receive progressive updates as each agent completes its work, not a single batch result. The user must be able to watch the analysis unfold in real time.

4. **Auditability.** Every claim, verdict, score, or recommendation in the final output must be traceable to its evidence. The user must be able to drill into any conclusion and see the source.

5. **Demo reliability.** The system must include a fallback mechanism that produces cached responses for the demo contract if any live LLM call fails or exceeds a configurable timeout. This fallback must be silent to the user — the system continues to operate normally.

6. **No hardcoded contracts.** The system must be able to process any well-formed contract upload, not only the demo contract. Hardcoded behavior is permitted only in the cache fallback layer.

7. **Privacy.** Uploaded contracts are processed in-memory and not persisted by default. Generated outputs (redlined .docx) are written to a temporary location and purged on a scheduled interval. No contract content is logged at any level above DEBUG.

---

## 3. Architectural Principles

When the specification is silent on an implementation detail, choose the option that best satisfies these principles in order:

1. **Specialization produces depth.** Each agent has a narrow, well-defined responsibility. Do not let agent responsibilities bleed into one another. If you find yourself adding "and also" to an agent's role, you are designing it wrong.

2. **Orchestration is the product.** The meta-agent (Chief Counsel) must make routing decisions dynamically based on the contents of the shared state, not execute a fixed pipeline. Conditional and parallel execution paths are required, not optional.

3. **Transparency over magic.** When agents disagree, surface the disagreement explicitly to the user. Do not silently reconcile. The reconciliation itself is part of the product's value proposition.

4. **State persists across modes.** The same shared state used during initial review must extend into the negotiation flow. Negotiation rounds append to the state; they do not replace it.

5. **Fail loud at the seams.** Multi-agent systems fail at the boundaries between agents. Validate inputs and outputs at every agent boundary. Prefer explicit errors over silent partial results.

---

## 4. The Seven Agents

You will implement seven agents with the following specifications. Each agent receives the full shared state as input and returns a state mutation. The system prompts you write for each agent must enforce the agent's specialization narrowly.

### 4.1 Scout — Document Mapping

**Responsibility:** Parse the uploaded contract document and produce a structured representation of its clauses.

**Inputs:** Raw contract bytes or text. Source format (`pdf` | `docx` | `txt`).

**Outputs (written to state):**
- `doc_type`: classified document type (e.g., `freelance_services_agreement`, `nda`, `employment_agreement`, `vendor_msa`, `unknown`)
- `doc_type_confidence`: float in [0.0, 1.0]
- `clauses`: ordered list of `Clause` objects, each containing `id` (sequential), `section_header` (if detected), `text`, `position` (start/end offsets in original document), `clause_type` (heuristically classified, e.g., `ip_assignment`, `termination`, `non_compete`, `payment`, `confidentiality`, `governing_law`, `other`)

**Tools:** PDF parsing, DOCX parsing, regex-based clause segmentation. No retrieval.

**Failure mode to prevent:** poor segmentation that breaks downstream agents. If clause boundaries cannot be reliably detected, the Scout must report low confidence so Chief Counsel can decide how to proceed.

### 4.2 Investigator — Counterparty Intelligence

**Responsibility:** Build a profile of the counterparty using publicly available data sources.

**Inputs:** Counterparty name, registration number (if extractable from contract), contact email, jurisdiction.

**Outputs (written to state):**
- `counterparty_profile`: object containing `risk_tier` (`trusted` | `standard` | `caution` | `high_risk`), `risk_score` (0–100), `litigation_summary` (list of disputes if any), `pattern_flags` (list of identified concerning patterns), `data_confidence` (low/medium/high based on sources found), `sources_consulted` (list of source identifiers)

**Tools:** External APIs and structured queries. Implementation note: for the hackathon build, this agent must support a `mock_mode` flag that returns realistic synthesized profile data for the demo counterparty without making live external requests. The mock mode must be indistinguishable in shape from real output and must use different profiles for different counterparty names.

**Failure mode to prevent:** falsely confident assertions about counterparties when data is sparse. Low data confidence must propagate to the final analysis.

### 4.3 Jurist — Legal Evaluation

**Responsibility:** Evaluate each clause against the curated legal rules corpus and Indian statutes corpus, producing per-clause legal verdicts with grounded citations.

**Inputs:** Clauses from Scout. User role and deal context.

**Outputs (written to state):**
- `jurist_verdicts`: dict mapping `clause_id` to `LegalVerdict`, each containing `verdict_label` (`standard` | `non_standard` | `predatory` | `unenforceable`), `severity` (`low` | `medium` | `high`), `reasons` (list of strings, ≥2 per verdict, ≤20 words each, each tied to specific evidence), `citations` (list of corpus entry IDs supporting the verdict), `enforceability_note` (string, only present if verdict references jurisdiction-specific enforceability)

**Tools:**
- `search_legal_rules(clause_text, k=3)` → list of corpus entries from rules corpus
- `lookup_indian_statute(clause_text)` → list of relevant statutory provisions

**Constraint:** The Jurist's system prompt must explicitly forbid producing citations outside the corpus. The agent's output schema must validate that every citation ID resolves to a real corpus entry. If validation fails, the agent's output is rejected and regenerated.

**Failure mode to prevent:** hallucinated case law. This is the single most dangerous failure mode in legal AI; the architectural constraint above prevents it structurally.

### 4.4 Benchmarker — Market Comparison

**Responsibility:** Compare each clause against the benchmark clauses corpus and produce numerical and semantic deviation scores.

**Inputs:** Clauses from Scout. Document type from Scout.

**Outputs (written to state):**
- `benchmark_scores`: dict mapping `clause_id` to `BenchmarkResult`, each containing `deviation_score` (numerical, where 1.0 = at median, >1.0 = stricter, <1.0 = more lenient), `comparable_clause_ids` (list of corpus entry IDs of similar clauses found), `numerical_features_extracted` (e.g., `{"notice_days": 30, "payment_terms_days": 45}`), `verdict` (`market_standard` | `non_standard` | `outlier`), `reasoning` (≤30 words explaining the deviation)

**Tools:**
- `find_similar_clauses(clause_text, doc_type_filter, k=10)` → list of corpus entries
- `compute_deviation(clause_text, neighbors)` → numerical score

**Failure mode to prevent:** "everything looks reasonable" syndrome. Without market context, even predatory clauses can read as standard.

### 4.5 Adversary — Red-Team Interpretation

**Responsibility:** For each clause flagged by Jurist or Benchmarker, generate concrete exploit scenarios describing how the clause could be used to harm the user.

**Inputs:** Flagged clauses. Counterparty profile from Investigator (if available — informs the threat model).

**Outputs (written to state):**
- `exploits`: dict mapping `clause_id` to list of `ExploitScenario`, each containing `scenario_description` (concrete, vivid description of how the clause could be invoked), `severity` (`low` | `medium` | `high`), `precedent_link` (optional reference to a counterparty pattern flag if the exploit matches a known pattern from the Investigator)

**Tools:** None. The Adversary operates on pure adversarial reasoning.

**Constraint:** The system prompt must instruct the Adversary to roleplay as the counterparty's most aggressive lawyer. The output style must be specific and concrete, never generic. Generic warnings ("this clause could be misused") are forbidden.

**Failure mode to prevent:** literal interpretation that misses worst-case readings.

### 4.6 Negotiator — Counter-Proposal Drafting

**Responsibility:** Synthesize all prior agents' outputs into actionable counter-proposals.

**Inputs:** Full state including Jurist verdicts, Benchmarker scores, Adversary exploits, counterparty profile, user role and parameters.

**Outputs (written to state):**
- `rewrites`: dict mapping `clause_id` to `Rewrite`, each containing `original_text`, `proposed_text` (the rewrite), `rationale` (≤40 words), `fallback_text` (acceptable alternative if counterparty pushes back), `walk_away_threshold` (the version below which the user should refuse)
- `redlined_docx_path`: path to generated .docx with tracked-change-style annotations
- `negotiation_email_draft`: complete copy-paste-ready email text

**Tools:**
- Document generation tool that produces a .docx file with the rewrites annotated

**Failure mode to prevent:** outputting analysis the user cannot act on. The Negotiator's outputs must be ready to send, not summaries the user must paraphrase.

### 4.7 Chief Counsel — Orchestration

**Responsibility:** Acts at four points in the workflow as the meta-agent that plans, routes, reconciles, and strategizes.

**Mode 1 — Planner.** After Scout completes, reads the Scout output and produces an `ExecutionPlan` specifying which downstream agents to invoke, in what sequence, and with what parallelism.

**Mode 2 — Router.** After Jurist and Benchmarker complete, reads their verdicts and decides which clauses warrant adversarial analysis (typically those flagged by either agent at medium or high severity).

**Mode 3 — Reconciler.** Before final synthesis, identifies any inter-agent disagreements (e.g., Jurist says "standard," Benchmarker says "outlier") and produces explicit reconciliation entries that surface the disagreement to the user.

**Mode 4 — Negotiation Strategist.** During Live Negotiation Mode, after each inbound counterparty reply has been re-evaluated by the agent crew, decides whether to AUTO-RESPOND (within authority), ESCALATE (requires user decision), or CLOSE (deal acceptable).

**Inputs:** Full shared state at the point of invocation.

**Outputs (written to state, mode-dependent):**
- Mode 1: `plan: ExecutionPlan`
- Mode 2: `routing_decision: RoutingDecision`
- Mode 3: `inter_agent_conflicts: list[Conflict]`, `final_synthesis: Synthesis`
- Mode 4: `negotiation_decision: NegotiationDecision`

**Tools:** Read-only access to all state. No external retrieval.

**Failure mode to prevent:** the Chief Counsel becoming a no-op control layer. Each mode invocation must produce a substantive, defensible decision visible in the output. If Chief Counsel is making trivial decisions, redesign the trigger conditions.

---

## 5. The Shared State Object

You will define a strongly-typed shared state object that all agents read from and write to. The state must support both the synchronous initial-review flow and the asynchronous, event-driven negotiation flow.

```
BlindspotState
├── inputs
│   ├── contract_text: string
│   ├── source_format: "pdf" | "docx" | "txt"
│   ├── user_role: string
│   ├── deal_context: { size, location, urgency, currency }
│   └── counterparty_info: { name, email, registration_number, jurisdiction }
│
├── initial_review
│   ├── scout_output: { doc_type, doc_type_confidence, clauses[] }
│   ├── investigator_profile: CounterpartyProfile | null
│   ├── jurist_verdicts: dict[clause_id → LegalVerdict]
│   ├── benchmark_scores: dict[clause_id → BenchmarkResult]
│   ├── exploits: dict[clause_id → ExploitScenario[]]
│   ├── rewrites: dict[clause_id → Rewrite]
│   ├── redlined_docx_path: string | null
│   └── negotiation_email_draft: string | null
│
├── chief_counsel
│   ├── plan: ExecutionPlan
│   ├── routing_decision: RoutingDecision
│   ├── inter_agent_conflicts: Conflict[]
│   ├── final_synthesis: Synthesis
│   └── negotiation_decisions: NegotiationDecision[]
│
├── negotiation
│   ├── active: boolean
│   ├── parameters: NegotiationParameters
│   │   ├── must_haves: string[]
│   │   ├── preferences: string[]
│   │   ├── walk_away_thresholds: dict
│   │   ├── authority_level: "conservative" | "balanced" | "aggressive"
│   │   └── counterparty_email: string
│   ├── rounds: NegotiationRound[]
│   │   ├── round_number: int
│   │   ├── inbound_email: { received_at, raw_text, parsed_intent }
│   │   ├── re_analysis: { jurist, benchmarker, adversary, investigator outputs for this round }
│   │   ├── outbound_response: { sent_at, raw_text } | null
│   │   ├── decision: "auto_respond" | "escalate" | "close"
│   │   └── escalation_details: object | null
│   ├── current_status: "awaiting_counterparty" | "analyzing" | "responding" | "escalated" | "closed" | "abandoned"
│   └── final_contract_state: ContractState | null
│
└── meta
    ├── created_at: timestamp
    ├── analyzer_version: string
    ├── processing_ms: int
    └── warnings: string[]
```

The state object is immutable from the outside but mutable internally — agents return state-mutation requests rather than mutating directly, allowing for validation and event emission at every change.

---

## 6. The Curated Corpora

The system depends on three curated retrieval corpora. You will implement loading, embedding, and retrieval over these corpora using a vector database of your choice. The corpora themselves must be treated as data, not code — they live in JSON files that can be modified without code changes.

### 6.1 Legal Rules Corpus

A minimum of 50 entries. Each entry has the following shape:

```json
{
  "id": "LR-014",
  "title": "Overbroad IP Assignment",
  "applicable_clause_types": ["ip_assignment"],
  "pattern_keywords": ["assignment of all intellectual property", "including pre-existing"],
  "severity": "high",
  "explanation": "Assigning pre-existing IP beyond project scope is non-standard and likely unenforceable against the contractor's prior works.",
  "citation": "Indian Copyright Act, §17 proviso",
  "remediation_template": "Narrow assignment to work product created during engagement period only."
}
```

Categories the rules corpus must cover (with approximate distribution):
- IP assignment and licensing (8 rules)
- Termination and notice (8 rules)
- Payment terms and penalties (6 rules)
- Confidentiality and NDA scope (5 rules)
- Non-compete and non-solicit (5 rules)
- Indemnification and liability (5 rules)
- Dispute resolution and jurisdiction (4 rules)
- Force majeure and excusable delay (3 rules)
- Vague performance standards (3 rules)
- Auto-renewal and lock-in (3 rules)

### 6.2 Benchmark Clauses Corpus

A minimum of 75 entries. Each entry has the following shape:

```json
{
  "id": "BC-031",
  "doc_type": "freelance_services_agreement",
  "clause_type": "termination_notice",
  "text": "Either party may terminate this agreement with thirty (30) days' written notice.",
  "numeric_features": {
    "notice_days_contractor": 30,
    "notice_days_client": 30,
    "is_symmetric": true
  },
  "source_descriptor": "synthesized from public freelance contract templates"
}
```

The corpus must cover at least three contract types (freelance services, NDA, employment offer letter) with at least 25 clauses each.

### 6.3 Indian Statutes Corpus

A minimum of 30 entries. Each entry has the following shape:

```json
{
  "id": "IS-007",
  "act_name": "Indian Contract Act, 1872",
  "section": "27",
  "section_title": "Agreement in restraint of trade, void",
  "text_summary": "Every agreement by which any one is restrained from exercising a lawful profession, trade or business of any kind, is to that extent void.",
  "applicable_situations": ["non_compete_post_employment", "non_compete_post_engagement"],
  "enforceability_implication": "Most non-compete clauses extending beyond the term of employment or engagement are void and unenforceable in India."
}
```

The corpus must cover at minimum: Indian Contract Act, Indian Copyright Act, Information Technology Act, Consumer Protection Act, and Specific Relief Act.

---

## 7. The Orchestration Graph

You will implement the agent crew as a stateful directed graph with the following topology:

```
                    [START]
                       │
                  ┌────▼─────┐
                  │  SCOUT   │
                  └────┬─────┘
                       │
                  ┌────▼──────────┐  parallel ─────────┐
                  │ CHIEF COUNSEL │                    │
                  │  (planner)    │                    │
                  └────┬──────────┘                    │
                       │                          ┌────▼─────────┐
                  ┌────▼──────┐                   │ INVESTIGATOR │
                  │ parallel: │                   └────┬─────────┘
                  │ JURIST +  │                        │
                  │ BENCHMARK │                        │
                  └────┬──────┘                        │
                       │                               │
                       └───────────┬───────────────────┘
                                   │ (join)
                            ┌──────▼──────┐
                            │CHIEF COUNSEL│
                            │   (router)  │
                            └──────┬──────┘
                                   │
                              ┌────┴────┐
                              │         │
                       (clauses     (no risky
                        flagged)     clauses)
                              │         │
                       ┌──────▼─────┐   │
                       │ ADVERSARY  │   │
                       └──────┬─────┘   │
                              │         │
                       ┌──────▼─────┐   │
                       │ NEGOTIATOR │   │
                       └──────┬─────┘   │
                              │         │
                              └────┬────┘
                                   │
                            ┌──────▼──────┐
                            │CHIEF COUNSEL│
                            │ (reconciler)│
                            └──────┬──────┘
                                   │
                                [END_OF_REVIEW]
                                   │
                       (if user starts negotiation)
                                   │
                            ┌──────▼──────────┐
                            │  NEGOTIATION    │
                            │  STATE MACHINE  │ (event-driven, see §8)
                            └─────────────────┘
```

**Required graph features:**

1. **Parallel execution** — Jurist + Benchmarker must run concurrently; Investigator must run concurrently with the Jurist/Benchmarker pair (kicked off by the Planner).
2. **Conditional edges** — Adversary and Negotiator only run if the Router determines risky clauses exist.
3. **State joining** — parallel branches must merge correctly back into the shared state with no race conditions.
4. **Streaming events** — every node completion must emit an event consumable by the API layer for SSE forwarding to the client.

You may use any agent orchestration framework that supports these features. Document your choice in `ARCHITECTURE.md`.

---

## 8. The Negotiation State Machine

Live Negotiation Mode operates as an event-driven state machine, separate from the synchronous initial-review flow. The user starts the negotiation by submitting their parameters; the system then operates autonomously, processing inbound emails as they arrive and producing outbound responses.

### 8.1 States

- `IDLE` — initial state before user starts negotiation
- `AWAITING_COUNTERPARTY` — outbound message sent, waiting for reply
- `ANALYZING` — inbound message received, agent crew re-evaluating
- `DECIDING` — Chief Counsel making auto-respond / escalate / close decision
- `RESPONDING` — Negotiator drafting outbound, system sending
- `ESCALATED` — paused, waiting for user input
- `CLOSED` — deal accepted, final contract prepared
- `ABANDONED` — user terminated negotiation

### 8.2 Transitions

Transitions are triggered by events: `user_starts_negotiation`, `inbound_email_received`, `analysis_complete`, `decision_made`, `outbound_sent`, `user_responds_to_escalation`, `user_abandons`.

The state machine must be durable — a negotiation may pause for hours or days. State must persist across restarts of the backend service.

### 8.3 Re-Analysis Flow

When an inbound email arrives, the existing agent crew is re-invoked but with a different scope:

1. Scout parses the email, identifies what changed from the prior round (e.g., counterparty proposed alternative wording for clause 11, accepted clause 7, introduced new clause about termination notice)
2. Jurist evaluates only the changed/new clauses against the legal corpus
3. Benchmarker scores the changed clauses against the benchmark
4. Adversary checks for new exploit vectors in the proposed alternatives
5. Investigator may re-check if the counterparty has displayed concerning patterns this round
6. Chief Counsel makes the strategic decision

This flow reuses agent implementations — no new agents are required, only a new entry point that wraps the existing crew with email parsing on the front and decision logic on the back.

### 8.4 Demo Mode

For the hackathon demo, the email integration must support a controlled mode where:
- Outbound emails are sent to a simulated counterparty (a teammate, or a controlled inbox)
- Inbound emails are received via polling a sandboxed mailbox or via an explicit "inject" endpoint
- A scripted demo flow can be triggered that runs through three pre-rehearsed counterparty replies

This mode must be enabled via configuration flag and must not be hard-coded into the negotiation logic itself.

---

## 9. The User Interface

You will implement a web-based frontend with three primary views, all visible simultaneously after upload, all updated via streaming events.

### 9.1 The Contract View (Left Pane)

- Renders the uploaded contract with original formatting preserved as much as possible
- Inline highlights appear on clauses as the agent crew flags them: yellow for `non_standard`, red for `predatory` or `unenforceable`
- Clicking any clause opens a side drawer showing the full per-clause analysis from all agents

### 9.2 The Crew View (Center Pane)

- Six (or seven, including Investigator) agent cards arranged in a grid
- Each card shows:
  - Agent name and icon
  - Current state ("idle" | "working" | "complete" | "error")
  - A live progress indicator while working
  - A summary of findings when complete (e.g., "3 clauses flagged as risky")
  - Click-to-expand for detailed output
- Cards animate as agents start and complete their work
- The Chief Counsel card shows its current "mode" (planner / router / reconciler / negotiation strategist)

### 9.3 The Negotiation View (Right Pane)

- Initially shows a "Start Negotiation" CTA after the initial review completes
- After the user starts negotiation, shows:
  - The negotiation parameters they set
  - A timeline of negotiation rounds
  - For each round: the inbound email, the agents' analysis, the outbound response, the decision (auto-responded / escalated / closed)
  - Active escalations appear as prominent cards with the recommended action and a "respond" interface

### 9.4 Streaming Behavior

- All updates flow over Server-Sent Events from the backend
- The UI must never display a blocking spinner for more than 2 seconds — there must always be progressive content appearing
- If the system falls back to cached responses (per the demo reliability requirement), the UI must not indicate this — it should look identical to a live run

---

## 10. The API Layer

You will implement a backend API with the following endpoints. The API must support both synchronous request/response (for initial review) and event-driven streaming (for negotiation updates).

### 10.1 Endpoints

```
POST /api/v1/analyze
  Body: multipart/form-data with `file` (contract upload) + `metadata` (JSON with role, deal_context, counterparty_info)
  Response: text/event-stream — emits events as agents complete, ends with `final_report` event
  Events emitted: scout_complete, investigator_complete, jurist_progress, jurist_complete,
                  benchmarker_progress, benchmarker_complete, adversary_complete,
                  negotiator_complete, chief_counsel_synthesis, final_report

POST /api/v1/negotiate/start
  Body: JSON with state_id (from prior /analyze) + negotiation_parameters
  Response: { negotiation_id, initial_outbound_email_id, status: "awaiting_counterparty" }

POST /api/v1/negotiate/{negotiation_id}/inbound
  Body: JSON with raw_email_content (used for demo-mode injection or webhook integration)
  Response: { round_number, decision, status }

GET /api/v1/negotiate/{negotiation_id}/stream
  Response: text/event-stream — emits events as negotiation rounds complete
  Events emitted: round_received, analysis_started, analysis_complete, decision_made,
                  outbound_sent, escalation_required, deal_closed

POST /api/v1/negotiate/{negotiation_id}/respond_to_escalation
  Body: JSON with user_decision (accept | counter | walk_away) + optional_message

GET /api/v1/download/{redline_id}
  Response: application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

### 10.2 Caching and Fallback

The API must implement a transparent caching layer with the following behavior:

- For any LLM call, if the input matches a cached input within a configurable similarity threshold AND the cache is enabled (config flag), return the cached response
- For demo reliability, a "demo mode" config flag must enable hard-coded cached responses for the demo contract specifically
- Cache hits must not be visible in the API response — they look identical to live calls
- Cache misses that fail (LLM API error, timeout) must fall back to cache if available, otherwise return a structured error

### 10.3 Privacy and Logging

- No contract content may be logged at INFO level or above
- DEBUG level may include contract content for development; production must run at INFO
- Uploaded files are stored in memory or in `tempfile.TemporaryDirectory()` only; no disk persistence by default
- A scheduled cleanup task must purge generated files older than a configurable TTL (default 1 hour)

---

## 11. Project Structure

You will organize the codebase into a clean monorepo with the following top-level structure:

```
blindspot/
├── README.md                        # quickstart + architecture overview
├── ARCHITECTURE.md                  # decisions, tradeoffs, framework choices
├── DEMO.md                          # demo script with timing
├── backend/
│   ├── pyproject.toml or package.json
│   ├── src/
│   │   ├── api/                     # API endpoints, SSE handling
│   │   ├── agents/                  # one file per agent
│   │   │   ├── scout.py
│   │   │   ├── investigator.py
│   │   │   ├── jurist.py
│   │   │   ├── benchmarker.py
│   │   │   ├── adversary.py
│   │   │   ├── negotiator.py
│   │   │   └── chief_counsel.py
│   │   ├── orchestration/           # the agent graph + negotiation state machine
│   │   ├── retrieval/               # corpus loading, vector DB, search interfaces
│   │   ├── state/                   # shared state schema + validation
│   │   ├── tools/                   # parsers, redline generator, email integration
│   │   ├── cache/                   # caching and fallback layer
│   │   └── config.py                # all thresholds, weights, model selection
│   └── tests/
│       ├── test_agents/             # one test file per agent
│       ├── test_orchestration/
│       ├── test_negotiation/
│       └── fixtures/                # ≥3 test contracts + golden outputs
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── pages/                   # main app page
│   │   ├── components/              # contract view, crew view, negotiation view
│   │   ├── services/                # SSE client, API wrapper
│   │   └── styles/
│   └── public/
├── data/
│   ├── legal_rules.json             # ≥50 entries
│   ├── benchmark_clauses.json       # ≥75 entries
│   ├── indian_statutes.json         # ≥30 entries
│   └── demo_contracts/              # contracts used in demo + their cached agent responses
├── scripts/
│   ├── seed_corpora.py              # loads and embeds corpora into vector DB
│   ├── generate_demo_cache.py       # pre-computes cached responses for demo contracts
│   └── run_demo.sh                  # one-command demo launch
└── docker-compose.yml               # local development stack
```

### 11.1 Hard rules for code quality

- Strong typing throughout (Pydantic in Python, TypeScript on frontend)
- No bare `except` clauses; all exceptions are typed
- All thresholds, weights, and configurable values live in `config.py` — no magic numbers in source files
- Structured logging via a logger object; never `print()` outside of CLI scripts
- Every agent has a corresponding test file; tests must validate that agents produce schema-compliant output
- Zero placeholders in delivered code: no `TODO`, `FIXME`, `pass # implement`, or `raise NotImplementedError`
- README must include working install + run commands that a fresh clone can execute

### 11.2 Determinism

The system must produce equivalent output for equivalent input under the same configuration. Where LLM nondeterminism is unavoidable, the cache layer ensures demo-time determinism for the demo contracts.

---

## 12. Required Deliverables

Your build must produce all of the following before being considered complete:

1. **Working backend** that exposes the API endpoints in §10
2. **Working frontend** that renders the three views in §9 and consumes the streaming API
3. **Three curated corpora** at the minimum sizes specified in §6
4. **At least three demo contracts** in `data/demo_contracts/` with corresponding cached agent outputs
5. **Pre-rehearsed negotiation flow** for at least one demo contract — three counterparty replies that exercise auto-respond, escalate, and close decisions
6. **`README.md`** with quickstart, architecture overview, and demo launch instructions
7. **`ARCHITECTURE.md`** documenting your framework and library choices with justification
8. **`DEMO.md`** with the 90-second demo script (timing, beats, presenter cues)
9. **`docker-compose.yml`** that brings up the full system with a single command
10. **`scripts/run_demo.sh`** that launches the system in demo mode with cached responses enabled

---

## 13. Acceptance Criteria

The build is complete when all of the following are demonstrably true:

| # | Criterion | How to Verify |
|---|---|---|
| 1 | A previously-unseen freelance contract can be uploaded and produces a complete review in under 60 seconds | Upload a fresh contract, time the full pipeline |
| 2 | All seven agents produce non-empty, schema-valid outputs for the demo contracts | Run integration test suite |
| 3 | Every legal citation in the output resolves to a real entry in the corpora | Run citation validation script |
| 4 | The streaming UI shows progressive updates with no blocking spinners >2s | Manual UX check |
| 5 | At least one inter-agent disagreement is surfaced and reconciled by Chief Counsel on at least one demo contract | Review final synthesis output |
| 6 | Live Negotiation Mode runs through three counterparty rounds with one auto-respond, one escalate, and one close | Run scripted demo flow |
| 7 | Demo mode produces identical output across three consecutive runs | Run demo script three times, diff outputs (excluding timestamps) |
| 8 | If the LLM API is disabled (e.g. invalid API key), demo mode still completes successfully using cached responses | Disable API, run demo, verify success |
| 9 | The 90-second demo script in `DEMO.md` is rehearsable and produces the expected beats | Run through it five times with a stopwatch |
| 10 | A fresh team member can clone the repo and run the demo within 15 minutes using only `README.md` and `scripts/run_demo.sh` | New-eyes test |

---

## 14. Implementation Sequencing

If you are working in parallel sessions or are time-constrained, sequence your work as follows. This sequencing minimizes integration risk by getting the highest-risk components working first.

### Tier 1 — Must Exist Before Anything Else (Hours 0–6)
- Shared state schema (the contract that everything else depends on)
- Three curated corpora at minimum size
- Vector DB seeded with corpora
- API skeleton with SSE infrastructure
- Frontend skeleton with three-view layout
- One end-to-end happy path (upload → mock agents → mock display) to validate plumbing

### Tier 2 — Initial Review Pipeline (Hours 6–14)
- Scout (real implementation)
- Investigator (with mock_mode default)
- Jurist with grounded retrieval
- Benchmarker with deviation scoring
- Chief Counsel — Planner mode + Router mode
- Adversary
- Negotiator with .docx generation
- Chief Counsel — Reconciler mode
- Streaming UI fully integrated
- Cache layer for demo reliability

### Tier 3 — Negotiation Mode (Hours 14–20)
- Negotiation parameters UI
- Email integration (controlled/sandboxed mode)
- Negotiation state machine
- Round-by-round re-analysis flow
- Chief Counsel — Negotiation Strategist mode
- Negotiation timeline UI
- Escalation handling UI

### Tier 4 — Demo Hardening (Hours 20–24)
- Pre-cache all demo contract outputs
- Pre-script three negotiation flows
- Rehearse demo five times
- Fix any UX rough edges visible during rehearsal
- Backup video recording
- Final README + DEMO.md polish

### Sequencing Discipline

If you are running behind, drop scope from Tier 3 (negotiation) before dropping from Tier 2 (initial review). A complete initial review with no negotiation is a defensible product. A half-built negotiation flow on top of a half-built review is not.

If you are running ahead, do not add features. Add polish and rehearsal time. The demo is what wins; everything else is support for the demo.

---

## 15. Final Instructions

When you begin implementation:

1. Read this entire document before writing any code
2. Establish the shared state schema first — it is the contract that allows all other work to proceed in parallel
3. Build the demo path end-to-end with mocks before building any agent in detail; this validates the full system shape early
4. Treat the demo script in DEMO.md as a target spec — every demo beat in §13 of the project review (delivered separately) must be achievable
5. Document every architectural choice you make in `ARCHITECTURE.md` as you make it; do not save documentation for the end
6. When the spec is silent, choose the option most consistent with the architectural principles in §3, and document your reasoning

The goal is not to build a functional system. The goal is to build a system that wins a hackathon. Those are different objectives. Optimize for the demo experience; everything else serves it.

*— End of Coding Agent Prompt —*
