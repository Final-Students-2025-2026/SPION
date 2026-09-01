import React from 'react'
import logo from '../assets/logo.png'

export default function AuthShell({ title, subtitle, children, wide }) {
  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'auto',
        padding: '32px 16px'
      }}
    >
      <div className="hex-field" style={{ opacity: 0.4 }} />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: wide ? 480 : 400
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
         <img src={logo} alt="SPION" style={{ width: 120, height: 'auto', objectFit: 'contain' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 16 }}>{title}</h1>
          {subtitle && <p style={{ color: 'var(--ink-mid)', fontSize: 13.5, marginTop: 6, textAlign: 'center' }}>{subtitle}</p>}
        </div>

        <div
          style={{
            background: 'var(--bg-panel)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-panel)',
            padding: 28
          }}
        >
          {children}
        </div>

        <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-low)', textAlign: 'center', marginTop: 20 }}>
          SPION · Smart Protection & Intrusion Observation Network
        </div>
      </div>
    </div>
  )
}