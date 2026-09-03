import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import SectionTitle from '@/components/SectionTitle';
import { colors, fontFamily, radius, spacing } from '@/theme/theme';

interface ToggleRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}

function ToggleRow({ icon, label, description, value, onValueChange }: ToggleRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceElevated, true: colors.accentBorder }}
        thumbColor={value ? colors.accent : colors.textTertiary}
      />
    </View>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const [visionMonitoring, setVisionMonitoring] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(true);
  const [highSensitivity, setHighSensitivity] = useState(false);
  const [nightlyReport, setNightlyReport] = useState(true);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="Configuration" title="Settings" subtitle="Tune how SPION watches your systems" />

        <View style={styles.card}>
          <SectionTitle title="Monitoring" />
          <ToggleRow
            icon="eye-outline"
            label="Computer vision monitoring"
            description="Flag unrecognized faces near connected devices"
            value={visionMonitoring}
            onValueChange={setVisionMonitoring}
          />
          <ToggleRow
            icon="speedometer-outline"
            label="High sensitivity mode"
            description="Detect subtler anomalies at the cost of more alerts"
            value={highSensitivity}
            onValueChange={setHighSensitivity}
          />
        </View>

        <View style={styles.card}>
          <SectionTitle title="Notifications" />
          <ToggleRow
            icon="notifications-outline"
            label="Push alerts"
            description="Get notified immediately on high-risk events"
            value={pushAlerts}
            onValueChange={setPushAlerts}
          />
          <ToggleRow
            icon="mail-outline"
            label="Nightly summary report"
            description="Daily digest of activity and risk trends"
            value={nightlyReport}
            onValueChange={setNightlyReport}
          />
        </View>

        <View style={styles.card}>
          <SectionTitle title="About" />
          <Text style={styles.aboutText}>
            SPION — Smart Protection & Intrusion Observation Network. Version 1.0.0 (frontend preview).
            Backend intelligence engine not yet connected.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  rowLabel: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 13.5,
    color: colors.textPrimary,
  },
  rowDescription: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: 2,
  },
  aboutText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12.5,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});
