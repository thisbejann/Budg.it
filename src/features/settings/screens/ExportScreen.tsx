import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Screen, Header } from '../../../shared/components/layout';
import { Button, Input } from '../../../shared/components/ui';
import { useLedgerStore } from '../../../store';
import { TransactionRepository, AccountRepository, TransferRepository } from '../../../database/repositories';
import { getToday } from '../../../shared/utils/date';
import { useTheme } from '../../../hooks/useColorScheme';
import { FileText, Table, ArrowLeftRight, Download, Check } from 'lucide-react-native';

type ExportType = 'transactions' | 'accounts' | 'transfers';

export function ExportScreen() {
  const { activeLedgerId } = useLedgerStore();
  const { colors } = useTheme();

  const [selectedType, setSelectedType] = useState<ExportType>('transactions');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(getToday());
  const [isExporting, setIsExporting] = useState(false);

  const exportOptions = [
    {
      type: 'transactions' as ExportType,
      label: 'Transactions',
      description: 'Export all transactions with details',
      icon: FileText,
    },
    {
      type: 'accounts' as ExportType,
      label: 'Accounts',
      description: 'Export account list and balances',
      icon: Table,
    },
    {
      type: 'transfers' as ExportType,
      label: 'Transfers',
      description: 'Export fund transfers between accounts',
      icon: ArrowLeftRight,
    },
  ];

  const generateTransactionsCSV = async (): Promise<string> => {
    if (!activeLedgerId) return '';

    const transactions = await TransactionRepository.getByLedger(activeLedgerId, {
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    const headers = ['Date', 'Time', 'Type', 'Amount', 'Account', 'Category', 'Subcategory', 'Notes'];
    const rows = transactions.map((t) => [
      t.date,
      t.time || '',
      t.type,
      t.amount.toString(),
      t.account_name || '',
      t.category_name || '',
      t.subcategory_name || '',
      (t.notes || '').replace(/"/g, '""'),
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  };

  const generateAccountsCSV = async (): Promise<string> => {
    if (!activeLedgerId) return '';

    const accounts = await AccountRepository.getAllByLedger(activeLedgerId);

    const headers = ['Name', 'Type', 'Initial Balance', 'Current Balance', 'Credit Limit', 'Person', 'Notes'];
    const rows = accounts.map((a) => [
      a.name,
      a.account_type,
      a.initial_balance.toString(),
      a.current_balance.toString(),
      a.credit_limit?.toString() || '',
      a.person_name || '',
      (a.notes || '').replace(/"/g, '""'),
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  };

  const generateTransfersCSV = async (): Promise<string> => {
    if (!activeLedgerId) return '';

    const transfers = await TransferRepository.getByLedger(activeLedgerId);

    // Filter by date if specified
    const filteredTransfers = transfers.filter((t) => {
      if (startDate && t.date < startDate) return false;
      if (endDate && t.date > endDate) return false;
      return true;
    });

    const headers = ['Date', 'Time', 'From Account', 'To Account', 'Amount', 'Fee', 'Notes'];
    const rows = filteredTransfers.map((t) => [
      t.date,
      t.time || '',
      t.from_account_name || '',
      t.to_account_name || '',
      t.amount.toString(),
      t.fee.toString(),
      (t.notes || '').replace(/"/g, '""'),
    ]);

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');
  };

  const handleExport = async () => {
    if (!activeLedgerId) {
      Alert.alert('Error', 'No active ledger selected');
      return;
    }

    try {
      setIsExporting(true);

      let csvContent = '';
      let filename = '';

      switch (selectedType) {
        case 'transactions':
          csvContent = await generateTransactionsCSV();
          filename = `transactions_${getToday()}.csv`;
          break;
        case 'accounts':
          csvContent = await generateAccountsCSV();
          filename = `accounts_${getToday()}.csv`;
          break;
        case 'transfers':
          csvContent = await generateTransfersCSV();
          filename = `transfers_${getToday()}.csv`;
          break;
      }

      if (!csvContent) {
        Alert.alert('No Data', 'No data to export for the selected criteria');
        return;
      }

      const fileUri = FileSystem.documentDirectory + filename;
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: `Export ${selectedType}`,
        });
      } else {
        Alert.alert('Success', `File saved to: ${fileUri}`);
      }
    } catch (error: any) {
      console.error('Error exporting data:', error);
      if (error?.message?.includes('native module') || error?.message?.includes('ExpoSharing')) {
        Alert.alert(
          'Rebuild Required',
          'Export feature requires a new development build. Run: eas build --profile development --platform android'
        );
      } else {
        Alert.alert('Error', 'Failed to export data');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const showDateRange = selectedType === 'transactions' || selectedType === 'transfers';

  return (
    <Screen scrollable={false}>
      <Header title="Export Data" showBack />

      <ScrollView className="flex-1 px-4 py-4">
        {/* Export Type Selection */}
        <Text className="mb-3 text-sm font-medium text-foreground">Select Data to Export</Text>
        <View className="mb-6 gap-3">
          {exportOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = selectedType === option.type;

            return (
              <TouchableOpacity
                key={option.type}
                onPress={() => setSelectedType(option.type)}
                className={`flex-row items-center rounded-xl border-2 p-4 ${
                  isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <View
                  className={`mr-3 h-10 w-10 items-center justify-center rounded-lg ${
                    isSelected ? 'bg-primary' : 'bg-secondary'
                  }`}
                >
                  <IconComponent
                    size={20}
                    color={isSelected ? '#ffffff' : colors.mutedForeground}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-medium text-foreground">{option.label}</Text>
                  <Text className="text-xs text-muted-foreground">{option.description}</Text>
                </View>
                {isSelected && (
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check size={14} color="#ffffff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Date Range */}
        {showDateRange && (
          <View className="mb-6">
            <Text className="mb-3 text-sm font-medium text-foreground">Date Range (optional)</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label="From"
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="To"
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
            <Text className="mt-2 text-xs text-muted-foreground">
              Leave empty to export all records
            </Text>
          </View>
        )}

        {/* Export Format Info */}
        <View className="mb-6 rounded-xl bg-secondary/50 p-4">
          <Text className="mb-1 text-sm font-medium text-foreground">Export Format</Text>
          <Text className="text-xs text-muted-foreground">
            Data will be exported as CSV (Comma Separated Values). You can open this file in Excel, Google Sheets, or any spreadsheet application.
          </Text>
        </View>

        {/* Export Button */}
        <Button onPress={handleExport} loading={isExporting}>
          <View className="flex-row items-center gap-2">
            {!isExporting && <Download size={18} color="#ffffff" />}
            <Text className="font-semibold text-white">
              Export {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}
            </Text>
          </View>
        </Button>

        <View className="h-8" />
      </ScrollView>
    </Screen>
  );
}
