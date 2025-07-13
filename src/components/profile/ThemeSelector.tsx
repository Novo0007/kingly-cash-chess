import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Check,
  Palette,
  Sparkles,
  Star,
  Eye,
  Zap,
  Crown,
  Flame,
  Snowflake,
  Waves,
  Gem,
  Sun,
} from "lucide-react";
import { toast } from "sonner";
import type { ThemeId } from "@/types/themes";

interface ThemeSelectorProps {
  onBack?: () => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ onBack }) => {
  const { currentTheme, setTheme, themeId, allThemes } = useTheme();
  const [previewTheme, setPreviewTheme] = useState<ThemeId | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleThemeChange = (newThemeId: string) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setTheme(newThemeId as ThemeId);
      setPreviewTheme(null);
      setIsTransitioning(false);
      toast.success(
        `🎨 Theme changed to ${allThemes.find((t) => t.id === newThemeId)?.name}!`,
        {
          style: {
            background:
              "linear-gradient(135deg, rgba(168, 85, 247, 0.9), rgba(59, 130, 246, 0.9))",
            color: "white",
            border: "none",
          },
        },
      );
    }, 300);
  };

  const handlePreviewTheme = (themeId: ThemeId) => {
    setPreviewTheme(themeId);
    setTimeout(() => setPreviewTheme(null), 2000);
  };

  const getThemeIcon = (themeId: string) => {
    const icons = {
      glitchcyber: "⚡",
      hackermatrix: "🔰",
      glowyfun: "✨",
      dreampixels: "🌙",
      mindmaze: "🧠",
      pixelnova: "🌟",
      default: "🎯",
    };
    return icons[themeId as keyof typeof icons] || "🎨";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl animate-pulse"></div>
        <div className="relative flex items-center gap-4 mb-6 p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full blur-md opacity-60 animate-pulse"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Palette className="h-5 w-5 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Theme Selector
            </h1>
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
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

      {/* Theme Grid */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-500 ${isTransitioning ? "scale-95 opacity-50" : "scale-100 opacity-100"}`}
      >
        {allThemes.map((theme, index) => {
          const isSelected = theme.id === themeId;
          const isPreviewing = previewTheme === theme.id;

          return (
            <div key={theme.id} className="relative group">
              {/* Enhanced Glow Effect */}
              <div
                className={`absolute -inset-2 bg-gradient-to-r ${theme.gradients.primary} rounded-2xl blur-xl transition-all duration-700 ${
                  isSelected
                    ? "opacity-80 scale-110"
                    : isPreviewing
                      ? "opacity-60 scale-105"
                      : "opacity-30 group-hover:opacity-60 group-hover:scale-105"
                }`}
              ></div>

              <Card
                className={`relative backdrop-blur-xl bg-gradient-to-br ${theme.gradients.primary.replace(/from-(\w+)-(\d+)/, "from-$1-$2/90").replace(/to-(\w+)-(\d+)/, "to-$1-$2/90")} cursor-pointer transform transition-all duration-500 hover:scale-[1.03] active:scale-[0.97] rounded-2xl overflow-hidden border-2 ${
                  isSelected
                    ? "border-white/60 shadow-2xl scale-[1.02]"
                    : isPreviewing
                      ? "border-white/50 shadow-xl scale-[1.01]"
                      : "border-white/20 hover:border-white/40"
                } ${theme.id === "hackermatrix" ? "matrix-card" : ""} ${
                  theme.id === "glitchcyber" ? "glitch-card" : ""
                }`}
                onClick={() => handleThemeChange(theme.id)}
              >
                {/* Enhanced Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className={`absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-16 translate-x-16 transition-all duration-700 bg-white/10 group-hover:scale-110`}
                  ></div>

                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700"></div>

                  {/* Theme-specific animated elements */}
                  <div
                    className={`absolute top-4 right-4 transition-all duration-500 ${
                      isPreviewing
                        ? "scale-125 rotate-12"
                        : "scale-100 rotate-0"
                    }`}
                  >
                    <div
                      className="text-2xl animate-pulse"
                      style={{ animationDelay: `${index * 0.2}s` }}
                    >
                      {getThemeIcon(theme.id)}
                    </div>
                  </div>

                  <Sparkles
                    className={`absolute bottom-4 left-4 h-4 w-4 text-white/30 transition-all duration-500 ${
                      isPreviewing ? "animate-spin" : "animate-pulse"
                    }`}
                    style={{ animationDelay: `${index * 0.3}s` }}
                  />
                </div>

                <CardContent className="p-6 relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-3xl transition-all duration-300 ${
                          theme.id === "hackermatrix" ? "matrix-text" : ""
                        } ${theme.id === "glitchcyber" ? "glitch-text" : ""} ${
                          isPreviewing
                            ? "scale-110 rotate-6"
                            : "scale-100 rotate-0"
                        }`}
                      >
                        {theme.preview}
                      </div>
                      <div>
                        <h3
                          className={`text-white font-bold text-lg transition-all duration-300 ${
                            theme.id === "hackermatrix" ? "matrix-text" : ""
                          } ${
                            theme.id === "glitchcyber" ? "glitch-element" : ""
                          } ${isPreviewing ? "text-yellow-200" : ""}`}
                        >
                          {theme.name}
                        </h3>
                        <p className="text-white/80 text-sm">
                          {theme.description}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-sm opacity-60 animate-pulse"></div>
                        <div className="relative p-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Color Preview */}
                  <div className="flex gap-2 mb-4">
                    {[
                      theme.gradients.primary,
                      theme.gradients.secondary,
                      theme.gradients.accent,
                    ].map((gradient, idx) => (
                      <div
                        key={idx}
                        className={`h-5 w-5 rounded-full bg-gradient-to-r ${gradient} border border-white/30 transition-all duration-300 hover:scale-110 hover:rotate-12 ${
                          isPreviewing ? "animate-pulse" : ""
                        }`}
                      ></div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 bg-white/10 text-white border-white/20 hover:bg-white/20 transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewTheme(theme.id);
                      }}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Preview
                    </Button>

                    <Button
                      variant={isSelected ? "secondary" : "outline"}
                      size="sm"
                      className={`flex-1 transition-all duration-300 ${
                        isSelected
                          ? "bg-white/30 text-white border-white/40 hover:bg-white/40"
                          : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleThemeChange(theme.id);
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Apply
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Theme Info */}
      <Card className="bg-gradient-to-r from-gray-700/80 to-gray-800/80 border-2 border-gray-600/50 rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
              <div className="relative text-4xl">🎨</div>
            </div>

            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Personalize Your Experience
            </h3>

            <p className="text-gray-300 max-w-md mx-auto">
              Choose from our carefully crafted themes to customize your gaming
              experience. Each theme is optimized for both mobile and desktop
              interfaces.
            </p>

            <div className="flex items-center justify-center gap-2 mt-4">
              <Badge
                variant="secondary"
                className="bg-white/10 text-gray-300 border-white/20"
              >
                Mobile Optimized
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/10 text-gray-300 border-white/20"
              >
                Auto-Save
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/10 text-gray-300 border-white/20"
              >
                Instant Apply
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
