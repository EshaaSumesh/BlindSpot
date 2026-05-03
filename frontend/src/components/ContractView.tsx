import { useState, useEffect, useMemo } from 'react'
import type { AgentStatuses } from './CrewView'

export interface Clause {
  id: string
  text: string
  clause_type: string
  section_header?: string
}

interface ContractViewProps {
  clauses: Clause[]
  agentStatuses: AgentStatuses
  documentText?: string
  negotiationStatus?: string
}

export default function ContractView({ clauses, agentStatuses, documentText, negotiationStatus }: ContractViewProps) {
  const [selectedClause, setSelectedClause] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const renderAnalysisSection = (title: string, data: any) => {
    if (!data) return null
    return (
      <div style={{ marginBottom: 32 }}>
        <h4 style={{ marginBottom: 12, color: 'var(--gold)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em' }}>{title}</h4>
        {showRaw ? (
          <pre className="code-block">
            {JSON.stringify(data, null, 2)}
          </pre>
        ) : (
          <div style={{ background: 'var(--ink)', padding: 16, border: '0.5px solid var(--border2)', borderRadius: 4 }}>
            {Array.isArray(data) ? (
              data.map((item, idx) => (
                <div key={idx} style={{ marginBottom: 16, paddingBottom: 12, borderBottom: idx < data.length - 1 ? '0.5px solid var(--border2)' : 'none' }}>
                  {typeof item === 'object' ? (
                    Object.entries(item).map(([k, v]) => (
                      <div key={k} style={{ marginBottom: 4, fontSize: '0.9rem' }}>
                        <span style={{ color: 'var(--text-dim)', fontWeight: 500, marginRight: 8, textTransform: 'capitalize' }}>{k.replace(/_/g, ' ')}:</span>
                        <span style={{ color: k === 'severity' && v === 'high' ? 'var(--red-flag)' : 'var(--text)' }}>{String(v)}</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: 'var(--text)' }}>{String(item)}</div>
                  )}
                </div>
              ))
            ) : (
              Object.entries(data).map(([key, val]) => (
                <div key={key} style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-dim)', fontWeight: 500, marginRight: 8, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}:</span>
                  <span style={{ color: 'var(--text)' }}>{String(val)}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    )
  }

  // Determine which visual effect to show
  const isScanning = Object.values(agentStatuses).some(agent => agent.status === 'working') || negotiationStatus === 'negotiating'
  const isScoutWorking = agentStatuses.scout?.status === 'working'
  const isOthersWorking = isScanning && !isScoutWorking && negotiationStatus !== 'closed'

  // Tokenize text for live reading effect
  const tokens = useMemo(() => {
    if (!documentText) return []
    return documentText.split(/(\s+)/)
  }, [documentText])

  const [readingIndices, setReadingIndices] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!isOthersWorking || tokens.length === 0) {
      setReadingIndices(new Set())
      return
    }

    const interval = setInterval(() => {
      const newIndices = new Set<number>()
      const numHighlights = Math.floor(Math.random() * 15) + 5 // 5-20 words at a time
      
      for (let i = 0; i < numHighlights; i++) {
        let index = Math.floor(Math.random() * tokens.length)
        if (tokens[index].trim() === '') {
          index = (index + 1) % tokens.length
        }
        newIndices.add(index)
      }
      setReadingIndices(newIndices)
    }, 300)

    return () => clearInterval(interval)
  }, [isOthersWorking, tokens])

  // Determine clause highlighting based on agent verdicts (for the sidebar)
  const getClauseStyle = (clauseId: string) => {
    const juristVerdict = agentStatuses.jurist?.jurist_verdicts?.[clauseId]
    const benchmarkScore = agentStatuses.benchmarker?.benchmark_scores?.[clauseId]

    if (juristVerdict?.verdict_label === 'predatory' || juristVerdict?.verdict_label === 'unenforceable') {
      return 'clause-item clause-predatory'
    }
    if (juristVerdict?.severity === 'high' || benchmarkScore?.verdict === 'outlier') {
      return 'clause-item clause-high-risk'
    }
    if (juristVerdict?.severity === 'medium' || benchmarkScore?.verdict === 'non_standard') {
      return 'clause-item clause-medium-risk'
    }
    return 'clause-item'
  }

  return (
    <div style={{ padding: 16, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 16, flex: 1, minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h2 style={{ marginBottom: 12 }}>Contract Document</h2>
          
          <div className="document-container" style={{ 
            flex: 1, 
            position: 'relative', 
            overflowY: 'auto', 
            background: 'var(--ink)', 
            border: '0.5px solid var(--border)',
            padding: '2rem',
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '0.95rem',
            color: 'var(--text-muted)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8
          }}>
            {!documentText ? 'Awaiting document extraction...' : (
              tokens.map((token, i) => (
                <span 
                  key={i} 
                  className={`doc-token ${readingIndices.has(i) ? 'reading' : ''}`}
                >
                  {token}
                </span>
              ))
            )}
            
            {isScoutWorking && (
              <div className="scanning-highlight" />
            )}
          </div>
        </div>

        <div style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ marginBottom: 12 }}>Analyzed Clauses</h2>
          <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border)', padding: 12, background: 'var(--ink)', borderRadius: 4 }}>
            {clauses.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Waiting for Scout to map the document structure...
              </div>
            ) : (
              clauses.map(clause => (
                <div
                  key={clause.id}
                  onClick={() => { setSelectedClause(clause.id); setDrawerOpen(true) }}
                  className={getClauseStyle(clause.id)}
                >
                  <strong style={{ color: 'var(--gold)', textTransform: 'uppercase', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                    {clause.clause_type.replace(/_/g, ' ')}
                  </strong>
                  <div style={{ marginTop: 6, fontSize: '0.85rem', lineHeight: 1.5 }}>
                    {clause.text.substring(0, 80)}...
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {drawerOpen && selectedClause && (
        <div className="clause-drawer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ margin: 0 }}>Clause Analysis</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <button 
                onClick={() => setShowRaw(!showRaw)}
                className="nav-cta"
                style={{ fontSize: '0.65rem', padding: '4px 10px' }}
              >
                {showRaw ? 'VIEW FORMATTED' : 'VIEW RAW JSON'}
              </button>
              <button 
                onClick={() => setDrawerOpen(false)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text)', fontSize: 24, cursor: 'pointer' }}
              >✕</button>
            </div>
          </div>

          <div style={{ marginBottom: 32 }}>
            <h4 style={{ color: 'var(--text-dim)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.1em' }}>Source Text</h4>
            <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.95rem', background: 'var(--ink3)', padding: 20, borderRadius: 4, borderLeft: '2px solid var(--gold)' }}>
              "{clauses.find(c => c.id === selectedClause)?.text}"
            </div>
          </div>

          {renderAnalysisSection("Jurist Verdict", agentStatuses.jurist?.jurist_verdicts?.[selectedClause])}
          {renderAnalysisSection("Benchmark Analysis", agentStatuses.benchmarker?.benchmark_scores?.[selectedClause])}
          {renderAnalysisSection("Risk Simulation (Adversary)", agentStatuses.adversary?.exploits?.[selectedClause])}
          {renderAnalysisSection("Proposed Modification", agentStatuses.negotiator?.rewrites?.[selectedClause])}
        </div>
      )}
    </div>
  )
}
