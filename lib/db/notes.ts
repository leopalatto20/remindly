import { getDb } from "./schema";

export interface Note {
  id: number;
  title: string;
  body: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

export async function getNotesByCategory(categoryId: number): Promise<Note[]> {
  const db = await getDb();
  return await db.getAllAsync<Note>(
    "SELECT * FROM notes WHERE category_id = ? ORDER BY updated_at DESC",
    categoryId,
  );
}

export async function getNote(id: number): Promise<Note | null> {
  const db = await getDb();
  return (await db.getFirstAsync<Note>("SELECT * FROM notes WHERE id = ?", id)) ?? null;
}

export async function createNote(title: string, categoryId: number): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO notes (title, category_id) VALUES (?, ?)",
    title,
    categoryId,
  );
  return result.lastInsertRowId;
}

export async function updateNoteBody(id: number, body: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE notes SET body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    body,
    id,
  );
}

export async function updateNote(id: number, title: string, body: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE notes SET title = ?, body = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    title,
    body,
    id,
  );
}

export async function deleteNote(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM notes WHERE id = ?", id);
}
