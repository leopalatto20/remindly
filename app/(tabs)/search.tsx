import { useEffect, useState } from "react";
import { FlatList, ScrollView, Text, TextInput, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Search as SearchIcon, X } from "lucide-react-native";
import { useSearch } from "../../lib/hooks/useSearch";
import { useCategories } from "../../lib/hooks/useCategories";
import { useUrgentTodos } from "../../lib/hooks/useUrgentTodos";
import { useRecentNotes } from "../../lib/hooks/useRecentNotes";
import {
  getRecentSearches,
  saveRecentSearch,
} from "../../lib/utils/recentSearches";
import {
  formatRelativeDate,
  formatRelativeTime,
} from "../../lib/utils/relativeDate";
import type { SearchResult } from "../../lib/db/search";
import type { UrgentTodo } from "../../lib/hooks/useUrgentTodos";
import type { RecentNote } from "../../lib/db/notes";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { useThemeColors } from "../../lib/theme/colors";

type TypeFilter = "all" | "note" | "todo";

type EmptySection =
  | { type: "section-header"; key: string; title: string }
  | { type: "todo"; key: string; todo: UrgentTodo }
  | { type: "note"; key: string; note: RecentNote }
  | { type: "recent-search"; key: string; text: string };

export default function SearchScreen() {
  const colors = useThemeColors();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(
    undefined,
  );

  const { data: results = [] } = useSearch(query, categoryFilter);
  const { data: categories = [] } = useCategories();
  const { data: urgentTodos = [] } = useUrgentTodos();
  const { data: recentNotes = [] } = useRecentNotes();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    getRecentSearches().then(setRecentSearches);
  }, []);

  // Reset filters when search input is cleared
  useEffect(() => {
    if (!query.trim()) {
      setTypeFilter("all");
      setCategoryFilter(undefined);
    }
  }, [query]);

  function persistAndRefreshSearches(text: string) {
    saveRecentSearch(text).then(() =>
      getRecentSearches().then(setRecentSearches),
    );
  }

  function handleSubmit() {
    const trimmed = query.trim();
    if (!trimmed) return;
    persistAndRefreshSearches(trimmed);
  }

  function handleRecentSearchTap(text: string) {
    setQuery(text);
    persistAndRefreshSearches(text);
  }

  function todoAccentColor(todo: UrgentTodo): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const due = new Date(todo.due_date);
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diffMs = dueDay.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return colors.danger;
    if (diffDays === 0) return colors.warning;
    return colors.textSecondary;
  }

  // Client-side type filter
  const filteredResults =
    typeFilter === "all"
      ? results
      : results.filter((r) => r.type === typeFilter);

  // Build empty-state sections
  const emptySections: EmptySection[] = [];

  if (urgentTodos.length > 0) {
    emptySections.push({
      type: "section-header",
      key: "header-todos",
      title: "Upcoming & Overdue",
    });
    for (const todo of urgentTodos.slice(0, 5)) {
      emptySections.push({ type: "todo", key: `todo-${todo.id}`, todo });
    }
  }

  if (recentNotes.length > 0) {
    emptySections.push({
      type: "section-header",
      key: "header-notes",
      title: "Recent Notes",
    });
    for (const note of recentNotes) {
      emptySections.push({ type: "note", key: `note-${note.id}`, note });
    }
  }

  if (recentSearches.length > 0) {
    emptySections.push({
      type: "section-header",
      key: "header-searches",
      title: "Recent Searches",
    });
    for (const text of recentSearches) {
      emptySections.push({
        type: "recent-search",
        key: `search-${text}`,
        text,
      });
    }
  }

  // Build search-result sections from filtered results
  const resultSections: {
    type: "header" | "result";
    data: SearchResult | string;
  }[] = [];
  const grouped = filteredResults.reduce<{
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
    { notes: {}, todos: {} },
  );

  if (Object.keys(grouped.notes).length > 0) {
    resultSections.push({ type: "header", data: "Notes" });
    Object.entries(grouped.notes).forEach(([catName, items]) => {
      resultSections.push({ type: "header", data: catName });
      items.forEach((n) => resultSections.push({ type: "result", data: n }));
    });
  }
  if (Object.keys(grouped.todos).length > 0) {
    resultSections.push({ type: "header", data: "Todos" });
    Object.entries(grouped.todos).forEach(([catName, items]) => {
      resultSections.push({ type: "header", data: catName });
      items.forEach((t) => resultSections.push({ type: "result", data: t }));
    });
  }

  const isSearching = query.trim().length > 0;
  const showFilterBar = isSearching;

  // Filter bar chip component
  function FilterChip({
    label,
    active,
    onPress,
    colorDot,
  }: {
    label: string;
    active: boolean;
    onPress: () => void;
    colorDot?: string;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderRadius: 16,
          backgroundColor: active ? colors.primary : "transparent",
          borderWidth: active ? 0 : 1,
          borderColor: colors.border,
          marginRight: 8,
        }}
      >
        {colorDot !== undefined && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: active ? "#FFFFFF" : colorDot,
              marginRight: 6,
            }}
          />
        )}
        <Text
          style={{
            fontSize: 14,
            fontWeight: active ? "600" : "400",
            color: active ? "#FFFFFF" : colors.textSecondary,
          }}
        >
          {label}
        </Text>
      </Pressable>
    );
  }

  function renderEmptyItem({ item }: { item: EmptySection }) {
    switch (item.type) {
      case "section-header":
        return (
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
              color: colors.primary,
            }}
          >
            {item.title}
          </Text>
        );
      case "todo":
        return (
          <Pressable
            onPress={() => router.push(`/note/${item.todo.note_id}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
              marginHorizontal: 16,
              backgroundColor: todoAccentColor(item.todo) + "12",
              borderRadius: 8,
              marginBottom: 4,
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: todoAccentColor(item.todo),
                marginRight: 10,
              }}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{ fontSize: 15, color: colors.text }}
                numberOfLines={1}
              >
                {item.todo.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {item.todo.note_title}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                color: todoAccentColor(item.todo),
                marginLeft: 8,
              }}
            >
              {formatRelativeDate(item.todo.due_date)}
            </Text>
          </Pressable>
        );
      case "note":
        return (
          <Pressable
            onPress={() => router.push(`/note/${item.note.id}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: item.note.category_color,
                marginRight: 10,
              }}
            />
            <Text
              style={{ flex: 1, fontSize: 15, color: colors.text }}
              numberOfLines={1}
            >
              {item.note.title}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginLeft: 8,
              }}
            >
              {formatRelativeTime(item.note.updated_at)}
            </Text>
          </Pressable>
        );
      case "recent-search":
        return (
          <Pressable
            onPress={() => handleRecentSearchTap(item.text)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <View style={{ marginRight: 10 }}>
              <SearchIcon size={14} color={colors.textSecondary} />
            </View>
            <Text style={{ fontSize: 15, color: colors.text }}>
              {item.text}
            </Text>
          </Pressable>
        );
    }
  }

  function renderResultItem({
    item,
  }: {
    item: { type: "header" | "result"; data: SearchResult | string };
  }) {
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
          if (r.type === "note") router.push(`/note/${r.id}`);
          else router.push(`/note/${r.note_id}`);
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
        <Text style={{ fontSize: 16, color: colors.text }}>{r.title}</Text>
      </Pressable>
    );
  }

  return (
    <ThemedScreen>
      <View style={{ padding: 16, paddingTop: 60 }}>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            marginBottom: 16,
            color: colors.text,
          }}
        >
          Search
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 10,
            paddingHorizontal: 12,
          }}
        >
          <SearchIcon size={18} color={colors.textSecondary} />
          <TextInput
            placeholder="Search notes and todos..."
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            style={{
              flex: 1,
              padding: 12,
              fontSize: 16,
              color: colors.text,
            }}
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <X size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      {showFilterBar && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingBottom: 12,
            alignItems: "center",
          }}
        >
          {/* Type toggles */}
          <FilterChip
            label="All"
            active={typeFilter === "all"}
            onPress={() => setTypeFilter("all")}
          />
          <FilterChip
            label="Notes"
            active={typeFilter === "note"}
            onPress={() => setTypeFilter("note")}
          />
          <FilterChip
            label="Todos"
            active={typeFilter === "todo"}
            onPress={() => setTypeFilter("todo")}
          />

          {/* Separator */}
          {categories.length > 0 && (
            <View
              style={{
                width: 1,
                height: 20,
                backgroundColor: colors.border,
                marginRight: 8,
              }}
            />
          )}

          {/* Category chips */}
          {categories.map((cat) => (
            <FilterChip
              key={cat.id}
              label={cat.name}
              active={categoryFilter === cat.id}
              onPress={() =>
                setCategoryFilter(
                  categoryFilter === cat.id ? undefined : cat.id,
                )
              }
              colorDot={cat.color}
            />
          ))}
        </ScrollView>
      )}

      {isSearching && resultSections.length === 0 && (
        <View style={{ alignItems: "center", paddingTop: 40 }}>
          <Text style={{ fontSize: 16, color: colors.textSecondary }}>
            No results for &lsquo;{query}&rsquo;
          </Text>
        </View>
      )}

      {isSearching && resultSections.length > 0 && (
        <FlatList
          data={resultSections}
          keyExtractor={(item, i) => String(i)}
          renderItem={renderResultItem}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {!isSearching && (
        <FlatList
          data={emptySections}
          keyExtractor={(item) => item.key}
          renderItem={renderEmptyItem}
          contentContainerStyle={{ paddingBottom: 32 }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </ThemedScreen>
  );
}
