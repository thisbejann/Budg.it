import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../../types/navigation';
import type { TransactionWithDetails } from '../../../types/database';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Card, CardContent, ExpenseBadge, IncomeBadge } from '../../../shared/components/ui';
import { TransactionRepository } from '../../../database/repositories';
import { formatPHP } from '../../../shared/utils/currency';
import { COLORS } from '../../../constants/colors';
import * as LucideIcons from 'lucide-react-native';
import { Pencil, Trash2, Calendar, Clock, Wallet, Tag, FileText, Receipt } from 'lucide-react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type TransactionDetailRouteProp = RouteProp<RootStackParamList, 'TransactionDetail'>;

export function TransactionDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TransactionDetailRouteProp>();
  const transactionId = route.params.transactionId;

  const [transaction, setTransaction] = useState<TransactionWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTransaction = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await TransactionRepository.getById(transactionId);
      setTransaction(data);
    } catch (error) {
      console.error('Error loading transaction:', error);
    } finally {
      setIsLoading(false);
    }
  }, [transactionId]);

  useFocusEffect(
    useCallback(() => {
      loadTransaction();
    }, [loadTransaction])
  );

  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction? This will also update the account balance.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionRepository.delete(transactionId);
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <Screen>
        <Header title="Transaction Details" showBack />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </Screen>
    );
  }

  if (!transaction) {
    return (
      <Screen>
        <Header title="Transaction Details" showBack />
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-muted-foreground">Transaction not found</Text>
        </View>
      </Screen>
    );
  }

  const isExpense = transaction.type === 'expense';
  const typeColor = isExpense ? COLORS.expense : COLORS.income;

  const CategoryIcon = transaction.category_icon
    ? (LucideIcons as any)[
        transaction.category_icon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
      ]
    : null;

  const AccountIcon = transaction.account_icon
    ? (LucideIcons as any)[
        transaction.account_icon.split('-').map((s, i) => i === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1)).join('')
      ]
    : LucideIcons.Wallet;

  return (
    <Screen scrollable={false}>
      <Header
        title="Transaction Details"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('EditTransaction', { transactionId })}
            className="p-2"
          >
            <Pencil size={20} color={COLORS.foreground} />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1">
        {/* Amount Card */}
        <View className="px-4 pt-4">
          <Card>
            <CardContent className="items-center p-6">
              <View className="mb-2">
                {isExpense ? <ExpenseBadge /> : <IncomeBadge />}
              </View>
              <Text
                className="text-3xl font-bold"
                style={{ color: typeColor }}
              >
                {isExpense ? '-' : '+'}
                {formatPHP(transaction.amount)}
              </Text>
              {transaction.notes && (
                <Text className="mt-2 text-center text-muted-foreground">
                  {transaction.notes}
                </Text>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Details */}
        <View className="px-4 py-4">
          <Text className="mb-3 text-sm font-medium text-muted-foreground">DETAILS</Text>

          <Card>
            <CardContent className="p-0">
              {/* Category */}
              <View className="flex-row items-center gap-3 border-b border-border p-4">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: transaction.category_color || COLORS.muted }}
                >
                  {CategoryIcon ? (
                    <CategoryIcon size={18} color="#ffffff" />
                  ) : (
                    <Tag size={18} color="#ffffff" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">Category</Text>
                  <Text className="font-medium text-foreground">
                    {transaction.category_name || 'Uncategorized'}
                    {transaction.subcategory_name && ` › ${transaction.subcategory_name}`}
                  </Text>
                </View>
              </View>

              {/* Account */}
              <View className="flex-row items-center gap-3 border-b border-border p-4">
                <View
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: transaction.account_color || COLORS.primary }}
                >
                  <AccountIcon size={18} color="#ffffff" />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">Account</Text>
                  <Text className="font-medium text-foreground">{transaction.account_name}</Text>
                </View>
              </View>

              {/* Date */}
              <View className="flex-row items-center gap-3 border-b border-border p-4">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                  <Calendar size={18} color={COLORS.foreground} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted-foreground">Date</Text>
                  <Text className="font-medium text-foreground">{transaction.date}</Text>
                </View>
              </View>

              {/* Time */}
              {transaction.time && (
                <View className="flex-row items-center gap-3 border-b border-border p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Clock size={18} color={COLORS.foreground} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground">Time</Text>
                    <Text className="font-medium text-foreground">{transaction.time}</Text>
                  </View>
                </View>
              )}

              {/* Receipt */}
              {transaction.receipt_image_path && (
                <View className="flex-row items-center gap-3 p-4">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-secondary">
                    <Receipt size={18} color={COLORS.foreground} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-muted-foreground">Receipt</Text>
                    <Text className="font-medium text-primary">View attachment</Text>
                  </View>
                </View>
              )}
            </CardContent>
          </Card>
        </View>

        {/* Delete Button */}
        <View className="px-4 pb-8">
          <Button variant="destructive" onPress={handleDelete}>
            <Trash2 size={18} color="#ffffff" />
            <Text className="ml-2 font-medium text-white">Delete Transaction</Text>
          </Button>
        </View>
      </ScrollView>
    </Screen>
  );
}
