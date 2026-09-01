import React from 'react'
import { motion } from 'framer-motion'
import { LogOut, MapPin, Moon, Settings as SettingsIcon, ShieldAlert, Sun, Terminal } from 'lucide-react'
import { useSpion } from '../context/SpionContext.jsx'
import SidePanel from './SidePanel.jsx'
import Toggle from './Toggle.jsx'

export default function SettingsPanel() {
  const {
    settingsOpen,
    closeSettings,
    theme,
    toggleTheme,
    locationEnabled,
    setLocationEnabled,
    terminalLockEnabled,
    setTerminalLockEnabled,
    captureEnabled,
    setCaptureEnabled,
    loggingOut,
    logout,
    user
  } = useSpion()

  return (
    <SidePanel open={settingsOpen} onClose={closeSettings} title="Settings" subtitle="Protection preferences & account" icon={SettingsIcon}>

      <Section title="Appearance">
        <SettingRow
          icon={theme === 'dark' ? Moon : Sun}
          label="Dark Mode"
          detail={theme === 'dark' ? 'Currently on. Switch to light mode.' : 'Currently off. Switch back to dark mode.'}
          control={<Toggle checked={theme === 'dark'} onChange={toggleTheme} label="Dark Mode" />}
          last
        />
      </Section>

      <Section title="Account">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 0 14px'
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'var(--signal-wash)',
              border: '1px solid var(--hairline-strong)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: 'var(--signal)',
              flexShrink: 0
            }}
          >
            {user.fullName
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-low)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          </div>
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(242,73,92,0.25)',
            background: 'var(--danger-wash)',
            color: 'var(--danger)',
            fontSize: 13,
            fontWeight: 700
          }}
        >
          <LogOut size={15} />
          {loggingOut ? 'Logging out…' : 'Log Out'}
        </motion.button>
      </Section>

      <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-low)', textAlign: 'center', marginTop: 8 }}>
        SPION v1.0.0 · Frontend build
      </div>
    </SidePanel>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div className="mono" style={{ fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-low)', marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function SettingRow({ icon: Icon, label, detail, control, last }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '12px 0',
        borderBottom: last ? 'none' : '1px solid var(--hairline)'
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-inset)',
          border: '1px solid var(--hairline)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ink-mid)',
          flexShrink: 0,
          marginTop: 1
        }}
      >
        <Icon size={14} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-low)', marginTop: 2, lineHeight: 1.4 }}>{detail}</div>
      </div>
      <div style={{ flexShrink: 0, marginTop: 2 }}>{control}</div>
    </div>
  )
}