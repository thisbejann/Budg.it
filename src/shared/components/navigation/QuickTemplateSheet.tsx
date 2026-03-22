import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Pressable, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Bookmark } from 'lucide-react-native';
import { useTheme } from '../../../hooks/useColorScheme';
import { useLedgerStore } from '../../../store';
import { TransactionRepository, TemplateRepository } from '../../../database/repositories';
import { getIconComponent } from '../../utils/icon';
import { formatPHP } from '../../utils/currency';
import { getToday, getCurrentTime } from '../../utils/date';
import type { TransactionTemplateWithDetails } from '../../../types/database';

interface QuickTemplateSheetProps {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function QuickTemplateSheet({ visible, onClose, onCreated }: QuickTemplateSheetProps) {
  const { colors } = useTheme();
  const { activeLedgerId } = useLedgerStore();
  const [templates, setTemplates] = useState<TransactionTemplateWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<number | null>(null);

  useEffect(() => {
    if (visible && activeLedgerId) {
      setLoading(true);
      TemplateRepository.getQuickCreate(activeLedgerId)
        .then(setTemplates)
        .catch(() => setTemplates([]))
        .finally(() => setLoading(false));
    }
  }, [visible, activeLedgerId]);

  const handleUseTemplate = useCallback(async (template: TransactionTemplateWithDetails) => {
    if (!activeLedgerId || creating) return;

    setCreating(template.id);
    try {
      await TransactionRepository.create(activeLedgerId, {
        account_id: template.account_id!,
        category_id: template.category_id ?? undefined,
        subcategory_id: template.subcategory_id ?? undefined,
        amount: template.amount!,
        type: template.type,
        date: getToday(),
        time: getCurrentTime(),
        notes: template.notes ?? undefined,
      });
      await TemplateRepository.incrementUsage(template.id);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
      onCreated();
    } catch (error) {
      console.error('Error creating transaction from template:', error);
      Alert.alert('Error', 'Failed to create transaction');
      setCreating(null);
    }
  }, [activeLedgerId, creating, onClose, onCreated]);

  const expenseTemplates = templates.filter(t => t.type === 'expense');
  const incomeTemplates = templates.filter(t => t.type === 'income');

  const renderTemplate = (template: TransactionTemplateWithDetails) => {
    const Icon = getIconComponent(template.icon, 'Bookmark');
    const isCreating = creating === template.id;

    return (
      <Pressable
        key={template.id}
        onPress={() => handleUseTemplate(template)}
        disabled={creating !== null}
        style={({ pressed }) => ({
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          opacity: pressed ? 0.6 : creating !== null && !isCreating ? 0.4 : 1,
        })}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: template.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isCreating ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon size={18} color="#fff" />
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text
            style={{ color: colors.foreground, fontSize: 15, fontWeight: '500' }}
            numberOfLines={1}
          >
            {template.name}
          </Text>
          <Text
            style={{ color: colors.mutedForeground, fontSize: 12, marginTop: 1 }}
            numberOfLines={1}
          >
            {template.account_name}
            {template.category_name ? ` · ${template.category_name}` : ''}
          </Text>
        </View>

        <Text
          style={{
            color: template.type === 'expense' ? colors.expense : colors.income,
            fontSize: 15,
            fontWeight: '600',
          }}
        >
          {formatPHP(template.amount!)}
        </Text>
      </Pressable>
    );
  };

  const renderSection = (title: string, items: TransactionTemplateWithDetails[]) => {
    if (items.length === 0) return null;

    return (
      <View>
        <Text
          style={{
            color: colors.mutedForeground,
            fontSize: 12,
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 6,
          }}
        >
          {title}
        </Text>
        {items.map(renderTemplate)}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: colors.backdrop,
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            paddingBottom: 24,
            maxHeight: '60%',
          }}
          onPress={() => {}}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
            <View
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                backgroundColor: colors.muted,
              }}
            />
          </View>

          {/* Header */}
          <View
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.foreground,
                fontSize: 16,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              Quick Add
            </Text>
          </View>

          {/* Content */}
          {loading ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : templates.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Bookmark size={32} color={colors.mutedForeground} strokeWidth={1.5} />
              <Text
                style={{
                  color: colors.mutedForeground,
                  fontSize: 14,
                  textAlign: 'center',
                  marginTop: 12,
                  lineHeight: 20,
                }}
              >
                No quick templates{'\n'}
                <Text style={{ fontSize: 12 }}>
                  Templates need an amount and account to appear here.
                </Text>
              </Text>
            </View>
          ) : (
            <ScrollView bounces={false}>
              {renderSection('Expenses', expenseTemplates)}
              {renderSection('Income', incomeTemplates)}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
