import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNote,
  getNotesByCategory,
  createNote as dbCreateNote,
  updateNoteBody as dbUpdateNoteBody,
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

export function useUpdateNoteBody() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: string }) => dbUpdateNoteBody(id, body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes", variables.id] });
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
