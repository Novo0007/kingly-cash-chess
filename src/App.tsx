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
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full opacity-30 particle-animation`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${6 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6">
        <div className="text-center space-y-6 sm:space-y-8 max-w-sm sm:max-w-md mx-auto w-full">
          {/* Themed Logo with Glow Effect */}
          <div className="relative group animate-scaleIn">
            <div
              className={`absolute -inset-6 sm:-inset-8 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full blur-2xl opacity-20 loading-glow`}
            ></div>
            <div
              className={`relative bg-gradient-to-br ${currentTheme.gradients.secondary}/20 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-primary/20 shadow-2xl loading-float`}
            >
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto bg-gradient-to-br ${currentTheme.gradients.primary} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl transform transition-all duration-500 hover:scale-110 hover:rotate-12`}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl animate-bounce">
                  {currentTheme.preview}
                </div>
              </div>
            </div>
          </div>

          {/* Themed Typography */}
          <div className="space-y-2 sm:space-y-3 md:space-y-4 animate-fadeInUp delay-200">
            <h1
              className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent loading-shimmer relative`}
            >
              <span className="relative z-10">
                {currentTheme.name} GAME HUB
              </span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground font-medium px-2">
              BY{" "}
              <span
                className={`font-bold bg-gradient-to-r ${currentTheme.gradients.primary} bg-clip-text text-transparent`}
              >
                NNC GAMES / HACKER TEAM LEGACY {currentTheme.preview}
              </span>
            </p>
          </div>

          {/* Elegant Loading Animation */}
          <div className="space-y-4 sm:space-y-6 animate-fadeInUp delay-300">
            {/* Enhanced Spinning Ring */}
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto">
              <div
                className={`absolute inset-0 border-2 sm:border-3 md:border-4 border-muted/20 rounded-full`}
              ></div>
              <div
                className={`absolute inset-0 border-2 sm:border-3 md:border-4 border-transparent border-t-primary rounded-full animate-spin`}
                style={{ animationDuration: "1.5s" }}
              ></div>
              <div
                className={`absolute inset-1 sm:inset-2 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full opacity-20 loading-glow`}
              ></div>
              <div
                className={`absolute inset-0 border border-primary/20 rounded-full animate-ping`}
                style={{ animationDuration: "3s" }}
              ></div>
            </div>

            {/* Beautiful Progress Bar */}
            <div className="w-full max-w-xs mx-auto space-y-2 sm:space-y-3 px-2">
              <div className="relative h-1.5 sm:h-2 bg-muted/20 rounded-full overflow-hidden backdrop-blur-sm border border-primary/10">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full opacity-10 animate-pulse`}
                ></div>
                <div
                  className={`h-full bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full relative overflow-hidden transition-all duration-1000 ease-out shadow-lg`}
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 loading-shimmer"></div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.accent} opacity-50 animate-pulse`}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] sm:text-xs md:text-sm px-1">
                <span className="text-muted-foreground font-medium truncate flex-1 mr-2">
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
                <span
                  className={`font-bold bg-gradient-to-r ${currentTheme.gradients.primary} bg-clip-text text-transparent text-xs sm:text-sm md:text-base min-w-0 flex-shrink-0`}
                >
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>
          </div>

          {/* Themed Feature Cards */}
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 md:gap-3 mt-4 sm:mt-6 md:mt-8 px-2 animate-fadeInUp delay-400">
            {[
              { icon: "🔒", title: "Secure", desc: "Safe & protected" },
              { icon: "👥", title: "Multiplayer", desc: "Play together" },
              { icon: "⚡", title: "Fast", desc: "Lightning quick" },
            ].map((feature, index) => (
              <div
                key={index}
                className={`relative group bg-gradient-to-br ${currentTheme.gradients.secondary}/5 backdrop-blur-xl border border-primary/10 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 text-center transform transition-all duration-500 hover:scale-105 hover:shadow-lg animate-scaleIn`}
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div
                  className={`absolute -inset-0.5 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-lg sm:rounded-xl md:rounded-2xl blur opacity-0 group-hover:opacity-15 transition-all duration-500`}
                ></div>
                <div className="relative">
                  <div
                    className="text-base sm:text-lg md:text-xl lg:text-2xl mb-1 loading-float"
                    style={{
                      animationDelay: `${index * 0.2}s`,
                      animationDuration: `${3 + index * 0.5}s`,
                    }}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="text-[10px] sm:text-xs md:text-sm font-bold text-foreground leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground mt-0.5 sm:mt-1 leading-tight">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Themed Status Card */}
          <div
            className={`relative bg-gradient-to-r ${currentTheme.gradients.primary}/5 backdrop-blur-xl border border-primary/20 rounded-lg sm:rounded-xl md:rounded-2xl p-2 sm:p-3 md:p-4 overflow-hidden mx-2 animate-fadeInUp delay-500`}
          >
            <div
              className={`absolute -inset-2 sm:-inset-4 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-xl opacity-10 loading-glow`}
            ></div>
            <p className="relative text-[10px] sm:text-xs md:text-sm text-foreground font-medium text-center">
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
