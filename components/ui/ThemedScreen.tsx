import { View, type ViewProps } from "react-native";
import { useThemeColors } from "../../lib/theme/colors";

interface ThemedScreenProps extends ViewProps {
  children: React.ReactNode;
}

export function ThemedScreen({ children, style, ...props }: ThemedScreenProps) {
  const colors = useThemeColors();
  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }, style]} {...props}>
      {children}
    </View>
  );
}
