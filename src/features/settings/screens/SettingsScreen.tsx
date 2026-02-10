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
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../shared/components/ui';
import { useLedgerStore, useThemeStore, ThemeMode } from '../../../store';
import { useTheme } from '../../../hooks/useColorScheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onPress: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  isDark: boolean;
}

function SettingItem({
  icon,
  title,
  description,
  onPress,
  colors,
  isDark,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View
          className="h-10 w-10 items-center justify-center"
          style={{
            backgroundColor: isDark ? colors.surfaceContainer : colors.surfaceVariant,
            borderRadius: 12,
            borderWidth: isDark ? 1 : 0,
            borderColor: 'rgba(255, 255, 255, 0.06)',
          }}
        >
          {icon}
        </View>
        <View>
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
      </View>
      <ChevronRight size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
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

      <ScrollView className="flex-1 px-4 py-4">
        {/* Current Ledger Info */}
        <Card variant={isDark ? 'glass' : 'default'} className="mb-4">
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

        {/* Theme Selection */}
        <Card variant={isDark ? 'glass' : 'default'} className="mb-4">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row gap-2 py-3">
              {themeModes.map(({ mode, label, icon: Icon }) => {
                const isActive = themeMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setThemeMode(mode)}
                    className="flex-1 items-center py-3"
                    style={{
                      backgroundColor: isActive
                        ? colors.primary
                        : isDark
                          ? colors.surfaceContainer
                          : colors.surfaceVariant,
                      borderRadius: 16,
                      borderWidth: isActive && isDark ? 1 : 0,
                      borderColor: 'rgba(255, 255, 255, 0.15)',
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
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card variant={isDark ? 'glass' : 'default'} className="mb-4">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingItem
              icon={<Tags size={20} color={colors.primary} />}
              title="Categories"
              description="Manage expense and income categories"
              onPress={() => navigation.navigate('Categories')}
              colors={colors}
              isDark={isDark}
            />
            <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }} />
            <SettingItem
              icon={<Bookmark size={20} color={colors.primary} />}
              title="Quick Add Templates"
              description="Save frequent transactions for quick entry"
              onPress={() => navigation.navigate('Templates')}
              colors={colors}
              isDark={isDark}
            />
            <View style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }} />
            <SettingItem
              icon={<BookOpen size={20} color={colors.primary} />}
              title="Ledgers"
              description="Manage multiple ledgers (personal, business)"
              onPress={() => navigation.navigate('Ledgers')}
              colors={colors}
              isDark={isDark}
            />
          </CardContent>
        </Card>

        {/* Export */}
        <Card variant={isDark ? 'glass' : 'default'} className="mb-4">
          <CardHeader>
            <CardTitle>Backup & Export</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingItem
              icon={<Download size={20} color={colors.primary} />}
              title="Export Data"
              description="Export transactions to CSV"
              onPress={() => navigation.navigate('Export')}
              colors={colors}
              isDark={isDark}
            />
          </CardContent>
        </Card>

        {/* About */}
        <Card variant={isDark ? 'glass' : 'default'} className="mb-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center gap-3 py-3">
              <View
                className="h-10 w-10 items-center justify-center"
                style={{
                  backgroundColor: isDark ? colors.surfaceContainer : colors.surfaceVariant,
                  borderRadius: 12,
                  borderWidth: isDark ? 1 : 0,
                  borderColor: 'rgba(255, 255, 255, 0.06)',
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
          </CardContent>
        </Card>
      </ScrollView>
    </Screen>
  );
}
