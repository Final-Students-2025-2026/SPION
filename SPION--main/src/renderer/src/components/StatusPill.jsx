import React from 'react'

const TONES = {
  signal: { fg: 'var(--signal)', bg: 'var(--signal-wash)', border: 'rgba(51,226,143,0.25)' },
  neutral: { fg: 'var(--ink-mid)', bg: 'rgba(255,255,255,0.04)', border: 'var(--hairline-strong)' },
  warn: { fg: 'var(--warn)', bg: 'rgba(245,181,69,0.1)', border: 'rgba(245,181,69,0.25)' },
  danger: { fg: 'var(--danger)', bg: 'var(--danger-wash)', border: 'rgba(242,73,92,0.25)' }
}

export default function StatusPill({ children, tone = 'neutral', dot = false }) {
  const t = TONES[tone] || TONES.neutral
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 10px',
        borderRadius: 999,
        fontSize: 11.5,
        fontWeight: 600,
        letterSpacing: '0.02em',
        color: t.fg,
        background: t.bg,
        border: `1px solid ${t.border}`,
        whiteSpace: 'nowrap'
      }}
    >
      {dot && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: t.fg,
            boxShadow: `0 0 6px ${t.fg}`
          }}
        />
      )}
      {children}
    </span>
  )
}
