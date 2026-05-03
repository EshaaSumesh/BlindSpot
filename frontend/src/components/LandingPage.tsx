import React from 'react';

interface LandingPageProps {
  handleUpload: (file: File) => void;
  streamStatus: string;
  errorMessage: string | null;
}

export default function LandingPage({ handleUpload, streamStatus, errorMessage }: LandingPageProps) {
  return (
    <>
      {/* NAV */}
      <nav>
        <div className="nav-logo">Blind<span>spot</span></div>
        <div className="nav-links">
          <a href="#problem">Problem</a>
          <a href="#agents">How It Works</a>
          <a href="#negotiation">Negotiation</a>
          <a href="#positioning">Why Blindspot</a>
          <label className="nav-cta" style={{ cursor: 'pointer' }}>
            Try it now
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-rule">
          <div className="hero-rule-line"></div>
          <div className="hero-rule-text">Autonomous Legal Counsel · India's First</div>
        </div>
        <h1 className="hero-heading">
          Other tools tell you<br/>what's wrong.<br/><em>Blindspot fights for you.</em>
        </h1>
        <p className="hero-subhead">
          Upload a contract. Set your terms. Watch six AI specialists <strong>review, negotiate, and close</strong> on your behalf — grounded in Indian law, verified by real data, visible in real time.
        </p>

        {streamStatus === 'error' && (
          <div style={{ padding: '1rem', background: 'rgba(201,64,64,0.1)', color: 'var(--red-flag)', border: '0.5px solid rgba(201,64,64,0.3)', marginBottom: '2rem', maxWidth: '580px' }}>
            Error: {errorMessage || 'Connection failed. Please try again.'}
          </div>
        )}

        <div className="hero-actions">
          <label className="btn-primary">
            Try it now - upload the contract now
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
          <a href="#agents" className="btn-ghost">See How It Works</a>
        </div>
        <div className="hero-stats">
          <div>
            <div className="hero-stat-num">6</div>
            <div className="hero-stat-label">Specialist AI agents</div>
          </div>
          <div>
            <div className="hero-stat-num">90s</div>
            <div className="hero-stat-label">Full contract review</div>
          </div>
          <div>
            <div className="hero-stat-num">₹0</div>
            <div className="hero-stat-label">Legal fees to start</div>
          </div>
          <div>
            <div className="hero-stat-num">IND</div>
            <div className="hero-stat-label">Indian-jurisdiction native</div>
          </div>
        </div>
      </section>

      {/* FEATURE STRIP */}
      <div className="feature-strip">
        <div className="feature-item"><div className="feature-dot"></div><div className="feature-text">Grounded in Indian statutes</div></div>
        <div className="feature-item"><div className="feature-dot"></div><div className="feature-text">No hallucinated case law</div></div>
        <div className="feature-item"><div className="feature-dot"></div><div className="feature-text">Counterparty intelligence</div></div>
        <div className="feature-item"><div className="feature-dot"></div><div className="feature-text">Live negotiation over email</div></div>
        <div className="feature-item"><div className="feature-dot"></div><div className="feature-text">Redlined .docx output</div></div>
        <div className="feature-item"><div className="feature-dot"></div><div className="feature-text">Visible agent reasoning</div></div>
        <div className="feature-item"><div className="feature-dot"></div><div className="feature-text">Escalate only when needed</div></div>
      </div>

      {/* PROBLEM */}
      <section className="problem" id="problem">
        <div className="section-eyebrow">
          <div className="section-eyebrow-line"></div>
          <div className="section-eyebrow-text">The Problem</div>
        </div>
        <h2 className="section-heading">A ₹3 lakh contract. A ₹20,000 lawyer. The math doesn't work.</h2>
        <div className="problem-grid">
          <div>
            <p className="problem-quote">
              "He didn't read the contract. He couldn't afford to. Six months later, Clause 11 claimed his entire codebase."
            </p>
            <p className="section-body">
              India has fifteen million freelancers. Each one signs contracts drafted by counterparties with in-house legal teams. None of them have the same protection. Existing tools are either inaccessible, dangerously incorrect, or simply not enough.
            </p>
          </div>
          <div>
            <table className="problem-table">
              <thead>
                <tr>
                  <th>Approach</th>
                  <th>Why it fails</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ChatGPT / Gemini</td>
                  <td>Hallucinates case law. Users have signed contracts based on fabricated legal advice.</td>
                </tr>
                <tr>
                  <td>LawGeex / Harvey</td>
                  <td>$200–$1,000/mo. Built for US law. Misapplies Delaware principles to Indian contracts.</td>
                </tr>
                <tr>
                  <td>Template sites</td>
                  <td>Teach you what a fair contract looks like. Leave you defenceless against an unfair one.</td>
                </tr>
                <tr>
                  <td>Upload-PDF AI tools</td>
                  <td>Reassuring summaries. No citations. "No issues found" mistaken for safety.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* AGENTS */}
      <section className="agents" id="agents">
        <div className="agents-intro">
          <div>
            <div className="section-eyebrow">
              <div className="section-eyebrow-line"></div>
              <div className="section-eyebrow-text">The Crew</div>
            </div>
            <h2 className="section-heading">Six specialists. One coordinated team.</h2>
          </div>
          <p className="section-body">
            A real legal review is not a pipeline — it is a coordinated team operating over time. Blindspot models this directly. Each agent has a narrow role, its own toolset, and a specific failure mode the others compensate for.
          </p>
        </div>
        <div className="agents-grid">
          <div className="agent-card">
            <div className="agent-num">01 / Scout</div>
            <div className="agent-name">Document Mapping</div>
            <div className="agent-role">Structural Preprocessor</div>
            <div className="agent-desc">Reads the contract, identifies its type, and produces a structured clause map with confidence scores. Every downstream agent works from this foundation.</div>
          </div>
          <div className="agent-card">
            <div className="agent-num">02 / Jurist</div>
            <div className="agent-name">Legal Evaluation</div>
            <div className="agent-role">Indian Statutes & Case Law</div>
            <div className="agent-desc">Per-clause legal verdict against the curated rules corpus. Cannot generate citations freely — only cites entries surfaced by the retrieval layer. No hallucination by design.</div>
          </div>
          <div className="agent-card">
            <div className="agent-num">03 / Benchmarker</div>
            <div className="agent-name">Market Comparison</div>
            <div className="agent-role">Statistical Deviation Analysis</div>
            <div className="agent-desc">Statistical and semantic comparison of each clause against 75+ reference contracts. Produces deviation scores so predatory clauses can't hide behind "standard practice."</div>
          </div>
          <div className="agent-card">
            <div className="agent-num">04 / Adversary</div>
            <div className="agent-name">Red-Team Interpretation</div>
            <div className="agent-role">Worst-Case Exploitation</div>
            <div className="agent-desc">Roleplays as the counterparty's counsel. For each flagged clause, generates concrete exploit scenarios — how it could be invoked to harm you specifically.</div>
          </div>
          <div className="agent-card">
            <div className="agent-num">05 / Negotiator</div>
            <div className="agent-name">Counter-Proposal Drafting</div>
            <div className="agent-role">Rewrites, Redlines & Emails</div>
            <div className="agent-desc">Synthesises all prior agents' outputs into per-clause rewrites, a redlined .docx, and ready-to-send negotiation emails. Analysis becomes action.</div>
          </div>
          <div className="agent-card">
            <div className="agent-num">06 / Chief Counsel</div>
            <div className="agent-name">Orchestration & Synthesis</div>
            <div className="agent-role">Planner · Router · Reconciler</div>
            <div className="agent-desc">Plans the crew's work, routes between agents, surfaces inter-agent disagreements explicitly, and decides in each negotiation round whether to respond autonomously or escalate to you.</div>
          </div>
        </div>
      </section>

      {/* NEGOTIATION */}
      <section className="negotiation" id="negotiation">
        <div className="section-eyebrow">
          <div className="section-eyebrow-line"></div>
          <div className="section-eyebrow-text">Live Negotiation Mode</div>
        </div>
        <h2 className="section-heading">The crew that reviews your contract is the crew that negotiates it.</h2>
        <div className="neg-layout">
          <div className="neg-steps">
            <div className="neg-step">
              <div className="neg-step-num">01</div>
              <div>
                <div className="neg-step-title">Set your parameters</div>
                <div className="neg-step-desc">Define must-haves, walk-away points, concession authority, and how aggressively the agent should push. One decision up front. No further involvement until needed.</div>
              </div>
            </div>
            <div className="neg-step">
              <div className="neg-step-num">02</div>
              <div>
                <div className="neg-step-title">Opening move sent automatically</div>
                <div className="neg-step-desc">The redlined contract and negotiation email are dispatched to the counterparty. The same output that was previously the endpoint is now the opening shot.</div>
              </div>
            </div>
            <div className="neg-step">
              <div className="neg-step-num">03</div>
              <div>
                <div className="neg-step-title">Inbound reply — agents re-evaluate</div>
                <div className="neg-step-desc">Their counter-offer is parsed, classified by intent, and evaluated against your original analysis. Jurist checks new language. Benchmarker checks market norms. Adversary checks for traps.</div>
              </div>
            </div>
            <div className="neg-step">
              <div className="neg-step-num">04</div>
              <div>
                <div className="neg-step-title">Chief Counsel decides the next move</div>
                <div className="neg-step-desc">Auto-respond if within your authority. Escalate to you if a walk-away point is hit. Close the deal if all terms are acceptable. The loop runs until the deal is done.</div>
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div>
            <div className="terminal">
              <div className="terminal-bar">
                <div className="terminal-dot" style={{ background: '#C94040' }}></div>
                <div className="terminal-dot" style={{ background: '#C9A84C' }}></div>
                <div className="terminal-dot" style={{ background: '#3A8A5A' }}></div>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>blindspot · negotiation · round 2</span>
              </div>
              <div className="terminal-body">
                <div className="t-line"><span className="t-ts">0:00</span><span className="t-agent">scout</span><span className="t-msg">Inbound email parsed. Intent: counter-offer.</span></div>
                <div className="t-line"><span className="t-ts">0:02</span><span className="t-agent">jurist</span><span className="t-msg">New clause 4b evaluated...</span></div>
                <div className="t-line"><span className="t-ts">0:03</span><span className="t-agent">jurist</span><span className="t-flag">Non-compete clause — void under §27 Indian Contract Act.</span></div>
                <div className="t-line"><span className="t-ts">0:04</span><span className="t-agent">benchmkr</span><span className="t-msg">IP assignment scope: 3.2× stricter than 47 refs.</span></div>
                <div className="t-line"><span className="t-ts">0:05</span><span className="t-agent">adversary</span><span className="t-flag">Clause 11 could claim pre-existing GitHub work.</span></div>
                <div className="t-separator"></div>
                <div className="t-line"><span className="t-ts">0:06</span><span className="t-agent">chief</span><span className="t-ok">DECISION: AUTO-RESPOND</span></div>
                <div className="t-line"><span className="t-ts">0:06</span><span className="t-agent">chief</span><span className="t-msg">Non-compete is unenforceable. Accept on paper. Note added.</span></div>
                <div className="t-line"><span className="t-ts">0:07</span><span className="t-agent">negotiat</span><span className="t-msg">Response drafted. IP scope rewritten to current project only.</span></div>
                <div className="t-line"><span className="t-ts">0:08</span><span className="t-system">Email sent. Round 2 logged. Awaiting counterparty...</span></div>
                <div className="t-line"><span className="t-ts"></span><span className="t-msg"></span><span className="t-cursor"></span></div>
              </div>
            </div>

            {/* Counterparty trust badge */}
            <div className="trust-badge" style={{ marginTop: '1.5rem' }}>
              <div className="trust-header">
                <div className="trust-company">Acme Studios Pvt Ltd</div>
                <div className="trust-tier">Caution</div>
              </div>
              <div className="trust-row">
                <span className="trust-row-label">Risk score</span>
                <span className="trust-row-val bad">72 / 100</span>
              </div>
              <div className="trust-row">
                <span className="trust-row-label">Court records (Indian Kanoon)</span>
                <span className="trust-row-val bad">2 disputes found</span>
              </div>
              <div className="trust-row">
                <span className="trust-row-label">MCA registration status</span>
                <span className="trust-row-val ok">Active</span>
              </div>
              <div className="trust-row">
                <span className="trust-row-label">Public complaint signals</span>
                <span className="trust-row-val bad">4 Reddit threads — IP grabs</span>
              </div>
              <div className="trust-findings">
                <div className="trust-finding-title">Pattern flags</div>
                <div className="trust-finding-item">Documented history of invoking broad IP assignment clauses against contractors.</div>
                <div className="trust-finding-item">Three prior complaints match current clause 11 pattern exactly.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* POSITIONING */}
      <section className="positioning" id="positioning">
        <div className="section-eyebrow">
          <div className="section-eyebrow-line"></div>
          <div className="section-eyebrow-text">Why Blindspot</div>
        </div>
        <h2 className="section-heading">Every position we take. Every tool we beat.</h2>
        <div className="pos-grid">
          <div className="pos-card">
            <div className="pos-label">Position</div>
            <div className="pos-value">Autonomous legal agent, not a reporting tool</div>
            <div className="pos-beat">Every existing competitor stops at the diagnosis. Blindspot acts on it — negotiating, responding, closing.</div>
          </div>
          <div className="pos-card">
            <div className="pos-label">Position</div>
            <div className="pos-value">Counterparty-aware, not document-only</div>
            <div className="pos-beat">Review tools ignore who sent the contract. Blindspot investigates them before it reads a single clause.</div>
          </div>
          <div className="pos-card">
            <div className="pos-label">Position</div>
            <div className="pos-value">Indian-jurisdiction native</div>
            <div className="pos-beat">US-trained tools misapply Delaware principles to Indian contracts. Blindspot knows §27 ICA, Indian Copyright Act §17, Indian evidence rules.</div>
          </div>
          <div className="pos-card">
            <div className="pos-label">Position</div>
            <div className="pos-value">Grounded reasoning, no hallucination</div>
            <div className="pos-beat">No free-form citation generation. Every verdict cites only corpus entries surfaced by the retrieval layer. Auditable by design.</div>
          </div>
          <div className="pos-card">
            <div className="pos-label">Position</div>
            <div className="pos-value">Visible inter-agent disagreement</div>
            <div className="pos-beat">When Jurist says "legally valid" and Benchmarker says "appears in 3 of 75 contracts", Chief Counsel reconciles — out loud, on screen.</div>
          </div>
          <div className="pos-card">
            <div className="pos-label">Position</div>
            <div className="pos-value">Built for the fifteen million</div>
            <div className="pos-beat">Not enterprise pricing. Not US law. Not a wrapper. Built specifically for India's freelancers, founders, and small operators who have been defenceless — until now.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section" id="cta">
        <div className="section-eyebrow" style={{ justifyContent: 'center' }}>
          <div className="section-eyebrow-line"></div>
          <div className="section-eyebrow-text">Try It Now</div>
          <div className="section-eyebrow-line"></div>
        </div>
        <h2 className="cta-heading">The law firm<br/>that fits <em>in a tab.</em></h2>
        <p className="cta-sub">Upload your contract and watch six AI specialists review, defend, and negotiate your terms autonomously.</p>
        <div className="cta-actions">
          <label className="btn-primary">
            Upload the contract now
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
              style={{ display: 'none' }}
            />
          </label>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo">Blind<span>spot</span></div>
        <div className="footer-copy">© 2026 Blindspot · Autonomous Legal Counsel</div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">GitHub</a>
        </div>
      </footer>
    </>
  );
}
