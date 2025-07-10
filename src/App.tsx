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
      {/* Bold Dynamic Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentTheme.gradients.primary}/20 via-background to-${currentTheme.gradients.secondary}/20`}
      >
        {/* Minimal Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full opacity-40 animate-pulse`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="text-center space-y-8 max-w-md mx-auto w-full">
          {/* Bold Logo */}
          <div className="relative animate-scaleIn">
            <div
              className={`absolute -inset-8 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full blur-3xl opacity-30 animate-pulse`}
            ></div>
            <div
              className={`relative w-24 h-24 mx-auto bg-gradient-to-br ${currentTheme.gradients.primary} rounded-3xl flex items-center justify-center shadow-2xl`}
            >
              <div className="text-5xl font-black text-white">🎮</div>
            </div>
          </div>

          {/* Bold Typography */}
          <div className="space-y-4 animate-fadeInUp delay-200">
            <h1
              className={`text-5xl md:text-6xl font-black bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent`}
            >
              NNC GAMES
            </h1>
            <p
              className={`text-xl font-bold bg-gradient-to-r ${currentTheme.gradients.primary} bg-clip-text text-transparent`}
            >
              GAMING HUB
            </p>
          </div>

          {/* Bold Loading Animation */}
          <div className="space-y-6 animate-fadeInUp delay-300">
            {/* Large Spinning Ring */}
            <div className="relative w-20 h-20 mx-auto">
              <div className="absolute inset-0 border-4 border-muted/20 rounded-full"></div>
              <div
                className={`absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin`}
              ></div>
              <div
                className={`absolute inset-2 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full opacity-30 animate-pulse`}
              ></div>
            </div>

            {/* Bold Progress Bar */}
            <div className="w-full max-w-sm mx-auto space-y-3">
              <div className="relative h-3 bg-muted/20 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-foreground">
                  {loadingProgress < 30
                    ? "Loading..."
                    : loadingProgress < 70
                      ? "Preparing..."
                      : loadingProgress < 95
                        ? "Almost Ready..."
                        : "Welcome!"}
                </span>
                <span
                  className={`text-lg font-black bg-gradient-to-r ${currentTheme.gradients.primary} bg-clip-text text-transparent`}
                >
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>
          </div>
        </div>
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
