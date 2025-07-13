import React, { useEffect, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Gamepad2,
  Sparkles,
  Zap,
  Code,
  Trophy,
  Target,
  Crown,
  Star,
} from "lucide-react";

interface AppLoadingScreenProps {
  onLoadingComplete?: () => void;
  loadingTime?: number; // in milliseconds
}

export const AppLoadingScreen: React.FC<AppLoadingScreenProps> = ({
  onLoadingComplete,
  loadingTime = 3000,
}) => {
  const { currentTheme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [currentIcon, setCurrentIcon] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  const loadingIcons = [
    Gamepad2,
    Code,
    Trophy,
    Target,
    Crown,
    Star,
    Sparkles,
    Zap,
  ];
  const loadingMessages = [
    "Initializing Game Hub...",
    "Loading CodeMaster...",
    "Preparing Chess Board...",
    "Setting up Puzzles...",
    "Loading Tournaments...",
    "Configuring Player Stats...",
    "Almost Ready...",
    "Welcome to Game Hub!",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 100 / (loadingTime / 100);

        // Update icon and text based on progress
        const iconIndex = Math.floor((newProgress / 100) * loadingIcons.length);
        setCurrentIcon(Math.min(iconIndex, loadingIcons.length - 1));

        const textIndex = Math.floor(
          (newProgress / 100) * loadingMessages.length,
        );
        setLoadingText(
          loadingMessages[Math.min(textIndex, loadingMessages.length - 1)],
        );

        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onLoadingComplete?.();
          }, 500);
          return 100;
        }

        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [loadingTime, onLoadingComplete]);

  const CurrentIcon = loadingIcons[currentIcon];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-muted flex items-center justify-center z-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 bg-secondary rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 bg-accent rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-primary rounded-full animate-pulse delay-700"></div>
      </div>

      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        {/* App Logo/Icon */}
        <div className="relative">
          <div
            className={`w-24 h-24 mx-auto bg-gradient-to-r ${currentTheme.gradients.primary} rounded-3xl flex items-center justify-center shadow-2xl transform transition-all duration-500 ${progress > 50 ? "scale-110" : "scale-100"}`}
          >
            <Gamepad2 className="w-12 h-12 text-white" />
          </div>

          {/* Floating animation icons */}
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
            <CurrentIcon className="w-4 h-4 text-white" />
          </div>
        </div>

        {/* App Title */}
        <div className="space-y-2">
          <h1
            className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent`}
          >
            Game Hub
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Your Ultimate Gaming Experience
          </p>
        </div>

        {/* Loading Progress */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${currentTheme.gradients.primary} transition-all duration-300 ease-out rounded-full relative`}
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          {/* Progress Text */}
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <span className="animate-pulse">{loadingText}</span>
            <span className="font-mono">{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Loading Features Preview */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div
            className={`p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 ${progress > 25 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Code className="w-6 h-6 text-primary mb-2" />
            <div className="text-xs font-medium text-foreground">
              CodeMaster
            </div>
            <div className="text-xs text-muted-foreground">
              Learn Programming
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 ${progress > 50 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Crown className="w-6 h-6 text-primary mb-2" />
            <div className="text-xs font-medium text-foreground">
              Chess Master
            </div>
            <div className="text-xs text-muted-foreground">
              Strategic Battles
            </div>
          </div>

          <div
            className={`p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 ${progress > 75 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Target className="w-6 h-6 text-primary mb-2" />
            <div className="text-xs font-medium text-foreground">Puzzles</div>
            <div className="text-xs text-muted-foreground">Brain Training</div>
          </div>

          <div
            className={`p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm transition-all duration-500 ${progress > 90 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Trophy className="w-6 h-6 text-primary mb-2" />
            <div className="text-xs font-medium text-foreground">
              Tournaments
            </div>
            <div className="text-xs text-muted-foreground">Win Prizes</div>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2 pt-4">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};
