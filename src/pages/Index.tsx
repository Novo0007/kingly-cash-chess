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
import { ChessRules } from "@/components/chess/ChessRules";
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
      case "chess-rules":
        return <ChessRules onBackToGames={() => setCurrentView("games")} />;
      default:
        return <GameSelection onSelectGame={handleSelectGame} />;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden lavender-bg">
      {/* Elegant Lavender Background */}
      <div className="fixed inset-0 lavender-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-purple-100/10"></div>
      </div>

      {/* Subtle Pattern Overlay */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, hsl(250, 70%, 80%) 0%, transparent 30%),
                             radial-gradient(circle at 80% 80%, hsl(270, 80%, 85%) 0%, transparent 30%),
                             radial-gradient(circle at 50% 50%, hsl(260, 75%, 82%) 0%, transparent 25%)`,
          }}
        ></div>
      </div>

      {/* Elegant Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 left-20 w-3 h-3 bg-gradient-to-br from-purple-300 to-indigo-300 rounded-full lavender-float opacity-40"
          style={{ animationDelay: "0s", animationDuration: "4s" }}
        ></div>
        <div
          className="absolute top-40 right-40 w-2 h-2 bg-gradient-to-br from-lavender-300 to-purple-300 rounded-full lavender-float opacity-50"
          style={{ animationDelay: "1s", animationDuration: "5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-40 w-4 h-4 bg-gradient-to-br from-indigo-200 to-purple-200 rounded-full lavender-float opacity-30"
          style={{ animationDelay: "2s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute bottom-20 right-20 w-2 h-2 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full lavender-float opacity-60"
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
          {/* Content Background with Lavender Glass Effect */}
          <div className="absolute inset-0 lavender-glass rounded-2xl sm:rounded-3xl lavender-shadow"></div>

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
