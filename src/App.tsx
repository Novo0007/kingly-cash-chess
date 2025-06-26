import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

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

  // Epic Gaming Loading Screen
  if (appLoading) {
    return (
      <div className="fixed inset-0 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 animate-pulse"></div>
        </div>

        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="cyber-grid h-full w-full"></div>
        </div>

        {/* Floating Gaming Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-10 left-10 text-4xl animate-bounce"
            style={{ animationDelay: "0s" }}
          >
            🎮
          </div>
          <div
            className="absolute top-20 right-20 text-3xl animate-bounce"
            style={{ animationDelay: "0.5s" }}
          >
            ♛
          </div>
          <div
            className="absolute bottom-20 left-20 text-3xl animate-bounce"
            style={{ animationDelay: "1s" }}
          >
            🏆
          </div>
          <div
            className="absolute bottom-10 right-10 text-4xl animate-bounce"
            style={{ animationDelay: "1.5s" }}
          >
            ⚡
          </div>
          <div
            className="absolute top-1/3 left-1/4 text-2xl animate-bounce"
            style={{ animationDelay: "2s" }}
          >
            💎
          </div>
          <div
            className="absolute top-2/3 right-1/4 text-2xl animate-bounce"
            style={{ animationDelay: "2.5s" }}
          >
            🌟
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
          <div className="text-center space-y-6 sm:space-y-8 max-w-sm sm:max-w-md mx-auto w-full">
            {/* Logo with Glow Effect */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
              <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-full border-4 border-purple-500/50 backdrop-blur-sm">
                <div className="text-6xl md:text-7xl animate-pulse">🎮</div>
              </div>
            </div>

            {/* Brand Name */}
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent animate-pulse">
                NNC GAMES
              </h1>
              <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                Chess Arena & More
              </h2>
            </div>

            {/* Loading Spinner */}
            <div className="relative">
              <div className="w-20 h-20 mx-auto">
                <div className="absolute inset-0 border-4 border-blue-500/30 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                <div
                  className="absolute inset-2 border-4 border-transparent border-t-purple-500 rounded-full animate-spin"
                  style={{
                    animationDirection: "reverse",
                    animationDuration: "0.8s",
                  }}
                ></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto">
              <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden border border-purple-500/50">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 animate-pulse"></div>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
              <p className="text-gray-300 text-sm mt-3 font-medium">
                {Math.round(loadingProgress)}% Loading...
              </p>
            </div>

            {/* Loading Messages */}
            <div className="space-y-2">
              <p className="text-gray-400 text-lg font-medium">
                {loadingProgress < 30
                  ? "🔥 Initializing Gaming Engine..."
                  : loadingProgress < 60
                    ? "⚡ Loading Game Assets..."
                    : loadingProgress < 90
                      ? "🎯 Preparing Your Experience..."
                      : "🚀 Almost Ready..."}
              </p>
              <p className="text-gray-500 text-sm">
                Get ready for epic gaming battles!
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Gaming Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end justify-center pb-8">
          <div className="flex items-center gap-6 text-2xl">
            <span className="animate-bounce" style={{ animationDelay: "0s" }}>
              🎲
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
              🎯
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>
              🏅
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.6s" }}>
              💰
            </span>
            <span className="animate-bounce" style={{ animationDelay: "0.8s" }}>
              🎊
            </span>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
