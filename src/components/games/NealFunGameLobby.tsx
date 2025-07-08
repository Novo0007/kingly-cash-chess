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
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileChatSystem } from "@/components/chat/MobileChatSystem";

interface NealFunGameLobbyProps {
  onSelectGame: (
    gameType: "chess" | "ludo" | "maze" | "game2048" | "math",
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
    (gameType: "chess" | "ludo" | "maze" | "game2048" | "math") => {
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
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <div className="text-center py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-6xl font-light text-black mb-4">NNC Games</h1>
          <p className="text-xl text-black opacity-70 font-light">
            Games and other stuff
          </p>
        </div>
      </div>

      {/* Main Games Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <div
              key={game.id}
              className="group cursor-pointer"
              onMouseEnter={() => setHoveredGame(game.id)}
              onMouseLeave={() => setHoveredGame(null)}
              onClick={() =>
                handleGameSelect(
                  game.id as "chess" | "ludo" | "maze" | "game2048" | "math",
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
                            <span className="text-yellow-600">Earn Money</span>
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
