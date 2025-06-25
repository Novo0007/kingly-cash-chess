
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GameLobby } from "@/components/chess/GameLobby";
import { GamePage } from "@/components/chess/GamePage";
import { GameSelection } from "@/components/games/GameSelection";
import { DotsAndBoxes } from "@/components/games/DotsAndBoxes";
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
  const [selectedGameType, setSelectedGameType] = useState<'chess' | 'dots-and-boxes' | null>(null);

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

  const handleSelectGame = (gameType: 'chess' | 'dots-and-boxes') => {
    setSelectedGameType(gameType);
    if (gameType === 'chess') {
      setCurrentView("lobby");
    } else {
      setCurrentView("dots-and-boxes");
    }
  };

  const handleJoinGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setCurrentView("game");
  };

  const handleBackToLobby = () => {
    setCurrentGameId(null);
    setCurrentView("lobby");
  };

  const handleBackToGameSelection = () => {
    setSelectedGameType(null);
    setCurrentView("games");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 md:gap-6">
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
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 md:gap-6">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Desktop Navbar - hidden on mobile */}
      <div className="hidden md:block">
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-3 md:px-4 py-3 md:py-8 pb-20 md:pb-8">
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden">
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

export default Index;
