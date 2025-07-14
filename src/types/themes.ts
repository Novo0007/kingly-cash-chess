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
  {
    id: "love",
    name: "Love Aesthetic",
    description: "Romantic vibes with warm hearts and dreamy love colors",
    preview: "💖",
    colors: {
      background: "350 100% 98%", // Soft romantic white with hint of pink
      foreground: "340 25% 15%", // Deep romantic dark
      card: "355 100% 99%", // Pure romantic white
      cardForeground: "340 25% 15%", // Deep romantic for cards
      popover: "355 100% 99%", // Pure romantic white
      popoverForeground: "340 25% 15%", // Deep romantic for popovers
      primary: "345 83% 65%", // Romantic rose pink
      primaryForeground: "0 0% 100%", // Pure white
      secondary: "15 85% 80%", // Warm coral blush
      secondaryForeground: "340 25% 15%", // Deep romantic on secondary
      muted: "350 50% 95%", // Very light romantic pink
      mutedForeground: "340 15% 50%", // Muted romantic gray
      accent: "30 100% 85%", // Warm peachy love
      accentForeground: "340 25% 15%", // Deep romantic on accent
      destructive: "0 75% 68%", // Soft romantic red
      destructiveForeground: "0 0% 100%", // White on destructive
      border: "350 30% 88%", // Soft romantic border
      input: "350 40% 96%", // Very light romantic input
      ring: "345 83% 65%", // Romantic rose ring
    },
    gradients: {
      primary: "from-rose-400 via-pink-400 to-red-300", // Love gradient
      secondary: "from-orange-200 to-pink-200", // Warm love gradient
      accent: "from-pink-200 via-rose-200 to-orange-200", // Sunset love gradient
    },
  },
  {
    id: "darkgoth",
    name: "Dark Aesthetic",
    description:
      "Deep mysterious vibes with gothic elegance and moody darkness",
    preview: "🖤",
    colors: {
      background: "240 8% 8%", // Very dark charcoal
      foreground: "0 0% 95%", // Near white text
      card: "240 10% 10%", // Dark card background
      cardForeground: "0 0% 95%", // Near white for cards
      popover: "240 10% 10%", // Dark popover
      popoverForeground: "0 0% 95%", // Near white for popovers
      primary: "270 50% 35%", // Deep gothic purple
      primaryForeground: "0 0% 98%", // Pure white
      secondary: "240 15% 20%", // Dark gray-blue
      secondaryForeground: "0 0% 90%", // Light gray on secondary
      muted: "240 10% 15%", // Dark muted
      mutedForeground: "240 5% 60%", // Muted gray
      accent: "300 30% 25%", // Dark purple accent
      accentForeground: "0 0% 90%", // Light gray on accent
      destructive: "0 60% 45%", // Dark red
      destructiveForeground: "0 0% 95%", // Near white on destructive
      border: "240 10% 18%", // Dark border
      input: "240 10% 12%", // Very dark input
      ring: "270 50% 35%", // Deep gothic purple ring
    },
    gradients: {
      primary: "from-purple-900 via-violet-900 to-indigo-900", // Dark gothic gradient
      secondary: "from-slate-900 to-gray-900", // Dark gradient
      accent: "from-purple-950 via-indigo-950 to-black", // Ultra dark gradient
    },
  },
  {
    id: "midnight",
    name: "Midnight Romance",
    description: "Dark romantic theme with mysterious love and gothic elegance",
    preview: "🌙💜",
    colors: {
      background: "300 15% 12%", // Dark romantic background
      foreground: "320 20% 92%", // Light romantic text
      card: "300 20% 15%", // Dark romantic cards
      cardForeground: "320 20% 92%", // Light romantic for cards
      popover: "300 20% 15%", // Dark romantic popover
      popoverForeground: "320 20% 92%", // Light romantic for popovers
      primary: "315 65% 55%", // Dark romantic pink
      primaryForeground: "0 0% 98%", // Pure white
      secondary: "280 40% 25%", // Dark lavender
      secondaryForeground: "320 15% 85%", // Light on secondary
      muted: "300 15% 20%", // Dark muted romantic
      mutedForeground: "300 8% 65%", // Muted romantic gray
      accent: "330 45% 40%", // Deep romantic accent
      accentForeground: "320 15% 85%", // Light on accent
      destructive: "0 55% 50%", // Dark romantic red
      destructiveForeground: "0 0% 95%", // Near white on destructive
      border: "300 15% 22%", // Dark romantic border
      input: "300 15% 18%", // Dark romantic input
      ring: "315 65% 55%", // Dark romantic pink ring
    },
    gradients: {
      primary: "from-pink-800 via-purple-800 to-violet-800", // Dark romantic gradient
      secondary: "from-purple-900 to-indigo-900", // Dark mysterious gradient
      accent: "from-rose-900 via-pink-900 to-purple-900", // Deep love gradient
    },
  },
  {
    id: "valentine",
    name: "Valentine's Day",
    description: "Sweet romantic theme perfect for love and valentine vibes",
    preview: "💕",
    colors: {
      background: "355 100% 97%", // Soft valentine background
      foreground: "335 30% 20%", // Deep valentine text
      card: "358 100% 98%", // Ultra soft valentine white
      cardForeground: "335 30% 20%", // Deep valentine for cards
      popover: "358 100% 98%", // Ultra soft valentine white
      popoverForeground: "335 30% 20%", // Deep valentine for popovers
      primary: "350 85% 70%", // Valentine pink
      primaryForeground: "0 0% 100%", // Pure white
      secondary: "10 80% 75%", // Valentine coral
      secondaryForeground: "335 30% 20%", // Deep valentine on secondary
      muted: "355 60% 93%", // Light valentine mist
      mutedForeground: "335 20% 55%", // Muted valentine gray
      accent: "25 90% 80%", // Warm valentine peach
      accentForeground: "335 30% 20%", // Deep valentine on accent
      destructive: "5 80% 70%", // Soft valentine red
      destructiveForeground: "0 0% 100%", // White on destructive
      border: "355 40% 85%", // Soft valentine border
      input: "355 50% 94%", // Light valentine input
      ring: "350 85% 70%", // Valentine pink ring
    },
    gradients: {
      primary: "from-pink-400 via-rose-400 to-red-400", // Valentine gradient
      secondary: "from-red-200 to-pink-200", // Sweet valentine gradient
      accent: "from-orange-200 via-pink-200 to-rose-200", // Warm valentine gradient
    },
  },
];

export type ThemeId = (typeof themes)[number]["id"];
