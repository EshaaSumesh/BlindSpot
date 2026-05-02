import { useState } from 'react'
import type { Clause } from './components/ContractView'
import ContractView from './components/ContractView'
import CrewView from './components/CrewView'
import NegotiationView from './components/NegotiationView'
import type { AgentStatuses } from './components/CrewView'

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'analyzing' | 'complete'>('upload')
  const [agentStatuses, setAgentStatuses] = useState<AgentStatuses>({})
  const [clauses, setClauses] = useState<Clause[]>([])
  const [streamStatus, setStreamStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle')

  const handleUpload = async (file: File) => {
    setCurrentView('analyzing')
    setStreamStatus('streaming')
    setAgentStatuses({})

    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify({
      role: 'freelancer',
      deal_context: { size: 400000, location: 'Bangalore', currency: 'INR' },
      counterparty_info: { name: 'Acme Studios', email: 'contact@acme.com' }
    }))

    // Use fetch with streaming
    try {
      const response = await fetch('/api/v1/analyze', {
        method: 'POST',
        body: formData,
      })

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        let eventType = ''
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            try {
              const data = JSON.parse(dataStr)
              handleSSEEvent(eventType, data)
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      }

      setStreamStatus('done')
      setCurrentView('complete')

    } catch (error) {
      console.error('SSE Error:', error)
      setStreamStatus('error')
    }
  }

  const handleSSEEvent = (eventType: string, data: any) => {
    switch (eventType) {
      case 'scout_complete':
        setAgentStatuses(prev => ({ ...prev, scout: { status: 'complete', ...data } }))
        if (data.clauses) {
          setClauses(data.clauses.map((c: any, i: number) => ({
            id: c.id || `clause_${i + 1}`,
            text: c.text || '',
            clause_type: c.clause_type || 'other'
          })))
        }
        break

      case 'investigator_complete':
        setAgentStatuses(prev => ({ ...prev, investigator: { status: 'complete', ...data } }))
        break

      case 'jurist_complete':
        setAgentStatuses(prev => ({ ...prev, jurist: { status: 'complete', ...data } }))
        break

      case 'benchmarker_complete':
        setAgentStatuses(prev => ({ ...prev, benchmarker: { status: 'complete', ...data } }))
        break

      case 'adversary_complete':
        setAgentStatuses(prev => ({ ...prev, adversary: { status: 'complete', ...data } }))
        break

      case 'negotiator_complete':
        setAgentStatuses(prev => ({ ...prev, negotiator: { status: 'complete', ...data } }))
        break

      case 'chief_counsel_synthesis':
        setAgentStatuses(prev => ({ ...prev, chief_counsel: { status: 'complete', mode: 'reconciler', ...data } }))
        break

      case 'final_report':
        setStreamStatus('done')
        break

      case 'error':
        setStreamStatus('error')
        break
    }
  }

  if (currentView === 'upload') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h1>Blindspot v2.0</h1>
        <p>Upload your contract for AI-powered review</p>
        {streamStatus === 'error' && (
          <p style={{ color: 'red' }}>Error connecting to backend. Please try again.</p>
        )}
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])}
          style={{ margin: 20 }}
        />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', position: 'relative' }}>
      {streamStatus === 'streaming' && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          padding: '8px 16px', backgroundColor: '#e3f2fd',
          borderRadius: 20, fontSize: 12
        }}>
          ⚡ Analyzing contract...
        </div>
      )}
      <div style={{ flex: 1, borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <ContractView clauses={clauses} agentStatuses={agentStatuses} />
      </div>
      <div style={{ flex: 1, borderRight: '1px solid #ccc', overflowY: 'auto' }}>
        <CrewView agentStatuses={agentStatuses} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <NegotiationView />
      </div>
    </div>
  )
}

export default App
