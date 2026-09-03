import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AlertItem } from '@/types';
import { colors, fontFamily, radius, riskColor, spacing } from '@/theme/theme';
import { timeAgo } from '@/utils/date';
import RiskBadge from './RiskBadge';

interface AlertCardProps {
  alert: AlertItem;
  onToggleAck: (id: string) => void;
}

export default function AlertCard({ alert, onToggleAck }: AlertCardProps) {
  const { fg } = riskColor(alert.risk);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleAck(alert.id);
  };

  return (
    <View style={[styles.card, { borderLeftColor: fg }]}>
      <View style={styles.headerRow}>
        <RiskBadge level={alert.risk} />
        <Text style={styles.time}>{timeAgo(alert.timestamp)}</Text>
      </View>
      <Text style={styles.title}>{alert.title}</Text>
      <Text style={styles.description}>{alert.description}</Text>
      <View style={styles.footerRow}>
        <Text style={styles.device}>{alert.device}</Text>
        <Pressable onPress={handlePress} style={styles.ackBtn} hitSlop={8}>
          <Ionicons
            name={alert.acknowledged ? 'checkmark-circle' : 'checkmark-circle-outline'}
            size={16}
            color={alert.acknowledged ? colors.riskLow : colors.textSecondary}
          />
          <Text
            style={[
              styles.ackText,
              { color: alert.acknowledged ? colors.riskLow : colors.textSecondary },
            ]}
          >
            {alert.acknowledged ? 'Acknowledged' : 'Mark reviewed'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderLeftWidth: 3,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  time: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 11,
    color: colors.textTertiary,
  },
  title: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  description: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12.5,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  device: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 11,
    color: colors.textTertiary,
  },
  ackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ackText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
  },
});
