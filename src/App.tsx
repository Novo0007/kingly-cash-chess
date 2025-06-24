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

  useEffect(() => {
    // App loading screen for 2 seconds
    const loadingTimer = setTimeout(() => {
      setAppLoading(false);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  // Futuristic Cyberpunk Loading Screen
  if (appLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 cyber-grid matrix-bg overflow-hidden z-50">
        {/* Animated Background Particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Scanning Lines Effect */}
        <div className="scan-lines absolute inset-0"></div>

        {/* Main Loading Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center space-y-12">
          {/* Futuristic Loading Rings */}
          <div className="relative">
            {/* Outer Ring */}
            <div className="w-48 h-48 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin glow-cyan"></div>

            {/* Middle Ring */}
            <div
              className="absolute top-6 left-6 w-36 h-36 border-4 border-purple-400 border-r-transparent rounded-full animate-spin glow-purple"
              style={{ animationDirection: "reverse", animationDuration: "2s" }}
            ></div>

            {/* Inner Ring */}
            <div
              className="absolute top-12 left-12 w-24 h-24 border-4 border-pink-400 border-b-transparent rounded-full animate-spin glow-pink"
              style={{ animationDuration: "1s" }}
            ></div>

            {/* Center Core */}
            <div className="absolute top-20 left-20 w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full cyber-pulse"></div>

            {/* Data Stream Indicators */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-2 h-8 bg-gradient-to-t from-transparent to-cyan-400 animate-pulse"></div>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
              <div
                className="w-2 h-8 bg-gradient-to-b from-transparent to-purple-400 animate-pulse"
                style={{ animationDelay: "0.5s" }}
              ></div>
            </div>
            <div className="absolute top-1/2 -left-4 transform -translate-y-1/2">
              <div
                className="w-8 h-2 bg-gradient-to-l from-transparent to-pink-400 animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
            </div>
            <div className="absolute top-1/2 -right-4 transform -translate-y-1/2">
              <div
                className="w-8 h-2 bg-gradient-to-r from-transparent to-cyan-400 animate-pulse"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>
          </div>

          {/* Glitch Title */}
          <div className="space-y-6">
            <h1
              className="text-6xl md:text-8xl font-bold text-neon-cyan glitch relative"
              data-text="NEXUS CHESS"
            >
              NEXUS CHESS
            </h1>
            <div className="text-xl md:text-2xl text-neon-purple">
              <span className="inline-block animate-pulse">◤</span>
              <span className="mx-4 text-cyan-300">
                INITIALIZING QUANTUM MATRIX
              </span>
              <span className="inline-block animate-pulse">◥</span>
            </div>
          </div>

          {/* Advanced Progress Bar */}
          <div className="w-80 md:w-96 space-y-4">
            <div className="relative">
              <div className="h-3 bg-slate-800 rounded-full border border-cyan-400/30 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full animate-pulse glow-cyan"
                  style={{
                    width: "100%",
                    animation: "cyber-pulse 1.5s ease-in-out infinite",
                  }}
                ></div>
              </div>

              {/* Progress indicators */}
              <div className="flex justify-between mt-2 text-xs text-cyan-400 font-mono">
                <span className="animate-pulse">⚡ LOADING NEURAL NET</span>
                <span className="animate-pulse">100%</span>
              </div>
            </div>

            {/* System Status */}
            <div className="space-y-2 text-sm font-mono text-cyan-300">
              <div className="flex justify-between animate-pulse">
                <span>⚡ QUANTUM PROCESSORS:</span>
                <span className="text-green-400">ONLINE</span>
              </div>
              <div
                className="flex justify-between animate-pulse"
                style={{ animationDelay: "0.2s" }}
              >
                <span>🧠 AI MATRIX:</span>
                <span className="text-green-400">SYNCHRONIZED</span>
              </div>
              <div
                className="flex justify-between animate-pulse"
                style={{ animationDelay: "0.4s" }}
              >
                <span>🔮 HOLOGRAPHIC UI:</span>
                <span className="text-green-400">CALIBRATED</span>
              </div>
              <div
                className="flex justify-between animate-pulse"
                style={{ animationDelay: "0.6s" }}
              >
                <span>⚔️ COMBAT ALGORITHMS:</span>
                <span className="text-green-400">READY</span>
              </div>
            </div>
          </div>

          {/* Bottom Command Line */}
          <div className="absolute bottom-8 left-0 right-0 px-8">
            <div className="font-mono text-green-400 text-sm opacity-75">
              <span className="animate-pulse">$</span>
              <span className="ml-2">
                nexus-chess --initialize --quantum-mode --player-ready
              </span>
              <span className="animate-pulse ml-2">▊</span>
            </div>
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
