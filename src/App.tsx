import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { ChessRulesPage } from "./pages/ChessRulesPage";
import { LudoRulesPage } from "./pages/LudoRulesPage";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { DraggableMusicControl } from "@/components/music/DraggableMusicControl";

const queryClient = new QueryClient();

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
      <div className="fixed inset-0 overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-8">
          <div className="text-center space-y-8 max-w-lg mx-auto w-full">
            {/* Clean Logo Design */}
            <div className="relative">
              <div className="bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm rounded-3xl p-8 border border-border">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-primary-foreground"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C13.1 2 14 2.9 14 4V10L16 12L14 14V20C14 21.1 13.1 22 12 22S10 21.1 10 20V14L8 12L10 10V4C10 2.9 10.9 2 12 2Z" />
                    <circle cx="12" cy="8" r="2" />
                    <circle cx="12" cy="16" r="2" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Clean Typography */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                GAME HUB
              </h1>
              <p className="text-lg text-muted-foreground">
                BY{" "}
                <span className="font-semibold text-foreground">NNC GAMES / Hacker Team Legacy 😜</span>
              </p>
            </div>

            {/* Simple Loading Animation */}
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto border-4 border-muted border-t-primary rounded-full"></div>

              {/* Progress Bar */}
              <div className="w-full max-w-sm mx-auto space-y-3">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  />
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {loadingProgress < 25
                      ? "Initializing..."
                      : loadingProgress < 50
                        ? "Loading Games..."
                        : loadingProgress < 75
                          ? "Setting Up..."
                          : loadingProgress < 95
                            ? "Almost Ready..."
                            : "Welcome!"}
                  </span>
                  <span className="font-semibold">
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-3 mt-8">
              {[
                { icon: "🔒", title: "Secure", desc: "Safe & protected" },
                { icon: "👥", title: "Multiplayer", desc: "Play together" },
                { icon: "⚡", title: "Fast", desc: "Lightning quick" },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-card border border-border rounded-2xl p-4 text-center"
                >
                  <div className="text-2xl mb-2">{feature.icon}</div>
                  <h3 className="text-sm font-semibold text-card-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Status */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-sm text-card-foreground">
                🎮 Welcome to Game Hub 
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <p className="text-xs text-muted-foreground">© 2024 NNC Games / Hacker See You 😘</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          {/* Draggable Background Music Control */}
          <DraggableMusicControl isPlaying={isPlaying} onToggle={toggleMusic} />

          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/chess-rules" element={<ChessRulesPage />} />
              <Route path="/ludo-rules" element={<LudoRulesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
