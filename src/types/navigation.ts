import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack Navigator params
export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  AddTransaction: { templateId?: number } | undefined;
  EditTransaction: { transactionId: number };
  TransactionDetail: { transactionId: number };
  AddAccount: { accountType?: string } | undefined;
  EditAccount: { accountId: number };
  AccountDetail: { accountId: number };
  Transfer: undefined;
  AddCategory: { type: 'expense' | 'income' };
  EditCategory: { categoryId: number };
  AddSubcategory: { categoryId: number };
  EditSubcategory: { subcategoryId: number };
  AddTemplate: undefined;
  EditTemplate: { templateId: number };
  AddLedger: undefined;
  EditLedger: { ledgerId: number };
  AddPerson: undefined;
  EditPerson: { personId: number };
  Categories: undefined;
  Templates: undefined;
  Ledgers: undefined;
  Export: undefined;
  Charts: undefined;
  Persons: undefined;
};

// Bottom Tab Navigator params (Charts removed, now a modal)
export type MainTabParamList = {
  Home: undefined;
  Transactions: { date?: string } | undefined;
  Accounts: undefined;
  Settings: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

// Declaration for useNavigation hook
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
