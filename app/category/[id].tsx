import { useState, useCallback, useEffect } from "react";
import { Alert, FlatList, Modal, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pressable, ScrollView } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { Trash2, ArrowLeft } from "lucide-react-native";

import { useCategory, useUpdateCategory, useDeleteCategory } from "../../lib/hooks/useCategories";
import { useNotes, useCreateNote, useDeleteNote } from "../../lib/hooks/useNotes";
import { IconPicker } from "../../components/categories/IconPicker";
import { ColorPicker } from "../../components/categories/ColorPicker";
import { DynamicIcon } from "../../lib/icons/DynamicIcon";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { SwipeableDeleteAction } from "../../components/ui/SwipeableDeleteAction";
import { useThemeColors } from "../../lib/theme/colors";

const NOTE_ITEM_STYLE = {
  padding: 16,
  borderRadius: 12,
  marginBottom: 8,
};

const ICON_CONTAINER_STYLE = {
  width: 48,
  height: 48,
  borderRadius: 24,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  marginRight: 12,
};

interface EditCategoryModalProps {
  visible: boolean;
  initialName: string;
  initialIcon: string;
  initialColor: string;
  onClose: () => void;
  onSave: (name: string, icon: string, color: string) => void;
}

function EditCategoryModal({
  visible,
  initialName,
  initialIcon,
  initialColor,
  onClose,
  onSave,
}: EditCategoryModalProps) {
  const colors = useThemeColors();
  const [editName, setEditName] = useState(initialName);
  const [editIcon, setEditIcon] = useState(initialIcon);
  const [editColor, setEditColor] = useState(initialColor);

  // Sync when initial values change (modal opened with new data)
  useEffect(() => {
    if (visible) {
      setEditName(initialName);
      setEditIcon(initialIcon);
      setEditColor(initialColor);
    }
  }, [visible, initialName, initialIcon, initialColor]);

  return (
    <Modal visible={visible} transparent animationType="slide">
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
                onPress={onClose}
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
                  if (!editName.trim()) return;
                  onSave(editName.trim(), editIcon, editColor);
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
  );
}

export default function CategoryDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const catId = Number(id);

  const { data: category } = useCategory(catId);
  const { data: notes = [] } = useNotes(catId);
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const createNote = useCreateNote();
  const deleteNote = useDeleteNote();

  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [editInitial, setEditInitial] = useState({ name: "", icon: "Book", color: "#007AFF" });

  function handleCreateNote() {
    if (!newTitle.trim() || !category) return;
    createNote.mutate(
      { title: newTitle.trim(), categoryId: category.id },
      {
        onSuccess: (noteId) => {
          setNewTitle("");
          setShowCreate(false);
          router.push(`/note/${noteId}`);
        },
      },
    );
  }

  const handleDeleteNote = useCallback(
    (item: { id: number; title: string }) => {
      Alert.alert("Delete Note", `Delete "${item.title}"?`, [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteNote.mutate(item.id),
        },
      ]);
    },
    [deleteNote],
  );

  const renderNoteItem = useCallback(
    ({ item }: { item: { id: number; title: string; created_at: string } }) => (
      <SwipeableDeleteAction onDelete={() => handleDeleteNote(item)}>
        <Pressable
          onPress={() => router.push(`/note/${item.id}`)}
          style={[NOTE_ITEM_STYLE, { backgroundColor: colors.card }]}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>{item.title}</Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
            Created:{" "}
            {new Date(item.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </Pressable>
      </SwipeableDeleteAction>
    ),
    [colors.card, colors.text, colors.textSecondary, handleDeleteNote],
  );

  if (!category) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
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
          <View style={[ICON_CONTAINER_STYLE, { backgroundColor: category.color + "20" }]}>
            <DynamicIcon name={category.icon} size={24} color={category.color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 22, fontWeight: "bold", color: colors.text }}>
              {category.name}
            </Text>
          </View>
          <Pressable
            onPress={() => {
              Alert.alert("Delete Category", `Delete "${category.name}" and all its notes?`, [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Delete",
                  style: "destructive",
                  onPress: () => {
                    deleteCategory.mutate(category.id, {
                      onSuccess: () => router.back(),
                    });
                  },
                },
              ]);
            }}
            style={{ marginRight: 12 }}
          >
            <Trash2 size={20} color={colors.danger} />
          </Pressable>
          <Pressable
            onPress={() => {
              setEditInitial({ name: category.name, icon: category.icon, color: category.color });
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
            renderItem={renderNoteItem}
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
                <Text style={{ color: colors.text }}>Cancel</Text>
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

        <EditCategoryModal
          visible={showEdit}
          initialName={editInitial.name}
          initialIcon={editInitial.icon}
          initialColor={editInitial.color}
          onClose={() => setShowEdit(false)}
          onSave={(name, icon, color) => {
            if (!category) return;
            updateCategory.mutate(
              { id: category.id, name, icon, color },
              { onSuccess: () => setShowEdit(false) },
            );
          }}
        />
      </SafeAreaView>
    </ThemedScreen>
  );
}
