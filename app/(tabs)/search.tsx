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

  const grouped = results.reduce<{
    notes: Record<string, SearchResult[]>;
    todos: Record<string, SearchResult[]>;
  }>(
    (acc, r) => {
      const catKey = r.category_name;
      if (r.type === "note") {
        if (!acc.notes[catKey]) acc.notes[catKey] = [];
        acc.notes[catKey].push(r);
      } else {
        if (!acc.todos[catKey]) acc.todos[catKey] = [];
        acc.todos[catKey].push(r);
      }
      return acc;
    },
    { notes: {}, todos: {} }
  );

  const sections: { type: "header" | "result"; data: SearchResult | string }[] = [];

  if (Object.keys(grouped.notes).length > 0) {
    sections.push({ type: "header", data: "Notes" });
    Object.entries(grouped.notes).forEach(([catName, items]) => {
      sections.push({ type: "header", data: catName });
      items.forEach((n) => sections.push({ type: "result", data: n }));
    });
  }
  if (Object.keys(grouped.todos).length > 0) {
    sections.push({ type: "header", data: "Todos" });
    Object.entries(grouped.todos).forEach(([catName, items]) => {
      sections.push({ type: "header", data: catName });
      items.forEach((t) => sections.push({ type: "result", data: t }));
    });
  }

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
            color: colors.text,
          }}
          placeholderTextColor={colors.textSecondary}
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
