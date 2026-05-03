import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenBackTitle } from '@/components/ui/ScreenBackTitle';
import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors, useAppTheme } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export default function SettingsScreen() {
  const colors = useAppColors();
  const styles = createStyles(colors);
  const { resolvedTheme, setThemePreference } = useAppTheme();
  const isDarkModeEnabled = resolvedTheme === 'dark';

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ScreenBackTitle title="Cài đặt" onPress={() => router.replace('/(tabs)')} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>HIỂN THỊ</Text>

          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <View style={styles.iconWrap}>
                  <Ionicons name="moon-outline" size={24} color={colors.primaryMain} />
                </View>

                <View style={styles.textWrap}>
                  <Text style={styles.itemTitle}>Chế độ tối</Text>
                  <Text style={styles.itemSubtitle}>Tối ưu hóa cho ban đêm</Text>
                </View>
              </View>

              <Switch
                value={isDarkModeEnabled}
                onValueChange={(value) => void setThemePreference(value ? 'dark' : 'light')}
                trackColor={{ false: colors.bgSurface3, true: colors.primaryLight }}
                thumbColor={colors.bgSurface1}
                ios_backgroundColor={colors.bgSurface3}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.bgApp,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 32,
    },
    header: {
      marginBottom: 28,
    },
    section: {
      gap: 16,
    },
    sectionLabel: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(13),
      color: colors.textMuted,
      letterSpacing: 0.6,
    },
    card: {
      backgroundColor: colors.bgSurface1,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.borderDefault,
      paddingHorizontal: 16,
      paddingVertical: 18,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    rowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: colors.bgSurface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    textWrap: {
      flex: 1,
      gap: 4,
    },
    itemTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(17),
      color: colors.textPrimary,
    },
    itemSubtitle: {
      fontFamily: FontFamily.sans,
      fontSize: scale(13),
      color: colors.textMuted,
      lineHeight: scale(19),
    },
  });
