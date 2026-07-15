import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { useTheme, type ThemeMode } from "../lib/theme";
import { ThemedScreen } from "../components/ui/ThemedScreen";
import { useThemeColors } from "../lib/theme/colors";

const options: { label: string; value: ThemeMode }[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const { mode, setMode } = useTheme();

  return (
    <ThemedScreen>
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
          color: "#8E8E93",
        }}
      >
        Theme
      </Text>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => setMode(opt.value)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            padding: 14,
            backgroundColor: mode === opt.value ? "#007AFF20" : "#F2F2F7",
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
              borderColor: mode === opt.value ? "#007AFF" : "#C7C7CC",
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
                  backgroundColor: "#007AFF",
                }}
              />
            )}
          </View>
          <Text style={{ fontSize: 16 }}>{opt.label}</Text>
        </Pressable>
      ))}
    </ThemedScreen>
  );
}
