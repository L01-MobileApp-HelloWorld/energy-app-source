import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { CustomTabBar } from '@/components/ui/custom-tab-bar';
import { AppColorsType } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

export default function TabLayout() {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Lịch sử',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? 'time' : 'time-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? 'home' : 'home-outline'} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Cài đặt',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons size={24} name={focused ? 'settings' : 'settings-outline'} color={color} />
            ),
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
