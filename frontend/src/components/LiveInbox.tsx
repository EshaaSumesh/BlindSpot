import React from 'react';

interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
  type: 'inbound' | 'outbound';
}

interface LiveInboxProps {
  emails: EmailMessage[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string) => void;
}

export default function LiveInbox({ emails, selectedEmailId, onSelectEmail }: LiveInboxProps) {
  const selectedEmail = emails.find(e => e.id === selectedEmailId) || emails[0];

  return (
    <div style={{ 
      display: 'flex', 
      height: '100%', 
      background: 'var(--ink)', 
      border: '0.5px solid var(--border)',
      marginTop: '1rem'
    }}>
      {/* Sidebar / List */}
      <div style={{ 
        width: '250px', 
        borderRight: '0.5px solid var(--border)', 
        overflowY: 'auto',
        background: 'rgba(255,255,255,0.02)'
      }}>
        <div style={{ padding: '12px', fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', borderBottom: '0.5px solid var(--border2)' }}>
          Autonomous Inbox
        </div>
        {emails.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
            No messages yet...
          </div>
        ) : (
          emails.map(email => (
            <div 
              key={email.id}
              onClick={() => onSelectEmail(email.id)}
              style={{
                padding: '12px 16px',
                borderBottom: '0.5px solid var(--border2)',
                cursor: 'pointer',
                background: selectedEmailId === email.id ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
                borderLeft: selectedEmailId === email.id ? '3px solid var(--gold)' : '3px solid transparent'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: email.type === 'outbound' ? 'var(--gold)' : 'var(--text)' }}>
                  {email.type === 'outbound' ? 'OUTBOUND' : 'INBOUND'}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                  {email.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email.subject}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {email.body.substring(0, 40)}...
              </div>
            </div>
          ))
        )}
      </div>

      {/* Preview Pane */}
      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
        {selectedEmail ? (
          <>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 16 }}>{selectedEmail.subject}</h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px 0' }}>
                <span style={{ color: 'var(--text-dim)' }}>From:</span>
                <span style={{ color: 'var(--text)' }}>{selectedEmail.from}</span>
                <span style={{ color: 'var(--text-dim)' }}>To:</span>
                <span style={{ color: 'var(--text)' }}>{selectedEmail.to}</span>
                <span style={{ color: 'var(--text-dim)' }}>Date:</span>
                <span style={{ color: 'var(--text-dim)' }}>{selectedEmail.timestamp.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ 
              background: 'var(--ink2)', 
              padding: '24px', 
              borderRadius: '4px', 
              fontSize: '0.95rem', 
              lineHeight: 1.6, 
              color: 'var(--text)',
              whiteSpace: 'pre-wrap',
              border: '0.5px solid var(--border2)'
            }}>
              {selectedEmail.body}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            Select a message to view details
          </div>
        )}
      </div>
    </div>
  );
}
