import { useQuery } from "@tanstack/react-query";
import { search, type SearchResult } from "../db/search";

export function useSearch(query: string, categoryId?: number) {
  return useQuery<SearchResult[]>({
    queryKey: ["search", query, categoryId],
    queryFn: () => search(query, categoryId),
    enabled: query.trim().length > 0,
  });
}
