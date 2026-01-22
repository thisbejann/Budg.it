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
} from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { COLORS } from '../../../constants/colors';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  onPress: () => void;
}

function SettingItem({ icon, title, description, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between py-3"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary">
          {icon}
        </View>
        <View>
          <Text className="text-base font-medium text-foreground">{title}</Text>
          {description && (
            <Text className="text-xs text-muted-foreground">{description}</Text>
          )}
        </View>
      </View>
      <ChevronRight size={20} color={COLORS.mutedForeground} />
    </TouchableOpacity>
  );
}

export function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedger } = useLedgerStore();

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

        {/* Data Management */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingItem
              icon={<Tags size={20} color={COLORS.primary} />}
              title="Categories"
              description="Manage expense and income categories"
              onPress={() => navigation.navigate('Categories')}
            />
            <View className="h-px bg-border" />
            <SettingItem
              icon={<Bookmark size={20} color={COLORS.primary} />}
              title="Quick Add Templates"
              description="Save frequent transactions for quick entry"
              onPress={() => navigation.navigate('Templates')}
            />
            <View className="h-px bg-border" />
            <SettingItem
              icon={<BookOpen size={20} color={COLORS.primary} />}
              title="Ledgers"
              description="Manage multiple ledgers (personal, business)"
              onPress={() => navigation.navigate('Ledgers')}
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
              icon={<Download size={20} color={COLORS.primary} />}
              title="Export Data"
              description="Export transactions to CSV"
              onPress={() => navigation.navigate('Export')}
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
              <View className="h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Info size={20} color={COLORS.primary} />
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
