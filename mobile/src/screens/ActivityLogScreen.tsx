import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '@/components/ScreenHeader';
import ActivityItem from '@/components/ActivityItem';
import EmptyState from '@/components/EmptyState';
import { activityLog } from '@/data/mockData';
import { colors, fontFamily, radius, riskColor, spacing } from '@/theme/theme';
import { RiskLevel } from '@/types';

const FILTERS: Array<{ key: RiskLevel | 'all'; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'low', label: 'Low' },
  { key: 'medium', label: 'Medium' },
  { key: 'high', label: 'High' },
  { key: 'critical', label: 'Critical' },
];

export default function ActivityLogScreen() {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<RiskLevel | 'all'>('all');

  const filtered = useMemo(() => {
    return activityLog.filter((entry) => {
      const matchesFilter = filter === 'all' || entry.risk === filter;
      const matchesQuery =
        query.trim().length === 0 ||
        entry.title.toLowerCase().includes(query.toLowerCase()) ||
        entry.device.toLowerCase().includes(query.toLowerCase());
      return matchesFilter && matchesQuery;
    });
  }, [query, filter]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader eyebrow="Log" title="Activity" subtitle={`${activityLog.length} events tracked`} />

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={16} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by event or device"
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const color = f.key === 'all' ? colors.accent : riskColor(f.key as RiskLevel).fg;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.chip,
                { borderColor: active ? color : colors.surfaceBorder },
                active && { backgroundColor: color + '1A' },
              ]}
            >
              <Text style={[styles.chipText, { color: active ? color : colors.textSecondary }]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityItem entry={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            icon="file-tray-outline"
            title="No matching events"
            subtitle="Try a different search term or filter"
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.lg,
    height: 44,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.bodyRegular,
    fontSize: 14,
    color: colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipText: {
    fontFamily: fontFamily.bodyMedium,
    fontSize: 12,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxxl,
  },
});
