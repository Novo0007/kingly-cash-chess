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
    id: "anime",
    name: "Anime Aesthetic",
    description: "Soft pastel colors with dreamy anime-inspired aesthetics",
    preview: "🌸",
    colors: {
      background: "330 100% 98%", // Very soft pink-white background
      foreground: "260 15% 15%", // Deep purple-gray text
      card: "320 100% 99%", // Pure white with hint of pink
      cardForeground: "260 15% 15%", // Deep purple-gray for card text
      popover: "320 100% 99%", // Pure white with hint of pink
      popoverForeground: "260 15% 15%", // Deep purple-gray for popover text
      primary: "340 82% 75%", // Soft sakura pink
      primaryForeground: "0 0% 100%", // Pure white text on primary
      secondary: "280 40% 85%", // Soft lavender purple
      secondaryForeground: "260 15% 15%", // Deep purple-gray on secondary
      muted: "300 30% 94%", // Very light purple-pink
      mutedForeground: "260 8% 45%", // Muted purple-gray
      accent: "200 80% 75%", // Soft sky blue
      accentForeground: "260 15% 15%", // Deep purple-gray on accent
      destructive: "0 70% 70%", // Soft coral red
      destructiveForeground: "0 0% 100%", // White text on destructive
      border: "300 20% 88%", // Soft purple-pink border
      input: "300 25% 95%", // Very light purple-pink input
      ring: "340 82% 75%", // Sakura pink ring
    },
    gradients: {
      primary: "from-pink-300 via-purple-300 to-indigo-300", // Dreamy anime gradient
      secondary: "from-rose-100 to-pink-200", // Soft rose gradient
      accent: "from-cyan-200 via-blue-200 to-purple-200", // Sky to purple gradient
    },
  },
  {
    id: "kawaii",
    name: "Kawaii Dreams",
    description: "Ultra-cute pastel theme with magical girl vibes",
    preview: "🌈",
    colors: {
      background: "310 100% 97%", // Soft magical pink
      foreground: "280 20% 20%", // Dark purple text
      card: "300 100% 98%", // Ultra soft pink-white
      cardForeground: "280 20% 20%", // Dark purple for cards
      popover: "300 100% 98%", // Ultra soft pink-white
      popoverForeground: "280 20% 20%", // Dark purple for popovers
      primary: "320 90% 70%", // Bright magical pink
      primaryForeground: "0 0% 100%", // Pure white
      secondary: "260 60% 80%", // Soft magic purple
      secondaryForeground: "280 20% 20%", // Dark purple
      muted: "290 40% 92%", // Light magical mist
      mutedForeground: "280 12% 50%", // Muted magical gray
      accent: "180 70% 75%", // Mint magical blue
      accentForeground: "280 20% 20%", // Dark purple on accent
      destructive: "15 80% 75%", // Coral magical
      destructiveForeground: "0 0% 100%", // White on destructive
      border: "290 30% 85%", // Magical border
      input: "290 35% 93%", // Magical input field
      ring: "320 90% 70%", // Bright magical pink ring
    },
    gradients: {
      primary: "from-pink-400 via-rose-400 to-purple-400", // Magical girl gradient
      secondary: "from-purple-100 to-pink-100", // Soft magical gradient
      accent: "from-blue-200 via-cyan-200 to-teal-200", // Ocean magical gradient
    },
  },
];

export type ThemeId = (typeof themes)[number]["id"];
