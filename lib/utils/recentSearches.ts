import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "recent_searches";
const MAX_SEARCHES = 5;

export async function getRecentSearches(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export async function saveRecentSearch(query: string): Promise<void> {
  const trimmed = query.trim();
  if (!trimmed) return;

  const existing = await getRecentSearches();
  const deduped = [trimmed, ...existing.filter((s) => s !== trimmed)].slice(0, MAX_SEARCHES);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(deduped));
}
