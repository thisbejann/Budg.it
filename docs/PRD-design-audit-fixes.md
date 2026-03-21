# PRD: Design Audit Remediation

**Date:** 2026-03-21
**Status:** Draft
**Scope:** BudgetTracker React Native app — fix all issues identified in the design audit

---

## Background

A comprehensive design audit of the BudgetTracker app identified 25 issues across accessibility, theming, performance, UX states, and code quality. This PRD groups those issues into actionable work items ordered by priority, each mapped to the skill command that should execute the fix.

---

## Phase 1: Accessibility & Resilience (`/harden`)

> **Goal:** Make the app usable with screen readers and robust against edge cases.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 1 | No `accessibilityLabel`, `accessibilityRole`, or `accessibilityHint` on any interactive element (40+ instances) | Critical | All screens — every `TouchableOpacity`, `Pressable`, icon button, FAB, tab item | Add semantic accessibility props to all interactive elements. Prioritize: tab bar items, header buttons, FAB, form inputs, list items. |
| 2 | Touch targets below 44x44dp minimum | Critical | `IconAvatar size="sm"` (32px) in HomeScreen/TransactionsScreen; color/icon picker buttons `h-10 w-10` (40px) in AddAccountScreen/AddCategoryScreen; period pills `py-1.5` (~36px) in ChartsScreen; "Pay Full Balance" `py-1` (~38px) in PayCreditCardScreen; view toggle `py-1.5` in TransactionsScreen | Increase padding to `py-2.5` minimum on pills/toggles. Add `hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}` to small icon buttons. Increase `IconAvatar size="sm"` container to 44px. |
| 3 | No user-facing error states on data load failures — errors logged to console only | High | HomeScreen (line 65), AccountsScreen (line 88), TransactionsScreen (line 58), ChartsScreen (line 50), CategoriesScreen (line 34), LedgersScreen (line 30) | Add an error state component (extend `EmptyState` or create `ErrorState`) showing message + retry button. Wire it into every screen's catch block. |
| 4 | No toast/snackbar system — success/error feedback uses blocking `Alert.alert()` or nothing | Medium | App-wide | Add a non-blocking toast component for routine feedback (transaction saved, account created, etc.). Reserve `Alert.alert()` for destructive confirmations only. |
| 5 | Charts tab has no loading state — content pops in abruptly | Medium | ChartsScreen — loads data on focus with no indicator | Add `ActivityIndicator` or skeleton while chart data loads. |
| 6 | No disabled visual state for Select and DateInput | Low | `Select.tsx`, `DateInput.tsx` | Add `opacity-50` and pointer-events-none styling when `disabled` prop is true. |

**Acceptance criteria:**
- VoiceOver (iOS) and TalkBack (Android) can navigate and describe every interactive element
- No interactive element has a touch target smaller than 44x44dp
- Every data-loading screen shows a recoverable error state on failure
- Non-destructive actions use toast feedback, not modal alerts

---

## Phase 2: Theme Consistency (`/normalize`)

> **Goal:** Eliminate hardcoded colors and dimensions that bypass the theme system.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 7 | Hardcoded RGBA opacity values scattered across files (`rgba(255,255,255,0.06)`, `rgba(255,255,255,0.04)`, `rgba(0,0,0,0.06)`, `colors.primary + '20'`) | High | HomeScreen, SettingsScreen, AccountsScreen, TransactionsScreen, ChartsScreen, AddTransactionScreen, PayCreditCardScreen | Define as CSS variables in `global.css` (e.g., `--color-border-subtle`, `--color-overlay-light`). The soft color pattern already exists there — extend it for borders and overlays. Replace string concatenation (`+ '20'`) with proper tokens. |
| 8 | Inconsistent border radius scale (12px, 16px, 20px, 28px, 9999px) with no semantic naming | High | Input (12), Modals (16), Cards (20), TabBar (28), Buttons/Badges (9999) | Define a radius scale in `global.css` or constants (`sm: 8`, `md: 12`, `lg: 16`, `xl: 20`, `2xl: 28`, `full: 9999`). Use semantic tokens in all components. |
| 9 | Hardcoded `#ffffff` icon colors bypassing theme | High | TransactionDetailScreen lines 169, 189 | Replace `"#ffffff"` with `colors.onPrimary` or a computed contrast color from the theme. |
| 10 | Dark mode borders bypass theme with raw RGBA (`isDark ? 'rgba(255,255,255,0.04)' : colors.border`) | Medium | HomeScreen, TransactionsScreen, ChartsScreen, AccountsScreen, SettingsScreen | Define `--color-border-subtle` in the dark variant of `global.css`. Replace all inline ternaries with the token. |
| 11 | `contentContainerStyle={{ paddingBottom: 100 }}` hardcoded instead of using tab bar constant | Medium | CategoriesScreen (line 193), LedgersScreen (line 144) | Import `FLOATING_TAB_BAR_TOTAL_HEIGHT` (96px) from `FloatingTabBar.tsx` and use it. |

**Acceptance criteria:**
- Zero hardcoded RGBA strings in screen files
- Zero hardcoded `#ffffff` or `#000000` color values
- All border radii reference a named scale
- Changing `FLOATING_TAB_BAR_TOTAL_HEIGHT` automatically updates all dependent padding

---

## Phase 3: Performance (`/optimize`)

> **Goal:** Eliminate unnecessary re-renders and fix stale data bugs.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 12 | `TabItem` in FloatingTabBar not wrapped in `React.memo` — all 5 tabs re-render on every navigation | High | `FloatingTabBar.tsx` | Wrap `TabItem` in `React.memo` with a comparator checking `isFocused` and `routeName`. |
| 13 | 5 computed values in AddTransactionScreen recompute on every keystroke (`accountOptions`, `filteredCategories`, `categoryOptions`, `selectedCategory`, `subcategoryOptions`) | High | AddTransactionScreen lines 174-194 | Wrap each in `useMemo` with correct dependency arrays (`accounts`, `categories`, `selectedAccountId`, `selectedCategoryId`, `type`). |
| 14 | `useEffect` missing dependencies — stale data after ledger switch | High | TransferScreen (line 66-68) missing `activeLedgerId`; PayCreditCardScreen (line 64-80) missing dependency array | Add correct dependency arrays. |
| 15 | Inline `.map()` renders without memoization in list screens | Medium | HomeScreen (category spending + recent transactions), AccountsScreen (`renderAccount`), ChartsScreen (category breakdown) | Extract list item components, wrap with `React.memo`. Use `useCallback` for render functions passed to FlatList. |

**Acceptance criteria:**
- Tab bar items only re-render when their own `isFocused` state changes
- AddTransactionScreen form inputs show no lag with 20+ categories
- Switching ledgers correctly reloads data in Transfer and PayCreditCard screens
- React DevTools Profiler shows no unnecessary re-renders in list screens

---

## Phase 4: Typography (`/typeset`)

> **Goal:** Fix unreadable text and inconsistent letter-spacing.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 16 | Calendar day amounts at 7px font size — unreadable | Critical | TransactionsScreen lines 121-142 (`fontSize: 7`) | Option A: Increase to 10px minimum. Option B: Remove numeric amounts and use color-coded dots (green/red) to indicate income/expense activity on each day. |
| 17 | `letterSpacing: -0.8` and `-0.5` applied via inline styles | Low | HomeScreen (line 104), Header component | Replace with Tailwind `tracking-tight` or `tracking-tighter` classes if supported by Uniwind. If not, define a reusable style constant. |

**Acceptance criteria:**
- No text in the app is smaller than 10px
- Calendar view communicates transaction activity without requiring microscopic text
- Letter-spacing values are applied consistently via classes or constants, not inline

---

## Phase 5: Code Extraction (`/extract`)

> **Goal:** Eliminate duplicated logic and create reusable utilities.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 18 | Icon name conversion (kebab-to-camelCase) duplicated in 5+ files | Medium | CategoriesScreen, AddCategoryScreen, LedgersScreen, PayCreditCardScreen, AccountDetailScreen | Extract to `src/shared/utils/icon.ts` as `toIconComponentName(kebabName: string): string`. Update all call sites. |
| 19 | Switch component styling repeated per-instance with inline `trackColor`/`thumbColor` | Low | PayCreditCardScreen, BalanceAdjustmentModal | Create a `ThemedSwitch` wrapper in `src/shared/components/ui/` that applies theme colors automatically. |

**Acceptance criteria:**
- Icon name conversion exists in exactly one place
- All Switch instances use `ThemedSwitch` with consistent theme-aware styling

---

## Phase 6: Layout & Spacing (`/arrange`)

> **Goal:** Establish consistent spatial rhythm.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 20 | Inconsistent spacing scale — padding varies without rationale (`py-1.5`, `py-2`, `py-2.5`, `py-3`, `py-4`); magic numbers in inline styles (3px, 4px, 16px) | Medium | All screens | Audit all spacing values. Standardize on a 4px grid: 4, 8, 12, 16, 24, 32, 48. Replace magic numbers with Tailwind classes or named constants. |

**Acceptance criteria:**
- All spacing values align to the 4px grid
- No magic number dimensions in inline styles

---

## Phase 7: Onboarding & Empty States (`/onboard`)

> **Goal:** Guide users through dead-end scenarios.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 21 | Transfer and PayCreditCard screens render non-functional forms when no accounts exist | Medium | TransferScreen (line 42), PayCreditCardScreen | Show `EmptyState` prompting the user to create an account first, with a button that navigates to AddAccount. |

**Acceptance criteria:**
- Transfer screen shows "Create an account to get started" with action button when no accounts exist
- PayCreditCard screen shows guidance when no debit accounts are available as payment sources

---

## Phase 8: Delight (`/delight`)

> **Goal:** Improve perceived performance with loading skeletons.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 22 | All list screens show a centered `ActivityIndicator` spinner — no content shape preview | Medium | HomeScreen, AccountsScreen, TransactionsScreen, ChartsScreen | Create skeleton components that mirror the shape of list items, cards, and chart areas. Show skeletons during initial load, keep `ActivityIndicator` for pull-to-refresh. |

**Acceptance criteria:**
- First load of each tab shows content-shaped skeletons instead of a spinner
- Skeletons animate with a subtle shimmer effect
- Pull-to-refresh still uses `ActivityIndicator`

---

## Phase 9: Visual Polish (`/quieter`)

> **Goal:** Tone down the one borderline anti-pattern.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 23 | FAB golden glow shadow with `shadowOpacity: 0.5` in dark mode | Low | `Button.tsx` — FAB variant | Reduce `shadowOpacity` to 0.25 in dark mode. Keep light mode as-is. |

**Acceptance criteria:**
- FAB in dark mode has a subtle warm shadow, not a glow effect

---

## Phase 10: Minor Cleanup

> **Goal:** Address remaining low-severity documentation and consistency items.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 24 | Avatar size names (`sm`, `md`, `lg`, `xl`) don't document their pixel values (32, 40, 48, 64) | Low | `Avatar.tsx` | Add a brief comment above the size map documenting the pixel values for each size token. |
| 25 | DayOfMonthPicker magic number constants undocumented | Low | `DayOfMonthPicker.tsx` — `ITEM_HEIGHT = 44`, `VISIBLE_ITEMS = 5`, `PICKER_HEIGHT = 220` | Add a comment explaining the relationship: `PICKER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS` (220 = 44 x 5). |

**Acceptance criteria:**
- Avatar sizes are self-documenting
- Picker constants explain their derivation

---

## Execution Order

| Priority | Phase | Command | Issues | Effort |
|----------|-------|---------|--------|--------|
| 1 | Accessibility & Resilience | `/harden` | #1-6 | Large |
| 2 | Theme Consistency | `/normalize` | #7-11 | Medium |
| 3 | Performance | `/optimize` | #12-15 | Medium |
| 4 | Typography | `/typeset` | #16-17 | Small |
| 5 | Code Extraction | `/extract` | #18-19 | Small |
| 6 | Layout & Spacing | `/arrange` | #20 | Medium |
| 7 | Onboarding | `/onboard` | #21 | Small |
| 8 | Delight | `/delight` | #22 | Medium |
| 9 | Visual Polish | `/quieter` | #23 | Small |
| 10 | Minor Cleanup | manual | #24-25 | Small |

---

## Out of Scope

- Feature changes or new functionality
- Database schema changes
- Navigation structure changes
- Third-party library upgrades
- CI/CD pipeline changes
