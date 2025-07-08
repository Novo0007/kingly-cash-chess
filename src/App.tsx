import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ChessRulesPage } from "./pages/ChessRulesPage";
import { LudoRulesPage } from "./pages/LudoRulesPage";
import MazeRulesPage from "./pages/MazeRulesPage";
import { Game2048RulesPage } from "./pages/Game2048RulesPage";
import { MathRulesPage } from "./pages/MathRulesPage";
import WordSearchRulesPage from "./pages/WordSearchRulesPage";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { DraggableMusicControl } from "@/components/music/DraggableMusicControl";

const queryClient = new QueryClient();

const LoadingScreen = ({ loadingProgress }: { loadingProgress: number }) => {
  const { currentTheme } = useTheme();

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Dynamic Animated Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradients.primary}/10 via-background to-${currentTheme.gradients.secondary}/10`}
      >
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full opacity-20 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="text-center space-y-6 sm:space-y-8 max-w-sm sm:max-w-md mx-auto w-full">
          {/* Themed Logo with Glow Effect */}
          <div className="relative group">
            <div
              className={`absolute -inset-8 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full blur-2xl opacity-20 group-hover:opacity-30 animate-pulse transition-opacity duration-1000`}
            ></div>
            <div
              className={`relative bg-gradient-to-br ${currentTheme.gradients.secondary}/20 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-primary/20 shadow-2xl`}
            >
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br ${currentTheme.gradients.primary} rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300`}
              >
                <div className="text-3xl sm:text-4xl animate-bounce">
                  {currentTheme.preview}
                </div>
              </div>
            </div>
          </div>

          {/* Themed Typography */}
          <div className="space-y-3 sm:space-y-4">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent animate-pulse`}
            >
              {currentTheme.name} GAME HUB
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium">
              BY{" "}
              <span
                className={`font-bold bg-gradient-to-r ${currentTheme.gradients.primary} bg-clip-text text-transparent`}
              >
                NNC GAMES / HACKER TEAM LEGACY {currentTheme.preview}
              </span>
            </p>
          </div>

          {/* Elegant Loading Animation */}
          <div className="space-y-4 sm:space-y-6">
            {/* Spinning Ring */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 mx-auto">
              <div
                className={`absolute inset-0 border-4 border-muted/30 rounded-full`}
              ></div>
              <div
                className={`absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin`}
              ></div>
              <div
                className={`absolute inset-2 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full opacity-20 animate-pulse`}
              ></div>
            </div>

            {/* Beautiful Progress Bar */}
            <div className="w-full max-w-xs mx-auto space-y-3">
              <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full opacity-20 animate-pulse`}
                ></div>
                <div
                  className={`h-full bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full relative overflow-hidden transition-all duration-700 ease-out`}
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-muted-foreground font-medium">
                  {loadingProgress < 25
                    ? `Loading ${currentTheme.name}...`
                    : loadingProgress < 50
                      ? "Preparing Games..."
                      : loadingProgress < 75
                        ? "Setting Up UI..."
                        : loadingProgress < 95
                          ? "Almost Ready..."
                          : `Welcome to ${currentTheme.name}!`}
                </span>
                <span className={`font-bold text-primary text-sm sm:text-base`}>
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Themed Feature Cards */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-6 sm:mt-8">
            {[
              { icon: "🔒", title: "Secure", desc: "Safe & protected" },
              { icon: "👥", title: "Multiplayer", desc: "Play together" },
              { icon: "⚡", title: "Fast", desc: "Lightning quick" },
            ].map((feature, index) => (
              <div
                key={index}
                className={`relative group bg-gradient-to-br ${currentTheme.gradients.secondary}/10 backdrop-blur-xl border border-primary/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center hover:scale-105 transition-all duration-300 hover:shadow-lg`}
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-xl sm:rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                ></div>
                <div className="relative">
                  <div
                    className="text-xl sm:text-2xl mb-1 sm:mb-2 animate-bounce"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Themed Status Card */}
          <div
            className={`relative bg-gradient-to-r ${currentTheme.gradients.primary}/10 backdrop-blur-xl border border-primary/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 overflow-hidden`}
          >
            <div
              className={`absolute -inset-4 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-xl opacity-10 animate-pulse`}
            ></div>
            <p className="relative text-xs sm:text-sm text-foreground font-medium">
              {currentTheme.preview} Welcome to {currentTheme.name} Game Hub
            </p>
          </div>
        </div>
      </div>

      {/* Floating Footer */}
      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 text-center">
        <p className="text-[10px] sm:text-xs text-muted-foreground/70 font-medium px-4">
          © 2024 NNC Games / {currentTheme.name} Theme / Hacker See You{" "}
          {currentTheme.preview}
        </p>
      </div>
    </div>
  );
};

const App = () => {
  const [appLoading, setAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize background music
  const { isPlaying, toggleMusic } = useBackgroundMusic({
    volume: 0.2,
    fadeInDuration: 4000,
  });

  useEffect(() => {
    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 100);

    // App loading screen for 3 seconds
    const loadingTimer = setTimeout(() => {
      setAppLoading(false);
    }, 3000);

    return () => {
      clearTimeout(loadingTimer);
      clearInterval(progressInterval);
    };
  }, []);

  if (appLoading) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <CustomThemeProvider>
          <LoadingScreen loadingProgress={loadingProgress} />
        </CustomThemeProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <CustomThemeProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            {/* Draggable Background Music Control */}
            <DraggableMusicControl
              isPlaying={isPlaying}
              onToggle={toggleMusic}
            />

            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chess-rules" element={<ChessRulesPage />} />
                <Route path="/ludo-rules" element={<LudoRulesPage />} />
                <Route path="/maze-rules" element={<MazeRulesPage />} />
                <Route path="/game2048-rules" element={<Game2048RulesPage />} />
                <Route path="/math-rules" element={<MathRulesPage />} />
                <Route
                  path="/wordsearch-rules"
                  element={<WordSearchRulesPage />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
};

export default App;
