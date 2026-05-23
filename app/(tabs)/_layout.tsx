import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { CustomTabBar } from '@/components/ui/custom-tab-bar';
import { AppColorsType } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

type TabIconProps = { color: string; focused: boolean };

function HistoryTabIcon({ color, focused }: TabIconProps) {
  return <Ionicons size={24} name={focused ? 'time' : 'time-outline'} color={color} />;
}

function HomeTabIcon({ color, focused }: TabIconProps) {
  return <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />;
}

function SettingsTabIcon({ color, focused }: TabIconProps) {
  return <Ionicons size={24} name={focused ? 'settings' : 'settings-outline'} color={color} />;
}

function renderTabBar(props: React.ComponentProps<typeof CustomTabBar>) {
  return <CustomTabBar {...props} />;
}

export default function TabLayout() {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={renderTabBar}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="history"
          options={{
            title: 'Lịch sử',
            tabBarIcon: HistoryTabIcon,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: HomeTabIcon,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Cài đặt',
            tabBarIcon: SettingsTabIcon,
          }}
        />
      </Tabs>
    </View>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bgApp,
    },
  });
