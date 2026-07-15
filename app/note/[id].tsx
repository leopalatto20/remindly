import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Trash2 } from "lucide-react-native";

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
  const [showPreview, setShowPreview] = useState(false);

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
  }

  const isInitialMount = useRef(true);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      if (!note) return;
      await updateNoteBody(note.id, body);
      setToastMessage("Saved");
      setToastVisible(true);
    }, 1000);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [body]);

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

  return (
    <ThemedScreen>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#F2F2F7",
        }}
      >
        <Pressable onPress={() => router.back()}>
          <Text style={{ color: colors.primary, fontSize: 16 }}>Back</Text>
        </Pressable>
        <Pressable onPress={() => setShowPreview(!showPreview)} style={{ marginRight: 12 }}>
          <Text style={{ color: colors.primary, fontSize: 14 }}>
            {showPreview ? "Edit" : "Preview"}
          </Text>
        </Pressable>
        <Text style={{ fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" }}>
          {note.title}
        </Text>
        <Pressable onPress={handleDelete}>
          <Trash2 size={20} color={colors.danger} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View style={{ marginBottom: 8 }}>
          <Text style={{ fontSize: 12, color: "#8E8E93" }}>
            Created: {new Date(note.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Text>
        </View>

        {showPreview ? (
          <View style={{ padding: 12, backgroundColor: "#F2F2F7", borderRadius: 10, minHeight: 200 }}>
            <MarkdownPreview body={body} />
          </View>
        ) : (
          <TextInput
            placeholder="Write in markdown..."
            value={body}
            onChangeText={setBody}
            multiline
            style={{
              padding: 12,
              backgroundColor: "#F2F2F7",
              borderRadius: 10,
              fontSize: 16,
              minHeight: 200,
              textAlignVertical: "top",
              lineHeight: 24,
            }}
          />
        )}

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginTop: 24,
            marginBottom: 12,
          }}
        >
          Todos
        </Text>

        {todos.map((todo) => (
          <View
            key={todo.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 12,
              opacity: todo.completed ? 0.5 : 1,
            }}
          >
            <Pressable
              onPress={() => handleToggleTodo(todo.id)}
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                borderWidth: 2,
                borderColor: todo.completed ? "#34C759" : "#C7C7CC",
                backgroundColor: todo.completed ? "#34C759" : "transparent",
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <Pressable style={{ flex: 1 }} onPress={() => handleTapTodo(todo)}>
              <Text
                style={{
                  fontSize: 16,
                  textDecorationLine: todo.completed ? "line-through" : "none",
                }}
              >
                {todo.title}
              </Text>
              <Text style={{ fontSize: 12, color: "#8E8E93" }}>
                Due: {new Date(todo.due_date).toLocaleDateString("en-US", {
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
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 12,
              marginTop: 12,
              marginBottom: 40,
              borderWidth: 1,
              borderColor: colors.primary,
              borderStyle: "dashed",
              borderRadius: 10,
            }}
          >
            <Text style={{ color: colors.primary, fontWeight: "600" }}>+ New Todo</Text>
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
    </ThemedScreen>
  );
}