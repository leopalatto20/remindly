import { getDb } from "./schema";
import { scheduleTodoNotification, cancelTodoNotification } from "../notifications";

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
    noteId,
  );
}

export async function getUrgentTodos(): Promise<
  (Todo & { category_color: string; category_icon: string; note_title: string })[]
> {
  const db = await getDb();
  return await db.getAllAsync(
    `SELECT t.*, c.color as category_color, c.icon as category_icon, n.title as note_title
     FROM todos t
     JOIN notes n ON n.id = t.note_id
     JOIN categories c ON c.id = n.category_id
     WHERE t.completed = 0
       AND t.due_date <= datetime('now', '+7 days')
     ORDER BY t.due_date ASC
     LIMIT 50`,
  );
}

export async function getTodo(id: number): Promise<Todo | null> {
  const db = await getDb();
  return (await db.getFirstAsync<Todo>("SELECT * FROM todos WHERE id = ?", id)) ?? null;
}

export async function createTodo(title: string, dueDate: string, noteId: number): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    "INSERT INTO todos (title, due_date, note_id) VALUES (?, ?, ?)",
    title,
    dueDate,
    noteId,
  );
  const todoId = result.lastInsertRowId;
  // Schedule notification for the new todo
  scheduleTodoNotification(todoId, title, dueDate, noteId);
  return todoId;
}

export async function updateTodo(id: number, title: string, dueDate: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE todos SET title = ?, due_date = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    title,
    dueDate,
    id,
  );
  // Reschedule notification for the updated todo
  const todo = await getTodo(id);
  if (todo) {
    scheduleTodoNotification(todo.id, todo.title, todo.due_date, todo.note_id);
  }
}

export async function toggleTodoCompleted(id: number): Promise<void> {
  const db = await getDb();
  const todo = await getTodo(id);
  const wasCompleted = todo ? todo.completed === 1 : false;

  await db.runAsync(
    "UPDATE todos SET completed = CASE WHEN completed = 0 THEN 1 ELSE 0 END, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    id,
  );

  if (!wasCompleted) {
    // Was incomplete, now completed → cancel notification
    await cancelTodoNotification(id);
  } else {
    // Was completed, now incomplete → reschedule notification
    const updated = await getTodo(id);
    if (updated) {
      scheduleTodoNotification(updated.id, updated.title, updated.due_date, updated.note_id);
    }
  }
}

export async function deleteTodo(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync("DELETE FROM todos WHERE id = ?", id);
  // Cancel notification for the deleted todo
  await cancelTodoNotification(id);
}
