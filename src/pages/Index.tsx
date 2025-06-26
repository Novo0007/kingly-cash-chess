import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GameLobby } from "@/components/chess/GameLobby";
import { GamePage } from "@/components/chess/GamePage";
import { GameSelection } from "@/components/games/GameSelection";
import { DotsAndBoxes } from "@/components/games/DotsAndBoxes";
import { DotsAndBoxesLobby } from "@/components/games/DotsAndBoxesLobby";
import { OnlineDotsAndBoxes } from "@/components/games/OnlineDotsAndBoxes";
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
    "chess" | "dots-and-boxes" | null
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

  const handleSelectGame = (gameType: "chess" | "dots-and-boxes") => {
    setSelectedGameType(gameType);
    if (gameType === "chess") {
      setCurrentView("lobby");
    } else {
      setCurrentView("dots-and-boxes-lobby");
    }
  };

  const handleJoinGame = (gameId: string) => {
    setCurrentGameId(gameId);
    if (selectedGameType === "chess") {
      setCurrentView("game");
    } else {
      setCurrentView("online-dots-and-boxes");
    }
  };

  const handleBackToLobby = () => {
    setCurrentGameId(null);
    if (selectedGameType === "chess") {
      setCurrentView("lobby");
    } else {
      setCurrentView("dots-and-boxes-lobby");
    }
  };

  const handleBackToGameSelection = () => {
    setSelectedGameType(null);
    setCurrentView("games");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-xl opacity-60 animate-pulse"></div>
          <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-full border-2 border-purple-500/50 backdrop-blur-sm">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "games":
        return <GameSelection onSelectGame={handleSelectGame} />;
      case "lobby":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
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
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 md:gap-6">
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
      case "dots-and-boxes":
        return <DotsAndBoxes onBackToLobby={handleBackToGameSelection} />;
      case "dots-and-boxes-lobby":
        return (
          <DotsAndBoxesLobby
            onJoinGame={handleJoinGame}
            onBackToGameSelection={handleBackToGameSelection}
          />
        );
      case "online-dots-and-boxes":
        return currentGameId ? (
          <OnlineDotsAndBoxes
            gameId={currentGameId}
            onBackToLobby={handleBackToLobby}
          />
        ) : (
          <DotsAndBoxesLobby
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-cyan-600/5 animate-pulse"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div className="cyber-grid h-full w-full"></div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-40 right-40 w-1 h-1 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "4.5s" }}
        ></div>
      </div>

      {/* Desktop Navbar - hidden on mobile */}
      <div className="hidden md:block relative z-30">
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Main Content Area */}
      <main className="relative z-20 max-w-7xl mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-4 md:py-8 pb-20 sm:pb-24 md:pb-8">
        <div className="relative">
          {/* Content Background with Glassmorphism */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/2 rounded-2xl sm:rounded-3xl border border-white/5"></div>

          {/* Content */}
          <div className="relative z-10 p-1 sm:p-2 md:p-4">
            {renderCurrentView()}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden relative z-30">
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

export default Index;
