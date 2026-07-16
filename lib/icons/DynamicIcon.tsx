import * as Lucide from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";

const iconRegistry: Record<string, LucideIcon> = {
  Book: Lucide.Book,
  Pen: Lucide.Pen,
  StickyNote: Lucide.StickyNote,
  BookOpen: Lucide.BookOpen,
  Palette: Lucide.Palette,
  Music: Lucide.Music,
  Sigma: Lucide.Sigma,
  FlaskConical: Lucide.FlaskConical,
  Globe: Lucide.Globe,
  Scroll: Lucide.Scroll,
  Monitor: Lucide.Monitor,
  Dumbbell: Lucide.Dumbbell,
  Utensils: Lucide.Utensils,
  Languages: Lucide.Languages,
  Plane: Lucide.Plane,
  Lightbulb: Lucide.Lightbulb,
  List: Lucide.List,
  Target: Lucide.Target,
  Heart: Lucide.Heart,
  Wallet: Lucide.Wallet,
  Gamepad2: Lucide.Gamepad2,
  Camera: Lucide.Camera,
  Clapperboard: Lucide.Clapperboard,
  Home: Lucide.Home,
  Search: Lucide.Search,
  Settings: Lucide.Settings,
  Plus: Lucide.Plus,
  Trash2: Lucide.Trash2,
};

export function getLucideIcon(name: string): LucideIcon | null {
  return iconRegistry[name] ?? null;
}

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function DynamicIcon({
  name,
  size = 24,
  color = "#000",
  strokeWidth = 2,
}: DynamicIconProps) {
  const Icon = getLucideIcon(name);
  if (!Icon) return null;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
