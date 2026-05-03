import { useState, useMemo } from 'react'
import type { Clause } from './components/ContractView'
import ContractView from './components/ContractView'
import CrewView from './components/CrewView'
import NegotiationView from './components/NegotiationView'
import LogsPanel from './components/LogsPanel'
import LandingPage from './components/LandingPage'
import RadarChart from './components/RadarChart'
import type { AgentStatuses } from './components/CrewView'

const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8888'

function App() {
  const [currentView, setCurrentView] = useState<'upload' | 'analyzing' | 'complete'>('upload')
  const [agentStatuses, setAgentStatuses] = useState<AgentStatuses>({})
  const [clauses, setClauses] = useState<Clause[]>([])
  const [streamStatus, setStreamStatus] = useState<'idle' | 'streaming' | 'done' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [documentText, setDocumentText] = useState<string>('')
  const [analysisId, setAnalysisId] = useState<string | null>(null)

  const [negotiationStatus, setNegotiationStatus] = useState<'idle' | 'starting' | 'negotiating' | 'closed' | 'error'>('idle')

  const healthScores = useMemo(() => {
    // Start with a perfect score and deduct based on risk
    const scores = { liability: 100, ip: 100, payment: 100, termination: 100, trust: 100 }
    
    // 1. Investigator Risk Impact (Trust Axis)
    const investigatorData = agentStatuses.investigator
    if (investigatorData?.profile) {
      const tier = (investigatorData.profile as any).risk_tier?.toLowerCase()
      if (tier === 'high' || tier === 'critical') scores.trust -= 60
      else if (tier === 'caution') scores.trust -= 30
      else if (tier === 'medium') scores.trust -= 20
    }

    // 2. Jurist Verdicts Impact
    if (clauses.length > 0) {
      const juristVerdicts = agentStatuses.jurist?.jurist_verdicts || {}
      
      Object.entries(juristVerdicts).forEach(([cid, verdict]: [string, any]) => {
        const clause = clauses.find(c => c.id === cid)
        if (!clause) return
        
        // Aggressive penalties for demo visibility
        const penalty = verdict.severity === 'high' ? 25 : verdict.severity === 'medium' ? 12 : 5
        
        const type = clause.clause_type.toLowerCase()
        if (type.includes('liability') || type.includes('indemni') || type.includes('dispute')) scores.liability -= penalty
        if (type.includes('ip') || type.includes('confid') || type.includes('ownersh')) scores.ip -= penalty
        if (type.includes('payment') || type.includes('fee') || type.includes('bill')) scores.payment -= penalty
        if (type.includes('terminat') || type.includes('convenience') || type.includes('duration')) scores.termination -= penalty
      })

      // 3. Adversary Exploit Impact
      const exploits = agentStatuses.adversary?.exploits || {}
      Object.values(exploits).forEach((exList: any) => {
        if (Array.isArray(exList)) {
            exList.forEach(ex => {
                if (ex.severity === 'high') {
                  scores.trust -= 10
                  scores.liability -= 5
                }
            })
        }
      })
    }

    // Bound scores between 15 and 100
    return {
        liability: Math.max(15, Math.min(100, scores.liability)),
        ip: Math.max(15, Math.min(100, scores.ip)),
        payment: Math.max(15, Math.min(100, scores.payment)),
        termination: Math.max(15, Math.min(100, scores.termination)),
        trust: Math.max(15, Math.min(100, scores.trust))
    }
  }, [clauses, agentStatuses])

  const activeAxes = useMemo(() => {
    const active = new Set<string>()
    if (agentStatuses.scout?.status === 'working') ['liability', 'ip', 'payment', 'termination', 'trust'].forEach(a => active.add(a))
    if (agentStatuses.investigator?.status === 'working') active.add('trust')
    if (agentStatuses.jurist?.status === 'working') ['liability', 'ip', 'payment', 'termination'].forEach(a => active.add(a))
    if (agentStatuses.adversary?.status === 'working') ['trust', 'liability'].forEach(a => active.add(a))
    return active
  }, [agentStatuses])

  const handleUpload = async (file: File) => {
    setCurrentView('analyzing')
    setStreamStatus('streaming')
    setAgentStatuses({ scout: { status: 'working', mode: 'Parsing document...' } })
    setErrorMessage('')
    setDocumentText('')
    setAnalysisId(null)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('metadata', JSON.stringify({
      role: 'freelancer',
      deal_context: { size: 400000, location: 'Bangalore', currency: 'INR' },
      counterparty_info: { name: 'Acme Studios', email: 'contact@acme.com' }
    }))

    try {
      // Connect directly to backend for SSE (bypass Vite proxy buffering)
      const response = await fetch(`${apiBaseUrl}/api/v1/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status} ${response.statusText}`)
      }

      if (!response.body) throw new Error('No response body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let eventType = ''
      let sawStreamError = false

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed === '') {
            eventType = ''
            continue
          }
          if (line.startsWith('event: ')) {
            eventType = line.slice(7).trim()
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim()
            try {
              const data = JSON.parse(dataStr)
              if (eventType === 'error') sawStreamError = true
              handleSSEEvent(eventType, data)
            } catch (e) {
              // Not JSON, skip
            }
          }
        }
      }

      if (!sawStreamError) {
        setStreamStatus('done')
        setCurrentView('complete')
      }

    } catch (error) {
      console.error('SSE Error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Connection failed')
      setStreamStatus('error')
    }
  }

  const handleSSEEvent = (eventType: string, data: any) => {
    if (eventType === 'error') {
      setStreamStatus('error')
      setErrorMessage(data.error || 'Unknown error')
      return
    }

    if (eventType === 'document_parsed') {
      setDocumentText(data.text)
      return
    }

    if (eventType === 'final_report') {
      setStreamStatus('done')
      if (data.analysis_id) {
        setAnalysisId(data.analysis_id)
      }
      return
    }

    if (eventType === 'chief_counsel_synthesis') {
      setAgentStatuses(prev => ({
        ...prev,
        chief_counsel: { status: 'working', mode: 'reconciler', final_synthesis: data }
      }))
      return
    }

    if (eventType === 'chief_counsel_planned') {
      setAgentStatuses(prev => ({
        ...prev,
        chief_counsel: { status: 'working', mode: 'planner', ...data }
      }))
      return
    }

    if (eventType === 'chief_counsel_routed') {
      setAgentStatuses(prev => ({
        ...prev,
        chief_counsel: { status: 'working', mode: 'router', ...data }
      }))
      return
    }

    const agentName = eventType.replace('_start', '').replace('_complete', '')
    const isStart = eventType.endsWith('_start')
    const isComplete = eventType.endsWith('_complete')

    if (isStart) {
      setAgentStatuses(prev => ({ ...prev, [agentName]: { status: 'working', ...data } }))
      return
    }

    if (!isComplete) return

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

      case 'chief_counsel_complete':
        setAgentStatuses(prev => ({ ...prev, chief_counsel: { status: 'complete', mode: 'reconciler', ...data } }))
        break
    }
  }

  if (currentView === 'upload') {
    return (
      <LandingPage 
        handleUpload={handleUpload} 
        streamStatus={streamStatus} 
        errorMessage={errorMessage} 
      />
    )
  }

  return (
    <>
      <nav>
        <div className="nav-logo">Blind<span>spot</span></div>
        <div className="nav-links">
          <a href="#" className="nav-cta" style={{ border: 'none' }}>Analysis Mode</a>
        </div>
      </nav>
      <div className="app-container">
        {streamStatus === 'streaming' && (
          <div className="status-pill" style={{ position: 'absolute', top: 90, right: 20, zIndex: 50 }}>
            Analyzing contract...
          </div>
        )}
        {streamStatus === 'error' && (
          <div className="status-pill" style={{ position: 'absolute', top: 90, right: 20, zIndex: 50, color: 'var(--red-flag)', borderColor: 'var(--red-flag)' }}>
            Error: {errorMessage || 'Connection failed'}
          </div>
        )}
        
        <div className="pane" style={{ flex: 2 }}>
          <ContractView 
            clauses={clauses} 
            agentStatuses={agentStatuses} 
            documentText={documentText} 
            negotiationStatus={negotiationStatus}
          />
        </div>
        <div className="pane" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <div style={{ padding: '24px 16px 0' }}>
            <h2 style={{ fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: 16, textAlign: 'center' }}>Legal Health Scan</h2>
            <RadarChart scores={healthScores} activeAxes={activeAxes} />
          </div>
          <CrewView agentStatuses={agentStatuses} />
        </div>
        <div className="pane" style={{ flex: 1.5 }}>
          <NegotiationView 
            analysisId={analysisId} 
            status={negotiationStatus}
            setStatus={setNegotiationStatus}
          />
        </div>
        <LogsPanel />
      </div>
    </>
  )
}

export default App
