import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { CustomTabBar } from '@/components/ui/custom-tab-bar';
import { AppColors } from '@/constants/theme';

export default function TabLayout() {
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AppColors.bgApp,
  },
});
