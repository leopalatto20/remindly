import { getDb } from "./schema";

export interface Todo {
  id: number;
  title: string;
  due_date: string;
  completed: number;
  note_id: number;
  created_at: string;
  updated_at: string;
}

export async function getTodosByNote(noteId: number): Promise<Todo[]> {
  const db = await getDb();
  return await db.getAllAsync<Todo>(
    "SELECT * FROM todos WHERE note_id = ? ORDER BY completed ASC, due_date ASC",
    noteId
  );
}

export async function getUrgentTodos(): Promise<(Todo & { category_color: string; category_icon: string; note_title: string })[]> {
  const db = await getDb();
  return await db.getAllAsync(
    `SELECT t.*, c.color as category_color, c.icon as category_icon, n.title as note_title
     FROM todos t
     JOIN notes n ON n.id = t.note_id
     JOIN categories c ON c.id = n.category_id
     WHERE t.completed = 0
       AND t.due_date <= datetime('now', '+7 days')
     ORDER BY t.due_date ASC
     LIMIT 50`
  );
}

export async function getTodo(id: number): Promise<Todo | null> {
  const db = await getDb();
  return (
    (await db.getFirstAsync<Todo>("SELECT * FROM todos WHERE id = ?", id)) ??
    null
  );
}

export async function createTodo(
  title: string,
  dueDate: string,
  noteId: number
): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO todos (title, due_date, note_id) VALUES (?, ?, ?)",
    title,
    dueDate,
    noteId
  );
  return result.lastInsertRowId;
}

export async function updateTodo(
  id: number,
  title: string,
  dueDate: string
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE todos SET title = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    title,
    dueDate,
    id
  );
}

export async function toggleTodoCompleted(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE todos SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    id
  );
}

export async function deleteTodo(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM todos WHERE id = ?", id);
}