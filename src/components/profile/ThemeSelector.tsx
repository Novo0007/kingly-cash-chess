import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, Monitor, Palette, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface ThemeSelectorProps {
  onBack?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onBack }) => {
  const {
    currentTheme,
    setTheme,
    themeId,
    isDark,
    toggleTheme,
    setSystemTheme,
  } = useTheme();

  const handleThemeChange = (newThemeId: "light" | "dark") => {
    setTheme(newThemeId);
    toast.success(
      `🎨 Theme changed to ${newThemeId === "light" ? "Light" : "Dark"} mode!`,
      {
        style: {
          background: isDark
            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9))"
            : "linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))",
          color: "white",
          border: "none",
        },
      },
    );
  };

  const handleSystemTheme = () => {
    setSystemTheme();
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    toast.success(
      `🖥️ Using system theme (${systemPrefersDark ? "Dark" : "Light"})!`,
      {
        style: {
          background: isDark
            ? "linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9))"
            : "linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))",
          color: "white",
          border: "none",
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur-xl animate-pulse"></div>
        <div className="relative flex items-center gap-4 mb-6 p-4 backdrop-blur-sm bg-card/80 rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent rounded-full blur-md opacity-60 animate-pulse"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-primary to-accent rounded-full flex items-center justify-center">
                <Palette className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Theme Settings
            </h1>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Current Theme Display */}
      <Card className="relative overflow-hidden border-2 border-primary/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="text-2xl">{currentTheme.preview}</div>
            <div>
              <h3 className="text-xl font-bold">Current Theme</h3>
              <p className="text-sm text-muted-foreground">
                {currentTheme.name}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-muted-foreground mb-4">
            {currentTheme.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <div
              className={`h-6 w-6 rounded-full bg-gradient-to-r ${currentTheme.gradients.primary} border border-border`}
            ></div>
            <div
              className={`h-6 w-6 rounded-full bg-gradient-to-r ${currentTheme.gradients.secondary} border border-border`}
            ></div>
            <div
              className={`h-6 w-6 rounded-full bg-gradient-to-r ${currentTheme.gradients.accent} border border-border`}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Theme Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Light Theme */}
        <Card
          className={`relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-2xl overflow-hidden border-2 ${
            themeId === "light"
              ? "border-primary/60 shadow-2xl bg-gradient-to-br from-blue-50 to-indigo-50"
              : "border-border hover:border-primary/40 bg-card"
          }`}
          onClick={() => handleThemeChange("light")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">☀️</div>
                <div>
                  <h3 className="font-bold text-lg">Light Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Clean and bright interface
                  </p>
                </div>
              </div>
              {themeId === "light" && (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-sm opacity-60 animate-pulse"></div>
                  <div className="relative p-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-500 to-violet-600 border border-border"></div>
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-border"></div>
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-border"></div>
            </div>
            <Button
              variant={themeId === "light" ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleThemeChange("light");
              }}
            >
              <Sun className="h-3 w-3 mr-2" />
              {themeId === "light" ? "Active" : "Activate"}
            </Button>
          </CardContent>
        </Card>

        {/* Dark Theme */}
        <Card
          className={`relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-2xl overflow-hidden border-2 ${
            themeId === "dark"
              ? "border-primary/60 shadow-2xl bg-gradient-to-br from-slate-800 to-slate-900"
              : "border-border hover:border-primary/40 bg-card"
          }`}
          onClick={() => handleThemeChange("dark")}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-violet-600/10"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🌙</div>
                <div>
                  <h3 className="font-bold text-lg">Dark Mode</h3>
                  <p className="text-sm text-muted-foreground">
                    Easy on the eyes
                  </p>
                </div>
              </div>
              {themeId === "dark" && (
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/30 rounded-full blur-sm opacity-60 animate-pulse"></div>
                  <div className="relative p-2 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-violet-700 border border-border"></div>
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-slate-800 to-slate-900 border border-border"></div>
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-border"></div>
            </div>
            <Button
              variant={themeId === "dark" ? "default" : "outline"}
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleThemeChange("dark");
              }}
            >
              <Moon className="h-3 w-3 mr-2" />
              {themeId === "dark" ? "Active" : "Activate"}
            </Button>
          </CardContent>
        </Card>

        {/* System Theme */}
        <Card
          className="relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-2xl overflow-hidden border-2 border-border hover:border-primary/40 bg-card"
          onClick={handleSystemTheme}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🖥️</div>
                <div>
                  <h3 className="font-bold text-lg">System</h3>
                  <p className="text-sm text-muted-foreground">
                    Follow system settings
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mb-4">
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 border border-border"></div>
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 border border-border"></div>
              <div className="h-5 w-5 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 border border-border"></div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={(e) => {
                e.stopPropagation();
                handleSystemTheme();
              }}
            >
              <Monitor className="h-3 w-3 mr-2" />
              Use System
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Toggle */}
      <Card className="bg-gradient-to-r from-card/80 to-card/60 border-2 border-border rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Quick Toggle</h3>
              <p className="text-sm text-muted-foreground">
                Switch between light and dark themes instantly
              </p>
            </div>
            <Button
              onClick={toggleTheme}
              variant="outline"
              size="lg"
              className="relative overflow-hidden group"
            >
              <div className="flex items-center gap-2">
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4" />
                    Switch to Light
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4" />
                    Switch to Dark
                  </>
                )}
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Info */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-2 border-border rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative text-4xl">🎨</div>
            </div>

            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Beautiful by Design
            </h3>

            <p className="text-muted-foreground max-w-md mx-auto">
              Our carefully crafted themes ensure optimal readability and visual
              appeal across all devices and screen sizes.
            </p>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                Auto-Save
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                System Sync
              </Badge>
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20"
              >
                Mobile Optimized
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
