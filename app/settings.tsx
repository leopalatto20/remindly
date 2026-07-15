import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

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
        {options.map((opt) => (
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
      </ScrollView>
    </ThemedScreen>
  );
}
