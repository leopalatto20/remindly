import { useCallback, useState } from "react";
import { Text, View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { useFocusEffect, router } from "expo-router";
import type { Todo } from "../../lib/db/todos";
import { toggleTodoCompleted } from "../../lib/db/todos";
import { useThemeColors } from "../../lib/theme/colors";
import { formatRelativeDate } from "../../lib/utils/relativeDate";

interface UrgentTodo extends Todo {
  category_color: string;
  category_icon: string;
  note_title: string;
}

interface Props {
  todos: UrgentTodo[];
  onLoadData: () => void;
}

function Checkbox({ checked, color }: { checked: boolean; color: string }) {
  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: checked ? color : "#8E8E93",
        backgroundColor: checked ? color : "transparent",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {checked && (
        <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "bold" }}>✓</Text>
      )}
    </View>
  );
}

export function UrgentTodosList({ todos, onLoadData }: Props) {
  const colors = useThemeColors();
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  // Reset completed IDs on page focus (data reload wipes completed todos from the list)
  useFocusEffect(
    useCallback(() => {
      setCompletedIds(new Set());
      setShowAll(false);
    }, []),
  );

  async function handleToggleComplete(id: number) {
    await toggleTodoCompleted(id);
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  const visible = showAll ? todos : todos.slice(0, 5);

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
      {visible.map((todo) => {
        const isCompleted = completedIds.has(todo.id);
        return (
          <View
            key={todo.id}
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
              onPress={() => handleToggleComplete(todo.id)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 4, marginRight: 6 }}
            >
              <Checkbox checked={isCompleted} color={todo.category_color} />
            </Pressable>
            <Pressable
              onPress={() => router.push(`/note/${todo.note_id}`)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Text
                style={{
                  fontSize: 14,
                  flex: 1,
                  textDecorationLine: isCompleted ? "line-through" : "none",
                }}
                numberOfLines={1}
              >
                {todo.title}
              </Text>
              <View style={{ alignItems: "flex-end", marginLeft: 8 }}>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    marginBottom: 2,
                  }}
                  numberOfLines={1}
                >
                  {formatRelativeDate(todo.due_date)}
                </Text>
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                  }}
                  numberOfLines={1}
                >
                  {todo.note_title}
                </Text>
              </View>
            </Pressable>
          </View>
        );
      })}
      {todos.length > 5 && (
        <Pressable
          onPress={() => setShowAll(!showAll)}
          style={{ padding: 8, alignItems: "center" }}
        >
          <Text style={{ color: colors.primary, fontSize: 14 }}>
            {showAll ? "Show less" : `Show all (${todos.length})`}
          </Text>
        </Pressable>
      )}
    </View>
  );
}