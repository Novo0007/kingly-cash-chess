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
import FourPicsRulesPage from "./pages/FourPicsRulesPage";
import HangmanRulesPage from "./pages/HangmanRulesPage";
import AkinatorRulesPage from "./pages/AkinatorRulesPage";
import { useBackgroundMusic } from "@/hooks/useBackgroundMusic";
import { DraggableMusicControl } from "@/components/music/DraggableMusicControl";
import { AppLoadingScreen } from "@/components/ui/app-loading-screen";
import { IntroVideo } from "@/components/ui/intro-video";

const queryClient = new QueryClient();

const LoadingScreen = ({ loadingProgress }: { loadingProgress: number }) => {
  return (
    <AppLoadingScreen
      loadingTime={3000}
      onLoadingComplete={() => {
        // Loading complete will be handled by parent component
      }}
    />
  );
};

const App = () => {
  const [showIntroVideo, setShowIntroVideo] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Initialize background music
  const { isPlaying, toggleMusic } = useBackgroundMusic({
    volume: 0.2,
    fadeInDuration: 4000,
  });

  const handleIntroVideoEnd = () => {
    setShowIntroVideo(false);
  };

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

  // Show intro video first
  if (showIntroVideo) {
    return (
      <IntroVideo
        onVideoEnd={handleIntroVideoEnd}
        videoUrl="https://firebasestorage.googleapis.com/v0/b/nopeca-106bd.appspot.com/o/videos%2FWho's%20better%20camellya%20or%20changli.....%23edit%20%23instagram%20%23wutheringwaves%20%23wutheringwavesedit%20%23wuwu%20.mp4?alt=media&token=fd96a2b4-c936-4d42-83bf-107280c425eb"
      />
    );
  }

  // Show loading screen after intro video
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
                <Route path="/fourpics-rules" element={<FourPicsRulesPage />} />
                <Route path="/hangman-rules" element={<HangmanRulesPage />} />
                <Route path="/akinator-rules" element={<AkinatorRulesPage />} />
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
