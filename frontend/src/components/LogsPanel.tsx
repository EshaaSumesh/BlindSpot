import { useState, useEffect } from 'react'

export default function LogsPanel() {
  const [logs, setLogs] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/v1/logs?lines=30')
        const data = await res.json()
        setLogs(data.logs || [])
      } catch (e) {
        setLogs([`Error fetching logs: ${e}`])
      }
    }

    fetchLogs()
    const interval = setInterval(fetchLogs, 2000)
    return () => clearInterval(interval)
  }, [isOpen])

  return (
    <div style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 1000 }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          background: 'var(--ink2)',
          color: 'var(--text-muted)',
          border: '0.5px solid var(--border2)',
          borderBottom: 'none',
          cursor: 'pointer',
          fontSize: 12,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {isOpen ? '↓ CLOSE LOGS' : '↑ SERVER LOGS'}
      </button>
      {isOpen && (
        <div style={{
          width: '600px',
          height: '300px',
          backgroundColor: 'var(--ink)',
          color: 'var(--text)',
          padding: '16px',
          overflowY: 'auto',
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          border: '0.5px solid var(--border2)',
          borderRight: 'none',
          borderBottom: 'none',
        }}>
          {logs.map((log, i) => (
            <div key={i} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, marginBottom: 4, opacity: 0.8 }}>
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
