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
  }

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
];

export type ThemeId = (typeof themes)[number]["id"];