import React from 'react'

export default function Panel({ children, style, as: Comp = 'div', ...rest }) {
  return (
    <Comp
      style={{
        background: 'var(--bg-panel)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-panel)',
        ...style
      }}
      {...rest}
    >
      {children}
    </Comp>
  )
}
