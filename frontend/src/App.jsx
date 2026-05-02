import React, { useState } from 'react';
import { Shield, Users, ArrowRightLeft, FileText, CheckCircle2, AlertTriangle, Scale, Activity } from 'lucide-react';
import './index.css';

const agents = [
  { id: 'scout', name: 'Scout', role: 'Document Mapping', icon: FileText, status: 'Completed', detail: '14 clauses detected. 3 anomalies.' },
  { id: 'jurist', name: 'Jurist', role: 'Legal Evaluation', icon: Scale, status: 'Analyzing Clause 7...', detail: 'Checking against Indian Contract Act', active: true },
  { id: 'benchmarker', name: 'Benchmarker', role: 'Market Comparison', icon: Activity, status: 'Waiting...', detail: '' },
  { id: 'adversary', name: 'Adversary', role: 'Red-Team Analysis', icon: AlertTriangle, status: 'Waiting...', detail: '' },
  { id: 'negotiator', name: 'Negotiator', role: 'Counter-Proposal', icon: ArrowRightLeft, status: 'Waiting...', detail: '' },
  { id: 'investigator', name: 'Investigator', role: 'Counterparty Intel', icon: Shield, status: 'Completed', detail: 'Risk Tier: CAUTION. 2 prior disputes.' },
];

function App() {
  const [negotiationMode, setNegotiationMode] = useState(false);

  return (
    <div className="app-container">
      {/* Contract View Pane */}
      <div className="pane contract-view">
        <h2 className="pane-title"><FileText size={20} /> Contract View</h2>
        <div className="contract-text">
          <p>This Freelance Agreement is made between Acme Studios Pvt Ltd and Priya...</p>
          <br/>
          <p>
            <strong>Clause 7: Non-Compete.</strong> 
            <span className="clause-risky" title="Click to view agent analysis"> The Contractor agrees not to engage in any similar software development work for a period of 12 months following the termination of this agreement.</span>
          </p>
          <br/>
          <p>
            <strong>Clause 11: Intellectual Property.</strong> 
            <span className="clause-risky" title="Click to view agent analysis"> The Contractor assigns all intellectual property rights, including those of pre-existing work and tools, to the Client upon signature.</span>
          </p>
          <br/>
          <p>
             <strong>Clause 14: Payment.</strong> Payment will be made within 90 days of project completion, subject to client satisfaction.
          </p>
        </div>
      </div>

      {/* Crew View Pane */}
      <div className="pane crew-view">
        <h2 className="pane-title"><Users size={20} /> The Crew</h2>
        <div className="agent-grid">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                {agent.active && <div className="agent-pulse"></div>}
                <agent.icon size={16} color={agent.active ? '#6366f1' : '#94a3b8'} />
                <span className="agent-name">{agent.name}</span>
              </div>
              <div className="agent-status" style={{ color: agent.active ? '#6366f1' : 'inherit' }}>
                {agent.status}
              </div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: '#94a3b8' }}>
                {agent.detail}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Shield size={16} color="#6366f1" />
            <strong style={{ fontSize: '0.9rem' }}>Chief Counsel Synthesis</strong>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
            Jurist flags Clause 7 as void under Indian Contract Act §27. Investigator notes counterparty history of IP grabs. Recommend full rewrite of Clause 11 and striking Clause 7.
          </p>
        </div>
      </div>

      {/* Negotiation View Pane */}
      <div className="pane negotiation-view">
        <h2 className="pane-title"><ArrowRightLeft size={20} /> Negotiation</h2>
        
        {!negotiationMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '1rem' }}>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Initial review complete. Ready to handle counter-offers on your behalf.</p>
            <button className="btn-primary" onClick={() => setNegotiationMode(true)}>
              Enter Live Negotiation Mode
            </button>
          </div>
        ) : (
          <div className="timeline">
            <div className="timeline-event">
              <div className="timeline-icon">
                <CheckCircle2 size={16} color="#10b981" />
              </div>
              <div className="timeline-content">
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Round 1 - Outbound</div>
                <div style={{ fontSize: '0.9rem' }}>Sent redlined contract and opening terms via email to counterparty.</div>
              </div>
            </div>
            
            <div className="timeline-event">
              <div className="timeline-icon">
                <AlertTriangle size={16} color="#f59e0b" />
              </div>
              <div className="timeline-content">
                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Round 2 - Inbound Reply</div>
                <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>"We can adjust the IP clause, but we must keep the 12-month non-compete."</div>
                <div style={{ fontSize: '0.8rem', color: '#6366f1', padding: '0.5rem', background: 'rgba(99,102,241,0.1)', borderRadius: '4px' }}>
                  <strong>Chief Counsel:</strong> Auto-responding. Non-compete is legally void anyway. Accepting to close deal.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
