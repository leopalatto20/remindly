import * as Notifications from "expo-notifications";
import { AndroidImportance, SchedulableTriggerInputTypes } from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getDb } from "./db/schema";

const REMINDER_SETTING_KEY = "remindly-reminder-offset";
const NOTIFICATION_MAP_KEY = "remindly-notification-map";

export type ReminderOffset = 0 | 1 | 2 | 3 | 4 | 5 | 6;

let initialised = false;

function getTimeContext(offset: ReminderOffset, dueDate: string): string {
  if (offset === 0) return "Due now";
  const label = offset === 1 ? "1 hour" : `${offset} hours`;
  const time = new Date(dueDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `Due in ${label} at ${time}`;
}

export async function getReminderOffset(): Promise<ReminderOffset> {
  const stored = await AsyncStorage.getItem(REMINDER_SETTING_KEY);
  if (!stored) return 0;
  const offset = parseInt(stored, 10);
  if ([0, 1, 2, 3, 4, 5, 6].includes(offset)) return offset as ReminderOffset;
  return 0;
}

export async function setReminderOffset(offset: ReminderOffset): Promise<void> {
  await AsyncStorage.setItem(REMINDER_SETTING_KEY, String(offset));
}

export async function areNotificationsEnabled(): Promise<boolean> {
  const settings = await Notifications.getPermissionsAsync();
  return settings.granted;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function getNotificationMap(): Promise<Record<string, string>> {
  const stored = await AsyncStorage.getItem(NOTIFICATION_MAP_KEY);
  return stored ? JSON.parse(stored) : {};
}

async function saveNotificationMap(map: Record<string, string>): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_MAP_KEY, JSON.stringify(map));
}

export async function scheduleTodoNotification(
  todoId: number,
  title: string,
  dueDate: string,
  noteId: number,
): Promise<void> {
  const offset = await getReminderOffset();
  if (offset === 0) return;

  const due = new Date(dueDate);
  const now = new Date();
  if (due <= now) return;

  const fireDate = new Date(due.getTime() - offset * 60 * 60 * 1000);
  if (fireDate <= now) return;

  // Cancel any existing notification for this todo first
  await cancelTodoNotification(todoId);

  const [identifier, map] = await Promise.all([
    Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: getTimeContext(offset, dueDate),
        data: { todoId, noteId, type: "todo-reminder" },
      },
      trigger: { type: SchedulableTriggerInputTypes.DATE, date: fireDate },
    }),
    getNotificationMap(),
  ]);
  map[String(todoId)] = identifier;
  await saveNotificationMap(map);
}

export async function cancelTodoNotification(todoId: number): Promise<void> {
  const map = await getNotificationMap();
  const identifier = map[String(todoId)];
  if (identifier) {
    await Notifications.cancelScheduledNotificationAsync(identifier);
    delete map[String(todoId)];
    await saveNotificationMap(map);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(NOTIFICATION_MAP_KEY);
}

export async function rescheduleAllNotifications(): Promise<void> {
  const offset = await getReminderOffset();

  if (offset === 0) {
    await cancelAllNotifications();
    return;
  }

  // Cancel existing notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const db = await getDb();
  const todos = await db.getAllAsync<{
    id: number;
    title: string;
    due_date: string;
    note_id: number;
  }>("SELECT id, title, due_date, note_id FROM todos WHERE completed = 0");

  const now = new Date();
  const updatedMap: Record<string, string> = {};

  const schedulePromises: Promise<{ todoId: string; identifier: string } | null>[] = [];
  for (const todo of todos) {
    const due = new Date(todo.due_date);
    const fireDate = new Date(due.getTime() - offset * 60 * 60 * 1000);
    if (due > now && fireDate > now) {
      schedulePromises.push(
        Notifications.scheduleNotificationAsync({
          content: {
            title: todo.title,
            body: getTimeContext(offset, todo.due_date),
            data: { todoId: todo.id, noteId: todo.note_id, type: "todo-reminder" },
          },
          trigger: { type: SchedulableTriggerInputTypes.DATE, date: fireDate },
        }).then((identifier) => ({ todoId: String(todo.id), identifier })),
      );
    }
  }

  const scheduleResults = await Promise.all(schedulePromises);
  for (const result of scheduleResults) {
    if (result) {
      updatedMap[result.todoId] = result.identifier;
    }
  }

  await saveNotificationMap(updatedMap);
}

export function configureNotificationHandler(): void {
  if (initialised) return;
  initialised = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Create Android notification channel
  Notifications.setNotificationChannelAsync("default", {
    name: "Todo Reminders",
    importance: AndroidImportance.HIGH,
  }).catch(() => {});
}
