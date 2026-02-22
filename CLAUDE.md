# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android (requires dev build)
npm run ios        # Run on iOS simulator
npm run lint       # Run ESLint
npm test           # Run Jest
npm run build:dev  # Build dev APK (EAS Cloud)
npm run build:beta # Build beta APK (EAS Cloud)
```

**Note:** This is an Expo managed project using expo-sqlite, so you need a development build (not Expo Go) to run the app.

## Architecture

**Stack:** React Native 0.81 + Expo SDK 54, TypeScript, Uniwind (Tailwind CSS v4), Zustand, expo-sqlite, HeroUI Native

### Styling Stack

```
global.css -> Tailwind CSS v4 + Uniwind + HeroUI Native styles
           ->
metro.config.js -> withUniwindConfig() processes CSS
           ->
Components -> Use Tailwind classes via className prop
```

- **Uniwind**: Tailwind CSS for React Native (replaces NativeWind)
- **Tailwind CSS v4**: Modern CSS-first config via `global.css`
- **HeroUI Native**: Component library built on Uniwind + Reanimated
- **Theme colors**: Defined in `global.css` using CSS variables with OKLCH color space

### Theme System

- **Light/Dark/System modes**: Managed by `useThemeStore` (Zustand + AsyncStorage)
- **Dynamic colors**: Use `useTheme()` hook from `src/hooks/useColorScheme.ts`
- **Color palette**: MD3-inspired with Fnatic Orange (#FF5900) as primary
- **Color constants**: `src/constants/colors.ts` (COLORS for light, COLORS_DARK for dark)

```tsx
// For dynamic theme colors in components:
const { colors, isDark } = useTheme();
<Icon color={colors.foreground} />

// For static Tailwind classes:
<Text className="text-foreground bg-background" />
```

## HeroUI Native

HeroUI Native is a React Native component library using:

- Compound components pattern (e.g., `Button.StartContent`, `Button.LabelContent`)
- React Native Reanimated for animations
- Uniwind (Tailwind CSS v4) for styling
- Semantic color system with CSS variables

**MCP Server available**: Use the heroui-native MCP tools for component docs.

### Data Flow

```
UI Components -> Zustand Store -> Repositories -> Database Helpers -> SQLite
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
GestureHandlerRootView -> SafeAreaProvider(initialWindowMetrics) -> KeyboardProvider -> NavigationContainer -> DatabaseProvider -> RootNavigator
```

DatabaseProvider initializes the database and creates default ledger on first run.

## Critical Android Stability Rules

A regression after PR #27 (`d00150e`, merged as `0dc889c`) reintroduced Android save crashes (`SafeAreaProvider contains null child`).

Do not change these patterns unless explicitly asked and fully re-tested on Android dev APK:

1. Save handler pattern for add/edit forms that close on success:
   - `setIsLoading(true)` before `try`
   - success path: `Keyboard.dismiss(); InteractionManager.runAfterInteractions(() => navigation.goBack());`
   - `catch` path: `setIsLoading(false)` and show error
   - never use `finally { setIsLoading(false) }` in handlers that navigate away on success
   - never use immediate `navigation.goBack()` after successful save
2. Provider stack safety:
   - Keep `SafeAreaProvider` with `initialWindowMetrics`
   - Keep `KeyboardProvider` in the provider tree
   - Do not reorder/remove these providers without Android save-flow validation
3. Architecture toggle safety:
   - Treat `newArchEnabled` changes (`android/gradle.properties`, `app.config.js`) as high-risk
   - Never toggle these as part of unrelated refactors

## Save-Flow Regression Checklist (Android)

Before merging PRs touching providers, forms, or navigation:

1. Test local dev APK flows: Add Account, Add Transaction, Edit Transaction, Transfer.
2. Verify no direct post-save `navigation.goBack()` replaced deferred navigation in these flows.
3. Verify no submit handler uses `finally { setIsLoading(false) }` when success path navigates away.

### Navigation

- RootNavigator: Stack navigator (tabs + modal screens)
- BottomTabNavigator: 5 tabs (Home, Transactions, Accounts, Charts, Settings)

## Key Patterns

- **Repository pattern** - Never access DB directly; use repositories
- **Form validation** - react-hook-form + zod schemas in `src/types/forms.ts`
- **Styling** - Uniwind/Tailwind classes via `className`; theme colors in `global.css`
- **Dynamic colors** - Use `useTheme()` hook for icon colors and inline styles
- **Entity types** - Defined in `src/types/database.ts` (Ledger, Account, Transaction, Category, etc.)
- **UI Components** - Use HeroUI Native components with compound pattern (prefer over custom implementations)

## Build Variants

App uses dynamic config (`app.config.js`) with APP_VARIANT env:

| Variant     | Package Name           | App Name            |
| ----------- | ---------------------- | ------------------- |
| development | com.budgettracker.dev  | BudgetTracker (Dev) |
| beta        | com.budgettracker.beta | BudgetTracker       |
| production  | com.budgettracker      | BudgetTracker       |

## Account Types

- `debit` - Bank accounts, cash
- `credit` - Credit cards
- `owed` - Money others owe you
- `debt` - Money you owe others

## Git

- create a new branch named [`jannjaspher/branch-name`] for each feature, bugfix, or enhancement
- NEVER commit directly to `master`
- Open a PR against `master` when your work is ready for review
- Branch naming: `jannjaspher/<descriptive-name>` (e.g., `jannjaspher/add-transaction-form`)
- Commit often with clear messages

## Plan Mode

- Make the plan extremely concise. Sacrifice grammar for the sake of concision.
- At the end of each plan, give me a list of unresolved questions to answer, if any.
