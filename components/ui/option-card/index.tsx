import React from 'react';
import { Pressable, Text, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type OptionCardProps = {
  label: string;
  description?: string;
  isSelected?: boolean;
  isDisabled?: boolean;
  onPress?: () => void;
  className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

const OptionCard = ({
  label,
  description,
  isSelected = false,
  isDisabled = false,
  onPress,
  className,
}: OptionCardProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`
        rounded-2xl border p-4
        ${isSelected
          ? 'border-accent-purple bg-accent-purple-surface'
          : 'border-border-default bg-surface-1'
        }
        ${isDisabled ? 'opacity-40' : 'active:opacity-70'}
        ${className ?? ''}
      `}
    >
      <View className="flex-row items-center gap-3">
        {/* Radio indicator */}
        <View
          className={`
            h-5 w-5 rounded-full border-2 items-center justify-center shrink-0
            ${isSelected ? 'border-accent-purple' : 'border-apptext-disabled'}
          `}
        >
          {isSelected && (
            <View className="h-2.5 w-2.5 rounded-full bg-accent-purple" />
          )}
        </View>

        {/* Text */}
        <View className="flex-1">
          <Text
            className={`text-sm font-semibold ${
              isSelected ? 'text-apptext-primary' : 'text-apptext-secondary'
            }`}
          >
            {label}
          </Text>
          {description ? (
            <Text className="text-xs text-apptext-muted mt-0.5">
              {description}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
};

OptionCard.displayName = 'OptionCard';

export { OptionCard };
export type { OptionCardProps };
