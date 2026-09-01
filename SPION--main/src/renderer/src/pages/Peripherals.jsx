import React from 'react'
import { motion } from 'framer-motion'
import { Camera, HardDrive, Keyboard, Mouse, Plus, ShieldCheck, ShieldX } from 'lucide-react'
import { useSpion } from '../context/SpionContext.jsx'
import Panel from '../components/Panel.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { useEffect, useState } from 'react'

const TYPE_ICON = {
  mouse: Mouse,
  keyboard: Keyboard,
  camera: Camera,
  storage: HardDrive
}

export default function Peripherals() {
  const { peripherals } = useSpion()
  const [usbEvents, setUsbEvents] = useState([])
const [processingUsb, setProcessingUsb] = useState(null)

console.log( "LAPTOP APP PERIPHERALS:", peripherals )
  const authorizedCount = peripherals.filter((p) => p.status === 'authorized').length

  useEffect(() => {

  let mounted = true

  const loadUsbEvents = async () => {

    try {

      const response = await fetch(
        'http://127.0.0.1:8000/usb-events'
      )

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`
        )
      }

    const data = await response.json()

console.log("USB EVENTS FROM BACKEND:", data)

if (mounted) {
        setUsbEvents(
          Array.isArray(data)
            ? data
            : []
        )
      }

    } catch (error) {

      console.error(
        'FAILED TO LOAD USB EVENTS:',
        error
      )

    }

  }

  loadUsbEvents()

  const interval = setInterval(
    loadUsbEvents,
    3000
  )

  return () => {
    mounted = false
    clearInterval(interval)
  }

}, [])

const handleUsbDecision = async (
  usb,
  status
) => {

  try {

    setProcessingUsb(usb.usb_id)

    const response = await fetch(
      'http://127.0.0.1:8000/approve-usb',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },

        body: new URLSearchParams({
          usb_id: usb.usb_id,
          usb_name: usb.usb_name,
          status: status
        })
      }
    )

    const data = await response.json()

    console.log(
      'USB APPROVAL RESPONSE:',
      data
    )

    if (!response.ok) {
      throw new Error(
        data?.detail ||
        `HTTP ${response.status}`
      )
    }

    // Remove it from pending requests
    setUsbEvents((current) =>
      current.filter(
        (item) =>
          item.usb_id !== usb.usb_id
      )
    )

  } catch (error) {

    console.error(
      'USB APPROVAL ERROR:',
      error
    )

  } finally {

    setProcessingUsb(null)

  }

}

  return (
    <div style={{ padding: '28px 40px 56px', maxWidth: 1360, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Peripherals</h1>
          <p style={{ color: 'var(--ink-mid)', fontSize: 14.5, marginTop: 6 }}>
            Devices connected to this laptop. Unregistered devices are rejected automatically.
          </p>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--signal)',
            color: 'var(--ink-on-signal)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            fontSize: 13,
            fontWeight: 700
          }}
        >
          <Plus size={15} />
          Register Device
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
        <SummaryTile label="Registered Devices" value={peripherals.length} />
        <SummaryTile label="Authorized" value={authorizedCount} tone="signal" />
        <SummaryTile label="Blocked Attempts" value={0} />
      </div>

      <Panel style={{ padding: 0, overflow: 'hidden' }}>
        {usbEvents.filter((usb) => usb.action === 'Blocked').length > 0 && (
  <Panel style={{ marginBottom: 20, padding: 0, overflow: 'hidden' }}>
    <div
      style={{
        padding: '18px 20px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>
          USB Approval Requests
        </h2>

        <p
          style={{
            color: 'var(--ink-mid)',
            fontSize: 13,
            marginTop: 5
          }}
        >
          A USB device is waiting for your approval.
        </p>
      </div>

      <StatusPill tone="danger" dot>
        Pending
      </StatusPill>
    </div>

    {usbEvents
      .filter((usb) => usb.action === 'Blocked')
      .map((usb) => (
        <div
          key={usb.usb_id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 20,
            padding: '18px 20px',
            borderBottom: '1px solid var(--hairline)'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-inset)',
                border: '1px solid var(--hairline)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <HardDrive size={17} />
            </div>

            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700
                }}
              >
                {usb.usb_name || 'Unknown USB Device'}
              </div>

              <div
                className="mono"
                style={{
                  fontSize: 11,
                  color: 'var(--ink-low)',
                  marginTop: 4
                }}
              >
                ID: {usb.usb_id}
              </div>

              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--ink-mid)',
                  marginTop: 4
                }}
              >
                Attempts: {usb.count || 1}
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 10,
              flexShrink: 0
            }}
          >
            <button
              disabled={processingUsb === usb.usb_id}
              onClick={() =>
                handleUsbDecision(usb, 'blocked')
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--hairline)',
                background: 'transparent',
                color: 'var(--ink-mid)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700
              }}
            >
              <ShieldX size={14} />
              Block
            </button>

            <button
              disabled={processingUsb === usb.usb_id}
              onClick={() =>
                handleUsbDecision(usb, 'allowed')
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 14px',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--signal)',
                color: 'var(--ink-on-signal)',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700
              }}
            >
              <ShieldCheck size={14} />
              Allow
            </button>
          </div>
        </div>
      ))}
  </Panel>
)}
        <div
          className="mono"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 140px 120px',
            padding: '14px 20px',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--ink-low)',
            borderBottom: '1px solid var(--hairline)'
          }}
        >
          <span>Device</span>
          <span>Type</span>
          <span>Status</span>
          <span>Connection</span>
        </div>

        {peripherals.map((device, i) => {
          const Icon = TYPE_ICON[device.type] || HardDrive
          return (
            <motion.div
              key={device.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 140px 140px 120px',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: i === peripherals.length - 1 ? 'none' : '1px solid var(--hairline)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
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
                  <Icon size={15} />
                </div>
                <span style={{ fontSize: 13.5, fontWeight: 600 }}>{device.name}</span>
              </div>
              <span style={{ fontSize: 12.5, color: 'var(--ink-mid)', textTransform: 'capitalize' }}>{device.type}</span>
              <StatusPill tone={device.status === 'authorized' ? 'signal' : 'danger'} dot>
                {device.status === 'authorized' ? (
                  <>
                    <ShieldCheck size={11} style={{ marginRight: -2 }} /> Authorized
                  </>
                ) : (
                  <>
                    <ShieldX size={11} style={{ marginRight: -2 }} /> Blocked
                  </>
                )}
              </StatusPill>
              <span style={{ fontSize: 12.5, color: device.connected ? 'var(--ink-high)' : 'var(--ink-low)' }}>
                {device.connected ? 'Connected' : 'Disconnected'}
              </span>
            </motion.div>
          )
        })}
      </Panel>
    </div>
  )
}

function SummaryTile({ label, value, tone }) {
  return (
    <Panel style={{ padding: '18px 20px' }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-low)', marginBottom: 10 }}>
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 26,
          fontWeight: 700,
          color: tone === 'signal' ? 'var(--signal)' : 'var(--ink-high)'
        }}
      >
        {value}
      </div>
    </Panel>
  )
}
