import React, { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus } from 'lucide-react'
import { useSpion } from '../../context/SpionContext.jsx'
import AuthShell from '../../components/AuthShell.jsx'
import { Field, TextInput, PasswordInput, SelectInput } from '../../components/FormField.jsx'
import PasswordStrengthMeter from '../../components/PasswordStrengthMeter.jsx'
import { scorePassword } from '../../utils/passwordStrength.js'
import { COUNTRIES } from '../../data/countries.js'

const initialForm = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  country: '',
  region: ''
}

export default function SignUp() {
  const { signUp } = useSpion()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const strength = useMemo(() => scorePassword(form.password), [form.password])

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.fullName.trim()) next.fullName = 'Enter your full name.'
    if (!form.username.trim()) next.username = 'Pick a username.'
    else if (form.username.trim().length < 3) next.username = 'Username needs at least 3 characters.'
    if (!form.email.trim()) next.email = 'Enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "That doesn't look like a valid email."
    if (!form.password) next.password = 'Create a password.'
    else if (form.password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (!form.confirmPassword) next.confirmPassword = 'Confirm your password.'
    else if (form.confirmPassword !== form.password) next.confirmPassword = 'Passwords don\u2019t match.'
    if (!form.country) next.country = 'Select your country.'
    if (!form.region.trim()) next.region = 'Enter your region/state.'
    return next
  }

  const handleSubmit = async (e) => {
  e.preventDefault()

  const validation = validate()
  setErrors(validation)

  if (Object.keys(validation).length > 0) {
    return
  }

  setSubmitting(true)
  setErrors({})

  const result = await signUp({
    fullName: form.fullName.trim(),
    username: form.username.trim(),
    email: form.email.trim(),
    password: form.password,
    country: form.country,
    region: form.region.trim()
  })

  if (!result.success) {
    setSubmitting(false)

    setErrors({
      form: result.error || 'Unable to create account.'
    })

    return
  }

  setSubmitting(false)

  if (result.needsConfirmation) {
    alert(
      'Account created. Please check your email to confirm your account.'
    )

    navigate('/signin')
  } else {
    navigate('/')
  }
}
  
  return (
    <AuthShell title="Create your SPION account" subtitle="Set up protection for this laptop in a couple of minutes.">
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Full Name" error={errors.fullName}>
          <TextInput value={form.fullName} onChange={update('fullName')} placeholder="Princess Brew" error={errors.fullName} autoFocus />
        </Field>

        <Field label="Username" error={errors.username}>
          <TextInput value={form.username} onChange={update('username')} placeholder="princessbrew" error={errors.username} />
        </Field>

        <Field label="Email" error={errors.email}>
          <TextInput type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" error={errors.email} />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Country" error={errors.country}>
            <SelectInput value={form.country} onChange={update('country')} error={errors.country}>
              <option value="">Select…</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Field>
          <Field label="Region / State" error={errors.region}>
            <TextInput value={form.region} onChange={update('region')} placeholder="Ashanti Region" error={errors.region} />
          </Field>
        </div>

        <Field label="Password" error={errors.password}>
          <PasswordInput value={form.password} onChange={update('password')} placeholder="At least 8 characters" error={errors.password} />
          <PasswordStrengthMeter password={form.password} />
        </Field>

        <Field label="Confirm Password" error={errors.confirmPassword}>
          <PasswordInput value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Re-enter your password" error={errors.confirmPassword} />
        </Field>

        {errors.form && (
  <div
    style={{
      fontSize: 12.5,
      color: 'var(--danger)',
      marginBottom: 14,
      textAlign: 'center'
    }}
  >
    {errors.form}
  </div>
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
          <UserPlus size={15} />
          {submitting ? 'Creating account…' : 'Create Account'}
        </motion.button>
      </form>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--ink-mid)', marginTop: 18 }}>
        Already have an account?{' '}
        <Link to="/signin" style={{ color: 'var(--signal)', fontWeight: 600, textDecoration: 'none' }}>
          Sign in
        </Link>
      </div>
    </AuthShell>
  )
    }