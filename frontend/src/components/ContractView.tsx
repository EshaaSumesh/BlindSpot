import { useState } from 'react'
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
}

export default function ContractView({ clauses, agentStatuses }: ContractViewProps) {
  const [selectedClause, setSelectedClause] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Determine clause highlighting based on agent verdicts
  const getClauseStyle = (clauseId: string) => {
    const juristVerdict = agentStatuses.jurist?.jurist_verdicts?.[clauseId]
    const benchmarkScore = agentStatuses.benchmarker?.benchmark_scores?.[clauseId]

    if (juristVerdict?.verdict_label === 'predatory' || juristVerdict?.verdict_label === 'unenforceable') {
      return { backgroundColor: '#ffebee', border: '2px solid #f44336' } // Red
    }
    if (juristVerdict?.severity === 'high' || benchmarkScore?.verdict === 'outlier') {
      return { backgroundColor: '#fff3e0', border: '2px solid #ff9800' } // Orange
    }
    if (juristVerdict?.severity === 'medium' || benchmarkScore?.verdict === 'non_standard') {
      return { backgroundColor: '#fffde7', border: '2px solid #ffeb3b' } // Yellow
    }
    return { backgroundColor: '#fff', border: '1px solid #ccc' }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Contract View</h2>
      {clauses.map(clause => (
        <div
          key={clause.id}
          onClick={() => { setSelectedClause(clause.id); setDrawerOpen(true) }}
          style={{
            padding: 12,
            margin: 6,
            borderRadius: 4,
            cursor: 'pointer',
            ...getClauseStyle(clause.id)
          }}
        >
          <strong>{clause.clause_type}</strong>: {clause.text.substring(0, 80)}...
        </div>
      ))}

      {drawerOpen && selectedClause && (
        <div style={{
          position: 'fixed', right: 0, top: 0, width: '30%', height: '100vh',
          backgroundColor: '#f5f5f5', padding: 20, overflowY: 'auto',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
        }}>
          <button onClick={() => setDrawerOpen(false)} style={{ float: 'right' }}>✕</button>
          <h3>Clause Analysis: {selectedClause}</h3>

          <h4>Jurist Verdict</h4>
          <pre style={{ fontSize: 11, backgroundColor: '#fff', padding: 8 }}>
            {JSON.stringify(agentStatuses.jurist?.jurist_verdicts?.[selectedClause], null, 2)}
          </pre>

          <h4>Benchmark Score</h4>
          <pre style={{ fontSize: 11, backgroundColor: '#fff', padding: 8 }}>
            {JSON.stringify(agentStatuses.benchmarker?.benchmark_scores?.[selectedClause], null, 2)}
          </pre>

          <h4>Exploit Scenarios</h4>
          <pre style={{ fontSize: 11, backgroundColor: '#fff', padding: 8 }}>
            {JSON.stringify(agentStatuses.adversary?.exploits?.[selectedClause], null, 2)}
          </pre>

          <h4>Proposed Rewrite</h4>
          <pre style={{ fontSize: 11, backgroundColor: '#fff', padding: 8 }}>
            {JSON.stringify(agentStatuses.negotiator?.rewrites?.[selectedClause], null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
