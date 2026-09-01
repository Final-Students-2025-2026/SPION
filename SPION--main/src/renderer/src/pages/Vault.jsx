import React, { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  File,
  Folder,
  Lock,
  LockKeyholeOpen,
  ShieldAlert,
  Plus,
  RefreshCw
} from 'lucide-react'
import { useSpion } from '../context/SpionContext.jsx'
import Panel from '../components/Panel.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Vault() {
  const {
    vaultLocked,
    vaultItems,
    unlockVault,
    lockVault,
    addToVault,
    refreshVault
  } = useSpion()

  const [adding, setAdding] = useState(false)
  const fileInputRef = useRef(null)

  const handleAddFile = async (event) => {
    const file = event.target.files?.[0]

    if (!file) return

    setAdding(true)

    try {
      await addToVault(file)
    } catch (error) {
      console.error('Failed to add file to vault:', error)
      alert(error.message || 'Failed to add file to vault')
    } finally {
      setAdding(false)

      // Allow selecting the same file again
      event.target.value = ''
    }
  }

  const handleRefresh = async () => {
    try {
      await refreshVault()
    } catch (error) {
      console.error('Failed to refresh vault:', error)
    }
  }

  return (
    <div
      style={{
        padding: '28px 40px 56px',
        maxWidth: 1360,
        margin: '0 auto'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 28
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 700,
              margin: 0
            }}
          >
            Vault
          </h1>

          <p
            style={{
              color: 'var(--ink-mid)',
              fontSize: 14.5,
              marginTop: 6
            }}
          >
            Your private files, locked behind SPION protection.
          </p>
        </div>

        {!vaultLocked && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleRefresh}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-panel)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink-high)',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              onClick={lockVault}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--bg-panel)',
                border: '1px solid var(--hairline-strong)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 16px',
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--ink-high)',
                cursor: 'pointer'
              }}
            >
              <Lock size={14} />
              Lock Vault
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {vaultLocked ? (
          <LockedGate
            key="locked"
            onUnlock={unlockVault}
          />
        ) : (
          <VaultContents
            key="open"
            items={vaultItems}
            onAddFile={() => fileInputRef.current?.click()}
            adding={adding}
          />
        )}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={handleAddFile}
      />
    </div>
  )
}

function LockedGate({ onUnlock }) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!passcode) return

    setLoading(true)
    setError(false)

    try {
      const ok = await onUnlock(passcode)

      if (!ok) {
        setError(true)

        setTimeout(() => {
          setError(false)
        }, 1800)
      }
    } catch (err) {
      console.error('Vault unlock error:', err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Panel
        style={{
          padding: '64px 32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          animate={
            error
              ? { x: [0, -8, 8, -6, 6, 0] }
              : {}
          }
          transition={{ duration: 0.4 }}
          style={{
            position: 'relative',
            zIndex: 1,
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: 'var(--bg-inset)',
            border: `1px solid ${
              error
                ? 'var(--danger)'
                : 'var(--hairline-strong)'
            }`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20
          }}
        >
          <Lock
            size={26}
            color={
              error
                ? 'var(--danger)'
                : 'var(--ink-mid)'
            }
            strokeWidth={1.8}
          />
        </motion.div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 700,
            position: 'relative',
            zIndex: 1
          }}
        >
          Vault is locked
        </div>

        <div
          style={{
            fontSize: 13,
            color: 'var(--ink-low)',
            marginTop: 6,
            maxWidth: 320,
            lineHeight: 1.5,
            position: 'relative',
            zIndex: 1
          }}
        >
          Enter your vault passcode to view what's inside.
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: 24,
            position: 'relative',
            zIndex: 1,
            width: 280
          }}
        >
          <input
            type="password"
            value={passcode}
            onChange={(e) =>
              setPasscode(e.target.value)
            }
            placeholder="Vault passcode"
            aria-label="Vault passcode"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--bg-inset)',
              border: `1px solid ${
                error
                  ? 'var(--danger)'
                  : 'var(--hairline-strong)'
              }`,
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              color: 'var(--ink-high)',
              fontSize: 14,
              textAlign: 'center',
              outline: 'none'
            }}
          />

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: 12,
              background: 'var(--signal)',
              color: 'var(--ink-on-signal)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontSize: 13.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            <LockKeyholeOpen size={15} />
            {loading ? 'Unlocking...' : 'Unlock Vault'}
          </motion.button>

          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                justifyContent: 'center',
                marginTop: 10,
                fontSize: 12,
                color: 'var(--danger)'
              }}
            >
              <ShieldAlert size={13} />
              Unable to unlock vault.
            </div>
          )}
        </form>
      </Panel>
    </motion.div>
  )
}

function VaultContents({
  items,
  onAddFile,
  adding
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <Panel style={{ padding: 'var(--space-5)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 18
          }}
        >
          <div
            style={{
              fontSize: 15.5,
              fontWeight: 600
            }}
          >
            {items.length} items
          </div>

          <button
            onClick={onAddFile}
            disabled={adding}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--bg-inset)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--ink-high)',
              cursor: adding ? 'wait' : 'pointer',
              opacity: adding ? 0.6 : 1
            }}
          >
            <Plus size={14} />
            {adding ? 'Adding...' : 'Add File'}
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Folder}
            title="Your vault is empty"
            detail="Add files to your SPION vault."
          />
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(4, 1fr)',
              gap: 14
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                style={{
                  background: 'var(--bg-inset)',
                  border:
                    '1px solid var(--hairline)',
                  borderRadius:
                    'var(--radius-md)',
                  padding: 16,
                  cursor: 'default'
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius:
                      'var(--radius-sm)',
                    background:
                      'var(--bg-panel-raised)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--signal)',
                    marginBottom: 14
                  }}
                >
                  {item.type === 'folder' ? (
                    <Folder size={17} />
                  ) : (
                    <File size={17} />
                  )}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginBottom: 4,
                    wordBreak: 'break-word'
                  }}
                >
                  {item.name}
                </div>

                <div
                  className="mono"
                  style={{
                    fontSize: 11,
                    color: 'var(--ink-low)'
                  }}
                >
                  {item.size || 'File'} ·{' '}
                  {item.updated || 'Unknown'}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </motion.div>
  )
}