import { useState } from "react";
import { Alert, FlatList, Modal, Text, TextInput, View } from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Settings } from "lucide-react-native";
import { UrgentTodosList } from "../../components/todos/UrgentTodosList";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { SwipeableDeleteAction } from "../../components/ui/SwipeableDeleteAction";
import { useThemeColors } from "../../lib/theme/colors";
import { IconPicker } from "../../components/categories/IconPicker";
import { ColorPicker } from "../../components/categories/ColorPicker";
import { DynamicIcon } from "../../lib/icons/DynamicIcon";
import { useCategories, useCreateCategory, useDeleteCategory } from "../../lib/hooks/useCategories";
import { useUrgentTodos } from "../../lib/hooks/useUrgentTodos";
import { useToggleTodo } from "../../lib/hooks/useTodos";

export default function HomeScreen() {
  const colors = useThemeColors();
  const { data: categories = [] } = useCategories();
  const { data: urgentTodos = [] } = useUrgentTodos();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const toggleTodo = useToggleTodo();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("Book");
  const [newCatColor, setNewCatColor] = useState("#007AFF");

  function handleDeleteCategory(cat: { id: number; name: string }) {
    Alert.alert("Delete Category", `Delete "${cat.name}" and all its notes?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteCategory.mutate(cat.id),
      },
    ]);
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
        <Text style={{ fontSize: 28, fontWeight: "bold", color: colors.text }}>Remindly</Text>
        <Pressable onPress={() => router.push("/settings")}>
          <Settings size={24} color={colors.primary} />
        </Pressable>
      </View>

      <FlatList
        data={categories}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <SwipeableDeleteAction onDelete={() => handleDeleteCategory(item)}>
            <Pressable
              onPress={() => router.push(`/category/${item.id}`)}
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
                <DynamicIcon name={item.icon} size={20} color={item.color} />
              </View>
              <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{item.name}</Text>
            </Pressable>
          </SwipeableDeleteAction>
        )}
        ListHeaderComponent={
          urgentTodos.length > 0 ? (
            <UrgentTodosList
              todos={urgentTodos}
              onToggleTodo={(id) => toggleTodo.mutate(id)}
            />
          ) : null
        }
        ListFooterComponent={
          <Pressable
            onPress={() => setShowCreateModal(true)}
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
      <Modal visible={showCreateModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              margin: 20,
              backgroundColor: colors.background,
              borderRadius: 16,
              padding: 20,
              maxHeight: "80%",
            }}
          >
            <ScrollView>
              <Text
                style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16, color: colors.text }}
              >
                New Category
              </Text>
              <TextInput
                placeholder="Category name"
                value={newCatName}
                onChangeText={setNewCatName}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 10,
                  fontSize: 16,
                  marginBottom: 16,
                  color: colors.text,
                }}
                placeholderTextColor={colors.textSecondary}
              />
              <IconPicker selected={newCatIcon} onSelect={setNewCatIcon} />
              <View style={{ height: 16 }} />
              <ColorPicker selected={newCatColor} onSelect={setNewCatColor} />
              <View style={{ height: 16 }} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => {
                    setShowCreateModal(false);
                    setNewCatName("");
                  }}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: colors.text }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (!newCatName.trim()) return;
                    createCategory.mutate(
                      { name: newCatName.trim(), icon: newCatIcon, color: newCatColor },
                      {
                        onSuccess: () => {
                          setShowCreateModal(false);
                          setNewCatName("");
                        },
                      },
                    );
                  }}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: colors.primary,
                    flex: 1,
                    alignItems: "center",
                  }}
                >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Create</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedScreen>
  );
}
