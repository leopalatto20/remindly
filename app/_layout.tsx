import "../global.css";
import { Stack } from "expo-router";
import { ThemeProvider } from "../lib/theme";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="category/[id]"
          options={{ headerShown: true, title: "Category" }}
        />
        <Stack.Screen
          name="note/[id]"
          options={{ headerShown: true, title: "Note" }}
        />
        <Stack.Screen
          name="settings"
          options={{ headerShown: true, title: "Settings", presentation: "modal" }}
        />
      </Stack>
    </ThemeProvider>
  );
}
