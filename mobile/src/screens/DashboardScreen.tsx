import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, spacing, typography } from '@/theme/theme';
import RiskGauge from '@/components/RiskGauge';
import StatCard from '@/components/StatCard';
import ActivityItem from '@/components/ActivityItem';
import SectionTitle from '@/components/SectionTitle';
import GradientCard from '@/components/GradientCard';
import { activityLog, dashboardSummary } from '@/data/mockData';
import { RootTabScreenProps } from '@/navigation/types';

export default function DashboardScreen({ navigation }: RootTabScreenProps<'Dashboard'>) {
  const insets = useSafeAreaInsets();
  const recent = activityLog.slice(0, 3);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>SPION</Text>
            <Text style={styles.title}>Overview</Text>
          </View>
          <View style={styles.liveWrap}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <GradientCard style={styles.heroCard}>
          <RiskGauge score={dashboardSummary.currentRiskScore} level={dashboardSummary.riskLevel} />
          <Text style={styles.heroCaption}>
            System activity is within normal range. Last scan completed a few minutes ago.
          </Text>
        </GradientCard>

        <View style={styles.statsGrid}>
          <StatCard icon="pulse-outline" label="Events today" value={String(dashboardSummary.eventsToday)} />
          <StatCard
            icon="hardware-chip-outline"
            label="Active devices"
            value={String(dashboardSummary.activeDevices)}
            accentColor={colors.riskLow}
          />
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            icon="warning-outline"
            label="Open alerts"
            value={String(dashboardSummary.openAlerts)}
            accentColor={colors.riskHigh}
          />
          <StatCard icon="time-outline" label="Last scan" value="3 min ago" accentColor={colors.riskMedium} />
        </View>

        <View style={styles.section}>
          <SectionTitle
            title="Recent activity"
            actionLabel="View all"
            onAction={() => navigation.navigate('Activity')}
          />
          {recent.map((entry) => (
            <ActivityItem key={entry.id} entry={entry} />
          ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.eyebrow,
    color: colors.accent,
    marginBottom: 2,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  liveWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.riskLow,
    marginRight: 6,
  },
  liveText: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 10,
    letterSpacing: 1,
    color: colors.textSecondary,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroCaption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12.5,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 18,
    paddingHorizontal: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  section: {
    marginTop: spacing.lg,
  },
});
