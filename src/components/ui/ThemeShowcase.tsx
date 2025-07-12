import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import {
  getThemeClasses,
  getThemeButtonClasses,
  getThemeIconClasses,
  getThemeParticleEffect,
} from "@/utils/themeUtils";
import {
  Sparkles,
  Star,
  Crown,
  Zap,
  Flame,
  Snowflake,
  Leaf,
  Gem,
  Sun,
  Waves,
} from "lucide-react";

export const ThemeShowcase: React.FC = () => {
  const { currentTheme } = useTheme();

  const showcaseItems = [
    {
      title: "Dynamic Cards",
      description: "Cards that adapt to your theme with unique animations",
      icon: Star,
      classes: "cosmic-particles ice-particles",
    },
    {
      title: "Interactive Buttons",
      description: "Buttons with theme-specific hover effects and gradients",
      icon: Zap,
      classes: "fire-particles gold-particles",
    },
    {
      title: "Animated Elements",
      description: "UI elements with theme-matching particle effects",
      icon: Sparkles,
      classes: "bubble-particles leaf-particles",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Theme Demo Header */}
      <Card
        className={`${getThemeClasses(currentTheme)} ${getThemeParticleEffect(currentTheme)}`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className={`text-2xl ${getThemeIconClasses(currentTheme)}`}>
              {currentTheme.preview}
            </div>
            <div>
              <h3 className="text-xl font-bold">{currentTheme.name} Theme</h3>
              <p className="text-sm text-muted-foreground">
                {currentTheme.description}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {showcaseItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl bg-gradient-to-br ${currentTheme.gradients.secondary} ${item.classes} relative overflow-hidden`}
                >
                  <div className="relative z-10">
                    <Icon
                      className={`h-8 w-8 mb-2 ${getThemeIconClasses(currentTheme)}`}
                    />
                    <h4 className="font-semibold text-white mb-1">
                      {item.title}
                    </h4>
                    <p className="text-white/80 text-sm">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Buttons Demo */}
      <Card className={getThemeClasses(currentTheme)}>
        <CardHeader>
          <CardTitle>Interactive Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className={getThemeButtonClasses(currentTheme, "primary")}>
              <Crown className="h-4 w-4 mr-2" />
              Primary Action
            </Button>
            <Button
              className={getThemeButtonClasses(currentTheme, "secondary")}
            >
              <Star className="h-4 w-4 mr-2" />
              Secondary
            </Button>
            <Button className={getThemeButtonClasses(currentTheme, "accent")}>
              <Sparkles className="h-4 w-4 mr-2" />
              Accent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Theme Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Flame, label: "Dynamic Effects", color: "text-red-400" },
          {
            icon: Snowflake,
            label: "Smooth Transitions",
            color: "text-blue-400",
          },
          { icon: Leaf, label: "Natural Animations", color: "text-green-400" },
          { icon: Gem, label: "Premium Feel", color: "text-purple-400" },
        ].map((feature, index) => {
          const Icon = feature.icon;
          return (
            <Card
              key={index}
              className={`${getThemeClasses(currentTheme)} hover:scale-105 transition-all duration-300`}
            >
              <CardContent className="p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${feature.color}`} />
                <Badge variant="secondary" className="text-xs">
                  {feature.label}
                </Badge>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
