import React, { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Dice1,
  Target,
  Gamepad2,
  Brain,
  Star,
  Clock,
  Users,
  Sparkles,
  MessageSquare,
  Filter,
  DollarSign,
  Gift,
  BookOpen,
  Code,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileChatSystem } from "@/components/chat/MobileChatSystem";
import { useTheme } from "@/contexts/ThemeContext";

interface NealFunGameLobbyProps {
  onSelectGame: (
    gameType:
      | "chess"
      | "ludo"
      | "maze"
      | "game2048"
      | "math"
      | "wordsearch"
      | "codelearn",
  ) => void;
}

export const NealFunGameLobby: React.FC<NealFunGameLobbyProps> = ({
  onSelectGame,
}) => {
  const { isMobile } = useDeviceType();
  const { currentTheme } = useTheme();
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  const [gameFilter, setGameFilter] = useState<"all" | "free" | "earning">(
    "all",
  );

  const games = [
    {
      id: "chess",
      title: "Chess Arena",
      description: "Strategic battles with real prizes",
      icon: Crown,
      emoji: "♛",
      players: "2.5K+ online",
      isPopular: true,
      isPaid: true,
    },
    {
      id: "ludo",
      title: "Ludo King",
      description: "Classic board game for 2-4 players",
      icon: Dice1,
      emoji: "🎲",
      players: "1.8K+ online",
      isPopular: true,
      isPaid: true,
    },
    {
      id: "maze",
      title: "Maze Challenge",
      description: "Navigate challenging puzzles",
      icon: Target,
      emoji: "🧩",
      players: "500+ playing",
      isPopular: false,
      isPaid: false,
    },
    {
      id: "game2048",
      title: "2048 Puzzle",
      description: "Combine tiles to reach 2048",
      icon: Gamepad2,
      emoji: "🎯",
      players: "300+ playing",
      isPopular: false,
      isPaid: false,
    },
    {
      id: "math",
      title: "Math Brain Puzzles",
      description: "Sharpen your arithmetic skills",
      icon: Brain,
      emoji: "🧮",
      players: "200+ playing",
      isPopular: false,
      isPaid: false,
    },
    {
      id: "wordsearch",
      title: "Word Search Puzzle",
      description: "Find hidden words in grids with friends",
      icon: BookOpen,
      emoji: "📝",
      players: "150+ playing",
      isPopular: true,
      isPaid: true,
    },
    {
      id: "codelearn",
      title: "CodeLearn Academy",
      description: "Learn programming with interactive lessons",
      icon: Code,
      emoji: "👨‍💻",
      players: "1.2K+ learning",
      isPopular: true,
      isPaid: false,
    },
  ];

  const comingSoon = [
    { name: "Carrom", emoji: "🏅" },
    { name: "Snake & Ladder", emoji: "🐍" },
    { name: "Teen Patti", emoji: "🃏" },
    { name: "Pool", emoji: "🎱" },
    { name: "Checkers", emoji: "⚫" },
    { name: "Backgammon", emoji: "🎯" },
  ];

  const handleGameSelect = useCallback(
    (
      gameType:
        | "chess"
        | "ludo"
        | "maze"
        | "game2048"
        | "math"
        | "wordsearch"
        | "codelearn",
    ) => {
      onSelectGame(gameType);
    },
    [onSelectGame],
  );

  const handleChatToggle = useCallback(() => {
    setShowGlobalChat((prev) => !prev);
  }, []);

  const handleChatClose = useCallback(() => {
    setShowGlobalChat(false);
  }, []);

  // Filter games based on selected filter
  const filteredGames = games.filter((game) => {
    if (gameFilter === "free") return !game.isPaid;
    if (gameFilter === "earning") return game.isPaid;
    return true; // "all" shows everything
  });

  return (
    <div className="min-h-screen bg-background font-sans pb-20 md:pb-0">
      {/* Global Chat System */}
      <MobileChatSystem
        isGlobalChat={true}
        isOpen={showGlobalChat}
        onClose={handleChatClose}
      />

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleChatToggle}
          className={`w-14 h-14 rounded-full bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* Themed Header */}
      <div className="relative">
        <div
          className={`absolute -inset-4 bg-gradient-to-r ${currentTheme.gradients.primary}/20 rounded-2xl blur-xl animate-pulse`}
        ></div>
        <div className="relative flex items-center justify-center gap-4 py-16 px-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-md opacity-60 animate-pulse`}
              ></div>
              <div
                className={`relative w-16 h-16 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full flex items-center justify-center`}
              >
                🎮
              </div>
            </div>
            <div className="text-center">
              <h1 className="text-6xl font-light bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-4">
                {currentTheme.preview} NNC Games
              </h1>
              <p className="text-xl text-muted-foreground font-light">
                Games with {currentTheme.name} theme and other stuff
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Game Filter Section */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-center gap-4 pb-8 border-b border-border">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter games:</span>
          </div>

          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              onClick={() => setGameFilter("all")}
              variant={gameFilter === "all" ? "default" : "ghost"}
              size="sm"
              className={`transition-all duration-200 ${
                gameFilter === "all"
                  ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-sm`
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              All Games ({games.length})
            </Button>

            <Button
              onClick={() => setGameFilter("free")}
              variant={gameFilter === "free" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-1 transition-all duration-200 ${
                gameFilter === "free"
                  ? `bg-gradient-to-r ${currentTheme.gradients.secondary} text-white`
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Gift className="w-3 h-3" />
              Free ({games.filter((g) => !g.isPaid).length})
            </Button>

            <Button
              onClick={() => setGameFilter("earning")}
              variant={gameFilter === "earning" ? "default" : "ghost"}
              size="sm"
              className={`flex items-center gap-1 transition-all duration-200 ${
                gameFilter === "earning"
                  ? `bg-gradient-to-r ${currentTheme.gradients.accent} text-white`
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <DollarSign className="w-3 h-3" />
              Earning ({games.filter((g) => g.isPaid).length})
            </Button>
          </div>
        </div>

        {/* Filter Description */}
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {gameFilter === "all" &&
              `Showing all ${currentTheme.name} themed games`}
            {gameFilter === "free" &&
              `🆓 Free ${currentTheme.name} games - play without any cost!`}
            {gameFilter === "earning" &&
              `💰 Earning ${currentTheme.name} games - compete for real money prizes!`}
          </p>
        </div>
      </div>

      {/* Main Games Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">{currentTheme.preview}</div>
            <h3 className="text-2xl font-light text-foreground mb-2">
              No games found
            </h3>
            <p className="text-muted-foreground mb-6">
              No games match your current filter selection.
            </p>
            <Button
              onClick={() => setGameFilter("all")}
              className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white`}
            >
              Show All Games
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGames.map((game) => (
              <div
                key={game.id}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredGame(game.id)}
                onMouseLeave={() => setHoveredGame(null)}
                onClick={() =>
                  handleGameSelect(
                    game.id as
                      | "chess"
                      | "ludo"
                      | "maze"
                      | "game2048"
                      | "math"
                      | "wordsearch"
                      | "codelearn",
                  )
                }
              >
                <Card
                  className={`bg-card border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg h-full relative overflow-hidden`}
                >
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-lg blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  ></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 bg-gradient-to-r ${currentTheme.gradients.secondary}/20 rounded-lg flex items-center justify-center group-hover:bg-gradient-to-r group-hover:${currentTheme.gradients.secondary}/40 transition-all duration-200`}
                        >
                          <game.icon className="w-6 h-6 text-foreground" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-foreground truncate">
                            {game.title}
                          </h3>
                          {game.isPopular && (
                            <Badge
                              className={`bg-gradient-to-r ${currentTheme.gradients.accent}/20 text-primary text-xs px-2 py-0.5 border border-primary/20`}
                            >
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {game.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{game.players}</span>
                          {game.isPaid && (
                            <>
                              <span>•</span>
                              <Sparkles className="w-3 h-3 text-yellow-500" />
                              <span className="text-yellow-600">
                                Earn Money
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-primary text-sm font-medium group-hover:underline">
                        Play Now →
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Coming Soon Section */}
        <div className="mt-16 pt-8 border-t border-border">
          <h2 className="text-2xl font-light text-foreground mb-8 text-center">
            Coming Soon - {currentTheme.name} Themed
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {comingSoon.map((game, index) => (
              <div
                key={index}
                className={`text-center p-4 border border-border rounded-lg bg-gradient-to-r ${currentTheme.gradients.secondary}/10 cursor-not-allowed opacity-60 hover:opacity-80 transition-opacity`}
              >
                <div className="text-2xl mb-2">{game.emoji}</div>
                <div className="text-sm font-medium text-foreground">
                  {game.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div
              className={`p-6 rounded-lg bg-gradient-to-r ${currentTheme.gradients.primary}/10 border border-primary/20`}
            >
              <div className="text-3xl font-light text-foreground mb-2">6</div>
              <div className="text-sm text-muted-foreground">
                Games Available
              </div>
            </div>
            <div
              className={`p-6 rounded-lg bg-gradient-to-r ${currentTheme.gradients.secondary}/10 border border-primary/20`}
            >
              <div className="text-3xl font-light text-foreground mb-2">
                5K+
              </div>
              <div className="text-sm text-muted-foreground">
                Active Players
              </div>
            </div>
            <div
              className={`p-6 rounded-lg bg-gradient-to-r ${currentTheme.gradients.accent}/10 border border-primary/20`}
            >
              <div className="text-3xl font-light text-foreground mb-2">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-muted-foreground font-light text-lg mb-6">
            Hi! This is where we make {currentTheme.name} themed games on the
            web. Obligatory links:
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              className={`border-primary/30 text-foreground hover:bg-gradient-to-r hover:${currentTheme.gradients.primary}/10`}
            >
              📧 Newsletter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`border-primary/30 text-foreground hover:bg-gradient-to-r hover:${currentTheme.gradients.secondary}/10`}
            >
              🐦 Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={`border-primary/30 text-foreground hover:bg-gradient-to-r hover:${currentTheme.gradients.accent}/10`}
            >
              ☕ Support
            </Button>
          </div>

          <p className="text-muted-foreground text-sm mb-2">
            Say hello: <span className="text-primary">hi@nncgames.com</span>
          </p>

          <p className="text-muted-foreground text-sm opacity-50">
            <a href="#" className="hover:underline">
              Privacy policy
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};
