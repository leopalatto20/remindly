import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { shareAsync } from "expo-sharing";
import { getDocumentAsync } from "expo-document-picker";
import { File } from "expo-file-system";
import { Paths } from "expo-file-system";
import { useTheme, type ThemeMode } from "../lib/theme";
import { ThemedScreen } from "../components/ui/ThemedScreen";
import { useThemeColors } from "../lib/theme/colors";
import { exportData, importData, backupFilename } from "../lib/db/backup";
import { Toast } from "../components/ui/Toast";

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: "",
    visible: false,
  });

  function showToast(message: string) {
    setToast({ message, visible: true });
  }

  function hideToast() {
    setToast({ message: "", visible: false });
  }

  async function handleExport() {
    try {
      const json = await exportData();
      const filename = backupFilename(new Date());
      const file = new File(Paths.cache, filename);
      file.write(json);
      await shareAsync(file.uri);
    } catch {
      showToast("Export failed");
    }
  }

  async function handleImport() {
    try {
      const result = await getDocumentAsync({ type: "application/json" });
      if (result.canceled) return;

      const asset = result.assets[0];
      const pickedFile = new File(asset.uri);
      const jsonString = await pickedFile.text();

      Alert.alert(
        "Import Data",
        "This will replace all your data. Are you sure?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Import",
            style: "destructive",
            onPress: async () => {
              const result = await importData(jsonString);
              if (result.success) {
                showToast("Data imported successfully");
                setTimeout(() => router.replace("/"), 500);
              } else {
                Alert.alert("Import Failed", result.error);
              }
            },
          },
        ],
      );
    } catch {
      showToast("Import failed");
    }
  }

  return (
    <ThemedScreen>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 16 }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginBottom: 16,
          }}
        >
          Settings
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 12,
            color: colors.textSecondary,
          }}
        >
          Theme
        </Text>
        {themeOptions.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => setMode(opt.value)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              backgroundColor: mode === opt.value ? colors.primary + "20" : colors.card,
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 10,
                borderWidth: 2,
                borderColor: mode === opt.value ? colors.primary : colors.border,
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {mode === opt.value && (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.primary,
                  }}
                />
              )}
            </View>
            <Text style={{ fontSize: 16 }}>{opt.label}</Text>
          </Pressable>
        ))}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            marginTop: 24,
            marginBottom: 12,
            color: colors.textSecondary,
          }}
        >
          Data
        </Text>
        <Pressable
          onPress={handleExport}
          style={{
            padding: 14,
            backgroundColor: colors.card,
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>Export</Text>
        </Pressable>
        <Pressable
          onPress={handleImport}
          style={{
            padding: 14,
            backgroundColor: colors.card,
            borderRadius: 10,
            marginBottom: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>Import</Text>
        </Pressable>
      </ScrollView>
      <Toast message={toast.message} visible={toast.visible} onHide={hideToast} />
    </ThemedScreen>
  );
}