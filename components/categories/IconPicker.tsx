import { FlatList, Pressable, Text, View } from "react-native";

const ICONS = [
  { emoji: "📚", name: "Books" },
  { emoji: "✏️", name: "Writing" },
  { emoji: "📝", name: "Notes" },
  { emoji: "📖", name: "Journal" },
  { emoji: "🎨", name: "Art" },
  { emoji: "🎵", name: "Music" },
  { emoji: "🧮", name: "Math" },
  { emoji: "🔬", name: "Science" },
  { emoji: "🌍", name: "Geography" },
  { emoji: "📜", name: "History" },
  { emoji: "💻", name: "Tech" },
  { emoji: "🗣️", name: "Languages" },
  { emoji: "🏋️", name: "Fitness" },
  { emoji: "🍳", name: "Cooking" },
  { emoji: "✈️", name: "Travel" },
  { emoji: "💡", name: "Ideas" },
  { emoji: "📋", name: "Lists" },
  { emoji: "🎯", name: "Goals" },
  { emoji: "❤️", name: "Health" },
  { emoji: "💰", name: "Finance" },
  { emoji: "🏠", name: "Home" },
  { emoji: "🎮", name: "Gaming" },
  { emoji: "📷", name: "Photo" },
  { emoji: "🎬", name: "Film" },
];

interface IconPickerProps {
  selected: string;
  onSelect: (icon: string) => void;
}

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <View>
      <Text style={{ fontSize: 14, fontWeight: "600", marginBottom: 8, color: "#8E8E93" }}>
        Icon
      </Text>
      <FlatList
        data={ICONS}
        keyExtractor={(item) => item.name}
        numColumns={6}
        scrollEnabled={false}
        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item.emoji)}
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: selected === item.emoji ? "#007AFF20" : "#F2F2F7",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: selected === item.emoji ? 2 : 0,
              borderColor: "#007AFF",
            }}
          >
            <Text style={{ fontSize: 24 }}>{item.emoji}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}