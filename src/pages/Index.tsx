import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { GameLobby } from "@/components/chess/GameLobby";
import { GamePage } from "@/components/chess/GamePage";
import { WalletManager } from "@/components/wallet/WalletManager";
import { FriendsSystem } from "@/components/friends/FriendsSystem";
import { ProfileSystem } from "@/components/profile/ProfileSystem";
import { ChatSystem } from "@/components/chat/ChatSystem";
import type { User } from "@supabase/supabase-js";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("lobby");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

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

  const handleJoinGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setCurrentView("game");
  };

  const handleBackToLobby = () => {
    setCurrentGameId(null);
    setCurrentView("lobby");
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
      case "wallet":
        return <WalletManager />;
      case "friends":
        return <FriendsSystem />;
      case "profile":
        return <ProfileSystem />;
      default:
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
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-cyan-900 cyber-grid relative overflow-hidden">
      {/* Futuristic Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/50 via-purple-900/30 to-cyan-900/50"></div>

      {/* Animated Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Scanning Effect */}
      <div className="scan-lines absolute inset-0 opacity-20"></div>

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
