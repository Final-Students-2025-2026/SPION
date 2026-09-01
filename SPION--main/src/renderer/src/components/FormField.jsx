import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function Field({ label, error, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, marginBottom: 7, color: 'var(--ink-mid)' }}>{label}</label>
      {children}
      {error && <div style={{ fontSize: 11.5, color: 'var(--danger)', marginTop: 6 }}>{error}</div>}
    </div>
  )
}

const baseInputStyle = (error) => ({
  width: '100%',
  background: 'var(--bg-inset)',
  border: `1px solid ${error ? 'var(--danger)' : 'var(--hairline-strong)'}`,
  borderRadius: 'var(--radius-sm)',
  padding: '11px 13px',
  color: 'var(--ink-high)',
  fontSize: 13.5,
  outline: 'none',
  fontFamily: 'inherit'
})

export function TextInput({ error, ...rest }) {
  return <input {...rest} style={baseInputStyle(error)} />
}

export function PasswordInput({ error, ...rest }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input {...rest} type={show ? 'text' : 'password'} style={{ ...baseInputStyle(error), paddingRight: 40 }} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 10,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          color: 'var(--ink-low)',
          display: 'flex',
          padding: 4
        }}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  )
}

export function SelectInput({ error, children, ...rest }) {
  return (
    <select {...rest} style={{ ...baseInputStyle(error), appearance: 'auto', cursor: 'pointer' }}>
      {children}
    </select>
  )
}