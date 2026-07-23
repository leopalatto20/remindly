import { useCallback, useState } from "react";
import { Alert, Pressable, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Check, Pencil, Trash2, ArrowLeft } from "lucide-react-native";

import { getNote, updateNoteBody, deleteNote, type Note } from "../../lib/db/notes";
import {
  getTodosByNote,
  createTodo,
  updateTodo,
  toggleTodoCompleted,
  type Todo,
} from "../../lib/db/todos";
import { TodoModal } from "../../components/todos/TodoModal";
import { TodoListModal } from "../../components/todos/TodoListModal";
import { TodoHeaderBadge } from "../../components/todos/TodoHeaderBadge";
import { MarkdownPreview } from "../../components/notes/MarkdownPreview";

import { Toast } from "../../components/ui/Toast";
import { ThemedScreen } from "../../components/ui/ThemedScreen";
import { useThemeColors } from "../../lib/theme/colors";

export default function NoteDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [note, setNote] = useState<Note | null>(null);
  const [body, setBody] = useState("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [todoListVisible, setTodoListVisible] = useState(false);
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [returnToList, setReturnToList] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) loadNote(Number(id));
    }, [id]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (note && body !== undefined) {
          updateNoteBody(note.id, body);
        }
      };
    }, [note?.id, body]),
  );

  async function loadNote(noteId: number) {
    const n = await getNote(noteId);
    setNote(n);
    if (n) {
      setBody(n.body);
      const ts = await getTodosByNote(noteId);
      setTodos(ts);
    }
    setIsEditing(false);
  }

  async function refreshTodos() {
    if (note) {
      const ts = await getTodosByNote(note.id);
      setTodos(ts);
    }
  }

  async function handleSave() {
    if (!note) return;
    await updateNoteBody(note.id, body);
    setIsEditing(false);
    setToastMessage("Saved");
    setToastVisible(true);
  }

  async function handleDelete() {
    if (!note) return;
    Alert.alert("Delete Note", `Delete "${note.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteNote(note.id);
          router.back();
        },
      },
    ]);
  }

  async function handleToggleTodo(todoId: number) {
    await toggleTodoCompleted(todoId);
    await refreshTodos();
  }

  function handleTapTodo(todo: Todo) {
    setEditingTodo(todo);
    setReturnToList(true);
    setTodoListVisible(false);
    setTimeout(() => setTodoModalVisible(true), 200);
  }

  function handleAddTodo() {
    setEditingTodo(null);
    setReturnToList(true);
    setTodoListVisible(false);
    setTimeout(() => setTodoModalVisible(true), 200);
  }

  if (!note) {
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
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.primary} />
          </Pressable>
          <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
            <TodoHeaderBadge todos={todos} onPress={() => setTodoListVisible(true)} />
            {isEditing ? (
              <Pressable onPress={handleSave}>
                <Check size={20} color={colors.primary} />
              </Pressable>
            ) : (
              <Pressable onPress={() => setIsEditing(true)}>
                <Pencil size={20} color={colors.primary} />
              </Pressable>
            )}
            <Pressable onPress={handleDelete}>
              <Trash2 size={20} color={colors.danger} />
            </Pressable>
          </View>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
          <View style={{ marginTop: 12, marginBottom: 16 }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                letterSpacing: -0.3,
                lineHeight: 34,
                color: colors.text,
              }}
            >
              {note.title}
            </Text>
            <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>
              {new Date(note.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>

          {isEditing ? (
            <TextInput
              placeholder="Write in markdown..."
              value={body}
              onChangeText={setBody}
              multiline
              style={{
                padding: 12,
                backgroundColor: colors.card,
                borderRadius: 10,
                fontSize: 17,
                minHeight: 200,
                textAlignVertical: "top",
                lineHeight: 27,
                color: colors.text,
              }}
              placeholderTextColor={colors.textSecondary}
            />
          ) : (
            <View style={{ minHeight: 200 }}>
              <MarkdownPreview body={body} />
            </View>
          )}
        </ScrollView>

        <TodoListModal
          visible={todoListVisible}
          todos={todos}
          onClose={() => setTodoListVisible(false)}
          onToggleTodo={handleToggleTodo}
          onTapTodo={handleTapTodo}
          onAddTodo={handleAddTodo}
        />

        <TodoModal
          visible={todoModalVisible}
          todo={editingTodo}
          onSave={async (title, dueDate) => {
            if (editingTodo) {
              await updateTodo(editingTodo.id, title, dueDate);
            } else if (note) {
              await createTodo(title, dueDate, note.id);
            }
            setTodoModalVisible(false);
            setEditingTodo(null);
            await refreshTodos();
            if (returnToList) {
              setReturnToList(false);
              setTimeout(() => setTodoListVisible(true), 200);
            }
          }}
          onClose={() => {
            setTodoModalVisible(false);
            setEditingTodo(null);
            if (returnToList) {
              setReturnToList(false);
              setTimeout(() => setTodoListVisible(true), 200);
            }
          }}
        />

        <Toast
          message={toastMessage}
          visible={toastVisible}
          onHide={() => setToastVisible(false)}
        />
      </SafeAreaView>
    </ThemedScreen>
  );
}
