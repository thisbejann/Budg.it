# AGENTS.md

## Context

This repository had a regression after PR #27 (`d00150e`, merged as `0dc889c`) where Android save flows crashed again with:

`IllegalStateException: SafeAreaProvider contains null child at index ...`

The stable behavior before that regression was present in `e269c7b` / PR #26 baseline (`fb48de6`).

## Stability Guardrails (Do Not Violate)

1. Save-and-close form flows (add/edit/create/update/delete) must use this exact navigation pattern:
   - `setIsLoading(true)` before `try`
   - in success path: `Keyboard.dismiss(); InteractionManager.runAfterInteractions(() => navigation.goBack());`
   - in `catch`: `setIsLoading(false)` then alert/log
   - do not use `finally { setIsLoading(false) }` on flows that navigate away after success
   - do not call direct `navigation.goBack()` immediately after save on Android form screens

2. Provider stack must keep keyboard/safe-area behavior stable:
   - Keep `SafeAreaProvider` with `initialWindowMetrics`
   - Keep `KeyboardProvider` wrapping app content inside provider tree
   - Do not remove or reorder these without validating save flows on Android dev build

3. New Architecture toggles are high risk for this app:
   - Do not change `newArchEnabled` in `android/gradle.properties` or `app.config.js` unless explicitly requested
   - If changed, run Android save-flow regression tests before merging

## Required Regression Checks Before Merge

1. Verify no risky submit handlers were introduced:
   - no direct `navigation.goBack()` in save success blocks for Android form screens
   - no `finally { setIsLoading(false) }` in submit handlers that navigate away on success
2. Smoke test on local dev APK:
   - Add Account, Add Transaction, Edit Transaction, Transfer
   - Confirm save succeeds and closes screen without crash
3. If save/navigation/provider code changed, compare against known stable commit patterns (`e269c7b` / `e272d78`) before merge.

