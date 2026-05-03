import { useState, useEffect } from 'react'
import LiveInbox from './LiveInbox'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'

type NegotiationState = 'idle' | 'starting' | 'negotiating' | 'closed' | 'error'

interface TimelineEvent {
  id: number
  event: string
  data: any
  timestamp: Date
}

interface EmailMessage {
  id: string
  from: string
  to: string
  subject: string
  body: string
  timestamp: Date
  type: 'inbound' | 'outbound'
}

interface NegotiationViewProps {
  analysisId?: string | null
  status: NegotiationState
  setStatus: (s: NegotiationState) => void
}

export default function NegotiationView({ analysisId, status, setStatus }: NegotiationViewProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [emails, setEmails] = useState<EmailMessage[]>([])
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null)
  const [negotiationId, setNegotiationId] = useState<string | null>(null)

  const startNegotiation = async () => {
    try {
      setStatus('starting')
      const res = await fetch(`${apiBaseUrl}/api/v1/negotiate/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strategy: 'balanced', analysis_id: analysisId || 'demo' })
      })
      if (!res.ok) throw new Error('Failed to start')
      const data = await res.json()
      setNegotiationId(data.negotiation_id)
      setStatus('negotiating')
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }

  const createEmailFromEvent = (evType: string, data: any): EmailMessage => {
    const isOutbound = evType === 'outbound_sent';
    return {
      id: `em_${Math.random().toString(36).substr(2, 9)}`,
      from: isOutbound ? "Blindspot AI Counsel" : "Acme Studios (Legal Dept)",
      to: isOutbound ? "legal@acmestudios.com" : "Priya (via Blindspot)",
      subject: isOutbound ? "Counter-Proposal: Freelance Agreement - Priya" : "RE: Counter-Proposal: Freelance Agreement - Priya",
      body: data.message || (data.decision === 'close' ? "Deal closed. All terms accepted." : "Processing..."),
      timestamp: new Date(),
      type: isOutbound ? 'outbound' : 'inbound'
    };
  }

  useEffect(() => {
    if (status !== 'negotiating' || !negotiationId) return

    const eventSource = new EventSource(`${apiBaseUrl}/api/v1/negotiate/${negotiationId}/stream`)
    
    eventSource.addEventListener('outbound_sent', (e) => {
        const data = JSON.parse((e as MessageEvent).data)
        setEvents(prev => [...prev, { id: Date.now() + Math.random(), event: 'outbound_sent', data, timestamp: new Date() }])
        const newEmail = createEmailFromEvent('outbound_sent', data);
        setEmails(prev => [newEmail, ...prev]);
        setSelectedEmailId(newEmail.id);
    })

    eventSource.addEventListener('inbound_received', (e) => {
        const data = JSON.parse((e as MessageEvent).data)
        setEvents(prev => [...prev, { id: Date.now() + Math.random(), event: 'inbound_received', data, timestamp: new Date() }])
        const newEmail = createEmailFromEvent('inbound_received', data);
        setEmails(prev => [newEmail, ...prev]);
        setSelectedEmailId(newEmail.id);
    })

    eventSource.addEventListener('decision', (e) => {
        const data = JSON.parse((e as MessageEvent).data)
        setEvents(prev => [...prev, { id: Date.now() + Math.random(), event: 'decision', data, timestamp: new Date() }])
        if (data.decision === 'close') {
            const finalEmail: EmailMessage = {
              id: `em_final_${Date.now()}`,
              from: "Blindspot AI Counsel",
              to: "User",
              subject: "✅ NEGOTIATION COMPLETE: Final Terms Secured",
              body: `The negotiation for your agreement is complete.\n\nAll critical terms have been successfully resolved. We have replaced the high-risk language in the original draft with secured, balanced provisions.\n\nKEY REDLINES SECURED:\n- Liability: Capped at total contract value (Original: Uncapped).\n- IP: Restricted to project-specific deliverables (Original: Full life-time grab).\n- Termination: 30-day notice period added (Original: Verbal immediate).\n\nThe final execution copy (PDF) is attached to this email and ready for your signature.`,
              timestamp: new Date(),
              type: 'outbound'
            };
            setEmails(prev => [finalEmail, ...prev]);
            setSelectedEmailId(finalEmail.id);
            setStatus('closed')
            eventSource.close()
        }
    })

    eventSource.onerror = () => {
        eventSource.close()
    }

    return () => {
      eventSource.close()
    }
  }, [status, negotiationId])

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Autonomous Negotiation</h2>
        {status !== 'idle' && (
          <div className={`status-pill ${status === 'closed' ? 'closed' : ''}`}>
            Status: {status.toUpperCase()}
          </div>
        )}
      </div>
      
      {status === 'idle' || status === 'error' ? (
        <div style={{ marginTop: 20, background: 'var(--ink2)', padding: '24px', border: '0.5px solid var(--border)', borderRadius: '4px' }}>
          <div style={{ color: 'var(--gold)', fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Ready for Execution</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>The Chief Counsel has synthesized a negotiation strategy. The autonomous agents will now engage directly with the counterparty legal team via the sandboxed email interface.</p>
          <button 
            className="btn-primary"
            onClick={startNegotiation}
            style={{ marginTop: 24, width: '100%' }}
          >
            Launch Autonomous Negotiation
          </button>
          {status === 'error' && <p style={{color:'var(--red-flag)', marginTop:10, fontSize: '0.8rem'}}>Failed to start. Please try again.</p>}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, minHeight: 0 }}>
            <LiveInbox 
              emails={emails} 
              selectedEmailId={selectedEmailId} 
              onSelectEmail={setSelectedEmailId} 
            />
          </div>

          {status === 'closed' && (
            <div style={{ marginTop: 20, background: 'var(--green-ok)', color: '#fff', padding: '16px', borderRadius: '4px', textAlign: 'center', animation: 'pulse-gold 2s infinite' }}>
              <strong style={{ display: 'block', marginBottom: 4 }}>DEAL CLOSED</strong>
              <span style={{ fontSize: '0.85rem' }}>Counterparty has accepted all terms. The final execution copy is ready.</span>
            </div>
          )}

          {status === 'negotiating' && (
            <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12, color: 'var(--text-dim)', fontSize: '0.8rem', padding: '12px', border: '0.5px solid var(--border2)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="t-cursor" style={{ width: 6, height: 12 }} />
              <span>Agents are currently re-evaluating inbound counter-proposals...</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
