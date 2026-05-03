import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { CustomTabBar } from '@/components/ui/custom-tab-bar';
import { IconSymbol } from '@/components/ui/icon-symbol';
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
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name="list.bullet.clipboard" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Trang chủ',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name="house.fill" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Cài đặt',
            tabBarIcon: ({ color }) => (
              <IconSymbol size={24} name="gearshape.fill" color={color} />
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
