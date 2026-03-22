import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, SectionList, ScrollView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Plus, Wallet, CreditCard, Users, HandCoins, AlertTriangle, List, LayoutGrid } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../types/navigation';
import type { AccountWithPerson, AccountType } from '../../../types/database';
import { Screen, SimpleHeader } from '../../../shared/components/layout';
import { Card, CardPressable, CardContent, IconAvatar, EmptyState, AccountTypeBadge, AccountsScreenSkeleton } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { AccountRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { useTheme } from '../../../hooks/useColorScheme';
import { FLOATING_TAB_BAR_TOTAL_HEIGHT } from '../../../shared/components/navigation/FloatingTabBar';
import { getIconComponent } from '../../../shared/utils/icon';

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
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'cards'>('list');

  const loadAccounts = useCallback(async () => {
    if (!activeLedgerId) return;

    try {
      setIsLoading(true);
      setError(null);
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
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load accounts');
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
    const IconComponent = getIconComponent(iconName);
    return <IconComponent size={18} color={color} />;
  };

  const pillStyle = (isActive: boolean) => ({
    backgroundColor: isActive ? colors.primary : (isDark ? colors.surfaceContainer : colors.secondaryContainer),
    borderRadius: 20,
  });

  const pillTextColor = (isActive: boolean) =>
    isActive ? colors.onPrimary : (isDark ? colors.mutedForeground : colors.onSecondaryContainer);

  const renderAccount = ({ item, index }: { item: AccountWithPerson; index: number }) => (
    <Animated.View entering={shouldAnimateEntry ? FadeInDown.delay(index * 50).duration(300) : undefined}>
      <TouchableOpacity
        onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
        accessibilityRole="button"
        accessibilityLabel={`${item.name}, balance ${formatPHP(item.current_balance)}`}
        className="flex-row items-center justify-between px-4 py-3"
        style={{ borderBottomWidth: 1, borderBottomColor: isDark ? colors.dividerSubtle : colors.border }}
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

  const renderCardView = () => (
    <ScrollView
      contentContainerStyle={{ paddingBottom: FLOATING_TAB_BAR_TOTAL_HEIGHT, paddingHorizontal: 16 }}
    >
      {sections.map((section) => (
        <View key={section.type} className="mb-4">
          {/* Section header */}
          <View className="flex-row items-center justify-between py-2 mb-2">
            <View className="flex-row items-center gap-2">
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
          {/* 2-column grid */}
          <View className="flex-row flex-wrap" style={{ gap: 12 }}>
            {section.data.map((item, index) => (
              <Animated.View
                key={item.id}
                entering={shouldAnimateEntry ? FadeInDown.delay(index * 50).duration(300) : undefined}
                style={{ width: '47%', flexGrow: 1 }}
              >
                <CardPressable
                  onPress={() => navigation.navigate('AccountDetail', { accountId: item.id })}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.name}, balance ${formatPHP(item.current_balance)}`}
                >
                  <IconAvatar
                    size="md"
                    icon={getIcon(item.icon)}
                    backgroundColor={item.color}
                  />
                  <Text className="text-sm font-semibold mt-2" style={{ color: colors.foreground }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  {item.person_name && (
                    <Text className="text-xs" style={{ color: colors.mutedForeground }} numberOfLines={1}>
                      {item.person_name}
                    </Text>
                  )}
                  <Text
                    className="text-base font-bold mt-1"
                    style={{ color: item.current_balance >= 0 ? colors.foreground : colors.expense }}
                  >
                    {formatPHP(item.current_balance)}
                  </Text>
                  {item.account_type === 'credit' && item.credit_limit && (
                    <Text className="text-xs" style={{ color: colors.mutedForeground }}>
                      of {formatPHP(item.credit_limit)}
                    </Text>
                  )}
                </CardPressable>
              </Animated.View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const hasAccounts = sections.length > 0;

  return (
    <Screen scrollable={false}>
      <SimpleHeader title="Accounts" />

      {/* Add Account Button + View Toggle */}
      <View className="flex-row items-center justify-between px-4 py-2">
        {/* View Toggle */}
        {hasAccounts && !isLoading && !error ? (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => setViewMode('list')}
              accessibilityRole="radio"
              accessibilityLabel="List view"
              accessibilityState={{ selected: viewMode === 'list' }}
              className="flex-row items-center gap-1 px-3 py-2"
              style={pillStyle(viewMode === 'list')}
            >
              <List size={16} color={pillTextColor(viewMode === 'list')} />
              <Text className="text-sm font-medium" style={{ color: pillTextColor(viewMode === 'list') }}>
                List
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setViewMode('cards')}
              accessibilityRole="radio"
              accessibilityLabel="Card view"
              accessibilityState={{ selected: viewMode === 'cards' }}
              className="flex-row items-center gap-1 px-3 py-2"
              style={pillStyle(viewMode === 'cards')}
            >
              <LayoutGrid size={16} color={pillTextColor(viewMode === 'cards')} />
              <Text className="text-sm font-medium" style={{ color: pillTextColor(viewMode === 'cards') }}>
                Cards
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View />
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('AddAccount')}
          accessibilityRole="button"
          accessibilityLabel="Add account"
          className="flex-row items-center gap-1 px-4 py-2.5"
          style={{ backgroundColor: colors.primary, borderRadius: 20 }}
        >
          <Plus size={16} color={colors.onPrimary} />
          <Text className="text-sm font-medium" style={{ color: colors.onPrimary }}>Add Account</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <AccountsScreenSkeleton />
      ) : error ? (
        <EmptyState
          icon={<AlertTriangle size={48} color={colors.mutedForeground} />}
          title="Something went wrong"
          description={error}
          actionLabel="Try Again"
          onAction={loadAccounts}
        />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={<Wallet size={48} color={colors.mutedForeground} />}
          title="No accounts yet"
          description="Add your bank accounts, credit cards, and track who owes you"
          actionLabel="Add Account"
          onAction={() => navigation.navigate('AddAccount')}
        />
      ) : viewMode === 'cards' ? (
        renderCardView()
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
