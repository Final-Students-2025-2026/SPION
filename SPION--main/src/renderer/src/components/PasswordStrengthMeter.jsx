import React from 'react'
import { scorePassword } from '../utils/passwordStrength.js'

export default function PasswordStrengthMeter({ password }) {
  const { score, label, color } = scorePassword(password)

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              height: 4,
              flex: 1,
              borderRadius: 2,
              background: i < score ? color : 'var(--hairline-strong)',
              transition: 'background 200ms var(--ease-out)'
            }}
          />
        ))}
      </div>
      <div style={{ fontSize: 11, color, marginTop: 5, fontWeight: 600, minHeight: 14 }}>
        {password ? label : ''}
      </div>
    </div>
  )
}