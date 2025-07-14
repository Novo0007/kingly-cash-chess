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
    id: "sakura-love",
    name: "Sakura Love",
    description: "Cherry blossom romance with soft pink anime aesthetics",
    preview: "🌸",
    colors: {
      background: "350 100% 98%", // Very soft pink background
      foreground: "340 50% 15%", // Deep rose text
      card: "350 80% 96%", // Light pink cards
      cardForeground: "340 50% 20%", // Dark rose card text
      popover: "350 70% 95%", // Soft pink popovers
      popoverForeground: "340 50% 15%", // Deep rose popover text
      primary: "340 85% 65%", // Beautiful rose primary
      primaryForeground: "0 0% 100%", // White text on primary
      secondary: "320 60% 85%", // Soft lavender pink
      secondaryForeground: "340 40% 25%", // Dark rose secondary text
      muted: "350 30% 92%", // Very light pink muted
      mutedForeground: "340 30% 50%", // Medium rose muted text
      accent: "300 70% 75%", // Bright pink accent
      accentForeground: "340 50% 15%", // Deep rose accent text
      destructive: "0 75% 60%", // Soft red
      destructiveForeground: "0 0% 100%", // White destructive text
      border: "350 40% 85%", // Soft pink border
      input: "350 50% 90%", // Light pink input
      ring: "340 85% 65%", // Rose ring
    },
    gradients: {
      primary: "from-pink-400 via-rose-400 to-pink-500",
      secondary: "from-pink-100 via-rose-100 to-pink-200",
      accent: "from-pink-300 via-rose-300 to-fuchsia-300",
    },
  },
  {
    id: "midnight-love",
    name: "Midnight Love",
    description: "Dark romantic theme with purple and pink anime vibes",
    preview: "💜",
    colors: {
      background: "260 25% 8%", // Deep dark purple
      foreground: "320 60% 85%", // Light pink text
      card: "260 30% 12%", // Dark purple cards
      cardForeground: "320 50% 80%", // Pink card text
      popover: "260 35% 10%", // Very dark purple popovers
      popoverForeground: "320 60% 85%", // Light pink popover text
      primary: "320 70% 60%", // Vibrant pink primary
      primaryForeground: "260 25% 8%", // Dark purple text on primary
      secondary: "280 40% 25%", // Dark purple secondary
      secondaryForeground: "320 50% 75%", // Pink secondary text
      muted: "260 20% 20%", // Dark muted
      mutedForeground: "320 30% 60%", // Medium pink muted text
      accent: "300 80% 70%", // Bright magenta accent
      accentForeground: "260 25% 8%", // Dark purple accent text
      destructive: "0 70% 50%", // Red for errors
      destructiveForeground: "0 0% 100%", // White destructive text
      border: "260 30% 18%", // Dark purple border
      input: "260 35% 15%", // Dark purple input
      ring: "320 70% 60%", // Pink ring
    },
    gradients: {
      primary: "from-purple-600 via-pink-600 to-fuchsia-600",
      secondary: "from-purple-900 via-purple-800 to-purple-900",
      accent: "from-pink-500 via-fuchsia-500 to-purple-500",
    },
  },
  {
    id: "dreampixels",
    name: "Dream Pixels",
    description: "Kawaii pastel anime theme with dreamy colors",
    preview: "✨",
    colors: {
      background: "200 100% 97%", // Very light cyan/blue
      foreground: "260 40% 25%", // Dark purple text
      card: "180 80% 95%", // Light cyan cards
      cardForeground: "260 35% 30%", // Purple card text
      popover: "190 70% 93%", // Soft cyan popovers
      popoverForeground: "260 40% 25%", // Dark purple popover text
      primary: "280 70% 70%", // Soft purple primary
      primaryForeground: "0 0% 100%", // White text on primary
      secondary: "160 60% 85%", // Soft mint green
      secondaryForeground: "260 35% 30%", // Purple secondary text
      muted: "200 40% 90%", // Light blue muted
      mutedForeground: "260 25% 50%", // Medium purple muted text
      accent: "45 90% 80%", // Soft yellow accent
      accentForeground: "260 40% 25%", // Dark purple accent text
      destructive: "10 80% 65%", // Soft coral red
      destructiveForeground: "0 0% 100%", // White destructive text
      border: "200 30% 85%", // Light blue border
      input: "190 50% 88%", // Light cyan input
      ring: "280 70% 70%", // Purple ring
    },
    gradients: {
      primary: "from-purple-400 via-pink-300 to-cyan-300",
      secondary: "from-cyan-100 via-purple-100 to-pink-100",
      accent: "from-yellow-200 via-pink-200 to-purple-200",
    },
  },
  {
    id: "neon-love",
    name: "Neon Love",
    description: "Cyberpunk anime aesthetic with neon pink and blue",
    preview: "💫",
    colors: {
      background: "240 15% 5%", // Very dark blue-black
      foreground: "300 100% 85%", // Bright pink text
      card: "240 20% 8%", // Dark blue cards
      cardForeground: "300 90% 80%", // Pink card text
      popover: "240 25% 6%", // Very dark blue popovers
      popoverForeground: "300 100% 85%", // Bright pink popover text
      primary: "300 100% 70%", // Neon pink primary
      primaryForeground: "240 15% 5%", // Dark background text on primary
      secondary: "200 100% 50%", // Neon cyan secondary
      secondaryForeground: "240 15% 5%", // Dark secondary text
      muted: "240 15% 15%", // Dark muted
      mutedForeground: "300 60% 65%", // Medium pink muted text
      accent: "180 100% 60%", // Neon cyan accent
      accentForeground: "240 15% 5%", // Dark accent text
      destructive: "0 100% 60%", // Neon red
      destructiveForeground: "0 0% 100%", // White destructive text
      border: "240 30% 12%", // Dark blue border
      input: "240 35% 10%", // Dark blue input
      ring: "300 100% 70%", // Neon pink ring
    },
    gradients: {
      primary: "from-pink-500 via-fuchsia-500 to-cyan-500",
      secondary: "from-blue-900 via-purple-900 to-pink-900",
      accent: "from-cyan-400 via-pink-400 to-purple-400",
    },
  },
  {
    id: "strawberry-cream",
    name: "Strawberry Cream",
    description: "Sweet and soft aesthetic with strawberry and cream colors",
    preview: "🍓",
    colors: {
      background: "10 60% 96%", // Very light cream
      foreground: "350 70% 20%", // Deep strawberry text
      card: "5 80% 94%", // Light cream cards
      cardForeground: "350 60% 25%", // Dark strawberry card text
      popover: "15 70% 92%", // Soft cream popovers
      popoverForeground: "350 70% 20%", // Deep strawberry popover text
      primary: "350 80% 65%", // Strawberry primary
      primaryForeground: "0 0% 100%", // White text on primary
      secondary: "25 70% 85%", // Peach secondary
      secondaryForeground: "350 50% 30%", // Dark strawberry secondary text
      muted: "20 40% 90%", // Light peach muted
      mutedForeground: "350 40% 45%", // Medium strawberry muted text
      accent: "40 90% 75%", // Bright peach accent
      accentForeground: "350 70% 20%", // Deep strawberry accent text
      destructive: "0 75% 55%", // Red
      destructiveForeground: "0 0% 100%", // White destructive text
      border: "15 40% 85%", // Light cream border
      input: "10 50% 88%", // Soft cream input
      ring: "350 80% 65%", // Strawberry ring
    },
    gradients: {
      primary: "from-red-300 via-pink-300 to-orange-300",
      secondary: "from-orange-100 via-pink-100 to-red-100",
      accent: "from-yellow-200 via-orange-200 to-pink-200",
    },
  },
  {
    id: "cosmic-love",
    name: "Cosmic Love",
    description: "Galaxy-inspired anime theme with stars and nebula colors",
    preview: "��",
    colors: {
      background: "250 45% 6%", // Deep space blue
      foreground: "320 80% 85%", // Bright pink text
      card: "250 50% 9%", // Dark space blue cards
      cardForeground: "320 70% 80%", // Pink card text
      popover: "250 55% 7%", // Very dark space blue popovers
      popoverForeground: "320 80% 85%", // Bright pink popover text
      primary: "280 90% 70%", // Galaxy purple primary
      primaryForeground: "0 0% 100%", // White text on primary
      secondary: "200 80% 60%", // Nebula blue secondary
      secondaryForeground: "0 0% 100%", // White secondary text
      muted: "250 25% 15%", // Dark space muted
      mutedForeground: "320 50% 70%", // Medium pink muted text
      accent: "60 100% 75%", // Star yellow accent
      accentForeground: "250 45% 6%", // Dark space accent text
      destructive: "0 80% 60%", // Red
      destructiveForeground: "0 0% 100%", // White destructive text
      border: "250 35% 12%", // Dark space border
      input: "250 40% 10%", // Dark space input
      ring: "280 90% 70%", // Galaxy purple ring
    },
    gradients: {
      primary: "from-purple-500 via-blue-500 to-pink-500",
      secondary: "from-blue-900 via-purple-900 to-indigo-900",
      accent: "from-yellow-400 via-pink-400 to-purple-400",
    },
  },
];

export type ThemeId = (typeof themes)[number]["id"];
