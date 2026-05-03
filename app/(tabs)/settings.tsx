import { AppColors } from '@/constants/theme';
import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading } from '@/components/ui/heading';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.bgApp }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Heading size="lg" style={{ color: AppColors.textDisabled }}>Cài đặt</Heading>
      </View>
    </SafeAreaView>
  );
}
