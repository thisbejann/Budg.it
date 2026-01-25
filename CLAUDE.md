# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android (requires dev build)
npm run ios        # Run on iOS simulator
npm run lint       # Run ESLint
npm test           # Run Jest tests
```

**Note:** This is an Expo managed project using expo-sqlite, so you need a development build (not Expo Go) to run the app. Use `eas build --profile development --platform android` for cloud builds.

## Architecture

**Stack:** React Native + Expo SDK 54, TypeScript, NativeWind (Tailwind), Zustand, expo-sqlite

### Data Flow

```
UI Components → Zustand Store → Repositories → Database Helpers → SQLite
```

### Directory Structure

- `src/features/` - Feature modules (home, transactions, accounts, charts, settings, transfers)
- `src/database/` - SQLite layer with repositories and migrations
- `src/store/` - Zustand store (active ledger state)
- `src/shared/` - Reusable components and utilities
- `src/types/` - TypeScript types for entities, forms, and navigation

### Database Layer

- **Repositories** (`src/database/repositories/`) - All DB access goes through these (TransactionRepository, AccountRepository, etc.)
- **Helpers** (`src/database/index.ts`):
  - `executeSql<T>()` - SELECT queries returning typed array
  - `executeSqlInsert()` - INSERT returning lastInsertRowId
  - `executeSqlUpdate()` - UPDATE/DELETE returning affected rows
- **Migrations** (`src/database/migrations/`) - Versioned schema files, auto-run on DB open

### State Management

- Zustand store (`useLedgerStore`) holds only active ledger
- Actual data lives in SQLite, fetched via repositories
- AsyncStorage persists active ledger ID

### Provider Hierarchy

```
GestureHandlerRootView → SafeAreaProvider → NavigationContainer → DatabaseProvider → RootNavigator
```

DatabaseProvider initializes the database and creates default ledger on first run.

### Navigation

- RootNavigator: Stack navigator (tabs + modal screens)
- BottomTabNavigator: 5 tabs (Home, Transactions, Accounts, Charts, Settings)

## Key Patterns

- **Repository pattern** - Never access DB directly; use repositories
- **Form validation** - react-hook-form + zod schemas in `src/types/forms.ts`
- **Styling** - NativeWind classes; colors defined in `tailwind.config.js`
- **Entity types** - Defined in `src/types/database.ts` (Ledger, Account, Transaction, Category, etc.)

## Account Types

- `debit` - Bank accounts, cash
- `credit` - Credit cards
- `owed` - Money others owe you
- `debt` - Money you owe others

## Git

- ALWAYS Create a new branch for each feature/fix/enhancements. I will preface the requests with "FEATURE:" or "FIX:" or "ENHANCEMENT" to indicate the type of change.
- Commit often with clear messages
- Open PRs against `main` for review
- Always name your branches with prefix 'jannjaspher/' followed by a descriptive name, e.g., 'jannjaspher/add-transaction-form' to indicate that i made the change
- When pushing to remote, always create a pull request for code review before merging

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
