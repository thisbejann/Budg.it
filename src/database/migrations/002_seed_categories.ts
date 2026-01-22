import type { SQLiteDatabase } from 'expo-sqlite';
import type { Migration } from './types';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../../constants/categories';

export const migration002: Migration = {
  version: 2,
  name: '002_seed_categories',
  up: async (db: SQLiteDatabase) => {
    // Seed expense categories
    let sortOrder = 0;
    for (const category of DEFAULT_EXPENSE_CATEGORIES) {
      const result = await db.runAsync(
        `INSERT INTO categories (name, icon, color, type, is_system, sort_order)
         VALUES (?, ?, ?, 'expense', 1, ?)`,
        [category.name, category.icon, category.color, sortOrder++]
      );

      const categoryId = result.lastInsertRowId;

      // Insert subcategories
      let subSortOrder = 0;
      for (const subcategoryName of category.subcategories) {
        await db.runAsync(
          `INSERT INTO subcategories (category_id, name, sort_order)
           VALUES (?, ?, ?)`,
          [categoryId, subcategoryName, subSortOrder++]
        );
      }
    }

    // Seed income categories
    sortOrder = 0;
    for (const category of DEFAULT_INCOME_CATEGORIES) {
      const result = await db.runAsync(
        `INSERT INTO categories (name, icon, color, type, is_system, sort_order)
         VALUES (?, ?, ?, 'income', 1, ?)`,
        [category.name, category.icon, category.color, sortOrder++]
      );

      const categoryId = result.lastInsertRowId;

      // Insert subcategories
      let subSortOrder = 0;
      for (const subcategoryName of category.subcategories) {
        await db.runAsync(
          `INSERT INTO subcategories (category_id, name, sort_order)
           VALUES (?, ?, ?)`,
          [categoryId, subcategoryName, subSortOrder++]
        );
      }
    }

    console.log('Migration 002: Default categories seeded');
  },
};
