import { getDb } from "./schema";

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  return await db.getAllAsync<Category>("SELECT * FROM categories ORDER BY name ASC");
}

export async function getCategory(id: number): Promise<Category | null> {
  const db = await getDb();
  return (await db.getFirstAsync<Category>("SELECT * FROM categories WHERE id = ?", id)) ?? null;
}

export async function createCategory(name: string, icon: string, color: string): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO categories (name, icon, color) VALUES (?, ?, ?)",
    name,
    icon,
    color,
  );
  return result.lastInsertRowId;
}

export async function updateCategory(
  id: number,
  name: string,
  icon: string,
  color: string,
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE categories SET name = ?, icon = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    name,
    icon,
    color,
    id,
  );
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM categories WHERE id = ?", id);
}
