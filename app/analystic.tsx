import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

const SPINNER = 128;
const STROKE = 10;
const R = (SPINNER - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function AnalysticScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { answers } = useLocalSearchParams<{ answers: string }>();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    ).start();

    const timer = setTimeout(() => {
      router.replace({ pathname: '/result', params: { answers } });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <Animated.View style={[styles.center, { opacity: fadeAnim }]}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Svg width={SPINNER} height={SPINNER}>
            <Circle
              cx={SPINNER / 2}
              cy={SPINNER / 2}
              r={R}
              stroke={colors.bgSurface3}
              strokeWidth={STROKE}
              fill="none"
            />
            <Circle
              cx={SPINNER / 2}
              cy={SPINNER / 2}
              r={R}
              stroke={colors.primaryMain}
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={CIRC}
              strokeDashoffset={CIRC * 0.28}
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        <View style={styles.textGroup}>
          <Text style={styles.title}>Đang phân tích...</Text>
          <Text style={styles.subtitle}>Vui lòng đợi trong giây lát</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bgApp,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 36,
  },
  textGroup: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: FontFamily.sansBold,
    fontSize: scale(22),
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: FontFamily.sans,
    fontSize: scale(14),
    color: colors.textMuted,
  },
});
