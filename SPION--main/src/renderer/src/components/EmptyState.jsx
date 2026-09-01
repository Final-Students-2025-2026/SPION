import React from 'react'

export default function EmptyState({ icon: Icon, title, detail, action }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '20px 24px',
        gap: 5,
        width: '100%'
      }}
    >
      {Icon && (
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--hairline-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 6,
            color: 'var(--ink-low)'
          }}
        >
          <Icon size={18} strokeWidth={1.6} />
        </div>
      )}
      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-high)' }}>{title}</div>
      {detail && (
        <div style={{ fontSize: 11.5, color: 'var(--ink-low)', maxWidth: 300, lineHeight: 1.45 }}>{detail}</div>
      )}
      {action && <div style={{ marginTop: 10 }}>{action}</div>}
    </div>
  )
}