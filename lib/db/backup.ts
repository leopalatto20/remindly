import { getDb } from "./schema";
import type { Category } from "./categories";
import type { Note } from "./notes";
import type { Todo } from "./todos";

export interface BackupData {
  exportedAt?: string;
  categories: Category[];
  notes: Note[];
  todos: Todo[];
}

export interface ValidationError {
  message: string;
}

// Named types for the validation boundary
export interface RawBackupObject {
  categories: unknown;
  notes: unknown;
  todos: unknown;
}

export function backupFilename(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `remindly-backup-${y}-${m}-${d}.json`;
}

function validateBackupObject(obj: RawBackupObject): ValidationError | null {
  if (!Array.isArray(obj.categories)) {
    return { message: "Missing or invalid 'categories' array" };
  }
  if (!Array.isArray(obj.notes)) {
    return { message: "Missing or invalid 'notes' array" };
  }
  if (!Array.isArray(obj.todos)) {
    return { message: "Missing or invalid 'todos' array" };
  }

  for (let i = 0; i < obj.categories.length; i++) {
    const c = obj.categories[i];
    if (!(c instanceof Object)) {
      return { message: `categories[${i}] is not an object` };
    }
    // SAFETY: instanceof Object confirms c is an object with the expected fields
    const cat = c as { id: unknown; name: unknown; icon: unknown; color: unknown };
    if (cat.id === undefined || cat.name === undefined || cat.icon === undefined || cat.color === undefined) {
      return { message: `categories[${i}] missing required fields` };
    }
  }

  for (let i = 0; i < obj.notes.length; i++) {
    const n = obj.notes[i];
    if (!(n instanceof Object)) {
      return { message: `notes[${i}] is not an object` };
    }
    // SAFETY: instanceof Object confirms n is an object with the expected fields
    const note = n as { id: unknown; title: unknown; body: unknown; category_id: unknown };
    if (note.id === undefined || note.title === undefined || note.category_id === undefined) {
      return { message: `notes[${i}] missing required fields` };
    }
  }

  for (let i = 0; i < obj.todos.length; i++) {
    const t = obj.todos[i];
    if (!(t instanceof Object)) {
      return { message: `todos[${i}] is not an object` };
    }
    // SAFETY: instanceof Object confirms t is an object with the expected fields
    const todo = t as { id: unknown; title: unknown; due_date: unknown; completed: unknown; note_id: unknown };
    if (todo.id === undefined || todo.title === undefined || todo.due_date === undefined || todo.note_id === undefined) {
      return { message: `todos[${i}] missing required fields` };
    }
  }

  return null;
}

export async function exportData(): Promise<string> {
  const db = await getDb();

  const [categories, notes, todos] = await Promise.all([
    db.getAllAsync<Category>("SELECT * FROM categories ORDER BY id"),
    db.getAllAsync<Note>("SELECT * FROM notes ORDER BY id"),
    db.getAllAsync<Todo>("SELECT * FROM todos ORDER BY id"),
  ]);

  const backup: BackupData = {
    exportedAt: new Date().toISOString(),
    categories,
    notes,
    todos,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importData(
  jsonString: string,
): Promise<{ success: true } | { success: false; error: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { success: false, error: "Invalid JSON" };
  }

  if (!(parsed instanceof Object)) {
    return { success: false, error: "Invalid backup format" };
  }
  // SAFETY: instanceof Object confirms parsed is a non-null object with the expected shape
  const obj = parsed as RawBackupObject;
  const validationError = validateBackupObject(obj);
  if (validationError) {
    return { success: false, error: validationError.message };
  }

  // SAFETY: validateBackupShape confirmed the required fields exist
  const data = parsed as BackupData;

  const db = await getDb();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    await db.runAsync("DELETE FROM todos");
    await db.runAsync("DELETE FROM notes");
    await db.runAsync("DELETE FROM categories");

    await Promise.all(
      data.categories.map((cat) =>
        db.runAsync(
          "INSERT INTO categories (id, name, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))",
          cat.id,
          cat.name,
          cat.icon,
          cat.color,
          cat.created_at,
          cat.updated_at,
        ),
      ),
    );

    await Promise.all(
      data.notes.map((note) =>
        db.runAsync(
          "INSERT INTO notes (id, title, body, category_id, created_at, updated_at) VALUES (?, ?, COALESCE(?, ''), ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))",
          note.id,
          note.title,
          note.body,
          note.category_id,
          note.created_at,
          note.updated_at,
        ),
      ),
    );

    await Promise.all(
      data.todos.map((todo) =>
        db.runAsync(
          "INSERT INTO todos (id, title, due_date, completed, note_id, created_at, updated_at) VALUES (?, ?, ?, COALESCE(?, 0), ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))",
          todo.id,
          todo.title,
          todo.due_date,
          todo.completed,
          todo.note_id,
          todo.created_at,
          todo.updated_at,
        ),
      ),
    );

    await db.execAsync("INSERT INTO notes_fts(notes_fts) VALUES('rebuild')");
    await db.execAsync("INSERT INTO todos_fts(todos_fts) VALUES('rebuild')");

    await db.execAsync("COMMIT");

    return { success: true };
  } catch (e) {
    await db.execAsync("ROLLBACK");
    const message = e instanceof Error ? e.message : "Unknown error during import";
    return { success: false, error: message };
  }
}
