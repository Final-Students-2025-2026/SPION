import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ActivityLogEntry, ActivitySource } from '@/types';
import { colors, fontFamily, radius, riskColor, spacing } from '@/theme/theme';
import { timeAgo } from '@/utils/date';
import RiskBadge from './RiskBadge';

const SOURCE_ICON: Record<ActivitySource, keyof typeof Ionicons.glyphMap> = {
  vision: 'eye-outline',
  system: 'hardware-chip-outline',
  network: 'globe-outline',
  login: 'log-in-outline',
};

export default function ActivityItem({ entry }: { entry: ActivityLogEntry }) {
  const { fg, bg } = riskColor(entry.risk);
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: bg }]}>
        <Ionicons name={SOURCE_ICON[entry.source]} size={18} color={fg} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.topLine}>
          <Text style={styles.title} numberOfLines={1}>
            {entry.title}
          </Text>
          <Text style={styles.time}>{timeAgo(entry.timestamp)}</Text>
        </View>
        <Text style={styles.description} numberOfLines={2}>
          {entry.description}
        </Text>
        <View style={styles.bottomLine}>
          <Text style={styles.device}>{entry.device}</Text>
          <RiskBadge level={entry.risk} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 14,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.textTertiary,
  },
  description: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 17,
  },
  bottomLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  device: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    color: colors.textTertiary,
  },
});
