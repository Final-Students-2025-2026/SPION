import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function SidePanel({ open, onClose, title, subtitle, icon: Icon, children }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(3, 8, 6, 0.55)',
              backdropFilter: 'blur(2px)',
              zIndex: 40
            }}
          />
          <motion.aside
            key="panel"
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 24, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            style={{
              position: 'fixed',
              top: 12,
              right: 12,
              bottom: 12,
              width: 380,
              background: 'var(--bg-panel)',
              border: '1px solid var(--hairline-strong)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '20px 20px 16px',
                borderBottom: '1px solid var(--hairline)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {Icon && (
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--bg-inset)',
                      border: '1px solid var(--hairline)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--signal)',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={15} />
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>{title}</div>
                  {subtitle && <div style={{ fontSize: 11.5, color: 'var(--ink-low)', marginTop: 2 }}>{subtitle}</div>}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: '1px solid var(--hairline)',
                  background: 'var(--bg-inset)',
                  color: 'var(--ink-mid)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <X size={13} />
              </button>
            </div>

            <div className="scroll-region" style={{ padding: 20, overflowY: 'auto', flex: 1 }}>
              {children}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}