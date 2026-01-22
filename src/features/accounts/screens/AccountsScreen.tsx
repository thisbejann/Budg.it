import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Plus, Wallet, CreditCard, Users, HandCoins } from 'lucide-react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson, AccountType } from '../../../types/database';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { Card, IconAvatar, EmptyState, AccountTypeBadge } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { AccountRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { COLORS } from '../../../constants/colors';
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

  const [sections, setSections] = useState<AccountSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);
      const accounts = await AccountRepository.getAllByLedger(activeLedgerId);

      // Group by type
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
          icon: <Wallet size={20} color={COLORS.accountDebit} />,
          data: grouped.debit,
          total: grouped.debit.reduce((sum, a) => sum + a.current_balance, 0),
        },
        {
          title: 'Credit Cards',
          type: 'credit',
          icon: <CreditCard size={20} color={COLORS.accountCredit} />,
          data: grouped.credit,
          total: grouped.credit.reduce((sum, a) => sum + a.current_balance, 0),
        },
        {
          title: 'Owed to Me',
          type: 'owed',
          icon: <HandCoins size={20} color={COLORS.accountOwed} />,
          data: grouped.owed,
          total: grouped.owed.reduce((sum, a) => sum + a.current_balance, 0),
        },
        {
          title: 'I Owe',
          type: 'debt',
          icon: <Users size={20} color={COLORS.accountDebt} />,
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

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const getIcon = (iconName: string, color: string = '#fff') => {
    const IconComponent = (LucideIcons as any)[
      iconName.split('-').map((s, i) => (i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1))).join('')
    ] || LucideIcons.Circle;
    return <IconComponent size={18} color={color} />;
  };

  const renderAccount = ({ item }: { item: AccountWithPerson }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
      className="flex-row items-center justify-between border-b border-border px-4 py-3"
    >
      <View className="flex-row items-center gap-3">
        <IconAvatar
          size="md"
          icon={getIcon(item.icon)}
          backgroundColor={item.color}
        />
        <View>
          <Text className="text-base font-medium text-foreground">{item.name}</Text>
          {item.person_name && (
            <Text className="text-xs text-muted-foreground">{item.person_name}</Text>
          )}
        </View>
      </View>
      <View className="items-end">
        <Text
          className={`text-base font-semibold ${
            item.current_balance >= 0 ? 'text-foreground' : 'text-red-600'
          }`}
        >
          {formatPHP(item.current_balance)}
        </Text>
        {item.account_type === 'credit' && item.credit_limit && (
          <Text className="text-xs text-muted-foreground">
            of {formatPHP(item.credit_limit)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: AccountSection }) => (
    <View className="flex-row items-center justify-between bg-secondary px-4 py-2">
      <View className="flex-row items-center gap-2">
        {section.icon}
        <Text className="text-sm font-semibold text-foreground">{section.title}</Text>
      </View>
      <Text className="text-sm font-semibold text-foreground">{formatPHP(section.total)}</Text>
    </View>
  );

  return (
    <Screen scrollable={false}>
      <SimpleHeader title="Accounts" />

      {/* Add Account Button */}
      <View className="flex-row justify-end border-b border-border px-4 py-2">
        <TouchableOpacity
          onPress={() => navigation.navigate('AddAccount')}
          className="flex-row items-center gap-1 rounded-lg bg-primary px-3 py-1.5"
        >
          <Plus size={16} color="#fff" />
          <Text className="text-sm font-medium text-white">Add Account</Text>
        </TouchableOpacity>
      </View>

      {sections.length === 0 ? (
        <EmptyState
          icon={<Wallet size={48} color={COLORS.mutedForeground} />}
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
        />
      )}
    </Screen>
  );
}
