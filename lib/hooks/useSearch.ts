import { useQuery } from "@tanstack/react-query";
import { search, type SearchResult } from "../db/search";

export function useSearch(query: string) {
  return useQuery<SearchResult[]>({
    queryKey: ["search", query],
    queryFn: () => search(query),
    enabled: query.trim().length > 0,
  });
}
