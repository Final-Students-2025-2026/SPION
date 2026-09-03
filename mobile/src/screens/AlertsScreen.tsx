import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenHeader from '@/components/ScreenHeader';
import AlertCard from '@/components/AlertCard';
import EmptyState from '@/components/EmptyState';
import { alerts as initialAlerts } from '@/data/mockData';
import { colors, spacing } from '@/theme/theme';

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const [alerts, setAlerts] = useState(initialAlerts);

  const toggleAck = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: !a.acknowledged } : a))
    );
  };

  const openCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <ScreenHeader
        eyebrow="Response"
        title="Alerts"
        subtitle={openCount > 0 ? `${openCount} awaiting review` : 'All alerts reviewed'}
      />
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AlertCard alert={item} onToggleAck={toggleAck} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="shield-checkmark-outline" title="No active alerts" subtitle="You're all caught up" />
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
});
