import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Check, Pencil, Trash2, ArrowLeft } from "lucide-react-native";

import { getNote, updateNoteBody, deleteNote, type Note } from "../../lib/db/notes";
import { getTodosByNote, createTodo, toggleTodoCompleted, type Todo } from "../../lib/db/todos";
import { TodoModal } from "../../components/todos/TodoModal";
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
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (id) loadNote(Number(id));
    }, [id])
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (note && body !== undefined) {
          updateNoteBody(note.id, body);
        }
      };
    }, [note?.id, body])
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
    if (note) {
      const ts = await getTodosByNote(note.id);
      setTodos(ts);
    }
  }

  async function handleTapTodo(todo: Todo) {
    setEditingTodo(todo);
    setTodoModalVisible(true);
  }

  if (!note) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const completedCount = todos.filter((t) => t.completed).length;

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
        <View style={{ flexDirection: "row", gap: 12 }}>
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

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 36,
            paddingTop: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
            Todos
          </Text>
          {todos.length > 0 && (
            <View
              style={{
                backgroundColor: colors.card,
                paddingHorizontal: 8,
                paddingVertical: 2,
                borderRadius: 10,
              }}
            >
              <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                {completedCount}/{todos.length}
              </Text>
            </View>
          )}
        </View>

        {todos.map((todo) => (
          <View
            key={todo.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 6,
              opacity: todo.completed ? 0.5 : 1,
            }}
          >
            <Pressable
              onPress={() => handleToggleTodo(todo.id)}
              hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
              style={{
                width: 18,
                height: 18,
                borderRadius: 9,
                borderWidth: 2,
                borderColor: todo.completed ? colors.success : colors.border,
                backgroundColor: todo.completed ? colors.success : "transparent",
                marginRight: 10,
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <Pressable style={{ flex: 1 }} onPress={() => handleTapTodo(todo)}>
              <Text
                style={{
                  fontSize: 14,
                  textDecorationLine: todo.completed ? "line-through" : "none",
                  color: colors.text,
                }}
              >
                {todo.title}
              </Text>
              <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 1 }}>
                {new Date(todo.due_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </Pressable>
          </View>
        ))}

        <Pressable
          onPress={() => {
            setEditingTodo(null);
            setTodoModalVisible(true);
          }}
          style={{ marginTop: 8, marginBottom: 40 }}
        >
          <Text style={{ color: colors.primary, fontWeight: "500", fontSize: 14 }}>
            + Add
          </Text>
        </Pressable>
      </ScrollView>

      <TodoModal
        visible={todoModalVisible}
        todo={editingTodo}
        onSave={async (title, dueDate) => {
          if (editingTodo) {
            const { updateTodo } = await import("../../lib/db/todos");
            await updateTodo(editingTodo.id, title, dueDate);
          } else if (note) {
            const { createTodo } = await import("../../lib/db/todos");
            await createTodo(title, dueDate, note.id);
          }
          setTodoModalVisible(false);
          setEditingTodo(null);
          if (note) {
            const ts = await getTodosByNote(note.id);
            setTodos(ts);
          }
        }}
        onClose={() => {
          setTodoModalVisible(false);
          setEditingTodo(null);
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