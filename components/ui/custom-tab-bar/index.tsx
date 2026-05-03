import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useAppColors();

  return (
    <View style={{ height: 72 + insets.bottom }} pointerEvents="box-none">
      <View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          bottom: insets.bottom + 12,
          left: 16,
          right: 16,
        }}
      >
        <View
          style={{
            backgroundColor: colors.bgSurface1,
            borderRadius: 999,
            flexDirection: 'row',
            paddingVertical: 12,
            paddingHorizontal: 8,
            borderWidth: 1,
            borderColor: colors.borderDefault,
          }}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const color = isFocused ? colors.primaryMain : colors.textPrimary;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 }}
              >
                {options.tabBarIcon?.({ color, size: 24, focused: isFocused })}
                <Text style={{ color, fontSize: 12, fontFamily: FontFamily.sansSemiBold }}>
                  {options.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
