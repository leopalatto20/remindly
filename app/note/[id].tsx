import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { Check, Pencil, Trash2, ArrowLeft } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNote, useUpdateNote, useDeleteNote } from "../../lib/hooks/useNotes";
import { useTodos, useCreateTodo, useUpdateTodo, useToggleTodo } from "../../lib/hooks/useTodos";
import type { Todo } from "../../lib/db/todos";
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
  const noteId = Number(id);

  const { data: note } = useNote(noteId);
  const { data: todos = [] } = useTodos(noteId);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const createTodo = useCreateTodo();
  const updateTodo = useUpdateTodo();
  const toggleTodo = useToggleTodo();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [todoListVisible, setTodoListVisible] = useState(false);
  const [todoModalVisible, setTodoModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [returnToList, setReturnToList] = useState(false);

  // Track unsaved changes for save-on-unmount
  const titleRef = useRef(title);
  titleRef.current = title;
  const bodyRef = useRef(body);
  bodyRef.current = body;

  // Sync state when note loads
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setBody(note.body);
      setIsEditing(false);
      setIsEditingTitle(false);
    }
  }, [note?.id]);

  // Save on unmount as safety net
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (note && (titleRef.current !== note.title || bodyRef.current !== note.body)) {
          updateNote.mutate({ id: note.id, title: titleRef.current, body: bodyRef.current });
        }
      };
    }, [note?.id]),
  );

  function handleSave() {
    if (!note) return;
    updateNote.mutate(
      { id: note.id, title, body },
      {
        onSuccess: () => {
          setIsEditing(false);
          setToastMessage("Saved");
          setToastVisible(true);
        },
      },
    );
  }

  function handleTitleBlur() {
    if (!note) return;
    setIsEditingTitle(false);
    const trimmed = title.trim();
    if (trimmed === "") {
      setTitle(note.title);
      return;
    }
    if (trimmed !== note.title) {
      updateNote.mutate({ id: note.id, title: trimmed, body });
    }
  }

  function handleDelete() {
    if (!note) return;
    Alert.alert("Delete Note", `Delete "${note.title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteNote.mutate(note.id, {
            onSuccess: () => router.back(),
          });
        },
      },
    ]);
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
            {isEditingTitle ? (
              <TextInput
                value={title}
                onChangeText={setTitle}
                onBlur={handleTitleBlur}
                autoFocus
                style={{
                  fontSize: 28,
                  fontWeight: "700",
                  letterSpacing: -0.3,
                  lineHeight: 34,
                  color: colors.text,
                  padding: 0,
                }}
              />
            ) : (
              <Pressable onPress={() => setIsEditingTitle(true)}>
                <Text
                  style={{
                    fontSize: 28,
                    fontWeight: "700",
                    letterSpacing: -0.3,
                    lineHeight: 34,
                    color: colors.text,
                  }}
                >
                  {title || note.title}
                </Text>
              </Pressable>
            )}
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
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
          onToggleTodo={(todoId) => toggleTodo.mutate(todoId)}
          onTapTodo={handleTapTodo}
          onAddTodo={handleAddTodo}
        />

        <TodoModal
          visible={todoModalVisible}
          todo={editingTodo}
          onSave={(title, dueDate) => {
            const mutation = editingTodo
              ? updateTodo.mutate({ id: editingTodo.id, title, dueDate })
              : createTodo.mutate({ title, dueDate, noteId: note.id });

            // Both mutations auto-invalidate via onSuccess
            setTodoModalVisible(false);
            setEditingTodo(null);
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
