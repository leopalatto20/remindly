import { useTheme } from "./ThemeContext";

export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  danger: string;
  success: string;
  warning: string;
}

const light: ThemeColors = {
  background: "#FFFFFF",
  card: "#F2F2F7",
  text: "#000000",
  textSecondary: "#8E8E93",
  border: "#C7C7CC",
  primary: "#0a4511",
  danger: "#FF3B30",
  success: "#34C759",
  warning: "#FF9500",
};

const dark: ThemeColors = {
  background: "#121212",
  card: "#1E1E1E",
  text: "#E5E5E5",
  textSecondary: "#9E9E9E",
  border: "#2A2A2A",
  primary: "#30D158",
  danger: "#FF453A",
  success: "#30D158",
  warning: "#FF9F0A",
};

export function useThemeColors(): ThemeColors {
  const { resolved } = useTheme();
  return resolved === "dark" ? dark : light;
}
