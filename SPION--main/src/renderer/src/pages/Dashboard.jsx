import React from 'react'
import { motion } from 'framer-motion'
import {
  Camera,
  Folder,
  ImageOff,
  Lock,
  ScanFace,
  ShieldCheck,
  UserRoundX
} from 'lucide-react'
import { useSpion } from '../context/SpionContext.jsx'
import Panel from '../components/Panel.jsx'
import StatCard from '../components/StatCard.jsx'
import StatusPill from '../components/StatusPill.jsx'
import EmptyState from '../components/EmptyState.jsx'
import RadarMark from '../components/RadarMark.jsx'
import { useNavigate } from 'react-router-dom'
const API = "http://127.0.0.1:8000";

export default function Dashboard() {
  const {
  userName,
  protectionActive,
  cameraReady,
  intrudersDetected,
  timeline,
  intruderPhotos,
  deviceLocked,
  lockDevice
} = useSpion()
  const navigate = useNavigate()
  console.log('DASHBOARD USERNAME:', userName)

    const latestAlert =
  intruderPhotos.length > 0
    ? intruderPhotos[0]
    : null;

  return (
    <div style={{ padding: '18px 32px 20px', maxWidth: 1360, margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 21, fontWeight: 700 }}>Dashboard</h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: 13, marginTop: 3 }}>
            Welcome back, {userName} <span style={{ display: 'inline-block' }}>👋</span>
          </p>
        </div>

        <Panel
          as={motion.div}
          whileHover={{ y: -1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '7px 16px 7px 10px',
            cursor: 'default'
          }}
        >
          <RadarMark active={protectionActive} size={22} />
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{protectionActive ? 'Laptop Protected' : 'Protection Paused'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--ink-low)', marginTop: 1 }}>
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: protectionActive ? 'var(--signal)' : 'var(--ink-low)',
                  boxShadow: protectionActive ? '0 0 6px var(--signal)' : 'none'
                }}
              />
              Monitoring Active
            </div>
          </div>
        </Panel>
      </div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
        <StatCard
          index={0}
          icon={ShieldCheck}
          eyebrow="Protection Status"
          value="ACTIVE"
          lines={['Your laptop is protected', 'All systems secure']}
        />
        <StatCard
          index={1}
          icon={Camera}
          eyebrow="Camera Status"
          value="READY"
          lines={['Intruder capture is enabled', 'Will capture on failed attempts']}
        />
        <StatCard
          index={2}
          icon={UserRoundX}
          eyebrow="Intruders Detected"
          value={intrudersDetected}
          valueTone="neutral"
          lines={[
  `${intrudersDetected} Intrusion Events`,
  intrudersDetected
    ? "Review the latest captures"
    : "No suspicious activity"
]}
        />
      </div>

      {/* Photos + Timeline */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:14,alignItems:'stretch',minHeight:0 }}>
       {/* INTRUDER PHOTOS */}
<Panel
  style={{
    padding: 16,
    minWidth: 0,
    overflow: 'hidden'
  }}
>
  <PanelHeader
    title="Recent Intruder Photos"
    onViewAll={() => navigate('/security')}
  />

  {Array.isArray(intruderPhotos) && intruderPhotos.length > 0 ? (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gap: 12,
        maxHeight: 430,
        overflowY: 'auto',
        paddingRight: 4
      }}
    >
      {intruderPhotos.map((alert, index) => {
  const rawImagePath = String(alert?.image_path || '').trim()

  const imageUrl = rawImagePath
    ? rawImagePath.startsWith('http://') ||
      rawImagePath.startsWith('https://')
      ? rawImagePath
      : `${API}/${rawImagePath.replace(/^\/+/, '')}`
    : ''

  console.log('SPION IMAGE URL:', imageUrl)

  return (
    <div
      key={`${alert?.device_name || 'device'}-${alert?.alert_type || 'alert'}-${index}`}
      style={{
        border: '1px solid var(--hairline)',
        borderRadius: 12,
        padding: 10,
        background: 'var(--bg-inset)',
        minWidth: 0
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={alert?.alert_type || 'Intruder'}
          style={{
            width: '100%',
            height: 130,
            objectFit: 'cover',
            borderRadius: 9,
            display: 'block',
            background: '#050b08'
          }}
          onLoad={() => {
            console.log('SPION IMAGE LOADED:', imageUrl)
          }}
          onError={(e) => {
            console.error('SPION IMAGE FAILED:', imageUrl)

            e.currentTarget.style.display = 'none'

            const fallback = e.currentTarget.nextElementSibling

            if (fallback) {
              fallback.style.display = 'flex'
            }
          }}
        />
      ) : null}

      <div
        style={{
          height: 130,
          borderRadius: 9,
          display: imageUrl ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050b08',
          color: 'var(--ink-low)',
          fontSize: 11
        }}
      >
        No image available
      </div>

      <div
        style={{
          marginTop: 9,
          fontSize: 12.5,
          fontWeight: 600,
          lineHeight: 1.3
        }}
      >
        {alert?.alert_type || 'Unknown Alert'}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 11.5,
          color: 'var(--ink-mid)'
        }}
      >
        Device: {alert?.device_name || 'Unknown device'}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 11.5,
          color: 'var(--ink-mid)'
        }}
      >
        Attempts: {alert?.count ?? 0}
      </div>

      <div
        style={{
          marginTop: 3,
          fontSize: 11,
          color: 'var(--ink-low)'
        }}
      >
        Last Seen: {alert?.last_seen || 'Unknown'}
      </div>

      <button
        type="button"
        onClick={() => navigate('/security')}
        style={{
          width: '100%',
          marginTop: 10,
          padding: '8px 10px',
          border: 'none',
          borderRadius: 7,
          background: 'var(--signal)',
          color: '#06120c',
          fontSize: 11.5,
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        View Details
      </button>
    </div>
  )
})}
    </div>
  ) : (
    <div
      style={{
        minHeight: 260,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <EmptyState
        icon={ImageOff}
        title="No intruder photos yet"
        detail="Photos will appear here after failed attempts."
      />
    </div>
  )}
</Panel>

        <Panel style={{ padding: 16 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>System Overview</div>
          <OverviewRow label="Protection" value="Active" tone="signal" />
          <OverviewRow label="Intruder Capture" value="Enabled" tone="signal" />
          <OverviewRow label="Peripherals" value="All authorized" tone="signal" />
          <OverviewRow label="Last Detection" value={latestAlert? latestAlert.last_seen: "No detections"} tone="neutral" isLast/>
        </Panel>

        <Panel
          style={{
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div className="hex-field" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <RadarMark active={protectionActive} size={32} />
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, marginTop: 10, position: 'relative', zIndex: 1 }}>SPION is protecting you</div>
          <div style={{ fontSize: 11, color: 'var(--ink-low)', marginTop: 3, position: 'relative', zIndex: 1 }}>You're safe. Keep it up!</div>
        </Panel>
      </div>
    </div>
  )
}

function PanelHeader({ title, onViewAll }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>{title}</div>
      <button
        onClick={onViewAll}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--signal)',
          fontSize: 11.5,
          fontWeight: 600,
          padding: 4,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}
      >
        View All ›
      </button>
    </div>
  )
}

function TimelineRow({ event, isLast }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        position: "relative",
        paddingBottom: isLast ? 0 : 16
      }}
    >
      {/* Timeline */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--signal)",
            boxShadow: "0 0 12px var(--signal)"
          }}
        />

        {!isLast && (
          <div
            style={{
              flex: 1,
              width: 2,
              marginTop: 4,
              background: "rgba(255,255,255,.08)"
            }}
          />
        )}
      </div>

      {/* Card */}
      <div
        style={{
          flex: 1,
          background: "var(--bg-inset)",
          border: "1px solid var(--hairline)",
          borderRadius: 12,
          padding: 12
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <strong>{event.title}</strong>

          <StatusPill tone="signal">
            {event.tag}
          </StatusPill>
        </div>

        <div
          style={{
            marginTop: 5,
            color: "var(--ink-mid)",
            fontSize: 13
          }}
        >
          {event.detail}
        </div>

        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: "gray"
          }}
        >
          {event.date} • {event.time}
        </div>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, label, detail, onClick, span, active }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      style={{
        gridColumn: span ? `span ${span}` : undefined,
        background: active ? 'var(--signal-wash)' : 'var(--bg-inset)',
        border: `1px solid ${active ? 'rgba(51,226,143,0.3)' : 'var(--hairline)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '11px 12px',
        textAlign: 'left',
        color: 'var(--ink-high)',
        transition: 'border-color 160ms var(--ease-out)'
      }}
    >
      <Icon size={17} color={active ? 'var(--signal)' : 'var(--ink-mid)'} strokeWidth={1.8} />
      <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 7 }}>{label}</div>
      <div style={{ fontSize: 10.5, color: 'var(--ink-low)', marginTop: 2, lineHeight: 1.35 }}>{detail}</div>
    </motion.button>
  )
}

function OverviewRow({ label, value, tone, isLast }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--hairline)'
      }}
    >
      <span style={{ fontSize: 12, color: 'var(--ink-mid)' }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, fontWeight: 600 }}>
        {value}
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: tone === 'signal' ? 'var(--signal)' : 'var(--ink-low)',
            boxShadow: tone === 'signal' ? '0 0 6px var(--signal)' : 'none'
          }}
        />
      </span>
    </div>
  )
}