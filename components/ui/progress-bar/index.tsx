import React from 'react';
import { Text, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

type ProgressBarProps = {
  /** Câu hỏi hiện tại (1-based) */
  current: number;
  /** Tổng số câu hỏi */
  total: number;
  /** Hiển thị nhãn "2/10" bên trên thanh */
  showLabel?: boolean;
  className?: string;
};

// ─── Component ────────────────────────────────────────────────────────────────

const ProgressBar = ({
  current,
  total,
  showLabel = false,
  className,
}: ProgressBarProps) => {
  const progress = Math.min(1, Math.max(0, current / total));
  const percentage = `${Math.round(progress * 100)}%` as `${number}%`;

  return (
    <View className={className}>
      {showLabel ? (
        <Text className="text-xs text-apptext-muted mb-1.5">
          {current}/{total}
        </Text>
      ) : null}

      {/* Track */}
      <View className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
        {/* Fill */}
        <View
          className="h-full rounded-full bg-accent-purple"
          style={{ width: percentage }}
        />
      </View>
    </View>
  );
};

ProgressBar.displayName = 'ProgressBar';

export { ProgressBar };
export type { ProgressBarProps };
