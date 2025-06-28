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

const queryClient = new QueryClient();

const App = () => {
  const [appLoading, setAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

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
        {/* Advanced Multi-Layer Background System */}
        <div className="absolute inset-0">
          {/* Primary Gradient Layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"></div>

          {/* Dynamic Mesh Gradient */}
          <div className="absolute inset-0 opacity-40">
            <div
              className="h-full w-full"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 20% 80%, hsl(205, 100%, 50%) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, hsl(195, 100%, 55%) 0%, transparent 50%),
                  radial-gradient(circle at 40% 40%, hsl(215, 100%, 45%) 0%, transparent 40%),
                  conic-gradient(from 180deg at 50% 50%, transparent 0deg, hsl(205, 100%, 50%) 180deg, transparent 360deg)
                `,
              }}
            ></div>
          </div>

          {/* Animated Particle System */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-blue-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              ></div>
            ))}
          </div>

          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="text-blue-300"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Floating Interactive Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating Orbs */}
          <div
            className="absolute top-1/4 left-1/4 w-20 h-20 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-full blur-xl electric-float"
            style={{ animationDelay: "0s" }}
          ></div>
          <div
            className="absolute top-3/4 right-1/4 w-16 h-16 bg-gradient-to-r from-purple-400/30 to-blue-400/30 rounded-full blur-xl electric-float"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 left-3/4 w-12 h-12 bg-gradient-to-r from-cyan-400/30 to-blue-400/30 rounded-full blur-xl electric-float"
            style={{ animationDelay: "2s" }}
          ></div>
        </div>

        {/* Main Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 sm:p-8">
          <div className="text-center space-y-10 sm:space-y-12 max-w-lg sm:max-w-xl mx-auto w-full">
            {/* Revolutionary Logo Design */}
            <div className="relative group">
              {/* Outer Glow Ring */}
              <div className="absolute -inset-8 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-1000"></div>

              {/* Logo Container */}
              <div className="relative">
                <div className="electric-glass backdrop-blur-2xl rounded-full p-8 sm:p-12 border border-blue-300/30">
                  {/* Rotating Border */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-75 blur-sm"></div>
                  <div className="absolute inset-0.5 rounded-full bg-slate-900/80 backdrop-blur-xl"></div>

                  {/* Logo Icon */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 mx-auto">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-purple-500 to-cyan-400 rounded-3xl electric-pulse transform rotate-45"></div>
                    <div className="absolute inset-3 bg-gradient-to-br from-white to-blue-50 rounded-2xl flex items-center justify-center transform -rotate-45">
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
              {/* Main Title */}
              <div className="relative">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-heading leading-none">
                  <span className="block bg-gradient-to-r from-blue-200 via-white to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl">
                    GAME
                  </span>
                  <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent electric-text-gradient">
                    HUB
                  </span>
                </h1>

                {/* Subtitle with Enhanced Styling */}
                <div className="mt-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent blur-xl"></div>
                  <p className="relative text-xl sm:text-2xl md:text-3xl font-medium text-blue-200 font-body tracking-widest">
                    BY
                    <span className="mx-3 font-black text-white electric-text-gradient">
                      NNC GAMES
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Sophisticated Loading Animation */}
            <div className="relative space-y-8">
              {/* Multi-Ring Spinner */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-blue-500/30"></div>
                <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-blue-400 animate-spin"></div>
                <div
                  className="absolute inset-4 rounded-full border-4 border-transparent border-r-purple-400 animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "2s",
                  }}
                ></div>
                <div
                  className="absolute inset-6 rounded-full border-4 border-transparent border-b-cyan-400 animate-spin"
                  style={{ animationDuration: "3s" }}
                ></div>

                {/* Center Glow */}
                <div className="absolute inset-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-60 electric-pulse"></div>
              </div>

              {/* Enhanced Progress System */}
              <div className="w-full max-w-md mx-auto space-y-4">
                {/* Progress Track */}
                <div className="relative h-3 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-blue-500/20">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent electric-shimmer"></div>
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                    style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-pulse"></div>
                    <div className="absolute inset-0 electric-shimmer"></div>
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

            {/* Interactive Feature Cards */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12">
              {[
                { icon: "🔒", title: "Secure", desc: "End-to-end encryption" },
                { icon: "👥", title: "Multiplayer", desc: "Real-time battles" },
                { icon: "⚡", title: "Lightning", desc: "Ultra-fast gaming" },
              ].map((feature, index) => (
                <div key={index} className="relative group tap-target">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                  <div className="relative electric-glass backdrop-blur-xl p-4 sm:p-6 rounded-xl border border-blue-300/20 hover:border-blue-300/40 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl mb-2">
                      {feature.icon}
                    </div>
                    <h3 className="text-xs sm:text-sm font-bold text-white font-heading">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-blue-200 font-body mt-1">
                      {feature.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Status Message */}
            <div className="relative">
              <div className="electric-glass backdrop-blur-xl rounded-2xl p-4 border border-blue-300/20">
                <p className="text-blue-100 font-body text-sm sm:text-base">
                  🌟 Welcome to the next generation gaming experience
                </p>
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
