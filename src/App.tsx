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

  // Modern Electric Blue Loading Screen
  if (appLoading) {
    return (
      <div className="fixed inset-0 overflow-hidden font-body">
        {/* Dynamic Electric Blue Background */}
        <div className="absolute inset-0 electric-gradient">
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-500/5"></div>
        </div>

        {/* Vibrant Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="h-full w-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, hsl(205, 100%, 50%) 0%, transparent 50%),
                               radial-gradient(circle at 75% 75%, hsl(195, 100%, 55%) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6 sm:p-8">
          <div className="text-center space-y-8 sm:space-y-10 max-w-md sm:max-w-lg mx-auto w-full">
            {/* Modern Logo */}
            <div className="relative">
              <div className="electric-shadow-lg rounded-full p-2">
                <div className="electric-glass rounded-full p-8 sm:p-10 backdrop-blur-xl">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl electric-pulse"></div>
                    <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                      <svg
                        className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                          fillRule="evenodd"
                          d="M4 5a2 2 0 012-2h8a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 1a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Brand Name */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading electric-text-gradient leading-tight">
                NNC GAMES
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl font-medium text-gray-700 font-body">
                Modern Gaming Platform
              </p>
            </div>

            {/* Modern Loading Spinner */}
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto">
                <div className="electric-spinner w-full h-full"></div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm mx-auto">
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden electric-shadow">
                <div className="absolute inset-0 electric-shimmer"></div>
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(loadingProgress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm font-medium text-gray-600 font-body">
                  Loading...
                </span>
                <span className="text-sm font-bold text-blue-600 font-body">
                  {Math.round(loadingProgress)}%
                </span>
              </div>
            </div>

            {/* Loading Status */}
            <div className="space-y-2">
              <p className="text-base sm:text-lg font-medium text-gray-700 font-body">
                {loadingProgress < 30
                  ? "Initializing Platform..."
                  : loadingProgress < 60
                    ? "Loading Game Engine..."
                    : loadingProgress < 90
                      ? "Preparing Interface..."
                      : "Almost Ready..."}
              </p>
              <p className="text-sm text-gray-500 font-body">
                Welcome to the modern gaming experience
              </p>
            </div>

            {/* Modern Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center tap-target">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-600 font-body">
                  Secure
                </p>
              </div>
              <div className="text-center tap-target">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-600 font-body">
                  Multiplayer
                </p>
              </div>
              <div className="text-center tap-target">
                <div className="w-10 h-10 mx-auto mb-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <p className="text-xs font-medium text-gray-600 font-body">
                  Real-time
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Branding */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-sm text-gray-500 font-medium font-body">
            © 2024 NNC Games • Modern Gaming Platform
          </p>
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
