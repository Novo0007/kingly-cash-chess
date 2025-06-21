
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthPage } from '@/components/auth/AuthPage';
import { Navbar } from '@/components/layout/Navbar';
import { BottomNav } from '@/components/layout/BottomNav';
import { GameLobby } from '@/components/chess/GameLobby';
import { GamePage } from '@/components/chess/GamePage';
import { WalletManager } from '@/components/wallet/WalletManager';
import { FriendsSystem } from '@/components/friends/FriendsSystem';
import { ProfileSystem } from '@/components/profile/ProfileSystem';
import { ChatSystem } from '@/components/chat/ChatSystem';
import type { User } from '@supabase/supabase-js';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('lobby');
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);

  useEffect(() => {
    getUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleJoinGame = (gameId: string) => {
    setCurrentGameId(gameId);
    setCurrentView('game');
  };

  const handleBackToLobby = () => {
    setCurrentGameId(null);
    setCurrentView('lobby');
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
      case 'lobby':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <GameLobby onJoinGame={handleJoinGame} />
            </div>
            <div className="hidden lg:block">
              <ChatSystem isGlobalChat={true} />
            </div>
          </div>
        );
      case 'game':
        return currentGameId ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="lg:col-span-3">
              <GamePage gameId={currentGameId} onBackToLobby={handleBackToLobby} />
            </div>
            <div className="hidden lg:block">
              <ChatSystem gameId={currentGameId} />
            </div>
          </div>
        ) : (
          <GameLobby onJoinGame={handleJoinGame} />
        );
      case 'wallet':
        return <WalletManager />;
      case 'friends':
        return <FriendsSystem />;
      case 'profile':
        return <ProfileSystem />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2">
              <GameLobby onJoinGame={handleJoinGame} />
            </div>
            <div className="hidden lg:block">
              <ChatSystem isGlobalChat={true} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
      
      {/* Desktop Navbar - hidden on mobile */}
      <div className="hidden sm:block">
        <Navbar currentView={currentView} onViewChange={setCurrentView} />
      </div>
      
      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {renderCurrentView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden">
        <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
};

export default Index;
