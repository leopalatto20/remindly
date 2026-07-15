import { useCallback, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { search, type SearchResult } from "../../lib/db/search";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { useThemeColors } from "../../lib/theme/colors";

export default function SearchScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        setQuery("");
        setResults([]);
      };
    }, [])
  );

  async function handleSearch(text: string) {
    setQuery(text);
    if (text.trim()) {
      const res = await search(text);
      setResults(res);
    } else {
      setResults([]);
    }
  }

  const grouped = results.reduce<
    Record<string, { notes: SearchResult[]; todos: SearchResult[] }>
  >((acc, r) => {
    const key = r.category_name;
    if (!acc[key]) acc[key] = { notes: [], todos: [] };
    if (r.type === "note") acc[key].notes.push(r);
    else acc[key].todos.push(r);
    return acc;
  }, {});

  const sections = Object.entries(grouped).flatMap(
    ([catName, { notes, todos }]) => {
      const items: { type: "header" | "result"; data: SearchResult | string }[] = [
        { type: "header" as const, data: catName },
      ];
      if (notes.length > 0)
        items.push({ type: "header" as const, data: "Notes" });
      notes.forEach((n) => items.push({ type: "result" as const, data: n }));
      if (todos.length > 0)
        items.push({ type: "header" as const, data: "Todos" });
      todos.forEach((t) => items.push({ type: "result" as const, data: t }));
      return items;
    }
  );

  return (
    <ThemedScreen>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold", marginBottom: 16 }}>
          Search
        </Text>
        <TextInput
          placeholder="Search notes and todos..."
          value={query}
          onChangeText={handleSearch}
          style={{
            padding: 12,
            backgroundColor: colors.card,
            borderRadius: 10,
            fontSize: 16,
          }}
          autoFocus
        />
      </View>

      {sections.length === 0 && query.trim() ? (
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            No results for '{query}'
          </Text>
        </View>
      ) : null}

      {sections.length === 0 && !query.trim() ? (
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            Type to search
          </Text>
        </View>
      ) : null}

      <FlatList
        data={sections}
        keyExtractor={(item, i) => String(i)}
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  color: colors.primary,
                }}
              >
                {item.data as string}
              </Text>
            );
          }
          const r = item.data as SearchResult;
          return (
            <Pressable
              onPress={() => {
                if (r.type === "note")
                  router.push(`/note/${r.id}`);
                else
                  router.push(`/note/${(r as any).note_id}`);
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 16,
                paddingVertical: 12,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: r.category_color,
                  marginRight: 8,
                }}
              />
              <Text style={{ fontSize: 16 }}>{r.title}</Text>
            </Pressable>
          );
        }}
      />
    </ThemedScreen>
  );
}
