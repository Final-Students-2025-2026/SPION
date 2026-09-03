import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '@/theme/theme';

interface GradientCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GradientCard({ children, style }: GradientCardProps) {
  return (
    <LinearGradient
      colors={[colors.surfaceElevated, colors.backgroundElevated]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
});
