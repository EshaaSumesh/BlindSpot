# Blindspot — Comprehensive Project Review (v2.0)

**Document Type:** Strategic Project Review & Build Specification
**Status:** Post-Selection — Building for the Win
**Tagline:** *Other tools tell you what's wrong with your contract. Blindspot fights for you.*

---

## 0. Executive Summary

Blindspot has evolved from an AI-powered contract review tool into something materially more ambitious: **the first autonomous legal agent that operates in the real world on a user's behalf** — not just diagnosing problems with a contract, but actively negotiating with the counterparty over email until the deal is either closed or escalated to a human.

The breakthrough capability — **Live Negotiation Mode** — vertically integrates the six-agent crew we previously designed into a long-horizon, conversational workflow. The same agents that perform the initial review now stretch their work across multiple email rounds with a real counterparty, evaluating counter-offers, holding the user's pre-defined lines, and only escalating when a decision exceeds the agent's authority.

This shifts Blindspot's category position. Where the original concept competed with contract-review tools (LawGeex, Spellbook, ChatGPT-as-lawyer), the v2.0 concept opens a new category that no incumbent occupies: **autonomous legal counsel for the small operator**. This is the move that transforms a hackathon project into a defensible product trajectory.

The hackathon-stage build delivers three integrated experiences: (1) the foundational contract review producing a redlined document and dashboard, (2) the negotiation engine that runs autonomously across email rounds, and (3) a counterparty intelligence layer that grounds the system's negotiation strategy in publicly available signals about who the user is actually dealing with.

---

## 1. What Changed Since v1

### 1.1 The Three Major Additions

**Live Negotiation Mode (the breakthrough).** Blindspot now extends past the initial review into multi-round negotiation. The user defines their negotiation parameters once — must-haves, walk-away points, concession authority — and the agent crew handles the back-and-forth with the counterparty over email. Inbound emails are parsed, evaluated against the original analysis and the user's parameters, and answered automatically. The user is pinged only when escalation is genuinely needed.

**Counterparty Intelligence Layer.** Before the negotiation begins, Blindspot performs a parallel investigation of the counterparty using publicly available sources: court records (via the Indian Kanoon API), public reviews and complaints, prior contracts available in public filings, news mentions of disputes. The output is a "counterparty trust profile" that informs both the initial review (more skeptical interpretation of clauses from a known-bad actor) and the negotiation strategy (more aggressive opening positions against counterparties with a litigation history).

**Coding-Agent-Native Architecture.** The entire build is structured to be executed primarily by AI coding agents (Claude Code, Codex, Cursor's agent mode). Components are decomposed into self-contained, well-specified units that can be parallelized across agent sessions. This is itself a competitive advantage — it means the team ships more in 24 hours than teams writing line-by-line.

### 1.2 What Stays From v1

The core architecture is preserved and extended, not replaced:

- The six-agent crew (Scout, Jurist, Benchmarker, Adversary, Negotiator, Chief Counsel)
- The shared-state orchestration model
- The grounded-reasoning constraint (no freeform citations)
- The curated corpora (legal rules, benchmark clauses, Indian statutes)
- The streaming UI showing each agent's reasoning live
- The Indian-jurisdiction differentiation
- The redlined .docx + email draft outputs

The v2.0 changes extend the agents' capabilities along the time dimension and broaden their inputs — they don't replace the original architecture, they complete it.

---

## 2. The Strategic Position

### 2.1 The New Pitch

> *Most legal AI tells you what's wrong with your contract. Blindspot fights for you. Upload the contract, set your terms, and watch six AI specialists negotiate with the counterparty on your behalf — drafting your responses, evaluating their counter-offers, holding your lines, and only pinging you when a real decision needs a human. This is the first AI legal assistant that doesn't stop at the diagnosis. It runs the whole case.*

### 2.2 What This Pitch Wins Against

| Position We're Taking | What We're Beating |
|---|---|
| Autonomous legal agent operating across time | Single-shot contract analyzers (every existing competitor) |
| Counterparty-aware analysis | Document-only review tools that ignore who's sending the contract |
| Negotiation, not just review | Tools that produce summaries the user must still act on alone |
| Indian-jurisdiction native | US-trained tools that misapply foreign legal principles |
| Grounded reasoning with citations | Generic AI tools that hallucinate case law |
| Six specialized agents with visible reasoning | Black-box single-LLM wrappers |

The combination of these positions has no incumbent. That is the strategic gap Blindspot is built to occupy.

### 2.3 The Hackathon-Specific Edge

Three things will differentiate the demo from every other team in the room:

1. **The negotiation runs live in the demo.** Most teams demo a static feature. We demo an agent doing autonomous, multi-step work in real time. This is unforgettable.
2. **The counterparty intelligence shows the system thinking beyond the document.** When Blindspot pulls up actual public records about the counterparty during the demo, the room realizes this isn't a wrapper.
3. **The agents visibly disagree and reconcile.** The Chief Counsel's role becomes vivid when the Jurist says "this clause is legally valid" and the Benchmarker says "but it appears in only 3 of 75 reference contracts" and Chief Counsel synthesizes "legally standard but a negotiation red flag." This is the moment that proves the system thinks.

---

## 3. The Problem (Sharpened)

### 3.1 The Hook

A Bangalore developer earning ₹6 lakh per year cannot afford to spend ₹20,000 on a lawyer to review a ₹3 lakh contract. So he signs. Six months later, his client invokes Clause 11 — the IP assignment clause he glossed over — and claims ownership of the side-project codebase he built before they ever met. He has no recourse. He didn't read the contract. He couldn't afford to.

This is not a rare story. It is the median outcome for India's fifteen million freelancers and the thousands of new startups added every year. Each one signs dozens of agreements drafted by counterparties with in-house legal teams. None of them have the same protection. The party most exposed to contractual risk has the least access to the tools that mitigate it.

### 3.2 Why Existing Solutions Are Not Just Insufficient — They're Dangerous

| Existing Approach | Why It Fails | Why It's Worse Than Nothing |
|---|---|---|
| **Direct ChatGPT / Gemini use** | No legal grounding, no jurisdictional awareness | Hallucinates plausible-sounding case law and statutory references; users have signed contracts based on AI-fabricated legal advice |
| **Enterprise tools (LawGeex, Spellbook, Harvey)** | Priced at $200–$1,000+/month, designed for in-house legal teams | Trained predominantly on US/UK common law; will misapply Delaware contract principles to Indian agreements, producing false confidence |
| **Template sites** | Static templates, not document analysis | Assume parties want fairness — but real contracts are written by the stronger party to exploit the weaker one. Templates teach users what a fair contract looks like, then leave them defenseless against an unfair one |
| **General "upload-PDF" AI tools** | Surface-level summaries with no citations | Produce reassuring restatements that users mistake for analysis; the absence of identified issues is interpreted as "no issues exist" |

The structural gap is clear. There is no tool that combines accessibility (priced for individuals), substantive rigor (grounded in real legal rules), jurisdictional relevance (Indian law specifically), and *agency* (acting on the user's behalf rather than producing reports they must still act on alone).

Blindspot is built to occupy this gap.

---

## 4. The Solution Architecture

### 4.1 Core Thesis

**A real legal review is not a fixed pipeline. It is a coordinated team operating over time.**

Blindspot models this directly. Six specialized agents, each with a narrow role and its own toolset, collaborate over a shared workspace. A meta-agent (Chief Counsel) plans the work, routes between agents based on what the document and the situation require, and synthesizes the final output. Crucially, this team operates not just on the initial review but on every subsequent negotiation round — meaning the same crew that diagnoses the contract is the crew that negotiates it.

### 4.2 The Six-Agent Crew

Each agent is defined by its responsibility, the tools it can call, and its specific failure mode that the others compensate for.

**Scout — Document Mapping**
Reads the uploaded contract, identifies its type (freelance services agreement, NDA, MSA, employment, rental), and produces a structured clause map with confidence scores. Acts as the structural preprocessor; uses no retrieval. *Failure mode it prevents:* downstream agents reasoning about poorly-segmented or misclassified text.

**Jurist — Legal Evaluation**
Per-clause legal verdict against the curated rules corpus and Indian statutes. Cannot generate citations freely — only cites entries surfaced by the retrieval layer. *Failure mode it prevents:* hallucinated case law, the single most dangerous failure mode in legal AI.

**Benchmarker — Market Comparison**
Statistical and semantic comparison of each clause against the benchmark corpus. Produces deviation scores with supporting reference clauses. *Failure mode it prevents:* "everything looks reasonable" syndrome — without market context, even predatory clauses can read as standard.

**Adversary — Red-Team Interpretation**
Roleplays as the counterparty's counsel. For each flagged clause, generates concrete exploit scenarios: how the clause could be invoked to harm the user. Uses no tools, only adversarial reasoning. *Failure mode it prevents:* literal reading that misses the worst-case interpretation.

**Negotiator — Counter-Proposal Drafting**
Synthesizes all prior agents' outputs into three artifacts: per-clause rewrites, a redlined .docx, and a copy-paste negotiation email. In v2.0, also drafts negotiation responses across subsequent email rounds. *Failure mode it prevents:* analysis without action — the user receiving a report they don't know what to do with.

**Chief Counsel — Orchestration & Synthesis**
Operates at four points in the workflow:
- *Planner:* after Scout, decides which downstream agents to deploy and in what sequence
- *Router:* after Jurist + Benchmarker, decides which clauses warrant adversarial analysis and which warrant rewriting
- *Reconciler:* surfaces inter-agent disagreements explicitly to the user — the system thinks out loud
- *Negotiation Strategist:* during Live Negotiation Mode, decides each round whether the agent has authority to respond autonomously or must escalate to the user

The Chief Counsel is what makes the system a *crew* instead of a *pipeline*. It's also what makes it visible to the user that the system is reasoning, not just executing.

### 4.3 The Counterparty Intelligence Layer (NEW in v2.0)

In parallel with the contract review, a separate agent performs research on the counterparty. This is treated as a seventh agent role — **the Investigator** — which runs alongside Scout in the initial pipeline.

**Inputs:** counterparty name, addresses, registration numbers (CIN if Indian company, derived from the contract)

**Sources queried:**
- **Indian Kanoon API** — court records, judgments naming the counterparty, dispute history
- **MCA portal** — corporate filings, director history, registered status
- **Public review sources** — Glassdoor reviews mentioning contract or payment issues, Trustpilot, Reddit discussions
- **News mentions** — recent press about the company, particularly disputes or layoffs
- **Prior public contracts** — sometimes leaked or shared in regulatory filings

**Output:** A counterparty trust profile that includes:
- Risk score (0–100) with tier (Trusted / Standard / Caution / High Risk)
- Litigation history summary
- Pattern flags (e.g., "history of invoking IP assignment clauses against contractors", "three Reddit threads in past 12 months about non-payment")
- Confidence indicator (based on how much public data was found)

The trust profile feeds back into the analysis: a "standard" clause from a high-risk counterparty is reinterpreted with greater suspicion, and the negotiation strategy is calibrated accordingly.

**Strategic note:** for the hackathon demo, the counterparty profile uses anonymized/synthesized public data. We are not running real-time scraping on real companies live on stage. The architecture supports it; the demo doesn't require it.

### 4.4 Live Negotiation Mode (THE BREAKTHROUGH)

This is the capability that wins the hackathon. The flow:

**Step 1 — Setup.** After the initial review, the user is presented with a "Negotiate" button. Clicking it opens a settings panel:
- **Must-haves:** non-negotiable terms (e.g., "no IP assignment of pre-existing work")
- **Preferences:** terms the agent should push for but can concede if needed (e.g., "30-day notice period preferred, will accept 45")
- **Walk-away points:** terms below which the agent must escalate to the user (e.g., "do not accept payment less than ₹3.5L total")
- **Authority level:** how aggressively the agent should push (Conservative / Balanced / Aggressive)
- **Counterparty contact:** email address of the person on the other side

**Step 2 — Opening Move.** The agent sends the redlined contract + the negotiation email to the counterparty's address. This is the email that was previously the *output* of Blindspot — now it's the *opening shot* of an automated negotiation.

**Step 3 — Inbound Reply Processing.** When the counterparty replies, the email is parsed by the Scout (now operating on email rather than contract), classified by intent (full agreement / counter-offer / pushback on specific clauses / new clauses introduced / question / refusal), and the relevant clauses are extracted.

**Step 4 — Multi-Agent Re-evaluation.** The Jurist evaluates any newly-introduced language against the legal corpus. The Benchmarker checks if the counter-offer terms align with market norms. The Adversary identifies any traps in the new language. The Investigator (if relevant) flags whether this counter-offer pattern matches any known bad-actor playbook.

**Step 5 — Strategic Decision (Chief Counsel).** Chief Counsel evaluates the situation against the user's negotiation parameters and decides:
- **Auto-respond:** the counter-offer is within the agent's authority. Negotiator drafts the next response, agent sends it.
- **Escalate:** the counter-offer requires human judgment (hits walk-away point, introduces unfamiliar terms, or matches risk pattern). User is notified with a clear summary and recommended response.
- **Close:** the counterparty has agreed to acceptable terms. Final contract is prepared for signing.

**Step 6 — Loop.** Steps 3–5 repeat until the deal closes or the user takes over.

**Demo angle:** during the hackathon presentation, you literally play out a negotiation in real time. A teammate plays the role of the counterparty (with a controlled email setup). The judges watch:
- The opening email leaves Blindspot
- The "counterparty" reply lands in the inbox 30 seconds later
- The agents re-evaluate on screen
- Blindspot's response composes itself
- A second round happens
- On the third round, the counterparty pushes too hard — Blindspot escalates to the user with a clear "they're trying to keep IP assignment, this hits your must-have. Recommend walking away or counter with X. Your call."

This is a 90-second demo that no other team in the room can match.

### 4.5 The Streaming Reasoning UI

The user interface is split into three primary views:

1. **The Contract View** — left pane. The original contract with inline highlights for risky clauses. Clicking any clause opens a side drawer with all six agents' verdicts on that clause, expandable.

2. **The Crew View** — center pane. Six agent cards that animate as each agent reports back during the analysis. Each card shows the agent's current state ("analyzing clause 7 of 14"), then their final verdict, then their evidence/citation.

3. **The Negotiation View** — right pane (active only after the user enters Negotiation Mode). A timeline of the negotiation rounds, with each round showing: the inbound email from the counterparty, the agents' analysis of it, Blindspot's outbound response, and the current status (auto-handled / escalated / closed).

The streaming UX is non-negotiable. It is what transforms the user's experience from "wait for a result" to "watch an expert team work." Most teams will build the former. We build the latter.

---

## 5. Technical Architecture

### 5.1 Layered View

```
┌──────────────────────────────────────────────────────────────────┐
│ LAYER 1 — CLIENT                                                 │
│ React frontend with three live-streaming views                   │
└──────────────────────────────────┬───────────────────────────────┘
                                   │ SSE + WebSocket
┌──────────────────────────────────▼───────────────────────────────┐
│ LAYER 2 — API & EVENT BUS                                        │
│ FastAPI for sync requests + event bus for negotiation rounds     │
└──────────────────────────────────┬───────────────────────────────┘
                                   │
┌──────────────────────────────────▼───────────────────────────────┐
│ LAYER 3 — ORCHESTRATION                                          │
│ Stateful agent graph + negotiation state machine                 │
└──┬──────┬──────┬──────┬──────┬──────┬─────────┬─────────────────┘
   │      │      │      │      │      │         │
 ┌─▼──┐ ┌─▼───┐ ┌▼────┐ ┌▼────┐ ┌▼─────┐ ┌────▼────┐ ┌─────────┐
 │Sct │ │Jrst │ │Bnch │ │Advr │ │Negot │ │ChiefCnsl│ │Investig.│
 └─┬──┘ └─┬───┘ └┬────┘ └┬────┘ └┬─────┘ └────┬────┘ └────┬────┘
   │      │      │       │       │            │           │
┌──▼──────▼──────▼───────▼───────▼────────────▼───────────▼──────┐
│ LAYER 4 — TOOLS & SERVICES                                     │
│ • Document parsers (PDF/DOCX/email)                            │
│ • Vector retrieval (Chroma)                                    │
│ • Email integration (IMAP/SMTP, OAuth)                         │
│ • External APIs (Indian Kanoon, MCA, public review sources)    │
│ • Redline generator (.docx with tracked changes)               │
└──────────────────────────────────┬─────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────┐
│ LAYER 5 — DATA                                                 │
│ • Curated corpora (rules, benchmarks, statutes)                │
│ • Per-user negotiation state (active rounds, parameters)       │
│ • Counterparty intelligence cache                              │
└────────────────────────────────────────────────────────────────┘
```

### 5.2 The Shared State Object (Extended)

The shared state from v1 is extended to support negotiation across rounds:

```python
class BlindspotState:
    # ───── Inputs ─────
    contract_text: str
    user_role: str                        # "freelancer" | "founder" | etc.
    deal_context: DealContext             # size, location, urgency
    counterparty_info: CounterpartyInfo   # name, email, registration

    # ───── Initial Review (V1) ─────
    scout_output: ScoutResult
    jurist_verdicts: dict[ClauseId, LegalVerdict]
    benchmark_scores: dict[ClauseId, BenchmarkResult]
    exploits: dict[ClauseId, list[ExploitScenario]]
    rewrites: dict[ClauseId, Rewrite]
    investigator_profile: CounterpartyProfile  # NEW

    # ───── Chief Counsel ─────
    plan: ExecutionPlan
    inter_agent_conflicts: list[Conflict]
    final_synthesis: Synthesis

    # ───── Negotiation Mode (V2 — NEW) ─────
    negotiation_active: bool
    negotiation_params: NegotiationParameters
    rounds: list[NegotiationRound]        # full history
    current_round: NegotiationRound | None
    escalations_needed: list[Escalation]
    final_contract_state: ContractState | None  # closed | escalated | abandoned
```

### 5.3 The Negotiation State Machine

Live Negotiation Mode introduces a state machine that operates *outside* the request/response flow of the initial review. It is event-driven:

```
                ┌──────────────┐
                │  REVIEW DONE │
                └──────┬───────┘
                       │ user clicks "Negotiate"
                ┌──────▼───────┐
                │   AWAITING   │ ◄─────────────┐
                │  COUNTERPARTY│               │
                └──────┬───────┘               │
                       │ inbound email         │
                ┌──────▼───────┐               │
                │  ANALYZING   │               │
                │   REPLY      │               │
                └──────┬───────┘               │
                       │                       │
                  ┌────┴─────┐                 │
                  │          │                 │
            ┌─────▼────┐  ┌──▼───────┐  ┌──────▼────┐
            │AUTO      │  │ESCALATE  │  │   CLOSE   │
            │RESPOND   │  │TO USER   │  │   DEAL    │
            └─────┬────┘  └──┬───────┘  └───────────┘
                  │          │
                  │          │ user response
                  └─────┬────┘
                        │
                        ▼
                  (back to AWAITING)
```

The machine is durable — a negotiation can pause for hours or days while the counterparty drafts their reply. The system polls inbound email, processes events when they arrive, and acts.

### 5.4 The Five Defining Architectural Decisions

For a technical reviewer asking "why this architecture?", these are the answers:

1. **Stateful agent graph (LangGraph-style) over sequential pipeline** — because the orchestration logic is the product. A short NDA and a 40-page MSA require different sequences. Conditional and parallel routing is what makes the agents act like a team rather than an assembly line.

2. **Shared mutable state over message-passing** — because transparency is the pitch. Every agent reads every other agent's work. When the Jurist and Benchmarker disagree, both verdicts live in the same state object, which is what enables the UI to show the disagreement and Chief Counsel to reconcile it.

3. **Curated retrieval corpora over LLM-only reasoning** — because grounding is the only defensible answer to the "wrapper" critique. Every legal verdict cites a specific corpus entry. Hallucination is structurally prevented at the architecture level.

4. **Event-driven negotiation state machine over synchronous flow** — because negotiation happens across time. The same agent crew operates synchronously during the initial review and asynchronously during negotiation rounds, with the shared state persisting across both modes.

5. **Streaming UI over batch results** — because the user trusts what they can see. A 30-second loading screen produces anxiety. A 30-second show of agents reasoning produces confidence.

---

## 6. The Build Plan (24 Hours, Coding-Agent-Accelerated)

### 6.1 Why Coding Agents Are Critical

The v2.0 scope is genuinely larger than v1. Doing it manually in 24 hours would require trade-offs that compromise the demo. Doing it with Claude Code, Codex, or Cursor agents in parallel makes it tractable. The strategy is to use coding agents for **scaffolding, integration, and boilerplate**, while the human team focuses on **agent prompts, demo orchestration, and corpus curation** — the parts where AI assistance is least effective.

The coding-agent prompt (delivered as the second artifact alongside this review) is structured to enable this: well-bounded units of work, complete specifications, no hidden dependencies between components.

### 6.2 Team Roles (4 People)

| Role | Primary Responsibility | Coding Agent Usage |
|---|---|---|
| **Tech Lead** | Agent prompts, Chief Counsel logic, demo orchestration | Low — this is judgment work |
| **Backend Engineer** | API layer, negotiation state machine, email integration | High — let agents scaffold integrations |
| **Frontend Engineer** | UI, streaming views, agent card animations | High — let agents build component skeletons |
| **Domain Lead** | Corpora curation (rules, benchmarks, statutes), demo contract design | Medium — agents help format and validate |

### 6.3 Phase Breakdown

#### Phase 1 — Foundations (Hours 0–6)

| Task | Owner | Output |
|---|---|---|
| Repo + monorepo structure setup | Backend (via coding agent) | Working dev environment |
| Define shared state schema (Pydantic models for full v2.0 state) | Tech Lead | Locked schema across all phases |
| Curate 50 legal rules | Domain Lead | `legal_rules.json` |
| Curate 75 benchmark clauses across 3 contract types | Domain Lead | `benchmark_clauses.json` |
| Curate 30 Indian statutes | Domain Lead | `indian_statutes.json` |
| Skeleton FastAPI with `/analyze` and `/negotiate` endpoints | Backend (via agent) | Mock endpoints returning structured stubs |
| Skeleton React frontend with three views | Frontend (via agent) | Pages render with placeholder data |
| Embed corpora into Chroma at startup | Backend | Vector retrieval working end-to-end |

**Milestone:** End of hour 6 — corpora live, schema locked, frontend and backend communicate over SSE with mock data.

#### Phase 2 — Initial Review Pipeline (Hours 6–14)

| Task | Owner | Output |
|---|---|---|
| Scout agent (PDF/DOCX parsing, clause segmentation, classification) | Backend | Working scout returning structured clause list |
| Jurist agent (rules retrieval, per-clause verdict with citations) | Tech Lead | Verdicts grounded in corpus |
| Benchmarker agent (similarity retrieval, deviation scoring) | Tech Lead | Statistical comparisons working |
| Adversary agent (adversarial prompt, exploit generation) | Tech Lead | Exploit scenarios per flagged clause |
| Negotiator agent (rewrites, redline .docx, email draft) | Backend + Tech Lead | All three artifacts produced |
| Investigator agent (counterparty research, scoring) | Backend (via agent) | Counterparty profile (using mock/anonymized data for demo) |
| Chief Counsel — planning, routing, conflict reconciliation | Tech Lead | Orchestration working end-to-end |
| LangGraph wiring with parallel + conditional edges | Tech Lead | Full graph executable |
| Streaming SSE events emitted at each agent's completion | Backend (via agent) | Frontend receives progressive updates |
| Live agent card animations | Frontend (via agent) | UI fills in as agents complete |
| Per-clause inline highlights with expandable verdict drawer | Frontend (via agent) | User can click any clause for full analysis |

**Milestone:** End of hour 14 — initial contract review fully working with the streaming UI. Demo is functional minus negotiation.

#### Phase 3 — Negotiation Mode (Hours 14–20)

| Task | Owner | Output |
|---|---|---|
| Negotiation parameters UI (must-haves, walk-aways, authority slider) | Frontend (via agent) | Settings panel functional |
| Email integration layer (controlled environment for demo) | Backend (via agent) | Outbound emails sending, inbound being received |
| Negotiation state machine implementation | Backend + Tech Lead | State transitions working with persistence |
| Round-by-round re-analysis (Scout → Jurist → Benchmarker → Adversary on inbound emails) | Tech Lead | Same agents working on email content |
| Chief Counsel's negotiation strategy logic (auto-respond / escalate / close decision) | Tech Lead | Decision logic with clear escalation criteria |
| Negotiation timeline UI (round-by-round visualization) | Frontend (via agent) | Visual history of the negotiation |
| Escalation notification UI | Frontend (via agent) | User sees clear escalation cards with recommended actions |
| Demo-mode counterparty simulator (controlled "actor" sending replies) | Backend (via agent) | Reliable demo flow |

**Milestone:** End of hour 20 — full negotiation flow works end-to-end with the demo counterparty.

#### Phase 4 — Demo Hardening (Hours 20–24)

| Task | Owner | Output |
|---|---|---|
| Pre-cache demo contract review outputs as fallback | Tech Lead | System falls back to cache if live LLM call fails |
| Pre-record backup demo video | All | Insurance against catastrophic failure |
| Adversarial test pass on demo contract | All | All critical clauses correctly flagged |
| Demo script rehearsal (×5) | All | Smooth 90-second presentation |
| Slide deck refinement | All | Submission-ready |

**Milestone:** End of hour 24 — system is demo-ready, pitch is rehearsed, contingencies are in place.

### 6.4 Risk Management

| Risk | Mitigation |
|---|---|
| Live email integration fails during demo | Use a controlled email environment (Mailtrap or sandboxed SMTP) with a teammate playing the counterparty role |
| LLM API rate-limited or slow during demo | Pre-cached responses for the demo contract; SSE allows fallback to cache mid-stream |
| One coding agent's output conflicts with another's | Strong interface contracts defined in Phase 1; daily integration checkpoints |
| Counterparty intelligence requires real scraping that fails live | Use synthesized/anonymized counterparty profile data for the demo; full live scraping is V2 post-hackathon |
| Negotiation logic produces a response the team didn't anticipate during demo | Three pre-rehearsed counterparty replies are scripted; the demo doesn't go off-script |

---

## 7. The 90-Second Demo Script

The demo is the artifact that wins or loses the hackathon. Here is the script, beat by beat.

```
0:00 — Presenter holds up phone with a contract on screen.
       "This is Priya. Yesterday she got a freelance offer from a
        Bangalore startup. ₹4 lakh project. She has 24 hours to sign
        or lose the client. She doesn't have ₹20,000 to spend on a
        lawyer. So normally — she signs. Today, she opens Blindspot."

0:08 — Upload contract PDF. Select "Freelancer, ₹4L, Bangalore."
       Counterparty name auto-extracted from contract.

0:12 — Six agent cards appear on screen. Scout activates first.
       "14 clauses detected. Document type: freelance services
        agreement. 3 anomalies flagged."

0:18 — Investigator card lights up in parallel.
       "Counterparty: 'Acme Studios Pvt Ltd'. 2 prior disputes in
        court records. 4 recent Reddit complaints about IP grabs.
        Risk tier: CAUTION."
       (Audible reaction from the room.)

0:25 — Jurist and Benchmarker fill in parallel. Red highlights
       appear on Clauses 7, 11, and 14 in the contract view.

0:35 — Presenter clicks Clause 11.
       Side panel opens. Five agents stack their verdicts:
       - Jurist: "Overbroad IP assignment under Indian Copyright
         Act §17 proviso. Citation: rule LR-014."
       - Benchmarker: "3.2× stricter than 47 reference freelance
         contracts. Median assigns work-product only."
       - Adversary: "If invoked, they could claim ownership of
         Priya's GitHub commits from before the project started."
       - Investigator: "This counterparty has a documented history
         of invoking exactly this clause. Three complaints match
         this pattern."
       - Negotiator: "Suggested rewrite: [shown in the panel]."

0:50 — Presenter clicks "Negotiate" button.
       Settings panel opens. Presenter selects:
       - Must-have: No assignment of pre-existing IP
       - Walk-away: Total payment below ₹3.5L
       - Authority: Balanced
       - Counterparty email: (auto-filled)
       Clicks "Start Negotiation."

0:58 — Outbound email composed and sent. Negotiation timeline view
       activates. Round 1 logged.

1:05 — Inbound email lands (counterparty actor sends scripted reply).
       "We can adjust the IP clause to current project only, but
        we need to keep the 12-month non-compete."

1:08 — Agents re-evaluate on screen. Jurist flags non-compete as
       unenforceable under Indian Contract Act §27. Chief Counsel
       decides: AUTO-RESPOND.
       "The non-compete is legally void in India. We can accept
        it on paper because it can't be enforced anyway. Drafting
        acceptance with documented note."

1:18 — Outbound response composed and sent. Round 2 logged.

1:25 — Counterparty replies: "Agreed on all terms. Sending final
        contract."
       Chief Counsel: CLOSE DEAL.

1:32 — Final redlined contract download appears.

1:35 — Presenter to room: "Priya didn't spend ₹20,000.
        She didn't spend three days. She spent 90 seconds.
        And every claim you saw — every citation, every market
        comparison, every counterparty insight — she can verify.
        This is the law firm that fits in a tab."

1:45 — End. Stop talking. Let the room react.
```

---

## 8. Success Criteria

### 8.1 Hackathon-Stage Success

The project is successful at the hackathon stage if it demonstrably:

1. Processes a contract end-to-end (review + investigator + negotiation setup) in under 60 seconds
2. Conducts at least two complete negotiation rounds with a controlled counterparty during the live demo, with one round triggering an auto-response and one triggering an escalation
3. Shows visible inter-agent disagreement at least once, with Chief Counsel's reconciliation displayed
4. Produces a downloadable redlined contract that a non-lawyer can read and act on
5. Surfaces at least one Indian-law-specific finding (non-compete §27 is the easiest)
6. Survives the live demo without requiring the presenter to verbally compensate for system failures

### 8.2 Qualitative Indicators

- Three non-technical freelancers, given access to the system without onboarding, can complete a contract review and articulate the recommended changes
- A technical evaluator examining the system can audit any verdict by drilling into its evidence
- The hackathon presentation produces visible engagement from judges (questions, follow-ups, requests for the GitHub link)

### 8.3 What Winning Looks Like

Winning means: when judges deliberate after all teams have presented, the conversation begins with *"Did you see Blindspot?"* Not "the contract review tool" — *Blindspot*. The name sticks because the demo was unforgettable. That is the goal.

---

## 9. What This Is, Strategically

This is not a hackathon artifact. This is the first commit of a company.

The hackathon is a forcing function — a 24-hour window to build the proof that the architecture works, the demo that proves the vision, and the GitHub repository that opens the door to the next conversations: with investors who fund agentic AI startups, with the freelance-platform partnerships that scale distribution, with the legal-tech advisors who validate the rigor.

The post-hackathon trajectory:

- **Weeks 1–4:** Closed beta with 50 freelancers and founders sourced from the team's networks. Telemetry on agent accuracy, refinement of corpora based on real-world contracts, hardening of the negotiation flow.
- **Weeks 4–12:** Public beta. Email and Slack integrations. Expansion to employment agreements and rental contracts.
- **Months 3–6:** Paid tier launch. First B2B partnerships with freelance platforms (Upwork-equivalents in India, gig platforms, agency networks).
- **Months 6–12:** Multi-jurisdiction expansion. Multi-language support. Enterprise tier for small law firms using Blindspot as a first-pass review tool.

The win condition isn't the prize money. It's the trajectory.

---

## 10. Final Note

The original Blindspot was solid. The v2.0 Blindspot is dangerous to compete against. The difference is one architectural insight: **agents that act on the user's behalf are categorically different from agents that report to the user.** Every other team in the room will build a reporter. We build the actor.

Build the demo. Win the room.

*— End of Project Review —*
