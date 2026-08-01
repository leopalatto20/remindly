import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTodosByNote, type Todo } from "../db/todos";
import {
  createTodo,
  updateTodo,
  toggleTodoCompleted,
  deleteTodo,
} from "../todo-service";

export function useTodos(noteId: number) {
  return useQuery<Todo[]>({
    queryKey: ["todos", "note", noteId],
    queryFn: () => getTodosByNote(noteId),
    enabled: !!noteId,
  });
}

export function useCreateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, dueDate, noteId }: { title: string; dueDate: string; noteId: number }) =>
      createTodo(title, dueDate, noteId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["todos", "note", variables.noteId] });
      queryClient.invalidateQueries({ queryKey: ["urgent-todos"] });
    },
  });
}

export function useUpdateTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, dueDate }: { id: number; title: string; dueDate: string }) =>
      updateTodo(id, title, dueDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-todos"] });
    },
  });
}

export function useToggleTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => toggleTodoCompleted(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-todos"] });
    },
  });
}

export function useDeleteTodo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteTodo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-todos"] });
    },
  });
}
