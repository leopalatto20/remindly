import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { Pressable } from "react-native-gesture-handler";
import { Text } from "react-native";
import { Trash2 } from "lucide-react-native";
import { useThemeColors } from "../../lib/theme/colors";

interface SwipeableDeleteActionProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function SwipeableDeleteAction({ children, onDelete }: SwipeableDeleteActionProps) {
  const colors = useThemeColors();
  return (
    <ReanimatedSwipeable
      renderRightActions={() => (
        <Pressable
          onPress={onDelete}
          style={{
            backgroundColor: colors.danger,
            justifyContent: "center",
            alignItems: "center",
            width: 80,
            marginBottom: 8,
            borderTopRightRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <Trash2 size={22} color="#fff" />
          <Text style={{ color: "#fff", fontSize: 12, marginTop: 2 }}>
            Delete
          </Text>
        </Pressable>
      )}
      overshootRight={false}
      friction={2}
    >
      {children}
    </ReanimatedSwipeable>
  );
}