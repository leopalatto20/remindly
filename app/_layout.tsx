import "../global.css";
import { useEffect } from "react";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../lib/theme";
import {
  configureNotificationHandler,
  rescheduleAllNotifications,
} from "../lib/notifications";

export default function RootLayout() {
  useEffect(() => {
    configureNotificationHandler();

    // Reschedule all notifications on startup
    rescheduleAllNotifications();

    // Handle notification taps (deep link to the note)
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;
        if (data?.type === "todo-reminder" && data?.noteId) {
          // Dynamic import to avoid circular deps
          const { router } = require("expo-router");
          router.push(`/note/${data.noteId}`);
        }
      },
    );

    return () => subscription.remove();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="category/[id]" options={{ headerShown: false }} />
          <Stack.Screen name="note/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="settings"
            options={{ headerShown: true, title: "Settings", presentation: "modal" }}
          />
        </Stack>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
