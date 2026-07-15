import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Trash2, ArrowLeft } from "lucide-react-native";

import {
  getCategory,
  updateCategory,
  deleteCategory,
  type Category,
} from "../../lib/db/categories";
import { getNotesByCategory, createNote, deleteNote, type Note } from "../../lib/db/notes";
import { IconPicker } from "../../components/categories/IconPicker";
import { ColorPicker } from "../../components/categories/ColorPicker";
import { DynamicIcon } from "../../lib/icons/DynamicIcon";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { SwipeableDeleteAction } from "../../components/ui/SwipeableDeleteAction";
import { useThemeColors } from "../../lib/theme/colors";

export default function CategoryDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("Book");
  const [editColor, setEditColor] = useState("#007AFF");

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadData(Number(id));
      }
    }, [id])
  );

  async function loadData(catId: number) {
    const cat = await getCategory(catId);
    setCategory(cat);
    if (cat) {
      const ns = await getNotesByCategory(cat.id);
      setNotes(ns);
    }
  }

  async function handleCreateNote() {
    if (!newTitle.trim() || !category) return;
    const noteId = await createNote(newTitle.trim(), category.id);
    setNewTitle("");
    setShowCreate(false);
    router.push(`/note/${noteId}`);
  }

  function handleDeleteNote(item: Note) {
    Alert.alert("Delete Note", `Delete "${item.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(item.id);
          if (category) loadData(category.id);
        },
      },
    ]);
  }

  if (!category) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemedScreen>
      <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        <Pressable onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.primary} />
        </Pressable>
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          backgroundColor: category.color + "15",
        }}
      >
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: category.color + "20",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <DynamicIcon name={category.icon} size={24} color={category.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {category.name}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Alert.alert(
              "Delete Category",
              `Delete "${category.name}" and all its notes?`,
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                    await deleteCategory(category.id);
                    router.back();
                  },
                },
              ]
            );
          }}
          style={{ marginRight: 12 }}
        >
          <Trash2 size={20} color={colors.danger} />
        </Pressable>
        <Pressable
          onPress={() => {
            setEditName(category.name);
            setEditIcon(category.icon);
            setEditColor(category.color);
            setShowEdit(true);
          }}
        >
          <Text style={{ color: colors.primary, fontSize: 16 }}>Edit</Text>
        </Pressable>
      </View>

      {showCreate ? null : (
        <FlatList
          data={notes}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <SwipeableDeleteAction onDelete={() => handleDeleteNote(item)}>
              <Pressable
                onPress={() => router.push(`/note/${item.id}`)}
                style={{
                  padding: 16,
                  backgroundColor: colors.card,
                  borderRadius: 12,
                  marginBottom: 8,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "600" }}>
                  {item.title}
                </Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                  Created: {new Date(item.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
              </Pressable>
            </SwipeableDeleteAction>
          )}
          ListEmptyComponent={
            <Text style={{ color: colors.textSecondary, textAlign: "center", paddingTop: 20 }}>
              No notes yet
            </Text>
          }
        />
      )}

      {showCreate && (
        <View style={{ padding: 16 }}>
          <TextInput
            placeholder="Note title"
            value={newTitle}
            onChangeText={setNewTitle}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              fontSize: 16,
              marginBottom: 12,
              color: colors.text,
            }}
            placeholderTextColor={colors.textSecondary}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => {
                setShowCreate(false);
                setNewTitle("");
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
              <Text>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleCreateNote}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: colors.primary,
                flex: 1,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Create</Text>
            </Pressable>
          </View>
        </View>
      )}

      {!showCreate && (
        <Pressable
          onPress={() => setShowCreate(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            margin: 16,
            borderWidth: 1,
            borderColor: colors.primary,
            borderStyle: "dashed",
            borderRadius: 12,
          }}
        >
          <Text style={{ fontSize: 20, color: colors.primary }}>+</Text>
          <Text style={{ color: colors.primary, marginLeft: 8, fontWeight: "600" }}>
            New Note
          </Text>
        </Pressable>
      )}

      <Modal visible={showEdit} transparent animationType="slide">
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
              <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16 }}>
                Edit Category
              </Text>
              <TextInput
                placeholder="Category name"
                value={editName}
                onChangeText={setEditName}
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
              <IconPicker selected={editIcon} onSelect={setEditIcon} />
              <View style={{ height: 16 }} />
              <ColorPicker selected={editColor} onSelect={setEditColor} />
              <View style={{ height: 16 }} />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable
                  onPress={() => setShowEdit(false)}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    borderWidth: 1,
                    borderColor: colors.border,
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    if (!editName.trim() || !category) return;
                    await updateCategory(
                      category.id,
                      editName.trim(),
                      editIcon,
                      editColor
                    );
                    setShowEdit(false);
                    loadData(category.id);
                  }}
                  style={{
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: colors.primary,
                    flex: 1,
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </ThemedScreen>
  );
}