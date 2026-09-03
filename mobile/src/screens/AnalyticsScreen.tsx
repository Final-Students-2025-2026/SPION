import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import ScreenHeader from '@/components/ScreenHeader';
import SectionTitle from '@/components/SectionTitle';
import { categoryBreakdown, riskHistory } from '@/data/mockData';
import { colors, fontFamily, radius, spacing } from '@/theme/theme';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - spacing.lg * 2 - spacing.md * 2;

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const totalEvents = categoryBreakdown.reduce((sum, c) => sum + c.value, 0);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <ScreenHeader eyebrow="Insights" title="Analytics" subtitle="Behavioral trends across the last 7 days" />

        <View style={styles.card}>
          <SectionTitle title="Risk score trend" />
          <LineChart
            data={{
              labels: riskHistory.map((p) => p.label),
              datasets: [{ data: riskHistory.map((p) => p.score) }],
            }}
            width={chartWidth}
            height={200}
            withInnerLines={false}
            withOuterLines={false}
            fromZero
            chartConfig={{
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(47, 211, 224, ${opacity})`,
              labelColor: () => colors.textSecondary,
              propsForDots: { r: '4', strokeWidth: '2', stroke: colors.accent },
              propsForBackgroundLines: { stroke: colors.surfaceBorder },
            }}
            bezier
            style={styles.chart}
          />
          <Text style={styles.caption}>
            Risk peaked mid-week following an unrecognized login, then returned to baseline.
          </Text>
        </View>

        <View style={styles.card}>
          <SectionTitle title="Event breakdown" />
          {categoryBreakdown.map((c) => {
            const pct = Math.round((c.value / totalEvents) * 100);
            return (
              <View key={c.label} style={styles.barRow}>
                <View style={styles.barHeader}>
                  <Text style={styles.barLabel}>{c.label}</Text>
                  <Text style={styles.barValue}>{c.value} events</Text>
                </View>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: c.color }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.card}>
          <SectionTitle title="Key takeaway" />
          <Text style={styles.insightText}>
            Login events and vision alerts account for the majority of flagged activity this week.
            Consider reviewing device trust settings for repeat offenders in the Alerts tab.
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
  chart: {
    borderRadius: radius.md,
    marginLeft: -spacing.md,
  },
  caption: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    lineHeight: 17,
  },
  barRow: {
    marginBottom: spacing.sm,
  },
  barHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 13,
    color: colors.textPrimary,
  },
  barValue: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 12,
    color: colors.textTertiary,
  },
  barTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  insightText: {
    fontFamily: fontFamily.bodyRegular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },
});
