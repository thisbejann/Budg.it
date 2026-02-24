import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SectionList, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Wallet, CreditCard, Users, HandCoins } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson, AccountType } from '../../../types/database';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { Card, IconAvatar, EmptyState, AccountTypeBadge } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { AccountRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { useTheme } from '../../../hooks/useColorScheme';
import { FLOATING_TAB_BAR_TOTAL_HEIGHT } from '../../../shared/components/navigation/FloatingTabBar';
import * as LucideIcons from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface AccountSection {
  title: string;
  type: AccountType;
  icon: React.ReactNode;
  data: AccountWithPerson[];
  total: number;
}

export function AccountsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeLedgerId } = useLedgerStore();
  const { colors, isDark } = useTheme();
  const shouldAnimateEntry = process.env.EXPO_OS !== 'android';

  const [sections, setSections] = useState<AccountSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);
      const accounts = await AccountRepository.getAllByLedger(activeLedgerId);

      const grouped: Record<AccountType, AccountWithPerson[]> = {
        debit: [],
        credit: [],
        owed: [],
        debt: [],
      };

      accounts.forEach((acc) => {
        grouped[acc.account_type].push(acc);
      });

      const sectionData: AccountSection[] = [
        {
          title: 'Cash & Bank',
          type: 'debit',
          icon: <Wallet size={20} color={colors.accountDebit} />,
          data: grouped.debit,
          total: grouped.debit.reduce((sum, a) => sum + a.current_balance, 0),
        },
        {
          title: 'Credit Cards',
          type: 'credit',
          icon: <CreditCard size={20} color={colors.accountCredit} />,
          data: grouped.credit,
          total: grouped.credit.reduce((sum, a) => sum + a.current_balance, 0),
        },
        {
          title: 'Owed to Me',
          type: 'owed',
          icon: <HandCoins size={20} color={colors.accountOwed} />,
          data: grouped.owed,
          total: grouped.owed.reduce((sum, a) => sum + a.current_balance, 0),
        },
        {
          title: 'I Owe',
          type: 'debt',
          icon: <Users size={20} color={colors.accountDebt} />,
          data: grouped.debt,
          total: grouped.debt.reduce((sum, a) => sum + a.current_balance, 0),
        },
      ];

      setSections(sectionData.filter((s) => s.data.length > 0));
    } catch (error) {
      console.error('Error loading accounts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeLedgerId]);

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [loadAccounts])
  );

  const getIcon = (iconName: string, color: string = colors.onPrimary) => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1))).join('')
    ] || LucideIcons.Circle;
    return <IconComponent size={18} color={color} />;
  };

  const renderAccount = ({ item, index }: { item: AccountWithPerson; index: number }) => (
    <Animated.View entering={shouldAnimateEntry ? FadeInDown.delay(index * 50).springify() : undefined}>
      <TouchableOpacity
        onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.04)' : colors.border }}
      >
        <View className="flex-row items-center gap-3">
          <IconAvatar
            size="md"
            icon={getIcon(item.icon)}
            backgroundColor={item.color}
          />
          <View>
            <Text className="text-base font-medium" style={{ color: colors.foreground }}>{item.name}</Text>
            {item.person_name && (
              <Text className="text-xs" style={{ color: colors.mutedForeground }}>{item.person_name}</Text>
            )}
          </View>
        </View>
        <View className="items-end">
          <Text
            className="text-base font-semibold"
            style={{ color: item.current_balance >= 0 ? colors.foreground : colors.expense }}
          >
            {formatPHP(item.current_balance)}
          </Text>
          {item.account_type === 'credit' && item.credit_limit && (
            <Text className="text-xs" style={{ color: colors.mutedForeground }}>
              of {formatPHP(item.credit_limit)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderSectionHeader = ({ section }: { section: AccountSection }) => (
    <View
      className="flex-row items-center justify-between px-4 py-2"
      style={{ backgroundColor: isDark ? colors.surfaceContainer : colors.surfaceVariant }}
    >
      <View className="flex-row items-center gap-2">
        {/* Gold accent bar */}
        <View
          style={{
            width: 3,
            height: 16,
            borderRadius: 2,
            backgroundColor: colors.primary,
            marginRight: 4,
          }}
        />
        {section.icon}
        <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>{section.title}</Text>
      </View>
      <Text className="text-sm font-semibold" style={{ color: colors.foreground }}>{formatPHP(section.total)}</Text>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <SimpleHeader title="Accounts" />

      {/* Add Account Button */}
      <View className="flex-row justify-end px-4 py-2">
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAccount')}
          className="flex-row items-center gap-1 px-4 py-1.5"
          style={{ backgroundColor: colors.primary, borderRadius: 20 }}
        >
          <Plus size={16} color={colors.onPrimary} />
          <Text className="text-sm font-medium" style={{ color: colors.onPrimary }}>Add Account</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : sections.length === 0 ? (
        <EmptyState
          icon={<Wallet size={48} color={colors.mutedForeground} />}
          title="No accounts yet"
          description="Add your bank accounts, credit cards, and track who owes you"
          actionLabel="Add Account"
          onAction={() => navigation.navigate('AddAccount')}
        />
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderAccount}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={(item) => item.id.toString()}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_TOTAL_HEIGHT }}
        />
      )}
    </Screen>
  );
}
