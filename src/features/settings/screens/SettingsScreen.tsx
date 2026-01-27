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
  Users,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui';
import { useLedgerStore, useThemeStore, ThemeMode } from '../../../store';
import { useTheme } from '../../../hooks/useColorScheme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onPress: () => void;
}

function SettingItem({ icon, title, description, onPress, colors }: SettingItemProps & { colors: any }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
          {icon}
        </View>
        <View>
          <Text className="text-base font-medium text-foreground">{title}</Text>
          {description && (
            <Text className="text-xs text-muted-foreground">{description}</Text>
          )}
        </View>
      </View>
      <ChevronRight size={20} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

interface ThemeOptionProps {
  icon: 'system' | 'light' | 'dark';
  label: string;
  value: ThemeMode;
  currentValue: ThemeMode;
  onSelect: (value: ThemeMode) => void;
  colors: any;
}

function ThemeOption({ icon, label, value, currentValue, onSelect, colors }: ThemeOptionProps) {
  const isSelected = currentValue === value;
  const iconColor = isSelected ? colors.primaryForeground : colors.foreground;

  const renderIcon = () => {
    switch (icon) {
      case 'system':
        return <Smartphone size={20} color={iconColor} />;
      case 'light':
        return <Sun size={20} color={iconColor} />;
      case 'dark':
        return <Moon size={20} color={iconColor} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onSelect(value)}
      className={`flex-1 items-center rounded-xl py-3 ${isSelected ? 'bg-primary' : 'bg-secondary'}`}
      activeOpacity={0.7}
    >
      <View className="mb-1">
        {renderIcon()}
      </View>
      <Text
        className={`text-xs font-medium ${isSelected ? 'text-white' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedger } = useLedgerStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const { colors } = useTheme();

  return (
    <Screen>
      <SimpleHeader title="Settings" />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Current Ledger Info */}
        <Card className="mb-4">
          <CardContent>
            <Text className="text-xs text-muted-foreground">Current Ledger</Text>
            <Text className="text-lg font-semibold text-foreground">
              {activeLedger?.name || 'No ledger selected'}
            </Text>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row gap-2">
              <ThemeOption
                icon="system"
                label="System"
                value="system"
                currentValue={themeMode}
                onSelect={setThemeMode}
                colors={colors}
              />
              <ThemeOption
                icon="light"
                label="Light"
                value="light"
                currentValue={themeMode}
                onSelect={setThemeMode}
                colors={colors}
              />
              <ThemeOption
                icon="dark"
                label="Dark"
                value="dark"
                currentValue={themeMode}
                onSelect={setThemeMode}
                colors={colors}
              />
            </View>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className="mb-4">
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
            />
            <View className="h-px bg-border" />
            <SettingItem
              icon={<Bookmark size={20} color={colors.primary} />}
              title="Quick Add Templates"
              description="Save frequent transactions for quick entry"
              onPress={() => navigation.navigate('Templates')}
              colors={colors}
            />
            <View className="h-px bg-border" />
            <SettingItem
              icon={<Users size={20} color={colors.primary} />}
              title="People"
              description="Manage contacts for owed/debt accounts"
              onPress={() => navigation.navigate('Persons')}
              colors={colors}
            />
            <View className="h-px bg-border" />
            <SettingItem
              icon={<BookOpen size={20} color={colors.primary} />}
              title="Ledgers"
              description="Manage multiple ledgers (personal, business)"
              onPress={() => navigation.navigate('Ledgers')}
              colors={colors}
            />
          </CardContent>
        </Card>

        {/* Export */}
        <Card className="mb-4">
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
            />
          </CardContent>
        </Card>

        {/* About */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center gap-3 py-3">
              <View className="h-10 w-10 items-center justify-center rounded-xl bg-secondary">
                <Info size={20} color={colors.primary} />
              </View>
              <View>
                <Text className="text-base font-medium text-foreground">
                  Budget Tracker
                </Text>
                <Text className="text-xs text-muted-foreground">Version 1.0.0</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </Screen>
  );
}
