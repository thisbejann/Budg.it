import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Modal, Switch } from 'react-native';
import { useTheme } from '../../../hooks/useColorScheme';
import { CurrencyInput } from './Input';
import { formatPHP } from '../../utils/currency';

interface BalanceAdjustmentModalProps {
  visible: boolean;
  currentBalance: number;
  accountName: string;
  onConfirm: (newBalance: number, recordTransaction: boolean) => void;
  onCancel: () => void;
}

export function BalanceAdjustmentModal({
  visible,
  currentBalance,
  accountName,
  onConfirm,
  onCancel,
}: BalanceAdjustmentModalProps) {
  const { colors } = useTheme();
  const [newBalanceStr, setNewBalanceStr] = useState('');
  const [recordTxn, setRecordTxn] = useState(false);

  useEffect(() => {
    if (visible) {
      setNewBalanceStr(currentBalance.toString());
      setRecordTxn(false);
    }
  }, [visible, currentBalance]);

  const newBalance = parseFloat(newBalanceStr) || 0;
  const difference = newBalance - currentBalance;

  const handleConfirm = () => {
    const parsed = parseFloat(newBalanceStr);
    if (!isNaN(parsed)) {
      onConfirm(parsed, recordTxn);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: colors.backdrop,
        }}
        onPress={onCancel}
      >
        <Pressable
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 16,
            paddingTop: 16,
          }}
          onPress={() => {}}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingHorizontal: 16,
              paddingBottom: 12,
            }}
          >
            <Pressable onPress={onCancel}>
              <Text style={{ color: colors.primary, fontSize: 16 }}>Cancel</Text>
            </Pressable>
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: '600',
              }}
            >
              Adjust Balance
            </Text>
            <Pressable onPress={handleConfirm}>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                Confirm
              </Text>
            </Pressable>
          </View>

          {/* Content */}
          <View style={{ paddingHorizontal: 16 }}>
            <Text
              style={{
                color: colors.mutedForeground,
                fontSize: 13,
                marginBottom: 12,
              }}
            >
              {accountName}
            </Text>

            {/* Current Balance */}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{ color: colors.mutedForeground, fontSize: 14 }}>
                Current Balance
              </Text>
              <Text
                style={{
                  color: colors.foreground,
                  fontSize: 16,
                  fontWeight: '600',
                }}
              >
                {formatPHP(currentBalance)}
              </Text>
            </View>

            {/* New Balance Input */}
            <CurrencyInput
              label="New Balance"
              placeholder="0.00"
              value={newBalanceStr}
              onChangeValue={setNewBalanceStr}
            />

            {/* Difference Indicator */}
            {difference !== 0 && (
              <View
                style={{
                  marginTop: 12,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor:
                    difference > 0
                      ? colors.incomeSoft
                      : colors.expenseSoft,
                }}
              >
                <Text style={{ color: colors.mutedForeground, fontSize: 13 }}>
                  Difference
                </Text>
                <Text
                  style={{
                    color: difference > 0 ? colors.income : colors.expense,
                    fontSize: 14,
                    fontWeight: '600',
                  }}
                >
                  {difference > 0 ? '+' : ''}
                  {formatPHP(difference)}
                </Text>
              </View>
            )}

            {/* Record in Transaction History */}
            <View
              style={{
                marginTop: 12,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: colors.surfaceVariant,
              }}
            >
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ color: colors.foreground, fontSize: 13, fontWeight: '500' }}>
                  Record in transaction history
                </Text>
                <Text style={{ color: colors.mutedForeground, fontSize: 11 }}>
                  {difference >= 0 ? 'Creates an income' : 'Creates an expense'} transaction
                </Text>
              </View>
              <Switch
                value={recordTxn}
                onValueChange={setRecordTxn}
                trackColor={{ false: colors.muted, true: colors.switchTrack }}
                thumbColor={recordTxn ? colors.primary : colors.mutedForeground}
              />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
