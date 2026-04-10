import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heading } from '@/components/ui/heading';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Heading size="lg" style={{ color: '#94A3B8' }}>Cài đặt</Heading>
      </View>
    </SafeAreaView>
  );
}
