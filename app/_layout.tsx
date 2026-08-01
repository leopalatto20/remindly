import "../global.css";
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
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

  const [queryClient] = useState(() => new QueryClient());

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
