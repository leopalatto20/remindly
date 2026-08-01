import { useQuery } from "@tanstack/react-query";
import { getUrgentTodos, type Todo } from "../db/todos";

export type UrgentTodo = Todo & {
  category_color: string;
  category_icon: string;
  note_title: string;
};

export function useUrgentTodos() {
  return useQuery<UrgentTodo[]>({
    queryKey: ["urgent-todos"],
    queryFn: getUrgentTodos,
  });
}
