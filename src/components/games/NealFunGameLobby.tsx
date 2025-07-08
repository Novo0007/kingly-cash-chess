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
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileChatSystem } from "@/components/chat/MobileChatSystem";

interface NealFunGameLobbyProps {
  onSelectGame: (
    gameType: "chess" | "ludo" | "maze" | "game2048" | "math" | "scrabble",
  ) => void;
}

export const NealFunGameLobby: React.FC<NealFunGameLobbyProps> = ({
  onSelectGame,
}) => {
  const { isMobile } = useDeviceType();
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
      id: "scrabble",
      title: "Scrabble Words",
      description: "Word-building game with friends, real-time multiplayer!",
      icon: BookOpen,
      emoji: "📝",
      players: "150+ playing",
      isPopular: true,
      isPaid: true,
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
      gameType: "chess" | "ludo" | "maze" | "game2048" | "math" | "scrabble",
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
    <div className="min-h-screen bg-white font-sans pb-20 md:pb-0">
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
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      </div>

      {/* Header */}
      <div className="text-center py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-6xl font-light text-black mb-4">NNC Games</h1>
          <p className="text-xl text-black opacity-70 font-light">
            Games and other stuff
          </p>
        </div>
      </div>

      {/* Game Filter Section */}
      <div className="max-w-5xl mx-auto px-6 mb-8">
        <div className="flex items-center justify-center gap-4 pb-8 border-b border-gray-200">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter games:</span>
          </div>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <Button
              onClick={() => setGameFilter("all")}
              variant={gameFilter === "all" ? "default" : "ghost"}
              size="sm"
              className={`transition-all duration-200 ${
                gameFilter === "all"
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-600 hover:bg-gray-200"
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
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "text-gray-600 hover:bg-gray-200"
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
                  ? "bg-yellow-600 text-white hover:bg-yellow-700"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <DollarSign className="w-3 h-3" />
              Earning ({games.filter((g) => g.isPaid).length})
            </Button>
          </div>
        </div>

        {/* Filter Description */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {gameFilter === "all" && "Showing all available games"}
            {gameFilter === "free" && "🆓 Free games - play without any cost!"}
            {gameFilter === "earning" &&
              "💰 Earning games - compete for real money prizes!"}
          </p>
        </div>
      </div>

      {/* Main Games Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-light text-black mb-2">
              No games found
            </h3>
            <p className="text-gray-600 mb-6">
              No games match your current filter selection.
            </p>
            <Button
              onClick={() => setGameFilter("all")}
              className="bg-blue-600 hover:bg-blue-700 text-white"
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
                      | "scrabble",
                  )
                }
              >
                <Card className="bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors duration-200">
                          <game.icon className="w-6 h-6 text-gray-700" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-black truncate">
                            {game.title}
                          </h3>
                          {game.isPopular && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {game.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
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
                      <span className="text-blue-600 text-sm font-medium group-hover:underline">
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
        <div className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-2xl font-light text-black mb-8 text-center">
            Coming Soon
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {comingSoon.map((game, index) => (
              <div
                key={index}
                className="text-center p-4 border border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60"
              >
                <div className="text-2xl mb-2">{game.emoji}</div>
                <div className="text-sm font-medium text-gray-700">
                  {game.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-light text-black mb-2">5+</div>
              <div className="text-sm text-gray-600">Games Available</div>
            </div>
            <div>
              <div className="text-3xl font-light text-black mb-2">5K+</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </div>
            <div>
              <div className="text-3xl font-light text-black mb-2">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-gray-600 font-light text-lg mb-6">
            Hi! This is where we make games on the web. Obligatory links:
          </p>

          <div className="flex justify-center gap-4 mb-6">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              📧 Newsletter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              🐦 Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ☕ Support
            </Button>
          </div>

          <p className="text-gray-600 text-sm mb-2">
            Say hello: <span className="text-blue-600">hi@nncgames.com</span>
          </p>

          <p className="text-gray-500 text-sm opacity-50">
            <a href="#" className="hover:underline">
              Privacy policy
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};
