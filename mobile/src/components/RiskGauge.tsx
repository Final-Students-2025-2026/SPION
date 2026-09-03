import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fontFamily, riskColor } from '@/theme/theme';
import type { RiskLevel } from '@/types';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RiskGaugeProps {
  score: number; // 0-100
  level: RiskLevel;
  size?: number;
  strokeWidth?: number;
}

export default function RiskGauge({
  score,
  level,
  size = 200,
  strokeWidth = 16,
}: RiskGaugeProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const { fg } = riskColor(level);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: score,
      duration: 1100,
      easing: Easing.out(Easing.cubic),
      // strokeDashoffset is an SVG prop, not a transform/opacity style —
      // the native driver only supports those, so this must run on the JS thread.
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={colors.surfaceElevated}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <AnimatedCircle
          stroke={fg}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.score, { color: fg }]}>{score}</Text>
        <Text style={styles.outOf}>RISK SCORE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  score: {
    fontFamily: fontFamily.bodyBold,
    fontSize: 48,
  },
  outOf: {
    fontFamily: fontFamily.bodySemiBold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: colors.textTertiary,
    marginTop: 2,
  },
});
