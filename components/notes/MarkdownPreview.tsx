import { Text } from "react-native";
import Markdown from "react-native-markdown-display";
import { useThemeColors } from "../../lib/theme/colors";

interface MarkdownPreviewProps {
  body: string;
}

export function MarkdownPreview({ body }: MarkdownPreviewProps) {
  const colors = useThemeColors();

  if (!body.trim()) {
    return (
      <Text
        style={{
          fontSize: 16,
          color: colors.textSecondary,
          fontStyle: "italic",
        }}
      >
        Empty note
      </Text>
    );
  }

  return (
    <Markdown
      style={{
        body: { fontSize: 16, lineHeight: 24, color: colors.text },
        heading1: {
          fontSize: 24,
          fontWeight: "bold",
          marginTop: 4,
          marginBottom: 8,
        },
        heading2: {
          fontSize: 20,
          fontWeight: "bold",
          marginTop: 4,
          marginBottom: 6,
        },
        heading3: {
          fontSize: 18,
          fontWeight: "600",
          marginTop: 4,
          marginBottom: 4,
        },
        code_inline: {
          fontFamily: "monospace",
          backgroundColor: colors.card,
          paddingHorizontal: 4,
          borderRadius: 3,
        },
        bullet_list: { paddingLeft: 8 },
        ordered_list: { paddingLeft: 8 },
      }}
    >
      {body}
    </Markdown>
  );
}
