import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileOptimized } from "@/components/layout/MobileOptimized";
import { GameLobby } from "@/components/chess/GameLobby";
import { GamePage } from "@/components/chess/GamePage";
import { GameSelection } from "@/components/games/GameSelection";
import { LudoLobby } from "@/components/games/ludo/LudoLobby";
import { LudoGame } from "@/components/games/ludo/LudoGame";
import { WalletManager } from "@/components/wallet/WalletManager";
import { FriendsSystem } from "@/components/friends/FriendsSystem";
import { ProfileSystem } from "@/components/profile/ProfileSystem";
import { ChatSystem } from "@/components/chat/ChatSystem";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("games");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<
    "chess" | "ludo" | null
  >(null);

  useEffect(() => {
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleSelectGame = (gameType: "chess" | "ludo") => {
    setSelectedGameType(gameType);
    if (gameType === "chess") {
      setCurrentView("lobby");
    } else if (gameType === "ludo") {
      setCurrentView("ludo-lobby");
    }
  };

  const handleJoinGame = (gameId: string) => {
    setCurrentGameId(gameId);
    if (selectedGameType === "chess") {
      setCurrentView("game");
    } else if (selectedGameType === "ludo") {
      setCurrentView("ludo-game");
    }
  };

  const handleBackToLobby = () => {
    setCurrentGameId(null);
    if (selectedGameType === "chess") {
      setCurrentView("lobby");
    } else if (selectedGameType === "ludo") {
      setCurrentView("ludo-lobby");
    }
  };

  const handleBackToGameSelection = () => {
    setSelectedGameType(null);
    setCurrentView("games");
  };

  if (loading) {
    return (
      <MobileOptimized className="flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-full border-2 border-purple-500/50 backdrop-blur-sm">
            <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </MobileOptimized>
    );
  }

  if (!user) {
    return (
      <MobileOptimized>
        <AuthPage />
      </MobileOptimized>
    );
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "games":
        return <GameSelection onSelectGame={handleSelectGame} />;
      case "lobby":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-4 md:gap-6">
            <div className="xl:col-span-2">
              <GameLobby onJoinGame={handleJoinGame} />
            </div>
            <div className="hidden xl:block">
              <ChatSystem isGlobalChat={true} />
            </div>
          </div>
        );
      case "game":
        return currentGameId ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            <div className="xl:col-span-3">
              <GamePage
                gameId={currentGameId}
                onBackToLobby={handleBackToLobby}
              />
            </div>
            <div className="hidden xl:block">
              <ChatSystem gameId={currentGameId} />
            </div>
          </div>
        ) : (
          <GameLobby onJoinGame={handleJoinGame} />
        );
      case "ludo-lobby":
        return (
          <LudoLobby
            onJoinGame={handleJoinGame}
            onBackToGameSelection={handleBackToGameSelection}
          />
        );
      case "ludo-game":
        return currentGameId ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
            <div className="xl:col-span-3">
              <LudoGame
                gameId={currentGameId}
                onBackToLobby={handleBackToLobby}
              />
            </div>
            <div className="hidden xl:block">
              <ChatSystem gameId={currentGameId} />
            </div>
          </div>
        ) : (
          <LudoLobby
            onJoinGame={handleJoinGame}
            onBackToGameSelection={handleBackToGameSelection}
          />
        );
      case "wallet":
        return <WalletManager />;
      case "friends":
        return <FriendsSystem />;
      case "profile":
        return <ProfileSystem />;
      default:
        return <GameSelection onSelectGame={handleSelectGame} />;
    }
  };

  return (
    <MobileOptimized className="electric-bg">
      {/* Enhanced Electric Background */}
      <div className="fixed inset-0 electric-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-cyan-100/15"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-blue-500/5 to-cyan-500/5"></div>
      </div>

      {/* Dynamic Pattern Overlay */}
      <div className="fixed inset-0 opacity-10 sm:opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 20% 20%, hsl(270, 95%, 70%) 0%, transparent 40%),
              radial-gradient(circle at 80% 80%, hsl(220, 100%, 70%) 0%, transparent 40%),
              radial-gradient(circle at 50% 50%, hsl(195, 100%, 70%) 0%, transparent 35%),
              radial-gradient(circle at 30% 70%, hsl(145, 85%, 60%) 0%, transparent 30%),
              conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(270, 95%, 70%) 60deg, transparent 120deg, hsl(220, 100%, 70%) 180deg, transparent 240deg, hsl(195, 100%, 70%) 300deg, transparent 360deg)
            `,
          }}
        ></div>
      </div>

      {/* Enhanced Floating Elements with More Variety */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Large vibrant orbs */}
        <div
          className="absolute top-1/4 left-1/4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-400/40 to-pink-400/40 rounded-full electric-float opacity-60 blur-sm"
          style={{ animationDelay: "0s", animationDuration: "8s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/4 w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-cyan-400/40 to-blue-400/40 rounded-full electric-float opacity-70 blur-sm"
          style={{ animationDelay: "2s", animationDuration: "10s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-br from-green-400/40 to-emerald-400/40 rounded-full electric-float opacity-50 blur-sm"
          style={{ animationDelay: "4s", animationDuration: "9s" }}
        ></div>

        {/* Small particle effects */}
        <div
          className="absolute top-20 right-20 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full particle-float opacity-80"
          style={{ animationDelay: "1s", animationDuration: "7s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full particle-float opacity-90"
          style={{ animationDelay: "3s", animationDuration: "6s" }}
        ></div>
        <div
          className="absolute top-60 left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full particle-float opacity-60"
          style={{ animationDelay: "5s", animationDuration: "8s" }}
        ></div>

        {/* Geometric shapes */}
        <div
          className="absolute bottom-40 right-40 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-cyan-400/30 to-blue-400/30 rotate-45 electric-float opacity-40"
          style={{ animationDelay: "6s", animationDuration: "11s" }}
        ></div>
      </div>

      {/* Desktop Navbar - hidden on mobile */}
      <div className="hidden md:block relative z-30">
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Main Content Area - Enhanced Mobile Optimized */}
      <main className="relative z-20 max-w-7xl mx-auto px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-8 pb-16 sm:pb-20 md:pb-8">
        <div className="relative">
          {/* Enhanced Content Background with Electric Glass Effect */}
          <div className="absolute inset-0 electric-glass rounded-xl sm:rounded-2xl md:rounded-3xl electric-shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-purple-500/5 rounded-xl sm:rounded-2xl md:rounded-3xl"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
          </div>

          {/* Content with enhanced styling */}
          <div className="relative z-10 p-1 sm:p-2 md:p-4">
            <div className="space-y-4 slide-in-bottom">
              {renderCurrentView()}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden relative z-30">
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </MobileOptimized>
  );
};

export default Index;
