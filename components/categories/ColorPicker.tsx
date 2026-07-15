import { useCallback, useState } from "react";
import { LayoutChangeEvent, View } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { hexToHsv, hsvToHex } from "../../lib/colors";

const HUE_COLORS = [
  "#FF0000", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#FF00FF", "#FF0000",
];

function lerpColor(a: string, b: string, t: number): string {
  const ar = parseInt(a.slice(1, 3), 16);
  const ag = parseInt(a.slice(3, 5), 16);
  const ab = parseInt(a.slice(5, 7), 16);
  const br = parseInt(b.slice(1, 3), 16);
  const bg = parseInt(b.slice(3, 5), 16);
  const bb = parseInt(b.slice(5, 7), 16);
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${[rr, rg, rb].map((x) => x.toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function generateHueSegments(count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const seg = t * 5;
    const idx = Math.floor(seg);
    const frac = seg - idx;
    return lerpColor(HUE_COLORS[idx], HUE_COLORS[idx + 1], frac);
  });
}

interface SliderProps {
  value: number;
  onValueChange: (v: number) => void;
  colors: string[];
  label?: string;
}

function ColorSlider({ value, onValueChange, colors }: SliderProps) {
  const width = useSharedValue(0);
  const pos = useSharedValue(value);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    width.value = e.nativeEvent.layout.width;
  }, []);

  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      const w = width.value;
      if (w <= 0) return;
      const newPos = Math.max(0, Math.min(1, e.x / w));
      pos.value = newPos;
      runOnJS(onValueChange)(newPos);
    })
    .onBegin((e) => {
      const w = width.value;
      if (w <= 0) return;
      const newPos = Math.max(0, Math.min(1, e.x / w));
      pos.value = newPos;
      runOnJS(onValueChange)(newPos);
    })
    .minDistance(0);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pos.value * Math.max(width.value - 28, 0) },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        onLayout={onLayout}
        style={{
          height: 28,
          borderRadius: 14,
          flexDirection: "row",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {colors.map((c, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: c }} />
        ))}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: -4,
              width: 36,
              height: 36,
              borderRadius: 18,
              borderWidth: 3,
              borderColor: "#FFFFFF",
              backgroundColor: "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.3,
              shadowRadius: 3,
              elevation: 4,
            },
            thumbStyle,
          ]}
        />
      </Animated.View>
    </GestureDetector>
  );
}

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  const initial = hexToHsv(selected);
  const [h, setH] = useState(initial.h);
  const [s, setS] = useState(initial.s);
  const [v, setV] = useState(initial.v);

  const currentHex = hsvToHex(h, s, v);

  const handleHue = useCallback(
    (t: number) => {
      const newH = t * 360;
      setH(newH);
      onSelect(hsvToHex(newH, s, v));
    },
    [s, v, onSelect],
  );

  const handleSat = useCallback(
    (t: number) => {
      const newS = t;
      setS(newS);
      onSelect(hsvToHex(h, newS, v));
    },
    [h, v, onSelect],
  );

  const handleVal = useCallback(
    (t: number) => {
      const newV = t;
      setV(newV);
      onSelect(hsvToHex(h, s, newV));
    },
    [h, s, onSelect],
  );

  const hueSegments = generateHueSegments(60);
  const satColors = Array.from({ length: 20 }, (_, i) =>
    hsvToHex(h, i / 19, 1),
  );
  const valColors = Array.from({ length: 20 }, (_, i) =>
    hsvToHex(h, s, i / 19),
  );

  return (
    <View>
      <View
        style={{
          width: "100%",
          height: 80,
          borderRadius: 12,
          backgroundColor: currentHex,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: "#E5E5EA",
        }}
      />

      <View style={{ gap: 16 }}>
        <View>
          <ColorSlider
            value={h / 360}
            onValueChange={handleHue}
            colors={hueSegments}
          />
        </View>

        <View>
          <ColorSlider
            value={s}
            onValueChange={handleSat}
            colors={satColors}
          />
        </View>

        <View>
          <ColorSlider
            value={v}
            onValueChange={handleVal}
            colors={valColors}
          />
        </View>
      </View>
    </View>
  );
}