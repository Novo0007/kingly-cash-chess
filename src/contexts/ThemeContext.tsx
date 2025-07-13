import React, { createContext, useContext, useEffect, useState } from "react";
import { themes, type ThemeId, type ThemeDefinition } from "@/types/themes";

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  setTheme: (themeId: ThemeId) => void;
  themeId: ThemeId;
  allThemes: ThemeDefinition[];
  isDark: boolean;
  toggleTheme: () => void;
  setSystemTheme: () => void;
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
    const savedTheme = localStorage.getItem("theme") as ThemeId;
    if (savedTheme && themes.find((t) => t.id === savedTheme)) {
      return savedTheme;
    }

    // Default to system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  });

  const currentTheme =
    themes.find((theme) => theme.id === themeId) || themes[0];
  const isDark = themeId === "dark";

  const setTheme = (newThemeId: ThemeId) => {
    setThemeId(newThemeId);
    localStorage.setItem("theme", newThemeId);
  };

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
  };

  const setSystemTheme = () => {
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(systemPrefersDark ? "dark" : "light");
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

    // Update document class for theme
    document.documentElement.classList.toggle("dark", isDark);

    // Add theme class to body for additional styling
    document.body.className = document.body.className.replace(/theme-\w+/g, "");
    document.body.classList.add(`theme-${themeId}`);
  }, [currentTheme, themeId, isDark]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        setSystemTheme();
      }
    };

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const value: ThemeContextType = {
    currentTheme,
    setTheme,
    themeId,
    allThemes: themes,
    isDark,
    toggleTheme,
    setSystemTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
