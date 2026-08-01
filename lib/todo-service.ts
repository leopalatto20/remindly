import {
  createTodo as dbCreateTodo,
  updateTodo as dbUpdateTodo,
  toggleTodoCompleted as dbToggleTodoCompleted,
  deleteTodo as dbDeleteTodo,
  getTodo,
} from "./db/todos";
import { scheduleTodoNotification, cancelTodoNotification } from "./notifications";

export async function createTodo(title: string, dueDate: string, noteId: number): Promise<number> {
  const todoId = await dbCreateTodo(title, dueDate, noteId);
  await scheduleTodoNotification(todoId, title, dueDate, noteId);
  return todoId;
}

export async function updateTodo(id: number, title: string, dueDate: string): Promise<void> {
  await dbUpdateTodo(id, title, dueDate);
  const todo = await getTodo(id);
  if (todo) {
    await scheduleTodoNotification(todo.id, todo.title, todo.due_date, todo.note_id);
  }
}

export async function toggleTodoCompleted(id: number): Promise<void> {
  const todo = await getTodo(id);
  const wasCompleted = todo ? todo.completed === 1 : false;

  await dbToggleTodoCompleted(id);

  if (wasCompleted) {
    // Was completed → now incomplete → reschedule
    const updated = await getTodo(id);
    if (updated) {
      await scheduleTodoNotification(updated.id, updated.title, updated.due_date, updated.note_id);
    }
  } else {
    // Was incomplete → now completed → cancel
    await cancelTodoNotification(id);
  }
}

export async function deleteTodo(id: number): Promise<void> {
  await dbDeleteTodo(id);
  await cancelTodoNotification(id);
}
