import { useState } from "react";
import { Modal, Platform, Pressable, Text, TextInput, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
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

  const defaultDate = new Date(Date.now() + 86400000);
  defaultDate.setHours(12, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date>(
    todo ? new Date(todo.due_date) : defaultDate,
  );

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const isEdit = todo !== null;

  function resetForm() {
    setTitle("");
    setSelectedDate(defaultDate);
    setShowDatePicker(false);
    setShowTimePicker(false);
  }

  function handleSave() {
    if (!title.trim()) return;
    const dueDate = selectedDate.toISOString();
    onSave(title.trim(), dueDate);
    resetForm();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function onDateChange(_event: unknown, date?: Date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
    if (Platform.OS === "android" && date) {
      setShowTimePicker(true);
    }
  }

  function onTimeChange(_event: unknown, date?: Date) {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
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

          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 4 }}>
            Due date
          </Text>

          <Pressable
            onPress={() => {
              if (Platform.OS === "android") {
                setShowDatePicker(true);
                setShowTimePicker(false);
              }
            }}
            style={{
              padding: 12,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 10,
              marginBottom: 16,
              backgroundColor: colors.card,
            }}
          >
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {selectedDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              {selectedDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </Pressable>

          {Platform.OS === "ios" && (
            <View style={{ marginBottom: 16, gap: 8 }}>
              <DateTimePicker value={selectedDate} mode="date" onChange={onDateChange} />
              <DateTimePicker value={selectedDate} mode="time" onChange={onTimeChange} />
            </View>
          )}

          {Platform.OS === "android" && showDatePicker && (
            <DateTimePicker value={selectedDate} mode="date" onChange={onDateChange} />
          )}

          {Platform.OS === "android" && showTimePicker && (
            <DateTimePicker value={selectedDate} mode="time" is24Hour onChange={onTimeChange} />
          )}

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
