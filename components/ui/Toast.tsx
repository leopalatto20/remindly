import { useEffect } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export function Toast({ message, visible, onHide }: ToastProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 }, () => {
        opacity.value = withDelay(
          1500,
          withTiming(0, { duration: 200 }, () => {
            runOnJS(onHide)();
          }),
        );
      });
    }
  }, [visible, opacity, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    zIndex: 1000,
  },
  text: {
    color: "#fff",
    fontSize: 14,
  },
});
