import React from 'react'
import { motion } from 'framer-motion'
import Panel from './Panel.jsx'

export default function StatCard({ icon: Icon, eyebrow, value, valueTone = 'signal', lines = [], index = 0 }) {
  const valueColor = valueTone === 'signal' ? 'var(--signal)' : valueTone === 'neutral' ? 'var(--ink-high)' : 'var(--ink-mid)'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Panel style={{ padding: 16, height: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-inset)',
              border: '1px solid var(--hairline)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ink-mid)',
              flexShrink: 0
            }}
          >
            <Icon size={16} strokeWidth={1.8} />
          </div>
          <div className="mono" style={{ fontSize: 10, letterSpacing: '0.1em', color: 'var(--ink-low)', textTransform: 'uppercase' }}>
            {eyebrow}
          </div>
        </div>

        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 22,
            fontWeight: 700,
            color: valueColor,
            marginBottom: 9,
            letterSpacing: '-0.01em'
          }}
        >
          {value}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--ink-mid)' }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: i === 0 ? 'var(--signal)' : 'var(--ink-low)',
                  flexShrink: 0
                }}
              />
              {line}
            </div>
          ))}
        </div>
      </Panel>
    </motion.div>
  )
}