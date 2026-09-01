// Lightweight heuristic strength scorer — no external dependency.
// Returns { score: 0-4, label, color }
export function scorePassword(pw = '') {
  if (!pw) return { score: 0, label: 'Enter a password', color: 'var(--ink-low)' }

  let score = 0
  const checks = {
    length8: pw.length >= 8,
    length12: pw.length >= 12,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[^A-Za-z0-9]/.test(pw)
  }

  if (checks.length8) score += 1
  if (checks.length12) score += 1
  if (checks.lower && checks.upper) score += 1
  if (checks.number) score += 1
  if (checks.symbol) score += 1

  const capped = Math.min(score, 4)

  const LABELS = [
    { label: 'Very weak', color: 'var(--danger)' },
    { label: 'Weak', color: 'var(--danger)' },
    { label: 'Fair', color: 'var(--warn)' },
    { label: 'Good', color: 'var(--signal-dim)' },
    { label: 'Strong', color: 'var(--signal)' }
  ]

  return { score: capped, ...LABELS[capped], checks }
}