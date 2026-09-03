import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import { RootTabParamList } from './types';
import { colors, fontFamily } from '@/theme/theme';
import DashboardScreen from '@/screens/DashboardScreen';
import ActivityLogScreen from '@/screens/ActivityLogScreen';
import AnalyticsScreen from '@/screens/AnalyticsScreen';
import AlertsScreen from '@/screens/AlertsScreen';
import SettingsScreen from '@/screens/SettingsScreen';

const Tab = createBottomTabNavigator<RootTabParamList>();

const ICONS: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid-outline',
  Activity: 'list-outline',
  Analytics: 'stats-chart-outline',
  Alerts: 'warning-outline',
  Settings: 'settings-outline',
};

const ICONS_FOCUSED: Record<keyof RootTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'grid',
  Activity: 'list',
  Analytics: 'stats-chart',
  Alerts: 'warning',
  Settings: 'settings',
};

export default function RootNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.backgroundElevated,
          borderTopColor: colors.surfaceBorder,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontFamily: fontFamily.bodyMedium,
          fontSize: 10.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const name = route.name as keyof RootTabParamList;
          const icon = focused ? ICONS_FOCUSED[name] : ICONS[name];
          return <Ionicons name={icon} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Activity" component={ActivityLogScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
