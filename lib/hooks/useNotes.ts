import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNote,
  getNotesByCategory,
  createNote as dbCreateNote,
  updateNote as dbUpdateNote,
  deleteNote as dbDeleteNote,
  type Note,
} from "../db/notes";

export function useNotes(categoryId: number) {
  return useQuery<Note[]>({
    queryKey: ["notes", "category", categoryId],
    queryFn: () => getNotesByCategory(categoryId),
    enabled: !!categoryId,
  });
}

export function useNote(id: number) {
  return useQuery<Note | null>({
    queryKey: ["notes", id],
    queryFn: () => getNote(id),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ title, categoryId }: { title: string; categoryId: number }) =>
      dbCreateNote(title, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, title, body }: { id: number; title: string; body: string }) =>
      dbUpdateNote(id, title, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dbDeleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-todos"] });
    },
  });
}
