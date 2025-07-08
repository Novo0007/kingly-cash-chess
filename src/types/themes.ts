export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  preview: string;
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    popover: string;
    popoverForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    destructive: string;
    destructiveForeground: string;
    border: string;
    input: string;
    ring: string;
  };
  gradients: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const themes: ThemeDefinition[] = [
  {
    id: "default",
    name: "Default",
    description: "Clean and minimal default theme",
    preview: "🎯",
    colors: {
      background: "0 0% 100%",
      foreground: "0 0% 3.9%",
      card: "0 0% 100%",
      cardForeground: "0 0% 3.9%",
      popover: "0 0% 100%",
      popoverForeground: "0 0% 3.9%",
      primary: "0 0% 9%",
      primaryForeground: "0 0% 98%",
      secondary: "0 0% 96.1%",
      secondaryForeground: "0 0% 9%",
      muted: "0 0% 96.1%",
      mutedForeground: "0 0% 45.1%",
      accent: "0 0% 96.1%",
      accentForeground: "0 0% 9%",
      destructive: "0 84.2% 60.2%",
      destructiveForeground: "0 0% 98%",
      border: "0 0% 89.8%",
      input: "0 0% 89.8%",
      ring: "0 0% 3.9%",
    },
    gradients: {
      primary: "from-gray-900 to-gray-700",
      secondary: "from-gray-100 to-gray-200",
      accent: "from-blue-500 to-purple-600",
    },
  },
  {
    id: "pixelnova",
    name: "PixelNova",
    description: "Retro pixel-inspired theme with vibrant neon colors",
    preview: "🌟",
    colors: {
      background: "220 30% 8%",
      foreground: "60 100% 95%",
      card: "220 25% 12%",
      cardForeground: "60 100% 95%",
      popover: "220 25% 12%",
      popoverForeground: "60 100% 95%",
      primary: "300 100% 60%",
      primaryForeground: "220 30% 8%",
      secondary: "180 100% 40%",
      secondaryForeground: "220 30% 8%",
      muted: "220 20% 20%",
      mutedForeground: "60 50% 80%",
      accent: "45 100% 60%",
      accentForeground: "220 30% 8%",
      destructive: "0 100% 60%",
      destructiveForeground: "60 100% 95%",
      border: "220 20% 25%",
      input: "220 20% 25%",
      ring: "300 100% 60%",
    },
    gradients: {
      primary: "from-fuchsia-500 to-cyan-400",
      secondary: "from-yellow-400 to-orange-500",
      accent: "from-purple-600 to-pink-500",
    },
  },
  {
    id: "mindmaze",
    name: "MindMaze UI",
    description: "Professional dark theme with blue accents for focus",
    preview: "🧠",
    colors: {
      background: "210 40% 8%",
      foreground: "210 40% 95%",
      card: "210 35% 12%",
      cardForeground: "210 40% 95%",
      popover: "210 35% 12%",
      popoverForeground: "210 40% 95%",
      primary: "210 100% 60%",
      primaryForeground: "210 40% 8%",
      secondary: "210 30% 18%",
      secondaryForeground: "210 40% 95%",
      muted: "210 30% 15%",
      mutedForeground: "210 20% 70%",
      accent: "200 100% 55%",
      accentForeground: "210 40% 8%",
      destructive: "0 80% 55%",
      destructiveForeground: "210 40% 95%",
      border: "210 30% 18%",
      input: "210 30% 18%",
      ring: "210 100% 60%",
    },
    gradients: {
      primary: "from-blue-600 to-indigo-600",
      secondary: "from-slate-700 to-slate-800",
      accent: "from-cyan-500 to-blue-500",
    },
  },
  {
    id: "glowyfun",
    name: "GlowyFun",
    description: "Bright and playful theme with glowing elements",
    preview: "✨",
    colors: {
      background: "280 20% 15%",
      foreground: "50 100% 95%",
      card: "280 15% 20%",
      cardForeground: "50 100% 95%",
      popover: "280 15% 20%",
      popoverForeground: "50 100% 95%",
      primary: "340 100% 65%",
      primaryForeground: "280 20% 15%",
      secondary: "120 100% 50%",
      secondaryForeground: "280 20% 15%",
      muted: "280 10% 25%",
      mutedForeground: "50 80% 85%",
      accent: "60 100% 60%",
      accentForeground: "280 20% 15%",
      destructive: "10 100% 60%",
      destructiveForeground: "50 100% 95%",
      border: "280 10% 30%",
      input: "280 10% 30%",
      ring: "340 100% 65%",
    },
    gradients: {
      primary: "from-pink-500 to-rose-400",
      secondary: "from-green-400 to-emerald-500",
      accent: "from-yellow-400 to-amber-500",
    },
  },
  {
    id: "dreampixels",
    name: "DreamPixels",
    description: "Soft pastel theme with dreamy gradient colors",
    preview: "🌙",
    colors: {
      background: "240 20% 96%",
      foreground: "240 30% 15%",
      card: "240 15% 98%",
      cardForeground: "240 30% 15%",
      popover: "240 15% 98%",
      popoverForeground: "240 30% 15%",
      primary: "270 80% 70%",
      primaryForeground: "240 20% 96%",
      secondary: "200 60% 85%",
      secondaryForeground: "240 30% 15%",
      muted: "240 10% 92%",
      mutedForeground: "240 20% 50%",
      accent: "320 70% 80%",
      accentForeground: "240 30% 15%",
      destructive: "0 70% 65%",
      destructiveForeground: "240 20% 96%",
      border: "240 10% 88%",
      input: "240 10% 88%",
      ring: "270 80% 70%",
    },
    gradients: {
      primary: "from-purple-400 to-pink-300",
      secondary: "from-blue-300 to-cyan-200",
      accent: "from-rose-300 to-pink-200",
    },
  },
];

export type ThemeId = (typeof themes)[number]["id"];
