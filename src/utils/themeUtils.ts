import type { ThemeDefinition } from "@/types/themes";

/**
 * Utility functions for applying theme-specific classes and effects
 */

export const getThemeClasses = (theme: ThemeDefinition): string => {
  const baseClasses = [];

  // Add theme-specific effect classes
  switch (theme.id) {
    case "hackermatrix":
      baseClasses.push("matrix-text");
      break;
    case "glitchcyber":
      baseClasses.push("glitch-element");
      break;
    default:
      break;
  }

  return baseClasses.join(" ");
};

export const getThemeCardClasses = (theme: ThemeDefinition): string => {
  const baseCard =
    "relative backdrop-blur-xl rounded-2xl overflow-hidden border-2 border-primary/50 shadow-2xl transition-all duration-500";
  const themeSpecific = getThemeClasses(theme);

  return `${baseCard} ${themeSpecific}`.trim();
};

export const getThemeHeaderClasses = (theme: ThemeDefinition): string => {
  const baseHeader =
    "relative flex items-center gap-4 p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10 transition-all duration-500";
  const themeSpecific = getThemeClasses(theme);

  return `${baseHeader} ${themeSpecific}`.trim();
};

export const getThemeTextClasses = (theme: ThemeDefinition): string => {
  const baseText = "transition-all duration-300";

  switch (theme.id) {
    case "hackermatrix":
      return `${baseText} matrix-text`;
    case "glitchcyber":
      return `${baseText} glitch-element`;
    default:
      return baseText;
  }
};

export const getThemeButtonClasses = (
  theme: ThemeDefinition,
  variant: "primary" | "secondary" | "accent" = "primary",
): string => {
  const baseButton =
    "relative overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95";
  const themeSpecific = getThemeClasses(theme);

  let gradientClass = "";
  switch (variant) {
    case "primary":
      gradientClass = `bg-gradient-to-r ${theme.gradients.primary}`;
      break;
    case "secondary":
      gradientClass = `bg-gradient-to-r ${theme.gradients.secondary}`;
      break;
    case "accent":
      gradientClass = `bg-gradient-to-r ${theme.gradients.accent}`;
      break;
  }

  return `${baseButton} ${gradientClass} ${themeSpecific}`.trim();
};

export const getThemeIconClasses = (theme: ThemeDefinition): string => {
  const baseIcon = "transition-all duration-300";

  switch (theme.id) {
    case "hackermatrix":
      return `${baseIcon} text-green-300`;
    case "glitchcyber":
      return `${baseIcon} text-cyan-300`;
    default:
      return `${baseIcon} text-gray-300`;
  }
};

export const getThemeGradientOverlay = (
  theme: ThemeDefinition,
  opacity: number = 0.1,
): string => {
  return `absolute inset-0 bg-gradient-to-br ${theme.gradients.primary.replace(/from-(\w+)-(\d+)/, `from-$1-$2/${opacity * 100}`).replace(/to-(\w+)-(\d+)/, `to-$1-$2/${opacity * 100}`)} pointer-events-none`;
};

export const getThemeParticleEffect = (theme: ThemeDefinition): string => {
  switch (theme.id) {
    case "hackermatrix":
      return "matrix-particles";
    case "glitchcyber":
      return "glitch-particles";
    default:
      return "";
  }
};

export const getThemeHoverEffect = (theme: ThemeDefinition): string => {
  const baseHover = "transition-all duration-300 hover:shadow-2xl";

  switch (theme.id) {
    case "hackermatrix":
      return `${baseHover} hover:shadow-green-500/50`;
    case "glitchcyber":
      return `${baseHover} hover:shadow-cyan-500/50`;
    default:
      return baseHover;
  }
};

// Animation utility
export const getThemeAnimation = (theme: ThemeDefinition): string => {
  switch (theme.id) {
    case "glitchcyber":
      return "animate-ping";
    default:
      return "";
  }
};
