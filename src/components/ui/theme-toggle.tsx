import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { currentTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    // Toggle between light and dark themes
    const isDarkTheme =
      currentTheme.id === "charcoal" ||
      currentTheme.id === "mindmaze" ||
      currentTheme.id === "hackermatrix" ||
      currentTheme.id === "glitchcyber" ||
      currentTheme.id === "pixelnova" ||
      currentTheme.id === "glowyfun";

    if (isDarkTheme) {
      // Switch to light theme
      setTheme("softsunrise");
    } else {
      // Switch to dark theme
      setTheme("charcoal");
    }
  };

  const isDark =
    currentTheme.id === "charcoal" ||
    currentTheme.id === "mindmaze" ||
    currentTheme.id === "hackermatrix" ||
    currentTheme.id === "glitchcyber" ||
    currentTheme.id === "pixelnova" ||
    currentTheme.id === "glowyfun";

  return (
    <Button
      onClick={toggleTheme}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 hover:bg-primary/10 transition-colors duration-200"
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-yellow-500" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
