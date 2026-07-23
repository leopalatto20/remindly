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

export function backupFilename(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `remindly-backup-${y}-${m}-${d}.json`;
}

function validateBackupData(data: unknown): ValidationError | null {
  if (!data || typeof data !== "object") {
    return { message: "Backup must be a JSON object" };
  }

  const obj = data as Record<string, unknown>;

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
    if (!c || typeof c !== "object") {
      return { message: `categories[${i}] is not an object` };
    }
    const cat = c as Record<string, unknown>;
    const missing = ["id", "name", "icon", "color"].filter((f) => cat[f] === undefined);
    if (missing.length > 0) {
      return { message: `categories[${i}] missing required fields: ${missing.join(", ")}` };
    }
  }

  for (let i = 0; i < obj.notes.length; i++) {
    const n = obj.notes[i];
    if (!n || typeof n !== "object") {
      return { message: `notes[${i}] is not an object` };
    }
    const note = n as Record<string, unknown>;
    const missing = ["id", "title", "category_id"].filter((f) => note[f] === undefined);
    if (missing.length > 0) {
      return { message: `notes[${i}] missing required fields: ${missing.join(", ")}` };
    }
  }

  for (let i = 0; i < obj.todos.length; i++) {
    const t = obj.todos[i];
    if (!t || typeof t !== "object") {
      return { message: `todos[${i}] is not an object` };
    }
    const todo = t as Record<string, unknown>;
    const missing = ["id", "title", "due_date", "note_id"].filter((f) => todo[f] === undefined);
    if (missing.length > 0) {
      return { message: `todos[${i}] missing required fields: ${missing.join(", ")}` };
    }
  }

  return null;
}

export async function exportData(): Promise<string> {
  const db = await getDb();

  const categories = await db.getAllAsync<Category>(
    "SELECT * FROM categories ORDER BY id",
  );
  const notes = await db.getAllAsync<Note>(
    "SELECT * FROM notes ORDER BY id",
  );
  const todos = await db.getAllAsync<Todo>(
    "SELECT * FROM todos ORDER BY id",
  );

  const backup: BackupData = {
    exportedAt: new Date().toISOString(),
    categories,
    notes,
    todos,
  };

  return JSON.stringify(backup, null, 2);
}

export async function importData(jsonString: string): Promise<{ success: true } | { success: false; error: string }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    return { success: false, error: "Invalid JSON" };
  }

  const validationError = validateBackupData(parsed);
  if (validationError) {
    return { success: false, error: validationError.message };
  }

  const data = parsed as BackupData;

  const db = await getDb();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    await db.runAsync("DELETE FROM todos");
    await db.runAsync("DELETE FROM notes");
    await db.runAsync("DELETE FROM categories");

    for (const cat of data.categories) {
      await db.runAsync(
        "INSERT INTO categories (id, name, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))",
        cat.id,
        cat.name,
        cat.icon,
        cat.color,
        cat.created_at,
        cat.updated_at,
      );
    }

    for (const note of data.notes) {
      await db.runAsync(
        "INSERT INTO notes (id, title, body, category_id, created_at, updated_at) VALUES (?, ?, COALESCE(?, ''), ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))",
        note.id,
        note.title,
        note.body,
        note.category_id,
        note.created_at,
        note.updated_at,
      );
    }

    for (const todo of data.todos) {
      await db.runAsync(
        "INSERT INTO todos (id, title, due_date, completed, note_id, created_at, updated_at) VALUES (?, ?, ?, COALESCE(?, 0), ?, COALESCE(?, CURRENT_TIMESTAMP), COALESCE(?, CURRENT_TIMESTAMP))",
        todo.id,
        todo.title,
        todo.due_date,
        todo.completed,
        todo.note_id,
        todo.created_at,
        todo.updated_at,
      );
    }

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