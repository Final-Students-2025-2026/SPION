import React from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

/**
 * RadarMark — the one signature visual of SPION.
 * A shield sitting inside a slowly sweeping radar ring, echoing the
 * "observation network" idea from the brief: it's always watching.
 */
export default function RadarMark({ active = true, size = 30 }) {
  const ringSize = size * 1.9

  return (
    <div
      style={{
        position: 'relative',
        width: ringSize,
        height: ringSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      {active && (
        <motion.div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(from 0deg, var(--signal-glow), transparent 30%)`,
            maskImage: 'radial-gradient(circle, transparent 55%, black 56%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 55%, black 56%)'
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: '1px solid var(--hairline-strong)'
        }}
      />
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'var(--bg-panel-raised)',
          border: `1px solid ${active ? 'var(--signal-dim)' : 'var(--hairline-strong)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: active ? '0 0 16px -2px var(--signal-glow)' : 'none'
        }}
      >
        <Shield size={size * 0.52} color={active ? 'var(--signal)' : 'var(--ink-low)'} strokeWidth={2.2} fill={active ? 'var(--signal-wash)' : 'transparent'} />
      </div>
    </div>
  )
}
