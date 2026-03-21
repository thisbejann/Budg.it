import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  ChevronRight,
  Tags,
  Bookmark,
  BookOpen,
  Download,
  Info,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { Card, CardContent } from '../../../shared/components/ui';
import { useLedgerStore, useThemeStore, ThemeMode } from '../../../store';
import { useTheme } from '../../../hooks/useColorScheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function SettingItem({
  icon,
  title,
  description,
  onPress,
  showDivider = true,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onPress: () => void;
  showDivider?: boolean;
}) {
  const { colors, isDark } = useTheme();

  return (
    <>
      <TouchableOpacity
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${title}${description ? `, ${description}` : ''}`}
        className="flex-row items-center justify-between px-4 py-3"
        activeOpacity={0.7}
      >
        <View className="flex-row items-center gap-3">
          <View
            className="h-10 w-10 items-center justify-center"
            style={{
              backgroundColor: isDark ? colors.surfaceContainer : colors.surfaceVariant,
              borderRadius: 12,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.borderSubtle,
            }}
          >
            {icon}
          </View>
          <View className="flex-1">
            <Text
              className="text-base font-medium"
              style={{ color: colors.foreground }}
            >
              {title}
            </Text>
            {description && (
              <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                {description}
              </Text>
            )}
          </View>
          <ChevronRight size={20} color={colors.mutedForeground} />
        </View>
      </TouchableOpacity>
      {showDivider && (
        <View
          className="ml-16"
          style={{ height: 1, backgroundColor: isDark ? colors.dividerSubtle : colors.border }}
        />
      )}
    </>
  );
}

function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text
      className="mb-1 mt-6 px-4 text-xs font-semibold uppercase"
      style={{ color: colors.mutedForeground, letterSpacing: 0.5 }}
    >
      {title}
    </Text>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedger } = useLedgerStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors, isDark } = useTheme();

  const themeModes: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
    { mode: 'light', label: 'Light', icon: Sun },
    { mode: 'dark', label: 'Dark', icon: Moon },
    { mode: 'system', label: 'System', icon: Smartphone },
  ];

  return (
    <Screen hasTabBar>
      <SimpleHeader title="Settings" />

      <ScrollView className="flex-1">
        {/* Current Ledger — kept as card since it displays data */}
        <View className="px-4 pt-4">
          <Card variant={isDark ? 'glass' : 'default'}>
            <CardContent>
              <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                Current Ledger
              </Text>
              <Text
                className="text-lg font-semibold"
                style={{ color: colors.foreground }}
              >
                {activeLedger?.name || 'No ledger selected'}
              </Text>
            </CardContent>
          </Card>
        </View>

        {/* Appearance */}
        <SectionHeader title="Appearance" />
        <View className="flex-row gap-2 px-4 py-2">
          {themeModes.map(({ mode, label, icon: Icon }) => {
            const isActive = themeMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                onPress={() => setThemeMode(mode)}
                accessibilityRole="radio"
                accessibilityLabel={`${label} theme`}
                accessibilityState={{ selected: isActive }}
                className="flex-1 items-center py-3"
                style={{
                  backgroundColor: isActive
                    ? colors.primary
                    : isDark
                      ? colors.surfaceContainer
                      : colors.surfaceVariant,
                  borderRadius: 16,
                  borderWidth: isActive && isDark ? 1 : 0,
                  borderColor: colors.borderSubtle,
                }}
              >
                <Icon
                  size={20}
                  color={isActive ? colors.onPrimary : colors.foreground}
                />
                <Text
                  className="mt-1 text-sm font-medium"
                  style={{
                    color: isActive ? colors.onPrimary : colors.foreground,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Data Management */}
        <SectionHeader title="Data Management" />
        <SettingItem
          icon={<Tags size={20} color={colors.primary} />}
          title="Categories"
          description="Manage expense and income categories"
          onPress={() => navigation.navigate('Categories')}
        />
        <SettingItem
          icon={<Bookmark size={20} color={colors.primary} />}
          title="Quick Add Templates"
          description="Save frequent transactions for quick entry"
          onPress={() => navigation.navigate('Templates')}
        />
        <SettingItem
          icon={<BookOpen size={20} color={colors.primary} />}
          title="Ledgers"
          description="Manage multiple ledgers (personal, business)"
          onPress={() => navigation.navigate('Ledgers')}
          showDivider={false}
        />

        {/* Backup & Export */}
        <SectionHeader title="Backup & Export" />
        <SettingItem
          icon={<Download size={20} color={colors.primary} />}
          title="Export Data"
          description="Export transactions to CSV"
          onPress={() => navigation.navigate('Export')}
          showDivider={false}
        />

        {/* About */}
        <SectionHeader title="About" />
        <View className="flex-row items-center gap-3 px-4 py-3">
          <View
            className="h-10 w-10 items-center justify-center"
            style={{
              backgroundColor: isDark ? colors.surfaceContainer : colors.surfaceVariant,
              borderRadius: 12,
              borderWidth: isDark ? 1 : 0,
              borderColor: colors.borderSubtle,
            }}
          >
            <Info size={20} color={colors.primary} />
          </View>
          <View>
            <Text
              className="text-base font-medium"
              style={{ color: colors.foreground }}
            >
              Budget Tracker
            </Text>
            <Text
              className="text-xs"
              style={{ color: colors.mutedForeground }}
            >
              Version 1.0.0
            </Text>
          </View>
        </View>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
