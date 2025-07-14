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
    id: "light",
    name: "Beautiful Light",
    description: "Elegant light theme with modern aesthetics",
    preview: "☀️",
    colors: {
      background: "0 0% 98%", // Light beige background
      foreground: "240 10% 10%", // Dark slate text color for contrast
      card: "0 0% 100%", // White card background
      cardForeground: "240 10% 10%", // Dark slate text for cards
      popover: "0 0% 100%", // Soft white for popovers
      popoverForeground: "240 10% 10%", // Dark slate text in popovers
      primary: "10 90% 60%", // Vibrant Coral (for buttons and highlights)
      primaryForeground: "0 0% 100%", // White text on primary elements
      secondary: "240 60% 80%", // Soft Lavender (for secondary elements)
      secondaryForeground: "240 10% 10%", // Dark slate text on secondary elements
      muted: "210 20% 95%", // Light Slate Gray (for muted/disabled elements)
      mutedForeground: "30 20% 60%", // Warm Taupe (for muted text)
      accent: "197 100% 70%", // Sky Blue (for links and accent elements)
      accentForeground: "240 10% 10%", // Dark slate text on accent elements
      destructive: "0 80% 55%", // Strong Red (for errors and warnings)
      destructiveForeground: "350 60% 85%", // Light Pink text on destructive elements
      border: "210 10% 85%", // Cool Silver border color
      input: "210 25% 92%", // Light Grayish Blue for input fields
      ring: "10 90% 60%", // Vibrant Coral ring (focus states)
    },
    gradients: {
      primary: "from-cyan-400 to-rose-400", // Gradient from cyan to rose for primary elements
      secondary: "from-slate-50 to-slate-200", // Light gradient for secondary elements
      accent: "from-blue-100 to-indigo-200", // Soft gradient for accent elements
    },
  },
  {
    id: "dark",
    name: "Beautiful Dark",
    description: "Sophisticated dark theme with premium feel",
    preview: "🌙",
    colors: {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      cardForeground: "0 0% 98%",
      popover: "240 10% 3.9%",
      popoverForeground: "0 0% 98%",
      primary: "217 91% 60%",
      primaryForeground: "222 84% 4.9%",
      secondary: "217 32% 17%",
      secondaryForeground: "210 40% 98%",
      muted: "217 32% 17%",
      mutedForeground: "215 20% 65%",
      accent: "217 32% 17%",
      accentForeground: "210 40% 98%",
      destructive: "0 63% 31%",
      destructiveForeground: "210 40% 98%",
      border: "217 32% 17%",
      input: "217 32% 17%",
      ring: "217 91% 60%",
    },
    gradients: {
      primary: "from-blue-600 to-violet-700",
      secondary: "from-slate-800 to-slate-900",
      accent: "from-blue-900/50 to-indigo-900/50",
    },
  },
  {
    id: "dreampixels",
    name: "Anime Love",
    description: "Kawaii anime aesthetic with soft pastels and love vibes",
    preview: "💖",
    colors: {
      background: "330 100% 98%", // Soft pink-white background
      foreground: "320 60% 15%", // Deep purple-pink text
      card: "340 60% 97%", // Very light pink cards
      cardForeground: "320 50% 20%", // Deep pink text
      popover: "340 50% 96%", // Soft pink popovers
      popoverForeground: "320 50% 20%", // Deep pink text
      primary: "340 82% 52%", // Bright pink primary
      primaryForeground: "0 0% 100%", // White text on primary
      secondary: "280 60% 85%", // Soft lavender secondary
      secondaryForeground: "320 40% 25%", // Dark pink on secondary
      muted: "320 40% 90%", // Light pink muted
      mutedForeground: "320 25% 50%", // Medium pink muted text
      accent: "270 100% 70%", // Purple accent
      accentForeground: "0 0% 100%", // White on accent
      destructive: "0 80% 55%", // Red for errors
      destructiveForeground: "350 60% 95%", // Light pink on destructive
      border: "320 30% 85%", // Soft pink borders
      input: "330 50% 95%", // Very light pink inputs
      ring: "340 82% 52%", // Bright pink focus ring
    },
    gradients: {
      primary: "from-pink-400 via-rose-400 to-red-400", // Pink to rose gradient
      secondary: "from-purple-300 via-pink-300 to-rose-300", // Soft pastel gradient
      accent: "from-violet-400 via-purple-400 to-pink-400", // Purple to pink gradient
    },
  },
  {
    id: "sakurablossom",
    name: "Sakura Blossom",
    description: "Cherry blossom inspired theme with soft florals",
    preview: "🌸",
    colors: {
      background: "350 100% 99%", // Almost white with pink tint
      foreground: "340 80% 8%", // Very dark pink
      card: "345 80% 97%", // Light pink cards
      cardForeground: "340 70% 12%", // Dark pink text
      popover: "345 70% 96%", // Soft pink popovers
      popoverForeground: "340 70% 12%", // Dark pink text
      primary: "345 100% 47%", // Cherry blossom pink
      primaryForeground: "0 0% 100%", // White text
      secondary: "320 50% 88%", // Soft pink secondary
      secondaryForeground: "340 60% 15%", // Dark pink
      muted: "340 40% 92%", // Very light pink muted
      mutedForeground: "340 30% 45%", // Medium pink text
      accent: "300 70% 65%", // Magenta accent
      accentForeground: "0 0% 100%", // White on accent
      destructive: "0 75% 50%", // Red for errors
      destructiveForeground: "0 0% 100%", // White on destructive
      border: "340 25% 88%", // Soft pink borders
      input: "345 60% 96%", // Light pink inputs
      ring: "345 100% 47%", // Cherry blossom focus ring
    },
    gradients: {
      primary: "from-pink-300 via-rose-300 to-pink-400", // Soft pink gradient
      secondary: "from-rose-100 via-pink-100 to-rose-200", // Very soft gradient
      accent: "from-purple-200 via-pink-200 to-rose-200", // Pastel gradient
    },
  },
  {
    id: "loveheart",
    name: "Love Heart",
    description: "Romantic red and pink theme with heart motifs",
    preview: "❤️",
    colors: {
      background: "10 100% 98%", // Soft peachy background
      foreground: "340 90% 10%", // Deep red text
      card: "5 70% 96%", // Light peachy cards
      cardForeground: "340 80% 15%", // Deep red text
      popover: "5 60% 95%", // Soft peach popovers
      popoverForeground: "340 80% 15%", // Deep red text
      primary: "348 83% 47%", // Love red primary
      primaryForeground: "0 0% 100%", // White text
      secondary: "0 60% 88%", // Soft red secondary
      secondaryForeground: "340 70% 20%", // Dark red
      muted: "5 40% 92%", // Light peach muted
      mutedForeground: "340 40% 40%", // Medium red text
      accent: "315 100% 60%", // Hot pink accent
      accentForeground: "0 0% 100%", // White on accent
      destructive: "0 80% 50%", // Red for errors
      destructiveForeground: "0 0% 100%", // White on destructive
      border: "5 30% 85%", // Soft peach borders
      input: "5 50% 94%", // Light peach inputs
      ring: "348 83% 47%", // Love red focus ring
    },
    gradients: {
      primary: "from-red-400 via-pink-400 to-rose-400", // Red to pink gradient
      secondary: "from-rose-200 via-pink-200 to-red-200", // Soft romantic gradient
      accent: "from-pink-400 via-red-400 to-rose-400", // Vibrant love gradient
    },
  },
];

export type ThemeId = (typeof themes)[number]["id"];
