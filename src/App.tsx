
import { useState, useEffect } from 'react';
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

  // App loading screen
  if (appLoading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-black via-purple-900 to-black flex flex-col items-center justify-center z-50">
        <div className="text-center space-y-8">
          <div className="relative">
            <div className="w-32 h-32 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <div className="w-24 h-24 border-4 border-purple-500 border-t-transparent rounded-full animate-spin absolute top-4 left-4"></div>
            <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin absolute top-8 left-8"></div>
          </div>
          <div className="space-y-4">
            <h1 className="text-white text-4xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-white bg-clip-text text-transparent">
              Chess Arena
            </h1>
            <p className="text-gray-300 text-lg">Loading the ultimate chess experience...</p>
            <div className="w-64 h-2 bg-gray-800 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 via-purple-500 to-white animate-pulse rounded-full"></div>
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
