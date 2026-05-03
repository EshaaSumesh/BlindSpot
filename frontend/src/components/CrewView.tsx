export interface AgentStatuses {
  [key: string]: {
    status: 'idle' | 'working' | 'complete' | 'error'
    mode?: string
    summary?: string
    [key: string]: any
  }
}

const AgentIcon = ({ type, color, isActive }: { type: string, color: string, isActive: boolean }) => {
  const stroke = isActive ? color : 'var(--text-dim)';
  
  const icons: Record<string, React.ReactNode> = {
    scout: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    ),
    investigator: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
    jurist: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <path d="M9 15h6"></path>
        <path d="M9 11h6"></path>
        <circle cx="12" cy="17" r="2"></circle>
      </svg>
    ),
    benchmarker: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6l3 12h12l3-12"></path>
        <path d="M12 3v18"></path>
        <path d="M3 21h18"></path>
      </svg>
    ),
    adversary: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        <circle cx="12" cy="12" r="3"></circle>
      </svg>
    ),
    negotiator: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
    ),
    chief_counsel: (
      <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 15v4"></path>
        <path d="M18 15v4"></path>
        <path d="M3 15h18"></path>
        <path d="M12 3v12"></path>
        <path d="M7 3h10"></path>
      </svg>
    )
  };
  
  return icons[type] || null;
}

const agentConfig: Record<string, { name: string; type: string; color: string }> = {
  scout: { name: 'Scout', type: 'scout', color: '#2196f3' },
  investigator: { name: 'Investigator', type: 'investigator', color: '#9c27b0' },
  jurist: { name: 'Jurist', type: 'jurist', color: '#4169E1' }, // Royal Blue for Jurist
  benchmarker: { name: 'Benchmarker', type: 'benchmarker', color: '#4caf50' },
  adversary: { name: 'Adversary', type: 'adversary', color: '#ff4444' }, // Sharper red for Adversary
  negotiator: { name: 'Negotiator', type: 'negotiator', color: '#00bcd4' },
  chief_counsel: { name: 'Chief Counsel', type: 'chief_counsel', color: '#C9A84C' }, // Gold for Chief
}

interface CrewViewProps {
  agentStatuses: AgentStatuses
}

export default function CrewView({ agentStatuses }: CrewViewProps) {
  const agentOrder = ['scout', 'investigator', 'jurist', 'benchmarker', 'adversary', 'negotiator', 'chief_counsel'];
  
  // Find the index of the first agent that is not complete
  const currentIndex = agentOrder.findIndex(id => agentStatuses[id]?.status !== 'complete');
  
  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ fontSize: '1rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 24 }}>The Legal Crew</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {agentOrder.map((id, index) => {
          const config = agentConfig[id]
          const status = agentStatuses[id]
          const isActive = status?.status === 'working'
          const isComplete = status?.status === 'complete'
          const isUpNext = index === currentIndex && !isActive && !isComplete;
          const isQueued = index > currentIndex;
          const isAdversary = id === 'adversary'

          let statusLabel = 'IDLE';
          if (isComplete) statusLabel = 'COMPLETE';
          else if (isActive) statusLabel = 'WORKING';
          else if (isUpNext) statusLabel = 'UP NEXT';
          else if (isQueued) statusLabel = 'QUEUED';

          return (
            <div
              key={id}
              className={`agent-card ${status?.status || (isUpNext ? 'up-next' : 'idle')}`}
              style={{
                opacity: (isActive || isComplete || isUpNext) ? 1 : 0.25,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                border: isAdversary ? `1px solid ${isActive ? '#ff4444' : 'rgba(255, 68, 68, 0.4)'}` : 
                        isUpNext ? '1px dashed var(--gold)' : undefined,
                boxShadow: isAdversary && isActive ? '0 0 20px rgba(255, 68, 68, 0.5)' : 
                           isUpNext ? '0 0 10px rgba(201, 168, 76, 0.2)' : 'none',
                background: isAdversary ? 'rgba(255, 68, 68, 0.1)' : 
                            isUpNext ? 'rgba(201, 168, 76, 0.05)' : undefined
              }}
            >
              {/* Sleek Minimalist Icon */}
              <div style={{ 
                marginBottom: '1rem', 
                width: '60px', 
                height: '60px', 
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem',
                border: `1px solid ${isActive || isUpNext ? config.color : 'var(--border2)'}`,
                borderRadius: '4px',
                background: isActive ? `${config.color}11` : isAdversary ? 'rgba(255, 68, 68, 0.15)' : 'transparent',
                transition: 'all 0.3s',
                boxShadow: isAdversary ? `0 0 10px ${isActive ? '#ff4444aa' : '#ff444433'}` : 'none'
              }}>
                <AgentIcon type={config.type} color={config.color} isActive={isActive || isComplete || isUpNext} />
              </div>
              <strong className="agent-name" style={{ 
                fontSize: '1rem', 
                color: isAdversary ? '#ffffff' : isUpNext ? 'var(--gold)' : 'var(--text)',
                textShadow: isAdversary ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
              }}>
                {config.name}
              </strong>
              
              <div style={{ 
                fontSize: '0.6rem', 
                marginTop: 6, 
                color: isActive ? config.color : isUpNext ? 'var(--gold)' : 'var(--text-dim)',
                letterSpacing: '0.1em',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                {status?.mode || statusLabel}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
