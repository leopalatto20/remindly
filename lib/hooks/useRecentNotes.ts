import { useQuery } from "@tanstack/react-query";
import { getRecentNotes, type RecentNote } from "../db/notes";

export function useRecentNotes() {
  return useQuery<RecentNote[]>({
    queryKey: ["recent-notes"],
    queryFn: getRecentNotes,
  });
}
