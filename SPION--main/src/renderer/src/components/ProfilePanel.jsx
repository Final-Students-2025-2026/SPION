import React from 'react'
import { Calendar, Globe2, Laptop, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react'
import { useSpion } from '../context/SpionContext.jsx'
import SidePanel from './SidePanel.jsx'
import StatusPill from './StatusPill.jsx'

export default function ProfilePanel() {
  const { profileOpen, closeProfile, user, protectionActive } = useSpion()

  const initials = user.fullName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)

  return (
    <SidePanel open={profileOpen} onClose={closeProfile} title="Profile" subtitle="Your account information" icon={UserRound}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '8px 0 24px' }}>
        <div
          style={{
            width: 68,
            height: 68,
            borderRadius: '50%',
            background: 'var(--signal-wash)',
            border: '1px solid var(--hairline-strong)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--signal)',
            marginBottom: 12
          }}
        >
          {initials}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{user.fullName}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-low)', marginTop: 2 }}>{user.plan}</div>
        <div style={{ marginTop: 10 }}>
          <StatusPill tone={protectionActive ? 'signal' : 'neutral'} dot>
            {protectionActive ? 'Protected account' : 'Protection paused'}
          </StatusPill>
        </div>
      </div>

      <InfoRow icon={Mail} label="Email" value={user.email} />
      <InfoRow icon={Phone} label="Phone" value={user.phone} />
      <InfoRow icon={Globe2} label="Location" value={user.region ? `${user.region}, ${user.country}` : user.country || 'Not set'} />
      <InfoRow icon={Laptop} label="Registered Device" value={user.deviceName} />
      <InfoRow icon={Calendar} label="Member Since" value={user.memberSince} />
      <InfoRow icon={ShieldCheck} label="Plan" value={user.plan} last />


    </SidePanel>
  )
}

function InfoRow({ icon: Icon, label, value, last }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
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
          flexShrink: 0
        }}
      >
        <Icon size={14} />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="mono" style={{ fontSize: 10, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-low)' }}>
          {label}
        </div>
        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</div>
      </div>
    </div>
  )
}