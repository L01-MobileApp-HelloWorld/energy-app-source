import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AppColorsType, FontFamily } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-theme';

const { width } = Dimensions.get('window');
const scale = (size: number) => (width / 390) * size;

export type SortOption = 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: { value: SortOption; label: string; sub: string; icon: React.ComponentProps<typeof Ionicons>['name'] }[] = [
  { value: 'date-desc', label: 'Mới nhất trước', sub: 'Kết quả gần đây hiển thị đầu tiên', icon: 'arrow-down-outline' },
  { value: 'date-asc',  label: 'Cũ nhất trước',  sub: 'Kết quả lâu nhất hiển thị đầu tiên', icon: 'arrow-up-outline' },
  { value: 'name-asc',  label: 'Tên A → Z',       sub: 'Sắp xếp theo thứ tự bảng chữ cái',  icon: 'text-outline' },
  { value: 'name-desc', label: 'Tên Z → A',       sub: 'Sắp xếp ngược thứ tự bảng chữ cái', icon: 'text-outline' },
];

type SortSheetProps = {
  visible: boolean;
  selected: SortOption;
  onSelect: (option: SortOption) => void;
  onClose: () => void;
};

export function SortSheet({ visible, selected, onSelect, onClose }: SortSheetProps) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.handle} />

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sắp xếp theo</Text>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7} style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {SORT_OPTIONS.map((opt, i) => {
          const isSelected = selected === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionRow, i < SORT_OPTIONS.length - 1 && styles.optionBorder]}
              activeOpacity={0.7}
              onPress={() => { onSelect(opt.value); onClose(); }}
            >
              <View style={[styles.optionIcon, isSelected && { backgroundColor: colors.primarySurface }]}>
                <Ionicons name={opt.icon} size={18} color={isSelected ? colors.primaryMain : colors.textMuted} />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, isSelected && { color: colors.primaryMain }]}>
                  {opt.label}
                </Text>
                <Text style={styles.optionSub}>{opt.sub}</Text>
              </View>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={20} color={colors.primaryMain} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColorsType) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheet: {
      backgroundColor: colors.bgSurface1,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingBottom: 32,
      paddingHorizontal: 20,
    },
    handle: {
      width: 36,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.borderDefault,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 16,
    },
    headerTitle: {
      fontFamily: FontFamily.sansBold,
      fontSize: scale(16),
      color: colors.textPrimary,
    },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.bgSurface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      paddingVertical: 14,
    },
    optionBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderDefault,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.bgSurface2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionText: {
      flex: 1,
      gap: 2,
    },
    optionLabel: {
      fontFamily: FontFamily.sansSemiBold,
      fontSize: scale(14),
      color: colors.textPrimary,
    },
    optionSub: {
      fontFamily: FontFamily.sans,
      fontSize: scale(12),
      color: colors.textMuted,
    },
  });
