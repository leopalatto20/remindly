import { Text, View } from "react-native";
import { useThemeColors } from "../../lib/theme/colors";

interface MarkdownPreviewProps {
  body: string;
}

export function MarkdownPreview({ body }: MarkdownPreviewProps) {
  const colors = useThemeColors();

  if (!body.trim()) {
    return (
      <Text style={{ fontSize: 16, color: colors.textSecondary, fontStyle: "italic" }}>
        Empty note
      </Text>
    );
  }

  const lines = body.split("\n");
  const elements: React.ReactNode[] = [];
  let inList = false;

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      if (inList) {
        elements.push(<View key={i} style={{ height: 8 }} />);
        inList = false;
      } else {
        elements.push(<View key={i} style={{ height: 12 }} />);
      }
      return;
    }

    if (trimmed.startsWith("# ")) {
      inList = false;
      elements.push(
        <Text
          key={i}
          style={{
            fontSize: 24,
            fontWeight: "bold",
            marginBottom: 8,
            marginTop: 4,
          }}
        >
          {trimmed.substring(2)}
        </Text>,
      );
    } else if (trimmed.startsWith("## ")) {
      inList = false;
      elements.push(
        <Text
          key={i}
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginBottom: 6,
            marginTop: 4,
          }}
        >
          {trimmed.substring(3)}
        </Text>,
      );
    } else if (trimmed.startsWith("### ")) {
      inList = false;
      elements.push(
        <Text
          key={i}
          style={{
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 4,
            marginTop: 4,
          }}
        >
          {trimmed.substring(4)}
        </Text>,
      );
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      inList = true;
      elements.push(
        <View key={i} style={{ flexDirection: "row", marginBottom: 2, paddingLeft: 8 }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>{"\u2022"}</Text>
          <Text style={{ fontSize: 16, flex: 1, lineHeight: 22 }}>
            {renderInline(trimmed.substring(2), colors)}
          </Text>
        </View>,
      );
    } else if (/^\d+\.\s/.test(trimmed)) {
      inList = false;
      const match = trimmed.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <View key={i} style={{ flexDirection: "row", marginBottom: 2, paddingLeft: 8 }}>
            <Text style={{ fontSize: 16, marginRight: 6, width: 20 }}>{match[1]}.</Text>
            <Text style={{ fontSize: 16, flex: 1, lineHeight: 22 }}>
              {renderInline(match[2], colors)}
            </Text>
          </View>,
        );
      }
    } else {
      inList = false;
      elements.push(
        <Text key={i} style={{ fontSize: 16, lineHeight: 24, marginBottom: 2 }}>
          {renderInline(trimmed, colors)}
        </Text>,
      );
    }
  });

  return <View>{elements}</View>;
}

function renderInline(text: string, colors: ReturnType<typeof useThemeColors>): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const remaining = text;

  const regex = /(\*\*(.*?)\*\*|__(.*?)__|\*(.*?)\*|_(.*?)_|`(.*?)`|~~(.*?)~~)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.substring(lastIndex, match.index));
    }

    if (match[2]) {
      parts.push(
        <Text key={match.index} style={{ fontWeight: "bold" }}>
          {match[2]}
        </Text>,
      );
    } else if (match[3]) {
      parts.push(
        <Text key={match.index} style={{ fontWeight: "bold" }}>
          {match[3]}
        </Text>,
      );
    } else if (match[4]) {
      parts.push(
        <Text key={match.index} style={{ fontStyle: "italic" }}>
          {match[4]}
        </Text>,
      );
    } else if (match[5]) {
      parts.push(
        <Text key={match.index} style={{ fontStyle: "italic" }}>
          {match[5]}
        </Text>,
      );
    } else if (match[6]) {
      parts.push(
        <Text
          key={match.index}
          style={{
            fontFamily: "monospace",
            backgroundColor: colors.card,
            paddingHorizontal: 4,
            borderRadius: 3,
          }}
        >
          {match[6]}
        </Text>,
      );
    } else if (match[7]) {
      parts.push(
        <Text key={match.index} style={{ textDecorationLine: "line-through" }}>
          {match[7]}
        </Text>,
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}
