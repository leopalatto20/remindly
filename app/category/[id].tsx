import { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";

import {
  getCategory,
  updateCategory,
  createCategory,
  type Category,
} from "../../lib/db/categories";
import { getNotesByCategory, createNote, type Note } from "../../lib/db/notes";
import { IconPicker } from "../../components/categories/IconPicker";
import { ColorPicker } from "../../components/categories/ColorPicker";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { useThemeColors } from "../../lib/theme/colors";

export default function CategoryDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const [category, setCategory] = useState<Category | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📚");
  const [newCatColor, setNewCatColor] = useState("#007AFF");
  const [editIcon, setEditIcon] = useState("📚");
  const [editColor, setEditColor] = useState("#007AFF");

  useFocusEffect(
    useCallback(() => {
      if (isNew) {
        setShowNew(true);
      } else if (id) {
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

  if (isNew) {
    return (
      <ThemedScreen>
        <View style={{ padding: 16, paddingTop: 60 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 16 }}>
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
            }}
          />
          <IconPicker selected={newCatIcon} onSelect={setNewCatIcon} />
          <View style={{ height: 16 }} />
          <ColorPicker selected={newCatColor} onSelect={setNewCatColor} />
          <View style={{ height: 16 }} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => {
                setNewCatName("");
                router.back();
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
              onPress={async () => {
                if (!newCatName.trim()) return;
                const catId = await createCategory(
                  newCatName.trim(),
                  newCatIcon,
                  newCatColor
                );
                setNewCatName("");
                router.replace(`/category/${catId}`);
              }}
              style={{
                padding: 12,
                borderRadius: 10,
                backgroundColor: "#007AFF",
                flex: 1,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>Create</Text>
            </Pressable>
          </View>
        </View>
      </ThemedScreen>
    );
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
          <Text style={{ fontSize: 24, color: category.color }}>
            {category.icon}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {category.name}
          </Text>
        </View>
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
            <Pressable
              onPress={() => router.push(`/note/${item.id}`)}
              onLongPress={() => {
                Alert.alert(
                  "Delete Note",
                  `Delete "${item.title}"?`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        const { deleteNote } = await import("../../lib/db/notes");
                        await deleteNote(item.id);
                        loadData(category.id);
                      },
                    },
                  ]
                );
              }}
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
                Updated: {new Date(item.updated_at).toLocaleDateString()}
              </Text>
            </Pressable>
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
            }}
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
                backgroundColor: "#007AFF",
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
                }}
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
                    backgroundColor: "#007AFF",
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
    </ThemedScreen>
  );
}
