import React from 'react'
import { motion } from 'framer-motion'

export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{
        width: 40,
        height: 24,
        borderRadius: 999,
        border: '1px solid ' + (checked ? 'transparent' : 'var(--hairline-strong)'),
        background: checked ? 'var(--signal)' : 'var(--bg-inset)',
        padding: 2,
        display: 'flex',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        flexShrink: 0,
        transition: 'background 160ms var(--ease-out)'
      }}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: checked ? 'var(--ink-on-signal)' : 'var(--ink-low)',
          display: 'block'
        }}
      />
    </button>
  )
}