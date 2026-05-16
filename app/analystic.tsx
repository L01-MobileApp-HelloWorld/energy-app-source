import Constants from 'expo-constants';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';
import { apiClient } from '@/services/api-client';
import type { IApiAnswer, IServerResult } from '@/typescript';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

const SPINNER = 128;
const STROKE = 10;
const R = (SPINNER - STROKE) / 2;
const CIRC = 2 * Math.PI * R;

export default function AnalysticScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { answers, apiAnswers, startedAt } = useLocalSearchParams<{
    answers: string;
    apiAnswers: string;
    startedAt?: string;
  }>();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [statusText, setStatusText] = useState('Đang phân tích...');
  const hasSubmitted = useRef(false);

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

    // Submit to API
    if (hasSubmitted.current) return;
    hasSubmitted.current = true;

    const submitQuiz = async () => {
      try {
        const parsedApiAnswers = JSON.parse(apiAnswers || '[]') as IApiAnswer[];
        const parsedStartedAt = Number(startedAt);
        const completionTime =
          Number.isFinite(parsedStartedAt) && parsedStartedAt > 0
            ? Math.max(0, Math.round((Date.now() - parsedStartedAt) / 1000))
            : 0;

        const res = await apiClient.post<{
          success: boolean;
          data: { history: IServerResult };
        }>('/api/histories/analyze', {
          answers: parsedApiAnswers,
          meta: {
            completionTime,
            deviceInfo: Platform.OS,
            appVersion: Constants.expoConfig?.version ?? '1.0.0',
          },
        });

        setStatusText('Hoàn tất!');

        // Navigate with server result
        setTimeout(() => {
          router.replace({
            pathname: '/result',
            params: {
              answers,
              serverResult: JSON.stringify(res.data.history),
            },
          });
        }, 500);
      } catch (error) {
        console.warn('[Analystic] API submit failed, using local scoring:', error);
        setStatusText('Đang tính toán...');

        // Fallback to local scoring
        setTimeout(() => {
          router.replace({ pathname: '/result', params: { answers } });
        }, 800);
      }
    };

    submitQuiz();
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
          <Text style={styles.title}>{statusText}</Text>
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
