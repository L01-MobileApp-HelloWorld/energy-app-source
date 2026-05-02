import React from 'react';
import { Text, View } from 'react-native';

// ─── Types ────────────────────────────────────────────────────────────────────

export type StateKey =
  | 'exhausted'
  | 'tired'
  | 'lazy'
  | 'ready'
  | 'focused'
  | 'unmotivated';

type StateBadgeProps = {
  state: StateKey;
  className?: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────
// Dùng class name hoàn chỉnh (không dynamic) để Tailwind scanner nhận ra

const STATE_CONFIG: Record<
  StateKey,
  { label: string; container: string; text: string }
> = {
  exhausted: {
    label: 'KIỆT SỨC',
    container: 'bg-state-exhausted/10 border border-state-exhausted/30',
    text: 'text-state-exhausted',
  },
  tired: {
    label: 'MỆT MỎI',
    container: 'bg-state-tired/10 border border-state-tired/30',
    text: 'text-state-tired',
  },
  lazy: {
    label: 'LƯỜI CÓ DEADLINE',
    container: 'bg-state-lazy/10 border border-state-lazy/30',
    text: 'text-state-lazy',
  },
  ready: {
    label: 'SẴN SÀNG',
    container: 'bg-state-ready/10 border border-state-ready/30',
    text: 'text-state-ready',
  },
  focused: {
    label: 'TẬP TRUNG',
    container: 'bg-state-focused/10 border border-state-focused/30',
    text: 'text-state-focused',
  },
  unmotivated: {
    label: 'THIẾU ĐỘNG LỰC',
    container: 'bg-state-unmotivated/10 border border-state-unmotivated/30',
    text: 'text-state-unmotivated',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

const StateBadge = ({ state, className }: StateBadgeProps) => {
  const config = STATE_CONFIG[state];

  return (
    <View
      className={`self-start rounded-full px-3 py-1 ${config.container} ${className ?? ''}`}
    >
      <Text
        className={`text-2xs font-semibold tracking-caption uppercase ${config.text}`}
      >
        {config.label}
      </Text>
    </View>
  );
};

StateBadge.displayName = 'StateBadge';

export { StateBadge };
