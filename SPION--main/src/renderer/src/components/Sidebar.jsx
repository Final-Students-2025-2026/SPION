import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, Lock, MapPin, MonitorSmartphone, Search, Settings, UserRound } from 'lucide-react'
import { useSpion } from '../context/SpionContext.jsx'
import logo from '../assets/logo.png'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutGrid, end: true },
  { to: '/vault', label: 'Vault', icon: Lock },
  { to: '/peripherals', label: 'Peripherals', icon: MonitorSmartphone },
  { to: '/map', label: 'Map', icon: MapPin }
]

export default function Sidebar() {
  const { openSettings, openProfile } = useSpion()
  const [query, setQuery] = useState('')

  return (
    <aside
      style={{
        borderRight: '1px solid var(--hairline)',
        background: 'var(--bg-base)',
        display: 'flex',
        flexDirection: 'column',
        padding: 'var(--space-5) var(--space-4)',
        position: 'relative'
      }}
    >
      {/* Brand mark */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0', marginBottom: 'var(--space-6)' }}>
        <img src={logo} alt="SPION" style={{ width: 120, height: 'auto', objectFit: 'contain' }} />
      </div>

      {/* Search */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--bg-inset)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--radius-sm)',
          padding: '9px 12px',
          marginBottom: 'var(--space-5)'
        }}
      >
        <Search size={15} color="var(--ink-low)" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search SPION"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--ink-high)',
            fontSize: 13,
            width: '100%'
          }}
        />
      </label>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 11,
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? 'var(--ink-high)' : 'var(--ink-mid)',
                  fontSize: 14,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'color 160ms var(--ease-out)'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-active"
                    transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'var(--bg-panel-raised)',
                      border: '1px solid var(--hairline-strong)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                )}
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: -13,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3,
                      height: 16,
                      borderRadius: 3,
                      background: 'var(--signal)',
                      boxShadow: '0 0 10px var(--signal-glow)'
                    }}
                  />
                )}
                <Icon size={17} style={{ position: 'relative', zIndex: 1 }} strokeWidth={isActive ? 2.25 : 1.8} />
                <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div style={{ flex: 1 }} />

      {/* Footer: profile + settings */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--hairline)',
          paddingTop: 'var(--space-4)'
        }}
      >
        <button
          onClick={openProfile}
          aria-label="Profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '1px solid var(--hairline-strong)',
            background: 'var(--bg-panel)',
            color: 'var(--ink-mid)'
          }}
        >
          <UserRound size={16} />
        </button>
        <button
          onClick={openSettings}
          aria-label="Settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 34,
            height: 34,
            borderRadius: '50%',
            border: '1px solid transparent',
            background: 'transparent',
            color: 'var(--ink-mid)'
          }}
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  )
}