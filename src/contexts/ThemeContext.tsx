import React, { createContext, useContext, useEffect, useState } from "react";
import { themes, type ThemeId, type ThemeDefinition } from "@/types/themes";

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  setTheme: (themeId: ThemeId) => void;
  themeId: ThemeId;
  allThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Custom hook to use theme context
const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { useTheme };

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    // Get theme from localStorage or default to "default"
    const savedTheme = localStorage.getItem("theme") as ThemeId;
    return savedTheme && themes.find((t) => t.id === savedTheme)
      ? savedTheme
      : "default";
  });

  const currentTheme =
    themes.find((theme) => theme.id === themeId) || themes[0];

  const setTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    localStorage.setItem("theme", newThemeId);
  };

  // Apply theme CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    const theme = currentTheme;

    // Apply all CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, "-$1").toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply gradient variables
    Object.entries(theme.gradients).forEach(([key, value]) => {
      const cssVar = `--gradient-${key}`;
      root.style.setProperty(cssVar, value);
    });

    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, "");
    document.body.classList.add(`theme-${themeId}`);
  }, [currentTheme, themeId]);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themeId,
    allThemes: themes,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
