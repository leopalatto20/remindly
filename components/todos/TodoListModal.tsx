import { Modal, Pressable, ScrollView, Text, View } from "react-native";
import { X, Plus } from "lucide-react-native";
import { useThemeColors } from "../../lib/theme/colors";
import type { Todo } from "../../lib/db/todos";

interface TodoListModalProps {
  visible: boolean;
  todos: Todo[];
  onClose: () => void;
  onToggleTodo: (id: number) => void;
  onTapTodo: (todo: Todo) => void;
  onAddTodo: () => void;
}

export function TodoListModal({
  visible,
  todos,
  onClose,
  onToggleTodo,
  onTapTodo,
  onAddTodo,
}: TodoListModalProps) {
  const colors = useThemeColors();
  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "70%",
            paddingBottom: 40,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View>
              <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>Todos</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                {completedCount} of {todos.length} completed
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 16, alignItems: "center" }}>
              <Pressable onPress={onAddTodo} hitSlop={8}>
                <Plus size={24} color={colors.primary} />
              </Pressable>
              <Pressable onPress={onClose} hitSlop={8}>
                <X size={24} color={colors.textSecondary} />
              </Pressable>
            </View>
          </View>

          <ScrollView style={{ paddingHorizontal: 20, paddingTop: 12 }}>
            {todos.map((todo) => (
              <Pressable
                key={todo.id}
                onPress={() => onTapTodo(todo)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  opacity: todo.completed ? 0.5 : 1,
                }}
              >
                <Pressable
                  onPress={() => onToggleTodo(todo.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: todo.completed ? colors.success : colors.border,
                    backgroundColor: todo.completed ? colors.success : "transparent",
                    marginRight: 14,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      textDecorationLine: todo.completed ? "line-through" : "none",
                      color: colors.text,
                    }}
                  >
                    {todo.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 3 }}>
                    {new Date(todo.due_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </Pressable>
            ))}
            {todos.length === 0 && (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Text style={{ color: colors.textSecondary, fontSize: 15 }}>No todos yet</Text>
                <Pressable onPress={onAddTodo} style={{ marginTop: 12 }}>
                  <Text style={{ color: colors.primary, fontWeight: "600", fontSize: 15 }}>
                    + Add a todo
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
