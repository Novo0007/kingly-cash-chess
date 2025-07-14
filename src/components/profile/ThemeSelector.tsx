import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Sun,
  Moon,
  Monitor,
  Palette,
  Sparkles,
  Check,
  Heart,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import type { ThemeId } from "@/types/themes";

interface ThemeSelectorProps {
  onBack?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onBack }) => {
  const { currentTheme, setTheme, themeId, allThemes, isDark, setSystemTheme } =
    useTheme();

  const handleThemeChange = (newThemeId: ThemeId) => {
    setTheme(newThemeId);
    const theme = allThemes.find((t) => t.id === newThemeId);
    toast.success(`🎨 Theme changed to ${theme?.name || newThemeId}!`, {
      style: {
        background: isDark
          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(139, 92, 246, 0.9))"
          : "linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(168, 85, 247, 0.9))",
        color: "white",
        border: "none",
      },
    });
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

  // Categorize themes
  const basicThemes = allThemes.filter(
    (theme) => theme.id === "light" || theme.id === "dark",
  );

  const animeThemes = allThemes.filter(
    (theme) => !["light", "dark"].includes(theme.id),
  );

  const getThemeIcon = (theme: any) => {
    if (theme.id === "light") return <Sun className="h-5 w-5" />;
    if (theme.id === "dark") return <Moon className="h-5 w-5" />;
    if (theme.name.toLowerCase().includes("love"))
      return <Heart className="h-5 w-5" />;
    return <Star className="h-5 w-5" />;
  };

  const renderThemeCard = (theme: any, isActive: boolean) => (
    <Card
      key={theme.id}
      className={`relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-2xl overflow-hidden border-2 ${
        isActive
          ? "border-primary/60 shadow-2xl"
          : "border-border hover:border-primary/40"
      }`}
      onClick={() => handleThemeChange(theme.id)}
    >
      {/* Theme preview background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.gradients.primary}/20 to-${theme.gradients.secondary}/10`}
      ></div>

      <CardContent className="p-4 relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{theme.preview}</div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-sm truncate">{theme.name}</h3>
              <p className="text-xs text-muted-foreground truncate">
                {theme.description}
              </p>
            </div>
          </div>
          {isActive && (
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-sm opacity-60 animate-pulse"></div>
              <div className="relative p-1.5 bg-primary/20 backdrop-blur-sm rounded-full border border-primary/30">
                <Check className="h-3 w-3 text-primary" />
              </div>
            </div>
          )}
        </div>

        {/* Color swatches */}
        <div className="flex gap-1.5 mb-3">
          <div
            className={`h-4 w-4 rounded-full bg-gradient-to-r ${theme.gradients.primary} border border-border/50 shadow-sm`}
          ></div>
          <div
            className={`h-4 w-4 rounded-full bg-gradient-to-r ${theme.gradients.secondary} border border-border/50 shadow-sm`}
          ></div>
          <div
            className={`h-4 w-4 rounded-full bg-gradient-to-r ${theme.gradients.accent} border border-border/50 shadow-sm`}
          ></div>
        </div>

        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          className="w-full text-xs h-8"
          onClick={(e) => {
            e.stopPropagation();
            handleThemeChange(theme.id);
          }}
        >
          {getThemeIcon(theme)}
          <span className="ml-1.5 truncate">
            {isActive ? "Active" : "Select"}
          </span>
        </Button>
      </CardContent>
    </Card>
  );

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
              Theme Gallery
            </h1>
            <Sparkles className="h-6 w-6 text-primary animate-pulse" />
          </div>
        </div>
      </div>

      {/* Current Theme Display */}
      <Card className="relative overflow-hidden border-2 border-primary/50 bg-gradient-to-r from-card/80 to-card/60 backdrop-blur-sm">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradients.primary}/10 to-${currentTheme.gradients.accent}/10`}
        ></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3">
            <div className="text-3xl">{currentTheme.preview}</div>
            <div>
              <h3 className="text-xl font-bold">{currentTheme.name}</h3>
              <p className="text-sm text-muted-foreground">Currently Active</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <p className="text-muted-foreground mb-4">
            {currentTheme.description}
          </p>
          <div className="flex flex-wrap gap-2">
            <div
              className={`h-6 w-6 rounded-full bg-gradient-to-r ${currentTheme.gradients.primary} border border-border shadow-sm`}
            ></div>
            <div
              className={`h-6 w-6 rounded-full bg-gradient-to-r ${currentTheme.gradients.secondary} border border-border shadow-sm`}
            ></div>
            <div
              className={`h-6 w-6 rounded-full bg-gradient-to-r ${currentTheme.gradients.accent} border border-border shadow-sm`}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Themes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Basic Themes</h2>
          <Badge variant="secondary" className="text-xs">
            Classic
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {basicThemes.map((theme) =>
            renderThemeCard(theme, themeId === theme.id),
          )}

          {/* System Theme Card */}
          <Card
            className="relative cursor-pointer transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-2xl overflow-hidden border-2 border-border hover:border-primary/40 bg-card"
            onClick={handleSystemTheme}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5"></div>
            <CardContent className="p-4 relative z-10">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🖥️</div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm">System</h3>
                    <p className="text-xs text-muted-foreground">
                      Follow system settings
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 mb-3">
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-gray-500 to-gray-600 border border-border/50 shadow-sm"></div>
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 border border-border/50 shadow-sm"></div>
                <div className="h-4 w-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 border border-border/50 shadow-sm"></div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs h-8"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSystemTheme();
                }}
              >
                <Monitor className="h-3 w-3 mr-1.5" />
                Use System
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Anime/Love Themes Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Anime & Love Aesthetics</h2>
          <Badge
            variant="secondary"
            className="text-xs bg-pink-100 text-pink-700"
          >
            ✨ Kawaii
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {animeThemes.map((theme) =>
            renderThemeCard(theme, themeId === theme.id),
          )}
        </div>
      </div>

      {/* Theme Features Info */}
      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-2 border-border rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/30 to-accent/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative text-4xl">🎨</div>
            </div>

            <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Immersive Experience
            </h3>

            <p className="text-muted-foreground max-w-md mx-auto">
              Transform your gaming experience with our collection of beautiful
              themes. From classic elegance to kawaii anime aesthetics - find
              your perfect style!
            </p>

            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
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
              <Badge
                variant="secondary"
                className="bg-pink-100 text-pink-700 border-pink-200"
              >
                💕 Anime Inspired
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
