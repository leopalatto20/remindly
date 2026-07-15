import { FlatList, Pressable, View } from "react-native";
import { DynamicIcon } from "../../lib/icons/DynamicIcon";
import { useThemeColors } from "../../lib/theme/colors";

const ICONS = [
  { name: "Book", label: "Books" },
  { name: "Pen", label: "Writing" },
  { name: "StickyNote", label: "Notes" },
  { name: "BookOpen", label: "Journal" },
  { name: "Palette", label: "Art" },
  { name: "Music", label: "Music" },
  { name: "Sigma", label: "Math" },
  { name: "FlaskConical", label: "Science" },
  { name: "Globe", label: "Geography" },
  { name: "Scroll", label: "History" },
  { name: "Monitor", label: "Tech" },
  { name: "Languages", label: "Languages" },
  { name: "Dumbbell", label: "Fitness" },
  { name: "Utensils", label: "Cooking" },
  { name: "Plane", label: "Travel" },
  { name: "Lightbulb", label: "Ideas" },
  { name: "List", label: "Lists" },
  { name: "Target", label: "Goals" },
  { name: "Heart", label: "Health" },
  { name: "Wallet", label: "Finance" },
  { name: "Gamepad2", label: "Gaming" },
  { name: "Camera", label: "Photo" },
  { name: "Clapperboard", label: "Film" },
];

interface IconPickerProps {
  selected: string;
  onSelect: (icon: string) => void;
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  const colors = useThemeColors();
  return (
    <View>
      <FlatList
        data={ICONS}
        keyExtractor={(item) => item.name}
        numColumns={6}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item.name)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: selected === item.name ? colors.primary + "20" : colors.card,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: selected === item.name ? 2 : 0,
              borderColor: colors.primary,
            }}
          >
            <DynamicIcon
              name={item.name}
              size={22}
              color={selected === item.name ? colors.primary : "#555"}
            />
          </Pressable>
        )}
      />
    </View>
  );
}