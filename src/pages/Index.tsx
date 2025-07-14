import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthPage } from "@/components/auth/AuthPage";
import { Navbar } from "@/components/layout/Navbar";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { MobileOptimized } from "@/components/layout/MobileOptimized";
import { GameLobby } from "@/components/chess/GameLobby";
import { GamePage } from "@/components/chess/GamePage";
import { GameSelection } from "@/components/games/GameSelection";
import { NealFunGameLobby } from "@/components/games/NealFunGameLobby";
import { ModernGameLobby } from "@/components/games/ModernGameLobby";
import { ProfessionalGameLobby } from "@/components/games/ProfessionalGameLobby";
import {
  ProfessionalAppLayout,
  ProfessionalMobileOptimized,
} from "@/components/layout/ProfessionalAppLayout";
import { LudoLobby } from "@/components/games/ludo/LudoLobby";
import { LudoGame } from "@/components/games/ludo/LudoGame";
import { MazeGame } from "@/components/games/maze/MazeGame";
import { Game2048 } from "@/components/games/game2048/Game2048";
import { MathGame } from "@/components/games/math/MathGame";
import { WordSearchGame } from "@/components/games/wordsearch/WordSearchGame";
import { CodeLearnGame } from "@/components/games/codelearn/CodeLearnGame";
import { HangmanGame } from "@/components/games/hangman/HangmanGame";
import { BookStore } from "@/components/games/books/BookStore";
import { WalletManager } from "@/components/wallet/WalletManager";
import { FriendsSystem } from "@/components/friends/FriendsSystem";
import { ProfileSystem } from "@/components/profile/ProfileSystem";
import { ChatSystem } from "@/components/chat/ChatSystem";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { GlobalRankings } from "@/components/rankings/GlobalRankings";
import { SimpleTournamentSection } from "@/components/games/tournaments/SimpleTournamentSection";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { ModernLoading } from "@/components/ui/modern-loading";

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("games");
  const [currentGameId, setCurrentGameId] = useState<string | null>(null);
  const [selectedGameType, setSelectedGameType] = useState<
    | "chess"
    | "ludo"
    | "maze"
    | "game2048"
    | "math"
    | "wordsearch"
    | "codelearn"
    | "hangman"
    | "books"
    | null
  >(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [useNealFunStyle, setUseNealFunStyle] = useState(false);
  const [useModernStyle, setUseModernStyle] = useState(false);
  const [useProfessionalStyle, setUseProfessionalStyle] = useState(true);
  const [useProfessionalLayout, setUseProfessionalLayout] = useState(true);

  // Optimized profile fetching with caching
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Profile fetch error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        return;
      }

      console.log("Profile fetched successfully:", data);
      setUserProfile(data);
    } catch (error) {
      console.error(
        "Unexpected profile fetch error:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }, []);

  // Optimized initialization
  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        console.log("🚀 Initializing app...");

        // Get current session immediately
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
        } else if (session?.user && mounted) {
          console.log("Session found, setting user:", session.user.id);
          setUser(session.user);
          // Fetch profile in parallel
          fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Initialization error:", error);
        toast.error("Connection error. Some features may be limited.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Set up auth listener first
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state changed:", event, session?.user?.id);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch profile asynchronously
        setTimeout(() => {
          if (mounted) {
            fetchUserProfile(session.user.id);
          }
        }, 0);
      } else {
        setUserProfile(null);
      }
    });

    // Initialize after setting up listener
    initializeApp();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  // Check admin status when user changes
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user?.email) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("is_admin");
        if (error) {
          console.error("Error checking admin status:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          setIsAdmin(false);
          return;
        }
        setIsAdmin(data || false);
      } catch (error) {
        console.error(
          "Unexpected error checking admin status:",
          error instanceof Error ? error.message : String(error),
        );
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user?.email]);

  const handleSelectGame = (
    gameType:
      | "chess"
      | "ludo"
      | "maze"
      | "game2048"
      | "math"
      | "wordsearch"
      | "codelearn"
      | "hangman"
      | "books",
  ) => {
    setSelectedGameType(gameType);
    if (gameType === "chess") {
      setCurrentView("lobby");
    } else if (gameType === "ludo") {
      setCurrentView("ludo-lobby");
    } else if (gameType === "maze") {
      setCurrentView("maze-game");
    } else if (gameType === "game2048") {
      setCurrentView("game2048");
    } else if (gameType === "math") {
      setCurrentView("math-game");
    } else if (gameType === "wordsearch") {
      setCurrentView("wordsearch-game");
    } else if (gameType === "codelearn") {
      setCurrentView("codelearn-game");
    } else if (gameType === "hangman") {
      setCurrentView("hangman-game");
    }
  };

  const handleJoinGame = (gameId: string) => {
    setCurrentGameId(gameId);
    if (selectedGameType === "chess") {
      setCurrentView("game");
    } else if (selectedGameType === "ludo") {
      setCurrentView("ludo-game");
    } else if (selectedGameType === "maze") {
      setCurrentView("maze-game");
    } else if (selectedGameType === "game2048") {
      setCurrentView("game2048");
    } else if (selectedGameType === "math") {
      setCurrentView("math-game");
    } else if (selectedGameType === "wordsearch") {
      setCurrentView("wordsearch-game");
    } else if (selectedGameType === "codelearn") {
      setCurrentView("codelearn-game");
    } else if (selectedGameType === "hangman") {
      setCurrentView("hangman-game");
    }
  };

  const handleBackToLobby = () => {
    setCurrentGameId(null);
    if (selectedGameType === "chess") {
      setCurrentView("lobby");
    } else if (selectedGameType === "ludo") {
      setCurrentView("ludo-lobby");
    } else if (selectedGameType === "maze") {
      setCurrentView("maze-game");
    } else if (selectedGameType === "game2048") {
      setCurrentView("game2048");
    } else if (selectedGameType === "math") {
      setCurrentView("math-game");
    } else if (selectedGameType === "wordsearch") {
      setCurrentView("wordsearch-game");
    } else if (selectedGameType === "codelearn") {
      setCurrentView("codelearn-game");
    } else if (selectedGameType === "hangman") {
      setCurrentView("hangman-game");
    }
  };

  const handleBackToGameSelection = () => {
    setSelectedGameType(null);
    setCurrentView("games");
  };

  // Optimized loading state
  if (loading) {
    return <ModernLoading message="Loading Game Platform..." />;
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
      case "admin":
        return isAdmin ? (
          <AdminPanel userEmail={user?.email || ""} />
        ) : (
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-amber-900 mb-4">
              Access Denied
            </h2>
            <p className="text-amber-800">You don't have admin privileges.</p>
            <p className="text-amber-600 text-sm mt-2">
              If you were invited as an admin, please make sure you're signed in
              with the correct email address.
            </p>
          </div>
        );
      case "games":
        return useProfessionalStyle ? (
          <ProfessionalGameLobby onSelectGame={handleSelectGame} />
        ) : useModernStyle ? (
          <ModernGameLobby onSelectGame={handleSelectGame} />
        ) : useNealFunStyle ? (
          <NealFunGameLobby onSelectGame={handleSelectGame} />
        ) : (
          <GameSelection onSelectGame={handleSelectGame} />
        );
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
      case "maze-game":
        return <MazeGame onBack={handleBackToGameSelection} user={user} />;
      case "game2048":
        return <Game2048 onBack={handleBackToGameSelection} user={user} />;
      case "math-game":
        return <MathGame onBack={handleBackToGameSelection} user={user} />;
      case "wordsearch-game":
        return (
          <WordSearchGame onBack={handleBackToGameSelection} user={user} />
        );
      case "codelearn-game":
        return <CodeLearnGame onBack={handleBackToGameSelection} user={user} />;
      case "hangman-game":
        return <HangmanGame onBack={handleBackToGameSelection} user={user} />;
      case "wallet":
        return <WalletManager />;
      case "friends":
        return <FriendsSystem />;
      case "profile":
        return <ProfileSystem />;
      case "rankings":
        return <GlobalRankings user={user} />;
      case "tournaments":
        return <SimpleTournamentSection />;
      default:
        return <GameSelection onSelectGame={handleSelectGame} />;
    }
  };

  // Professional Layout Handler
  if (useProfessionalLayout) {
    return (
      <ProfessionalMobileOptimized>
        <ProfessionalAppLayout
          currentView={currentView}
          onViewChange={setCurrentView}
          isAdmin={isAdmin}
          showHeader={currentView !== "games" || !useProfessionalStyle}
          showBottomNav={true}
        >
          {renderCurrentView()}
        </ProfessionalAppLayout>
      </ProfessionalMobileOptimized>
    );
  }

  if (useProfessionalStyle && currentView === "games") {
    return (
      <MobileOptimized>
        <ProfessionalGameLobby onSelectGame={handleSelectGame} />
        {/* Bottom Nav for mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30">
          <BottomNav
            currentView={currentView}
            onViewChange={setCurrentView}
            isAdmin={isAdmin}
          />
        </div>
      </MobileOptimized>
    );
  }

  if (useModernStyle && currentView === "games") {
    return (
      <MobileOptimized>
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <ModernGameLobby onSelectGame={handleSelectGame} />
        {/* Bottom Nav for mobile */}
        <div className="md:hidden relative z-30">
          <BottomNav
            currentView={currentView}
            onViewChange={setCurrentView}
            isAdmin={isAdmin}
          />
        </div>
      </MobileOptimized>
    );
  }

  if (useNealFunStyle && currentView === "games") {
    return (
      <MobileOptimized>
        <Header currentView={currentView} onViewChange={setCurrentView} />
        <NealFunGameLobby onSelectGame={handleSelectGame} />
        {/* Bottom Nav for mobile */}
        <div className="md:hidden relative z-30">
          <BottomNav
            currentView={currentView}
            onViewChange={setCurrentView}
            isAdmin={isAdmin}
          />
        </div>
      </MobileOptimized>
    );
  }

  return (
    <MobileOptimized className="wood-bg">
      {/* Natural Wood Background */}
      <div className="fixed inset-0 wood-gradient">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/15 via-transparent to-orange-100/15"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-700/5 via-orange-600/5 to-yellow-600/5"></div>
      </div>

      <div className="fixed inset-0 opacity-15 sm:opacity-25">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 20% 20%, hsl(25, 45%, 35%) 0%, transparent 40%),
              radial-gradient(ellipse at 80% 80%, hsl(30, 40%, 65%) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 50%, hsl(120, 30%, 40%) 0%, transparent 35%),
              radial-gradient(ellipse at 30% 70%, hsl(20, 60%, 50%) 0%, transparent 30%),
              repeating-linear-gradient(90deg,
                hsl(25, 35%, 25%) 0px,
                hsl(25, 45%, 35%) 2px,
                hsl(25, 35%, 25%) 4px,
                hsl(30, 40%, 30%) 6px)
            `,
          }}
        ></div>
      </div>

      {/* Natural Floating Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-600/40 to-orange-600/40 rounded-full wood-float opacity-60 blur-sm"
          style={{ animationDelay: "0s", animationDuration: "10s" }}
        ></div>
        <div
          className="absolute top-3/4 right-1/4 w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-green-700/40 to-emerald-800/40 rounded-full wood-float opacity-70 blur-sm"
          style={{ animationDelay: "3s", animationDuration: "12s" }}
        ></div>
        <div
          className="absolute top-1/2 left-3/4 w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-br from-yellow-600/40 to-amber-700/40 rounded-full wood-float opacity-50 blur-sm"
          style={{ animationDelay: "6s", animationDuration: "11s" }}
        ></div>

        <div
          className="absolute top-20 right-20 w-2 h-2 sm:w-3 sm:h-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full particle-float opacity-80"
          style={{ animationDelay: "2s", animationDuration: "9s" }}
        ></div>
        <div
          className="absolute bottom-20 left-20 w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-br from-green-700 to-emerald-800 rounded-full particle-float opacity-90"
          style={{ animationDelay: "4s", animationDuration: "8s" }}
        ></div>
        <div
          className="absolute top-60 left-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-gradient-to-br from-yellow-700 to-amber-800 rounded-full particle-float opacity-60"
          style={{ animationDelay: "7s", animationDuration: "10s" }}
        ></div>

        <div
          className="absolute bottom-40 right-40 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-700/30 to-orange-700/30 rotate-45 wood-float opacity-40 rounded-sm"
          style={{ animationDelay: "8s", animationDuration: "13s" }}
        ></div>
      </div>

      {/* Header Component - always visible */}
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <div className="hidden md:block relative z-30">
        <Navbar
          currentView={currentView}
          onViewChange={setCurrentView}
          isAdmin={isAdmin}
        />
      </div>

      <main className="relative z-20 max-w-7xl mx-auto px-1 sm:px-2 md:px-4 py-1 sm:py-2 md:py-8 pb-16 sm:pb-20 md:pb-8">
        <div className="relative">
          <div className="absolute inset-0 wood-glass rounded-lg sm:rounded-xl md:rounded-2xl wood-shadow-lg wood-plank">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/5 via-transparent to-orange-600/5 rounded-lg sm:rounded-xl md:rounded-2xl"></div>
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent"></div>
          </div>

          <div className="relative z-10 p-1 sm:p-2 md:p-4">
            <div className="space-y-4 slide-in-bottom">
              {renderCurrentView()}
            </div>
          </div>
        </div>
      </main>

      <div className="md:hidden relative z-30">
        <BottomNav
          currentView={currentView}
          onViewChange={setCurrentView}
          isAdmin={isAdmin}
        />
      </div>
    </MobileOptimized>
  );
};

export default Index;
