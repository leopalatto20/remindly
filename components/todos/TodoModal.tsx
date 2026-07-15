import { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Todo } from "../../lib/db/todos";
import { useThemeColors } from "../../lib/theme/colors";

interface TodoModalProps {
  visible: boolean;
  todo: Todo | null;
  onSave: (title: string, dueDate: string) => void;
  onClose: () => void;
}

export function TodoModal({ visible, todo, onSave, onClose }: TodoModalProps) {
  const colors = useThemeColors();
  const [title, setTitle] = useState(todo?.title ?? "");
  const [dateString, setDateString] = useState(
    todo ? todo.due_date.replace("T", " ").substring(0, 16) : ""
  );

  const isEdit = todo !== null;

  function handleSave() {
    if (!title.trim()) return;
    let dueDate = dateString;
    if (!dueDate) {
      const d = new Date(Date.now() + 86400000);
      dueDate = d.toISOString();
    } else {
      try {
        dueDate = new Date(dueDate).toISOString();
      } catch {
        const d = new Date(Date.now() + 86400000);
        dueDate = d.toISOString();
      }
    }
    onSave(title.trim(), dueDate);
    setTitle("");
    setDateString("");
  }

  function handleClose() {
    setTitle("");
    setDateString("");
    onClose();
  }

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
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 16, color: colors.text }}>
            {isEdit ? "Edit Todo" : "New Todo"}
          </Text>
          <TextInput
            placeholder="Todo title"
            value={title}
            onChangeText={setTitle}
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
          <TextInput
            placeholder="Due date (YYYY-MM-DD HH:mm)"
            value={dateString}
            onChangeText={setDateString}
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
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={handleClose}
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
              onPress={handleSave}
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
        </View>
      </View>
    </Modal>
  );
}