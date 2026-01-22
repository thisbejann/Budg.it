# Expo Migration Plan for BudgetTracker

## Overview

Migrate BudgetTracker from bare React Native (requiring Android Studio/JDK) to Expo managed workflow.

**Current State:** React Native 0.83.1 with native Android/iOS folders
**Target State:** Expo SDK 52+ managed workflow

---

## Phase 1: Project Conversion to Expo

### Step 1.1: Initialize Expo in existing project

```bash
# Install Expo CLI globally (if not already)
npm install -g expo-cli

# Install expo package in project
npx expo install expo

# Create app.json for Expo configuration
```

Create `app.json`:
```json
{
  "expo": {
    "name": "BudgetTracker",
    "slug": "budget-tracker",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.budgettracker"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#ffffff"
      },
      "package": "com.budgettracker"
    }
  }
}
```

### Step 1.2: Update entry point

Replace `index.js` with Expo entry point pattern:
```javascript
import 'expo-router/entry';
// OR for traditional setup:
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

### Step 1.3: Remove native folders (optional - can keep for ejected builds)

```bash
# Backup first
mv android android.backup
mv ios ios.backup
```

---

## Phase 2: Dependencies Migration

### Step 2.1: Remove bare React Native dependencies

**Remove these packages:**
```bash
npm uninstall react-native-sqlite-storage @types/react-native-sqlite-storage
npm uninstall react-native-image-picker  # Not currently used in code
npm uninstall @react-native-community/cli @react-native-community/cli-platform-android @react-native-community/cli-platform-ios
npm uninstall @react-native/babel-preset @react-native/metro-config @react-native/typescript-config @react-native/eslint-config
```

### Step 2.2: Install Expo equivalents

**Core Expo packages:**
```bash
npx expo install expo-sqlite expo-status-bar expo-constants
```

**Keep compatible packages (no changes needed):**
- `@react-native-async-storage/async-storage` - Expo compatible
- `@react-navigation/*` - Expo compatible
- `react-native-reanimated` - Expo compatible
- `react-native-gesture-handler` - Expo compatible
- `react-native-screens` - Expo compatible
- `react-native-safe-area-context` - Expo compatible
- `react-native-svg` - Expo compatible
- `nativewind` - Expo compatible
- `victory-native` - Expo compatible
- `lucide-react-native` - Expo compatible
- `zustand` - Pure JS, works everywhere
- `zod` - Pure JS, works everywhere
- `date-fns` - Pure JS, works everywhere
- `react-hook-form` - Pure JS, works everywhere

### Step 2.3: Update package.json scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "lint": "eslint .",
    "test": "jest"
  }
}
```

---

## Phase 3: Database Layer Migration (Main Work)

This is the most significant change. The `expo-sqlite` API differs from `react-native-sqlite-storage`.

### Step 3.1: Update database/index.ts

**Current (react-native-sqlite-storage):**
```typescript
import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
SQLite.enablePromise(true);
const db = await SQLite.openDatabase({ name: 'budget_tracker.db', location: 'default' });
const [results] = await db.executeSql(sql, params);
results.rows.item(i)  // Access rows
results.insertId      // Get insert ID
results.rowsAffected  // Get affected rows
```

**New (expo-sqlite):**
```typescript
import * as SQLite from 'expo-sqlite';

let database: SQLite.SQLiteDatabase | null = null;
const DATABASE_NAME = 'budget_tracker.db';

export async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (database) {
    return database;
  }

  try {
    database = await SQLite.openDatabaseAsync(DATABASE_NAME);

    // Enable foreign keys
    await database.execAsync('PRAGMA foreign_keys = ON;');

    // Run migrations
    await runMigrations(database);

    console.log('Database opened successfully');
    return database;
  } catch (error) {
    console.error('Error opening database:', error);
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (database) {
    await database.closeAsync();
    database = null;
    console.log('Database closed');
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!database) {
    return openDatabase();
  }
  return database;
}

// Helper function to execute SQL and return results
export async function executeSql<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const db = await getDatabase();
  const results = await db.getAllAsync<T>(sql, params);
  return results;
}

// Helper function to execute SQL and return insert id
export async function executeSqlInsert(
  sql: string,
  params: any[] = []
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(sql, params);
  return result.lastInsertRowId;
}

// Helper function to execute SQL for updates/deletes
export async function executeSqlUpdate(
  sql: string,
  params: any[] = []
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(sql, params);
  return result.changes;
}

// Transaction helper
export async function executeTransaction<T>(
  callback: (db: SQLite.SQLiteDatabase) => Promise<T>
): Promise<T> {
  const db = await getDatabase();
  return await db.withTransactionAsync(async () => {
    return await callback(db);
  });
}
```

### Step 3.2: Update migration types

**File: `src/database/migrations/types.ts`**

```typescript
import type { SQLiteDatabase } from 'expo-sqlite';

export interface Migration {
  version: number;
  name: string;
  up: (db: SQLiteDatabase) => Promise<void>;
}
```

### Step 3.3: Update migrations/index.ts

Update to use expo-sqlite API:
- Replace `db.executeSql()` with `db.execAsync()` for DDL statements
- Replace `db.executeSql()` with `db.runAsync()` for INSERT/UPDATE
- Replace `db.executeSql()` with `db.getAllAsync()` for SELECT

### Step 3.4: Update individual migrations

**001_initial_schema.ts:**
```typescript
// Change from:
await db.executeSql(`CREATE TABLE...`);

// To:
await db.execAsync(`CREATE TABLE...`);
```

**002_seed_categories.ts:**
```typescript
// Change from:
const [result] = await db.executeSql('INSERT INTO categories...', params);
const categoryId = result.insertId;

// To:
const result = await db.runAsync('INSERT INTO categories...', params);
const categoryId = result.lastInsertRowId;
```

### Step 3.5: Repository files (minimal changes needed)

The repositories use the helper functions from `index.ts`. Since we're updating those helpers to maintain the same interface, **repositories should work without changes**.

Verify these files work correctly:
- `AccountRepository.ts`
- `CategoryRepository.ts`
- `LedgerRepository.ts`
- `PersonRepository.ts`
- `TemplateRepository.ts`
- `TransactionRepository.ts`
- `TransferRepository.ts`

---

## Phase 4: Configuration Files

### Step 4.1: Update babel.config.js

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo', 'nativewind/babel'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

### Step 4.2: Update metro.config.js

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './global.css',
});
```

### Step 4.3: Update tsconfig.json (if needed)

Add Expo types:
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true
  }
}
```

### Step 4.4: tailwind.config.js (no changes needed)

The existing configuration is compatible with Expo.

---

## Phase 5: App Structure Updates

### Step 5.1: Update App.tsx entry

```typescript
import './global.css';
import { StatusBar } from 'expo-status-bar';
import App from './src/app/App';

export default function Root() {
  return (
    <>
      <StatusBar style="auto" />
      <App />
    </>
  );
}
```

### Step 5.2: Update DatabaseProvider (if using expo-sqlite types)

Ensure the provider uses the correct SQLiteDatabase type from expo-sqlite.

---

## Phase 6: Testing & Verification

### Step 6.1: Start Expo development server

```bash
npx expo start
```

### Step 6.2: Test on Expo Go (limited - SQLite requires dev build)

For SQLite, you'll need a development build:
```bash
npx expo install expo-dev-client
npx expo run:android  # or run:ios
```

### Step 6.3: Test all features

1. [ ] App launches successfully
2. [ ] Database initializes and migrations run
3. [ ] Ledger CRUD operations work
4. [ ] Account CRUD operations work
5. [ ] Transaction CRUD operations work
6. [ ] Transfer operations work
7. [ ] Category management works
8. [ ] Charts/visualizations render correctly
9. [ ] Navigation works (tabs + stack)
10. [ ] Forms work (react-hook-form)
11. [ ] Styling works (NativeWind)

---

## Phase 7: Build & Distribution (Optional)

### Step 7.1: Configure EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Step 7.2: Create development build

```bash
eas build --profile development --platform android
```

### Step 7.3: Create production build

```bash
eas build --profile production --platform android
```

---

## Files Changed Summary

| File | Change Type | Effort |
|------|-------------|--------|
| `package.json` | Modify | Low |
| `app.json` | Create | Low |
| `index.js` | Modify | Low |
| `App.tsx` | Modify | Low |
| `babel.config.js` | Modify | Low |
| `metro.config.js` | Modify | Low |
| `tsconfig.json` | Modify | Low |
| `src/database/index.ts` | **Rewrite** | **High** |
| `src/database/migrations/types.ts` | Modify | Low |
| `src/database/migrations/index.ts` | Modify | Medium |
| `src/database/migrations/001_initial_schema.ts` | Modify | Medium |
| `src/database/migrations/002_seed_categories.ts` | Modify | Medium |
| `android/` folder | Delete (backup) | N/A |
| `ios/` folder | Delete (backup) | N/A |

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| SQLite API differences cause bugs | Medium | High | Thorough testing of all DB operations |
| expo-sqlite missing features | Low | Medium | expo-sqlite is mature and full-featured |
| NativeWind compatibility issues | Low | Low | NativeWind officially supports Expo |
| Build configuration issues | Medium | Medium | Follow Expo documentation carefully |

---

## Rollback Plan

If migration fails:
1. Restore `android/` and `ios/` folders from backup
2. Revert `package.json` changes
3. Run `npm install` to restore original dependencies
4. The original bare React Native setup will work again

---

## Timeline Estimate

- Phase 1 (Project Conversion): 1 task
- Phase 2 (Dependencies): 1 task
- Phase 3 (Database Migration): 3-4 tasks (main work)
- Phase 4 (Configuration): 1 task
- Phase 5 (App Structure): 1 task
- Phase 6 (Testing): 1-2 tasks
- Phase 7 (Build Setup): Optional

**Total: 8-10 tasks**
