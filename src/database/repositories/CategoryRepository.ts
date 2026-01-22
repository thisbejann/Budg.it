import { executeSql, executeSqlInsert, executeSqlUpdate } from '../index';
import type { Category, Subcategory, CategoryWithSubcategories, CategoryType } from '../../types/database';
import type { CategoryFormData, SubcategoryFormData } from '../../types/forms';

export const CategoryRepository = {
  // Categories
  async getAll(): Promise<Category[]> {
    return executeSql<Category>(
      'SELECT * FROM categories ORDER BY type, sort_order, name'
    );
  },

  async getByType(type: CategoryType): Promise<Category[]> {
    return executeSql<Category>(
      'SELECT * FROM categories WHERE type = ? ORDER BY sort_order, name',
      [type]
    );
  },

  async getById(id: number): Promise<Category | null> {
    const results = await executeSql<Category>(
      'SELECT * FROM categories WHERE id = ?',
      [id]
    );
    return results[0] || null;
  },

  async getAllWithSubcategories(): Promise<CategoryWithSubcategories[]> {
    const categories = await executeSql<Category>(
      'SELECT * FROM categories ORDER BY type, sort_order, name'
    );

    const subcategories = await executeSql<Subcategory>(
      'SELECT * FROM subcategories ORDER BY sort_order, name'
    );

    return categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((sub) => sub.category_id === cat.id),
    }));
  },

  async getByTypeWithSubcategories(type: CategoryType): Promise<CategoryWithSubcategories[]> {
    const categories = await executeSql<Category>(
      'SELECT * FROM categories WHERE type = ? ORDER BY sort_order, name',
      [type]
    );

    const categoryIds = categories.map((c) => c.id);
    if (categoryIds.length === 0) return [];

    const subcategories = await executeSql<Subcategory>(
      `SELECT * FROM subcategories WHERE category_id IN (${categoryIds.join(',')}) ORDER BY sort_order, name`
    );

    return categories.map((cat) => ({
      ...cat,
      subcategories: subcategories.filter((sub) => sub.category_id === cat.id),
    }));
  },

  async create(data: CategoryFormData): Promise<number> {
    // Get max sort_order for the type
    const maxOrder = await executeSql<{ max_order: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM categories WHERE type = ?',
      [data.type]
    );

    const id = await executeSqlInsert(
      `INSERT INTO categories (name, icon, color, type, sort_order)
       VALUES (?, ?, ?, ?, ?)`,
      [data.name, data.icon, data.color, data.type, maxOrder[0].max_order + 1]
    );
    return id;
  },

  async update(id: number, data: Partial<CategoryFormData>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      values.push(data.icon);
    }
    if (data.color !== undefined) {
      fields.push('color = ?');
      values.push(data.color);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await executeSqlUpdate(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async updateSortOrder(id: number, sortOrder: number): Promise<void> {
    await executeSqlUpdate(
      `UPDATE categories SET sort_order = ?, updated_at = datetime('now') WHERE id = ?`,
      [sortOrder, id]
    );
  },

  async delete(id: number): Promise<void> {
    // Check if it's a system category
    const category = await this.getById(id);
    if (category?.is_system) {
      throw new Error('Cannot delete system category');
    }
    await executeSqlUpdate('DELETE FROM categories WHERE id = ?', [id]);
  },

  // Subcategories
  async getSubcategories(categoryId: number): Promise<Subcategory[]> {
    return executeSql<Subcategory>(
      'SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order, name',
      [categoryId]
    );
  },

  async getSubcategoryById(id: number): Promise<Subcategory | null> {
    const results = await executeSql<Subcategory>(
      'SELECT * FROM subcategories WHERE id = ?',
      [id]
    );
    return results[0] || null;
  },

  async createSubcategory(data: SubcategoryFormData): Promise<number> {
    // Get max sort_order for the category
    const maxOrder = await executeSql<{ max_order: number }>(
      'SELECT COALESCE(MAX(sort_order), -1) as max_order FROM subcategories WHERE category_id = ?',
      [data.category_id]
    );

    const id = await executeSqlInsert(
      `INSERT INTO subcategories (category_id, name, icon, sort_order)
       VALUES (?, ?, ?, ?)`,
      [data.category_id, data.name, data.icon || null, maxOrder[0].max_order + 1]
    );
    return id;
  },

  async updateSubcategory(id: number, data: Partial<SubcategoryFormData>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.icon !== undefined) {
      fields.push('icon = ?');
      values.push(data.icon);
    }

    if (fields.length === 0) return;

    fields.push("updated_at = datetime('now')");
    values.push(id);

    await executeSqlUpdate(
      `UPDATE subcategories SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  },

  async deleteSubcategory(id: number): Promise<void> {
    await executeSqlUpdate('DELETE FROM subcategories WHERE id = ?', [id]);
  },
};
