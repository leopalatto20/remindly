import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { getAllCategories, deleteCategory } from "../../lib/db/categories";
import type { Category } from "../../lib/db/categories";
import { getUrgentTodos } from "../../lib/db/todos";
import type { Todo } from "../../lib/db/todos";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { useThemeColors } from "../../lib/theme/colors";

export default function HomeScreen() {
  const colors = useThemeColors();
  const [categories, setCategories] = useState<Category[]>([]);
  const [urgentTodos, setUrgentTodos] = useState<Todo[]>([]);
const [showAllUrgent, setShowAllUrgent] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const cats = await getAllCategories();
    setCategories(cats);
    const todos = await getUrgentTodos();
    setUrgentTodos(todos);
  }

  function handleDeleteCategory(cat: Category) {
    Alert.alert(
      "Delete Category",
      `Delete "${cat.name}" and all its notes?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteCategory(cat.id);
            loadData();
          },
        },
      ]
    );
  }

  return (
    <ThemedScreen>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          paddingTop: 60,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>Remindly</Text>
        <Pressable onPress={() => router.push("/settings")}>
          <Text style={{ fontSize: 24, color: colors.primary }}>⚙</Text>
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/category/${item.id}`)}
            onLongPress={() => handleDeleteCategory(item)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 16,
              backgroundColor: colors.card,
              borderRadius: 12,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: item.color + "20",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Text style={{ fontSize: 20, color: item.color }}>
                {item.icon}
              </Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.name}</Text>
          </Pressable>
        )}
        ListHeaderComponent={
          urgentTodos.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  marginBottom: 8,
                  color: colors.warning,
                }}
              >
                Urgent Todos
              </Text>
              {urgentTodos.slice(0, 5).map((todo) => (
                <Pressable
                  key={todo.id}
                  onPress={() => {
                    const { toggleTodoCompleted } = require("../../lib/db/todos");
                    toggleTodoCompleted(todo.id).then(() => loadData());
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: colors.warning + "20",
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: (todo as any).category_color || "#FF9500",
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 14, flex: 1 }}>{todo.title}</Text>
                </Pressable>
              ))}
              {urgentTodos.length > 5 && (
                <Pressable
                  onPress={() => setShowAllUrgent(!showAllUrgent)}
                  style={{ padding: 8, alignItems: "center" }}
                >
                  <Text style={{ color: colors.primary, fontSize: 14 }}>
                    {showAllUrgent ? "Show less" : `Show all (${urgentTodos.length})`}
                  </Text>
                </Pressable>
              )}
              {showAllUrgent && urgentTodos.slice(5).map((todo) => (
                <Pressable
                  key={todo.id}
                  onPress={() => {
                    const { toggleTodoCompleted } = require("../../lib/db/todos");
                    toggleTodoCompleted(todo.id).then(() => loadData());
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: colors.warning + "20",
                    borderRadius: 8,
                    marginBottom: 4,
                  }}
                >
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: (todo as any).category_color || "#FF9500",
                      marginRight: 8,
                    }}
                  />
                  <Text style={{ fontSize: 14, flex: 1 }}>{todo.title}</Text>
                </Pressable>
              ))}
            </View>
          ) : null
        }
        ListFooterComponent={
          <Pressable
            onPress={() => router.push("/category/new")}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
              borderWidth: 1,
              borderColor: colors.primary,
              borderStyle: "dashed",
              borderRadius: 12,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 20, color: colors.primary }}>+</Text>
            <Text style={{ color: colors.primary, marginLeft: 8, fontWeight: "600" }}>
              New Category
            </Text>
          </Pressable>
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingTop: 40 }}>
            <Text style={{ fontSize: 16, color: colors.textSecondary }}>
              No categories yet. Create one!
            </Text>
          </View>
        }
      />
    </ThemedScreen>
  );
}
