import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { fontFamily, radius, riskColor, spacing } from '@/theme/theme';
import type { RiskLevel } from '@/types';

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const { fg, bg } = riskColor(level);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <View style={[styles.dot, { backgroundColor: fg }]} />
      <Text style={[styles.text, { color: fg }]}>{level.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.6,
  },
});
