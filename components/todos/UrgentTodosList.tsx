import { useState } from "react";
import { Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { toggleTodoCompleted } from "../../lib/db/todos";
import type { Todo } from "../../lib/db/todos";
import { useThemeColors } from "../../lib/theme/colors";
import { formatRelativeDate } from "../../lib/utils/relativeDate";

type UrgentTodo = Todo & {
  category_color: string;
  category_icon: string;
  note_title: string;
};

interface UrgentTodosListProps {
  todos: UrgentTodo[];
}

export function UrgentTodosList({ todos }: UrgentTodosListProps) {
  const colors = useThemeColors();
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const visibleTodos = todos.filter((t) => !completedIds.has(t.id));
  const displayedTodos = showAll ? visibleTodos : visibleTodos.slice(0, 5);
  const hasMore = visibleTodos.length > 5;

  async function handleToggle(id: number) {
    await toggleTodoCompleted(id);
    setCompletedIds((prev) => new Set(prev).add(id));
  }

  if (visibleTodos.length === 0) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 8,
          color: colors.primary,
        }}
      >
        Urgent Todos
      </Text>

      {displayedTodos.map((todo) => {
        const isCompleted = completedIds.has(todo.id);
        return (
          <Pressable
            key={todo.id}
            onPress={() => router.push(`/note/${todo.note_id}`)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              backgroundColor: todo.category_color + "15",
              borderRadius: 8,
              marginBottom: 4,
              opacity: isCompleted ? 0.5 : 1,
            }}
          >
            <Pressable
              onPress={() => handleToggle(todo.id)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: isCompleted ? colors.success : colors.textSecondary,
                backgroundColor: isCompleted ? colors.success : "transparent",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 10,
              }}
            >
              {isCompleted && <Check size={14} color="#FFFFFF" />}
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.text,
                  textDecorationLine: isCompleted ? "line-through" : "none",
                }}
              >
                {todo.title}
              </Text>
              <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
                {todo.note_title}
              </Text>
            </View>

            <Text style={{ fontSize: 12, color: colors.textSecondary, marginLeft: 8 }}>
              {formatRelativeDate(todo.due_date)}
            </Text>
          </Pressable>
        );
      })}

      {hasMore && (
        <Pressable
          onPress={() => setShowAll(!showAll)}
          style={{ padding: 8, alignItems: "center" }}
        >
          <Text style={{ color: colors.primary, fontSize: 14 }}>
            {showAll ? "Show less" : `Show all (${visibleTodos.length})`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
