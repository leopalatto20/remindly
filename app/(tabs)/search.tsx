import { useEffect, useId, useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Search as SearchIcon, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSearch } from "../../lib/hooks/useSearch";
import { useCategories } from "../../lib/hooks/useCategories";
import { useUrgentTodos } from "../../lib/hooks/useUrgentTodos";
import { useRecentNotes } from "../../lib/hooks/useRecentNotes";
import { getRecentSearches, saveRecentSearch } from "../../lib/utils/recentSearches";
import { formatRelativeDate, formatRelativeTime } from "../../lib/utils/relativeDate";
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
  const colors = useThemeColors();
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

/** Render FTS snippet with <mark> highlights split into styled Text elements. */
function HighlightedSnippet({ snippet }: { snippet: string }) {
  const colors = useThemeColors();
  const id = useId();
  const parts = snippet.split(/(<mark>.*?<\/mark>)/g);

  // Build stable keys without using the array index
  const elements: React.ReactNode[] = [];
  let highlightCount = 0;
  let textCount = 0;
  for (const part of parts) {
    if (part.startsWith("<mark>") && part.endsWith("</mark>")) {
      const highlighted = part.slice(6, -7);
      elements.push(
        <Text
          key={`${id}-hl-${highlightCount++}`}
          style={{ backgroundColor: colors.primary + "15" }}
        >
          {highlighted}
        </Text>,
      );
    } else {
      elements.push(<Text key={`${id}-tx-${textCount++}`}>{part}</Text>);
    }
  }

  return (
    <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }} numberOfLines={2}>
      {elements}
    </Text>
  );
}

interface SearchBarProps {
  query: string;
  onChangeQuery: (text: string) => void;
  onSubmit: () => void;
  onClear: () => void;
}

function SearchBar({ query, onChangeQuery, onSubmit, onClear }: SearchBarProps) {
  const colors = useThemeColors();
  return (
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
        onChangeText={onChangeQuery}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        style={{
          flex: 1,
          paddingHorizontal: 12,
          paddingVertical: 10,
          fontSize: 16,
          color: colors.text,
        }}
        placeholderTextColor={colors.textSecondary}
        autoFocus
      />
      {query.length > 0 && (
        <Pressable onPress={onClear}>
          <X size={18} color={colors.textSecondary} />
        </Pressable>
      )}
    </View>
  );
}

interface FilterBarProps {
  typeFilter: TypeFilter;
  categoryFilter: number | undefined;
  categories: Array<{ id: number; name: string; color: string }>;
  onTypeFilterChange: (filter: TypeFilter) => void;
  onCategoryFilterChange: (id: number | undefined) => void;
}

type FilterItem =
  | { kind: "type"; label: string; filter: TypeFilter }
  | { kind: "separator" }
  | { kind: "category"; id: number; name: string; color: string };

function FilterBar({
  typeFilter,
  categoryFilter,
  categories,
  onTypeFilterChange,
  onCategoryFilterChange,
}: FilterBarProps) {
  const filterItems: FilterItem[] = [
    { kind: "type", label: "All", filter: "all" },
    { kind: "type", label: "Notes", filter: "note" },
    { kind: "type", label: "Todos", filter: "todo" },
  ];
  if (categories.length > 0) {
    filterItems.push({ kind: "separator" });
    for (const cat of categories) {
      filterItems.push({ kind: "category", id: cat.id, name: cat.name, color: cat.color });
    }
  }

  function renderFilterItem({ item }: { item: FilterItem }) {
    if (item.kind === "separator") {
      return (
        <View
          style={{ width: 1, height: 20, backgroundColor: "rgba(0,0,0,0.1)", marginRight: 8 }}
        />
      );
    }
    if (item.kind === "type") {
      return (
        <FilterChip
          label={item.label}
          active={typeFilter === item.filter}
          onPress={() => onTypeFilterChange(item.filter)}
        />
      );
    }
    return (
      <FilterChip
        label={item.name}
        active={categoryFilter === item.id}
        onPress={() => onCategoryFilterChange(categoryFilter === item.id ? undefined : item.id)}
        colorDot={item.color}
      />
    );
  }

  return (
    <FlatList
      horizontal
      data={filterItems}
      keyExtractor={(item, idx) =>
        item.kind === "type"
          ? `type-${item.filter}`
          : item.kind === "category"
            ? `cat-${item.id}`
            : `sep-${idx}`
      }
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ alignItems: "center" }}
      renderItem={renderFilterItem}
    />
  );
}

interface EmptyStateItemProps {
  item: EmptySection;
  onRecentSearchTap: (text: string) => void;
}

function EmptyStateItem({ item, onRecentSearchTap }: EmptyStateItemProps) {
  const colors = useThemeColors();

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
    case "todo": {
      const accent = todoAccentColor(item.todo);
      return (
        <Pressable
          onPress={() => router.push(`/note/${item.todo.note_id}`)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 10,
            marginHorizontal: 16,
            backgroundColor: accent + "12",
            borderRadius: 8,
            marginBottom: 4,
          }}
        >
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: accent,
              marginRight: 10,
            }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, color: colors.text }} numberOfLines={1}>
              {item.todo.title}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              {item.todo.note_title}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: accent, marginLeft: 8 }}>
            {formatRelativeDate(item.todo.due_date)}
          </Text>
        </Pressable>
      );
    }
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
          <Text style={{ flex: 1, fontSize: 15, color: colors.text }} numberOfLines={1}>
            {item.note.title}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 8 }}>
            {formatRelativeTime(item.note.updated_at)}
          </Text>
        </Pressable>
      );
    case "recent-search":
      return (
        <Pressable
          onPress={() => onRecentSearchTap(item.text)}
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
          <Text style={{ fontSize: 15, color: colors.text }}>{item.text}</Text>
        </Pressable>
      );
  }
}

interface SearchResultItemProps {
  item: { type: "header" | "result"; data: SearchResult | string };
}

function SearchResultItem({ item }: SearchResultItemProps) {
  const colors = useThemeColors();

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
      style={{ paddingHorizontal: 16, paddingVertical: 12 }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: colors.text, flex: 1 }}>{r.title}</Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 8 }}>
          {r.type === "todo" ? formatRelativeDate(r.due_date) : formatRelativeTime(r.updated_at)}
        </Text>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: r.category_color,
            marginRight: 6,
          }}
        />
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>{r.category_name}</Text>
      </View>
      {r.type === "note" && r.snippet && <HighlightedSnippet snippet={r.snippet} />}
    </Pressable>
  );
}
function renderSearchResultItem({
  item,
}: {
  item: { type: "header" | "result"; data: SearchResult | string };
}) {
  return <SearchResultItem item={item} />;
}

export default function SearchScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>(undefined);

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
    saveRecentSearch(text).then(() => getRecentSearches().then(setRecentSearches));
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

  // Client-side type filter
  const filteredResults =
    typeFilter === "all" ? results : results.filter((r) => r.type === typeFilter);

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

  function renderEmptyStateItem({ item }: { item: EmptySection }) {
    return <EmptyStateItem item={item} onRecentSearchTap={handleRecentSearchTap} />;
  }

  return (
    <ThemedScreen>
      <View style={{ paddingHorizontal: 16, paddingTop: insets.top, gap: 8 }}>
        <SearchBar
          query={query}
          onChangeQuery={setQuery}
          onSubmit={handleSubmit}
          onClear={() => setQuery("")}
        />

        {showFilterBar && (
          <FilterBar
            typeFilter={typeFilter}
            categoryFilter={categoryFilter}
            categories={categories}
            onTypeFilterChange={setTypeFilter}
            onCategoryFilterChange={setCategoryFilter}
          />
        )}

        {isSearching && resultSections.length === 0 && (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>
              No results for &lsquo;{query}&rsquo;
            </Text>
          </View>
        )}

        {isSearching && resultSections.length > 0 && (
          <FlatList
            data={resultSections}
            keyExtractor={(item, i) => `${item.type}-${item.data}-${i}`}
            renderItem={renderSearchResultItem}
            ListHeaderComponent={
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  paddingHorizontal: 16,
                  paddingBottom: 4,
                }}
              >
                {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
              </Text>
            }
            keyboardShouldPersistTaps="handled"
          />
        )}

        {!isSearching && (
          <FlatList
            data={emptySections}
            keyExtractor={(item) => item.key}
            renderItem={renderEmptyStateItem}
            contentContainerStyle={{ paddingBottom: 32 }}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </View>
    </ThemedScreen>
  );
}
