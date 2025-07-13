// Professional Design System Utilities
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Color utility functions
export function hexToRgb(
  hex: string,
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

export function getContrastRatio(
  foreground: string,
  background: string,
): number {
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Dynamic text color based on background
export function getOptimalTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);

  // WCAG AA compliance threshold
  if (luminance > 0.5) {
    // Light background - use dark text
    return "#1a1a1a"; // Near black for readability
  } else {
    // Dark background - use light text
    return "#ffffff"; // Pure white for contrast
  }
}

// Get secondary text color based on background
export function getSecondaryTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);

  if (luminance > 0.5) {
    // Light background - use medium gray
    return "#6b7280"; // gray-500
  } else {
    // Dark background - use light gray
    return "#d1d5db"; // gray-300
  }
}

// Get muted text color based on background
export function getMutedTextColor(backgroundColor: string): string {
  const luminance = getLuminance(backgroundColor);

  if (luminance > 0.5) {
    // Light background - use light gray
    return "#9ca3af"; // gray-400
  } else {
    // Dark background - use medium gray
    return "#9ca3af"; // gray-400
  }
}

// Professional color palette
export const professionalColors = {
  // Primary grays
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
    950: "#030712",
  },

  // Professional blues
  blue: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },

  // Status colors
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
};

// Typography system
export const typography = {
  // Font families
  fontFamily: {
    sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
    mono: ["JetBrains Mono", "Consolas", "Monaco", "monospace"],
  },

  // Font sizes with line heights
  fontSize: {
    xs: ["0.75rem", { lineHeight: "1rem" }], // 12px
    sm: ["0.875rem", { lineHeight: "1.25rem" }], // 14px
    base: ["1rem", { lineHeight: "1.5rem" }], // 16px
    lg: ["1.125rem", { lineHeight: "1.75rem" }], // 18px
    xl: ["1.25rem", { lineHeight: "1.75rem" }], // 20px
    "2xl": ["1.5rem", { lineHeight: "2rem" }], // 24px
    "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
    "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
    "5xl": ["3rem", { lineHeight: "1" }], // 48px
    "6xl": ["3.75rem", { lineHeight: "1" }], // 60px
  },

  // Font weights
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
    black: "900",
  },
};

// Spacing system (8px base unit)
export const spacing = {
  0: "0",
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
};

// Professional border radius
export const borderRadius = {
  none: "0",
  sm: "0.375rem", // 6px
  base: "0.5rem", // 8px
  md: "0.75rem", // 12px
  lg: "1rem", // 16px
  xl: "1.5rem", // 24px
  "2xl": "2rem", // 32px
  full: "9999px",
};

// Shadow system
export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  base: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
};

// Professional component styles
export const componentStyles = {
  // Card styles
  card: {
    base: "bg-white border border-gray-200 rounded-xl shadow-sm",
    elevated: "bg-white border border-gray-200 rounded-xl shadow-md",
    interactive:
      "bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200",
  },

  // Button styles
  button: {
    base: "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
    sizes: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-8 text-base",
      xl: "h-12 px-8 text-base",
    },
  },

  // Input styles
  input: {
    base: "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500",
  },
};

// Utility functions for dynamic styling
export function getBackgroundColor(element?: HTMLElement): string {
  if (!element) return "#ffffff";

  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;

  // Convert rgb to hex if needed
  if (backgroundColor.startsWith("rgb")) {
    const rgb = backgroundColor.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      return rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]));
    }
  }

  return backgroundColor || "#ffffff";
}

// Create dynamic text classes based on background
export function createDynamicTextClasses(backgroundColor: string) {
  const primaryText = getOptimalTextColor(backgroundColor);
  const secondaryText = getSecondaryTextColor(backgroundColor);
  const mutedText = getMutedTextColor(backgroundColor);

  return {
    primary: `text-[${primaryText}]`,
    secondary: `text-[${secondaryText}]`,
    muted: `text-[${mutedText}]`,
    // CSS custom properties for dynamic use
    styles: {
      "--text-primary": primaryText,
      "--text-secondary": secondaryText,
      "--text-muted": mutedText,
    } as React.CSSProperties,
  };
}

// Professional animation classes
export const animations = {
  fadeIn: "animate-in fade-in-0 duration-300",
  slideUp: "animate-in slide-in-from-bottom-4 duration-300",
  slideDown: "animate-in slide-in-from-top-4 duration-300",
  scaleIn: "animate-in zoom-in-95 duration-200",
  slideInLeft: "animate-in slide-in-from-left-4 duration-300",
  slideInRight: "animate-in slide-in-from-right-4 duration-300",
};

export default {
  cn,
  getOptimalTextColor,
  getSecondaryTextColor,
  getMutedTextColor,
  createDynamicTextClasses,
  getBackgroundColor,
  professionalColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  componentStyles,
  animations,
};
