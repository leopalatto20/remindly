import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  getCategory,
  createCategory as dbCreateCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  type Category,
} from "../db/categories";

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: getAllCategories,
  });
}

export function useCategory(id: number) {
  return useQuery<Category | null>({
    queryKey: ["categories", id],
    queryFn: () => getCategory(id),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, icon, color }: { name: string; icon: string; color: string }) =>
      dbCreateCategory(name, icon, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, icon, color }: { id: number; name: string; icon: string; color: string }) =>
      dbUpdateCategory(id, name, icon, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => dbDeleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      queryClient.invalidateQueries({ queryKey: ["urgent-todos"] });
    },
  });
}
