import { Pressable, Text } from "react-native";
import { CheckSquare } from "lucide-react-native";
import { useThemeColors } from "../../lib/theme/colors";
import type { Todo } from "../../lib/db/todos";

interface TodoHeaderBadgeProps {
  todos: Todo[];
  onPress: () => void;
}

export function TodoHeaderBadge({ todos, onPress }: TodoHeaderBadgeProps) {
  const colors = useThemeColors();
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: todos.length > 0 ? colors.card : "transparent",
        paddingHorizontal: todos.length > 0 ? 8 : 0,
        paddingVertical: todos.length > 0 ? 4 : 0,
        borderRadius: 12,
        opacity: todos.length > 0 ? 1 : 0.4,
      }}
    >
      <CheckSquare
        size={todos.length > 0 ? 14 : 20}
        color={todos.length > 0 ? colors.primary : colors.textSecondary}
      />
      {todos.length > 0 && (
        <Text style={{ fontSize: 12, fontWeight: "600", color: colors.text }}>
          {completedCount}/{todos.length}
        </Text>
      )}
    </Pressable>
  );
}
