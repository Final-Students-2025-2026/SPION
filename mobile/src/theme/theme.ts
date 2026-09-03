/**
 * SPION Design System
 * A dark, high-contrast theme inspired by the SPION brand deck —
 * near-black surfaces, crisp white type, and a single electric-cyan
 * accent reserved for interactive elements and live data.
 */

export const colors = {
  // Surfaces
  background: '#061118',
  backgroundElevated: '#0A1720',
  surface: '#0C1822',
  surfaceElevated: '#10202B',
  surfaceBorder: 'rgba(46, 243, 176, 0.22)',

  // Text
  textPrimary: '#F3F9FF',
  textSecondary: '#9FB0BF',
  textTertiary: '#698093',
  textInverse: '#061118',

  // Brand accent
  accent: '#2EF3B0',
  accentMuted: 'rgba(46, 243, 176, 0.14)',
  accentBorder: 'rgba(46, 243, 176, 0.35)',

  // Risk / status semantics
  riskLow: '#2EF3B0',
  riskLowMuted: 'rgba(46, 243, 176, 0.14)',
  riskMedium: '#F5B942',
  riskMediumMuted: 'rgba(245, 185, 66, 0.14)',
  riskHigh: '#FF6B6B',
  riskHighMuted: 'rgba(255, 107, 107, 0.14)',
  riskCritical: '#FF4D8D',
  riskCriticalMuted: 'rgba(255, 77, 141, 0.16)',

  // Misc
  overlay: 'rgba(0,0,0,0.55)',
  divider: '#10202B',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  xxl: 36,
  xxxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const fontFamily = {
  display: 'BebasNeue_400Regular', // condensed bold headers, matches brand deck
  bodyRegular: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemiBold: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
};

export const typography = {
  h1: { fontFamily: fontFamily.display, fontSize: 40, letterSpacing: 0.5 },
  h2: { fontFamily: fontFamily.display, fontSize: 30, letterSpacing: 0.5 },
  h3: { fontFamily: fontFamily.display, fontSize: 22, letterSpacing: 0.5 },
  eyebrow: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1.6,
    textTransform: 'uppercase' as const,
  },
  bodyLg: { fontFamily: fontFamily.bodyRegular, fontSize: 16, lineHeight: 23 },
  body: { fontFamily: fontFamily.bodyRegular, fontSize: 14, lineHeight: 20 },
  bodySm: { fontFamily: fontFamily.bodyRegular, fontSize: 12, lineHeight: 17 },
  label: { fontFamily: fontFamily.bodyMedium, fontSize: 13 },
  numeric: { fontFamily: fontFamily.bodyBold, fontSize: 34 },
};

export function riskColor(level: 'low' | 'medium' | 'high' | 'critical') {
  switch (level) {
    case 'low':
      return { fg: colors.riskLow, bg: colors.riskLowMuted };
    case 'medium':
      return { fg: colors.riskMedium, bg: colors.riskMediumMuted };
    case 'high':
      return { fg: colors.riskHigh, bg: colors.riskHighMuted };
    case 'critical':
      return { fg: colors.riskCritical, bg: colors.riskCriticalMuted };
  }
}

const theme = { colors, spacing, radius, fontFamily, typography, riskColor };
export default theme;
