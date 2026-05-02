export interface AgentStatuses {
  [key: string]: {
    status: 'idle' | 'working' | 'complete' | 'error'
    mode?: string
    summary?: string
    [key: string]: any
  }
}

const agentConfig: Record<string, { name: string; icon: string; color: string }> = {
  scout: { name: 'Scout', icon: '🔍', color: '#2196f3' },
  investigator: { name: 'Investigator', icon: '🕵️', color: '#9c27b0' },
  jurist: { name: 'Jurist', icon: '⚖️', color: '#f44336' },
  benchmarker: { name: 'Benchmarker', icon: '📊', color: '#4caf50' },
  adversary: { name: 'Adversary', icon: '⚔️', color: '#ff9800' },
  negotiator: { name: 'Negotiator', icon: '✉️', color: '#00bcd4' },
  chief_counsel: { name: 'Chief Counsel', icon: '👔', color: '#795548' },
}

interface CrewViewProps {
  agentStatuses: AgentStatuses
}

export default function CrewView({ agentStatuses }: CrewViewProps) {
  return (
    <div style={{ padding: 16 }}>
      <h2>Crew View</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {Object.entries(agentConfig).map(([id, config]) => {
          const status = agentStatuses[id]
          const isActive = status?.status === 'working'
          const isComplete = status?.status === 'complete'

          return (
            <div
              key={id}
              style={{
                padding: 12,
                border: `2px solid ${isComplete ? '#4caf50' : isActive ? config.color : '#ccc'}`,
                borderRadius: 8,
                backgroundColor: isComplete ? '#e8f5e9' : isActive ? '#e3f2fd' : '#fff',
                transition: 'all 0.3s ease',
                opacity: status ? 1 : 0.5
              }}
            >
              <div style={{ fontSize: 24, animation: isActive ? 'pulse 1s infinite' : 'none' }}>
                {config.icon}
              </div>
              <strong>{config.name}</strong>
              {status?.mode && (
                <div style={{ fontSize: 10, color: '#666' }}>{status.mode}</div>
              )}
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {status?.status || 'idle'}
              </div>
              {status?.summary && (
                <div style={{ fontSize: 11, marginTop: 4, color: '#333' }}>
                  {status.summary}
                </div>
              )}
              {status?.clauses_flagged && (
                <div style={{ fontSize: 10, color: '#666', marginTop: 2 }}>
                  {status.clauses_flagged} flagged
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
