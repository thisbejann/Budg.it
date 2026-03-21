# PRD: Design Critique Remediation

**Date:** 2026-03-21
**Status:** Draft
**Scope:** BudgetTracker React Native app — fix issues identified in the design critique

---

## Background

A holistic design critique of the BudgetTracker app identified 8 issues across component consistency, theme integrity, and UX quality. This PRD groups those issues into actionable phases.

---

## Phase 1: Opacity Token System (`/normalize`)

> **Goal:** Eliminate hex concatenation and raw RGBA by adding semantic opacity color tokens.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 1 | `colors.primary + '20'`, `+ '15'` hex concatenation for soft backgrounds is fragile and bypasses the theme | High | AccountDetailScreen (lines 278, 340, 355, 463), PayCreditCardScreen (line 165, 261), HomeScreen | Add `primarySoft`, `primaryMuted` tokens to `colors.ts` / `COLORS_DARK`. Replace all `+ '20'` / `+ '15'` concatenation. |
| 2 | ~30 raw RGBA strings scattered across screens (`rgba(255,255,255,0.06)`, `rgba(255,255,255,0.04)`, `rgba(0,0,0,0.06)`) | High | SettingsScreen, FloatingTabBar, ChartsScreen, HomeScreen, AccountsScreen, TransactionsScreen | Add `borderSubtle`, `dividerSubtle`, `surfaceGlass` tokens. Replace all inline RGBA ternaries. |

---

## Phase 2: SettingsScreen Grouped List (`/distill`)

> **Goal:** Replace 5 stacked cards with a clean iOS-style grouped list. Cards should be reserved for data-rich content (home summary, account balances).

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 3 | SettingsScreen wraps every section in a Card, adding visual weight without clarity | Medium | SettingsScreen.tsx — 5 Card components stacked vertically | Replace with a flat grouped list using section headers + dividers. Only keep the "Current Ledger" info card at top. Remove Card wrappers from Data Management, Backup & Export, About, and Appearance sections. |

---

## Phase 3: Expense/Income Type Toggle (`/colorize`)

> **Goal:** Make the expense/income toggle visually bold with semantic color — red for expense, green for income — instead of generic gold pills.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 4 | Expense/income toggle in AddTransactionScreen and EditTransactionScreen looks like two generic pills with no color distinction | Medium | AddTransactionScreen (lines 246-277), EditTransactionScreen (lines 173-212) | Redesign toggle: active expense = red tonal background + red text, active income = green tonal background + green text. Inactive side stays muted. Add a smooth animated sliding indicator. |

---

## Phase 4: TransferScreen DateInput (`/harden`)

> **Goal:** Replace the manual text input for date with the DateInput picker component.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 5 | TransferScreen uses `<Input>` for date with `placeholder="YYYY-MM-DD"` while every other screen uses `<DateInput>` | Medium | TransferScreen.tsx (lines 232-245) | Replace `<Input label="Date">` with `<DateInput label="Date">` using the same pattern as PayCreditCardScreen. |

---

## Phase 5: AccountDetailScreen Cleanup (`/extract` + `/normalize`)

> **Goal:** Use shared icon utility and replace hardcoded colors.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 6 | AccountDetailScreen manually converts icon names (kebab-to-camelCase) instead of using `getIconComponent()` from shared utility | Medium | AccountDetailScreen.tsx lines 134-141, 146-153 | Replace with `getIconComponent()` calls. |
| 7 | 4 instances of `#ffffff` hardcoded in AccountDetailScreen icon colors | Medium | AccountDetailScreen.tsx lines 169, 171, 173, 251 | Replace with `colors.onPrimary`. |

---

## Phase 6: AccountDetailScreen Error State (`/harden`)

> **Goal:** Add error handling and recovery to the detail screen.

| # | Issue | Severity | Location | Fix |
|---|-------|----------|----------|-----|
| 8 | AccountDetailScreen catches errors with only `console.error`, no error UI, and still uses `ActivityIndicator` | High | AccountDetailScreen.tsx lines 97-110, 197-205 | Add error state with retry button using EmptyState pattern. |

---

## Execution Order

| Priority | Phase | Command | Issues | Effort |
|----------|-------|---------|--------|--------|
| 1 | Opacity Token System | `/normalize` | #1-2 | Medium |
| 2 | SettingsScreen Grouped List | `/distill` | #3 | Medium |
| 3 | Expense/Income Toggle | `/colorize` | #4 | Medium |
| 4 | TransferScreen DateInput | `/harden` | #5 | Small |
| 5 | AccountDetailScreen Cleanup | `/extract` + `/normalize` | #6-7 | Small |
| 6 | AccountDetailScreen Error State | `/harden` | #8 | Small |

---

## Out of Scope

- Extracting SegmentedControl/PillToggle (deferred — needs design alignment on variants)
- Skeleton shimmer gradient (current pulse is functional)
- prefers-reduced-motion support (requires Expo config changes)
- Glass card variant consistency (design decision needed)
