import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

  // Ultra-Modern Professional Gaming Loading Experience
  if (appLoading) {
    return (
      <div className="fixed inset-0 overflow-hidden font-body">
        {/* Natural Wood Background System */}
        <div className="absolute inset-0">
          {/* Primary Wood Gradient Layer */}
          <div className="absolute inset-0 wood-gradient-dark"></div>

          {/* Wood Texture Overlay */}
          <div className="absolute inset-0 opacity-60">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                  radial-gradient(ellipse at 20% 80%, hsl(25, 45%, 35%) 0%, transparent 40%),
                  radial-gradient(ellipse at 80% 20%, hsl(30, 40%, 65%) 0%, transparent 40%),
                  radial-gradient(ellipse at 40% 40%, hsl(25, 35%, 25%) 0%, transparent 30%),
                  radial-gradient(ellipse at 60% 80%, hsl(120, 30%, 40%) 0%, transparent 25%),
                  repeating-linear-gradient(90deg,
                    hsl(25, 35%, 20%) 0px,
                    hsl(25, 45%, 30%) 2px,
                    hsl(25, 35%, 20%) 4px,
                    hsl(25, 40%, 25%) 6px)
                `,
              }}
            ></div>
          </div>

          {/* Subtle Wood Grain Accents */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(15)].map((_, i) => {
              const colors = [
                "bg-amber-600",
                "bg-orange-600",
                "bg-yellow-700",
                "bg-green-700",
              ];
              const randomColor =
                colors[Math.floor(Math.random() * colors.length)];
              return (
                <div
                  key={i}
                  className={`absolute w-1 h-1 ${randomColor} rounded-full opacity-40`}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    boxShadow: `0 0 2px currentColor`,
                  }}
                ></div>
              );
            })}
          </div>

          {/* Wood Plank Pattern Overlay */}
          <div className="absolute inset-0 opacity-15">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="woodGrain"
                  width="60"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 0 10 Q 15 5 30 10 T 60 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.5"
                    className="text-amber-800"
                  />
                  <path
                    d="M 0 15 Q 20 12 40 15 T 60 15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.3"
                    className="text-amber-700"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#woodGrain)" />
            </svg>
          </div>
        </div>

        {/* Subtle Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Static Floating Orbs */}
          <div className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl"></div>
          <div className="absolute top-3/4 right-1/4 w-14 h-14 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-3/4 w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-full blur-xl"></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 sm:p-8">
          <div className="text-center space-y-10 sm:space-y-12 max-w-lg sm:max-w-xl mx-auto w-full">
            {/* Revolutionary Logo Design */}
            <div className="relative group">
              {/* Outer Glow Ring - Enhanced Vibrancy */}
              <div className="absolute -inset-10 bg-gradient-to-r from-purple-500/30 via-pink-500/30 via-cyan-500/30 to-green-500/30 rounded-full blur-3xl group-hover:blur-4xl transition-all duration-1000"></div>

              {/* Logo Container */}
              <div className="relative">
                <div className="electric-glass backdrop-blur-2xl rounded-full p-8 sm:p-12 border border-purple-300/40">
                  {/* Rotating Border - More Vibrant */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 via-cyan-500 to-green-500 opacity-85 blur-sm"></div>
                  <div className="absolute inset-0.5 rounded-full bg-slate-900/85 backdrop-blur-xl"></div>

                  {/* Logo Icon - Enhanced with Vibrant Colors */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 via-cyan-400 to-green-400 rounded-3xl electric-pulse transform rotate-45"
                      style={{ filter: "brightness(1.1)" }}
                    ></div>
                    <div className="absolute inset-3 bg-gradient-to-br from-white to-purple-50 rounded-2xl flex items-center justify-center transform -rotate-45">
                      <svg
                        className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600"
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
              </div>
            </div>

            {/* Advanced Typography System */}
            <div className="space-y-6">
              {/* Main Title - Ultra Vibrant */}
              <div className="relative">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading leading-none">
                  <span
                    className="block bg-gradient-to-r from-purple-200 via-pink-100 via-white to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl"
                    style={{ filter: "brightness(1.2)" }}
                  >
                    GAME
                  </span>
                  <span
                    className="block bg-gradient-to-r from-cyan-300 via-purple-300 via-pink-300 to-green-300 bg-clip-text text-transparent electric-text-gradient"
                    style={{ filter: "brightness(1.1)" }}
                  >
                    HUB
                  </span>
                </h1>

                {/* Subtitle with Enhanced Styling */}
                <div className="mt-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/25 via-pink-500/20 to-transparent blur-xl"></div>
                  <p className="relative text-xl sm:text-2xl md:text-3xl font-medium text-purple-200 font-body tracking-widest">
                    BY
                    <span
                      className="mx-3 font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent"
                      style={{ filter: "brightness(1.15)" }}
                    >
                      NNC GAMES
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Sophisticated Loading Animation */}
            <div className="relative space-y-8">
              {/* Simple Ring Spinner */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-purple-500/30"></div>
                <div className="absolute inset-2 rounded-full border-3 border-transparent border-t-purple-400 animate-spin"></div>

                {/* Center Dot */}
                <div className="absolute inset-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full opacity-50"></div>
              </div>

              {/* Enhanced Progress System */}
              <div className="w-full max-w-md mx-auto space-y-4">
                {/* Progress Track - Vibrant */}
                <div className="relative h-4 bg-slate-800/60 rounded-full overflow-hidden backdrop-blur-sm border border-purple-500/30">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/25 via-pink-400/20 to-transparent electric-shimmer"></div>
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 via-pink-500 via-cyan-500 to-green-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{
                      width: `${Math.min(loadingProgress, 100)}%`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  </div>
                </div>

                {/* Progress Info */}
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-blue-300 font-body">
                    {loadingProgress < 25
                      ? "🚀 Initializing Platform..."
                      : loadingProgress < 50
                        ? "⚡ Loading Game Engine..."
                        : loadingProgress < 75
                          ? "🎮 Preparing Interface..."
                          : loadingProgress < 95
                            ? "🎯 Finalizing Setup..."
                            : "✨ Almost Ready..."}
                  </span>
                  <span className="text-lg font-black text-white font-heading">
                    {Math.round(loadingProgress)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Feature Cards - Enhanced Vibrancy */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12">
              {[
                {
                  icon: "🔒",
                  title: "Secure",
                  desc: "End-to-end encryption",
                  gradient: "from-purple-500/25 to-pink-500/25",
                },
                {
                  icon: "👥",
                  title: "Multiplayer",
                  desc: "Real-time battles",
                  gradient: "from-cyan-500/25 to-blue-500/25",
                },
                {
                  icon: "⚡",
                  title: "Lightning",
                  desc: "Ultra-fast gaming",
                  gradient: "from-green-500/25 to-emerald-500/25",
                },
              ].map((feature, index) => (
                <div key={index} className="relative group tap-target">
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${feature.gradient} rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500`}
                  ></div>
                  <div
                    className="relative electric-glass backdrop-blur-xl p-4 sm:p-6 rounded-xl border border-purple-300/25 hover:border-purple-300/50 transition-all duration-300"
                    style={{ background: "rgba(139, 69, 193, 0.1)" }}
                  >
                    <div className="text-2xl sm:text-3xl mb-2 filter brightness-110">
                      {feature.icon}
                    </div>
                    <h3
                      className="text-xs sm:text-sm font-bold text-white font-heading"
                      style={{ textShadow: "0 0 8px rgba(255, 255, 255, 0.3)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-xs text-purple-200 font-body mt-1"
                      style={{ textShadow: "0 0 4px rgba(196, 181, 253, 0.5)" }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Message */}
            <div className="relative space-y-3">
              <div className="electric-glass backdrop-blur-xl rounded-2xl p-4 border border-blue-300/20">
                <p className="text-blue-100 font-body text-sm sm:text-base">
                  🌟 Welcome to the next generation gaming experience
                </p>
              </div>

              {/* Music preparation indicator */}
              <div className="electric-glass backdrop-blur-xl rounded-xl p-3 border border-purple-300/20">
                <div className="flex items-center justify-center gap-2 text-purple-200">
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12,3V13.55C11.41,13.21 10.73,13 10,13A3,3 0 0,0 7,16A3,3 0 0,0 10,19A3,3 0 0,0 13,16V7H19V5H12V3Z" />
                  </svg>
                  <span className="text-xs sm:text-sm font-medium">
                    🎵 Preparing ambient music experience
                  </span>
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-purple-400 rounded-full opacity-80"></div>
                    <div className="w-1 h-1 bg-pink-400 rounded-full opacity-60"></div>
                    <div className="w-1 h-1 bg-cyan-400 rounded-full opacity-80"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Footer */}
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <div className="electric-glass backdrop-blur-xl inline-block px-6 py-2 rounded-full border border-blue-300/20">
            <p className="text-xs sm:text-sm text-blue-200 font-medium font-body">
              © 2024 NNC Games • Professional Gaming Platform
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
