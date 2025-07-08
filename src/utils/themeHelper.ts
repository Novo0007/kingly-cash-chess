import { themes, type ThemeId } from "@/types/themes";

export const getThemeById = (id: ThemeId) => {
  return themes.find((theme) => theme.id === id) || themes[0];
};

export const getThemeDisplayName = (id: ThemeId) => {
  const theme = getThemeById(id);
  return `${theme.preview} ${theme.name}`;
};

export const isValidThemeId = (id: string): id is ThemeId => {
  return themes.some((theme) => theme.id === id);
};

export const getRandomTheme = () => {
  const randomIndex = Math.floor(Math.random() * themes.length);
  return themes[randomIndex];
};

export const getThemePreview = (id: ThemeId) => {
  const theme = getThemeById(id);
  return {
    name: theme.name,
    preview: theme.preview,
    primaryGradient: theme.gradients.primary,
    description: theme.description,
  };
};

export const hasSpecialEffects = (id: ThemeId) => {
  return id === "hackermatrix" || id === "glitchcyber";
};

export const getThemeCategory = (id: ThemeId) => {
  if (id === "hackermatrix" || id === "glitchcyber") return "Special Effects";
  if (id === "pixelnova" || id === "glowyfun") return "Vibrant & Fun";
  if (id === "mindmaze" || id === "default") return "Professional";
  if (id === "dreampixels") return "Soft & Dreamy";
  return "Other";
};

export const getThemeAnimation = (id: ThemeId) => {
  switch (id) {
    case "hackermatrix":
      return "matrix-rain";
    case "glitchcyber":
      return "glitch-effects";
    case "pixelnova":
      return "neon-glow";
    case "glowyfun":
      return "fun-bounce";
    default:
      return "default";
  }
};
