import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LogIn } from 'lucide-react'
import { useSpion } from '../../context/SpionContext.jsx'
import AuthShell from '../../components/AuthShell.jsx'
import { Field, TextInput, PasswordInput } from '../../components/FormField.jsx'

export default function SignIn() {
  const { signIn } = useSpion()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

 const handleSubmit = async (e) => {
  e.preventDefault()

  const next = {}

  if (!username.trim()) {
    next.username = 'Enter your username.'
  }

  if (!password) {
    next.password = 'Enter your password.'
  }

  setErrors(next)

  if (Object.keys(next).length > 0) {
    return
  }

  setSubmitting(true)
  setFormError('')

  try {
    const ok = await signIn(
      username.trim(),
      password
    )

    if (ok) {
      navigate('/')
      return
    }

    setFormError('Incorrect username or password.')

  } catch (error) {
    console.error('Login error:', error)
    setFormError('Unable to sign in. Please try again.')
  } finally {
    setSubmitting(false)
  }
}
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to keep watching over your laptop.">
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Username" error={errors.username}>
  <TextInput
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    placeholder="princessbrew"
    error={errors.username}
    autoFocus
  />
</Field>

<Field label="Password" error={errors.password}>
  <PasswordInput
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="Your password"
    error={errors.password}
  />
</Field>

        {formError && (
          <div style={{ fontSize: 12.5, color: 'var(--danger)', marginBottom: 14, textAlign: 'center' }}>{formError}</div>
        )}

        <motion.button
          type="submit"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          disabled={submitting}
          style={{
            width: '100%',
            marginTop: 6,
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
            opacity: submitting ? 0.75 : 1
          }}
        >
          <LogIn size={15} />
          {submitting ? 'Signing in…' : 'Sign In'}
        </motion.button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-mid)', marginTop: 18 }}>
        Don't have an account?{' '}
        <Link to="/signup" style={{ color: 'var(--signal)', fontWeight: 600, textDecoration: 'none' }}>
          Sign up
        </Link>
      </div>
    </AuthShell>
  )
}