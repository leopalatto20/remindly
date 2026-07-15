import { Pressable, Text, View } from "react-native";

const COLORS = [
  "#FF3B30", "#FF9500", "#FFCC00", "#34C759", "#00C7BE",
  "#007AFF", "#5856D6", "#AF52DE", "#FF2D55", "#A2845E",
  "#8E8E93", "#636366", "#48484A", "#E5E5EA", "#D1D1D6",
  "#C7C7CC", "#AEAEB2", "#F2F2F7", "#FFFFFF", "#000000",
];

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#8E8E93" }}>
        Color
      </Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {COLORS.map((color) => (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: color,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: selected === color ? 3 : 1,
              borderColor: selected === color ? "#007AFF" : "#E5E5EA",
            }}
          >
            {selected === color && (
              <Text style={{ fontSize: 14, color: color === "#FFFFFF" || color === "#F2F2F7" ? "#000" : "#FFF" }}>
                ✓
              </Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}