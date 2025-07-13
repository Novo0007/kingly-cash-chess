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
  Heart,
  Zap,
  Play,
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
  const [gameFilter, setGameFilter] = useState<"all" | "free" | "featured">(
    "all",
  );

  const games = [
    {
      id: "chess",
      title: "Chess Arena",
      description: "Master strategy, one brilliant move at a time",
      icon: Crown,
      emoji: "♛",
      players: "2.5K+ legends",
      isPopular: true,
      isPaid: true,
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "from-amber-500/20 to-orange-500/20",
    },
    {
      id: "ludo",
      title: "Ludo King",
      description: "Where family memories meet friendly competition",
      icon: Dice1,
      emoji: "🎲",
      players: "1.8K+ families",
      isPopular: true,
      isPaid: true,
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "from-emerald-500/20 to-teal-500/20",
    },
    {
      id: "maze",
      title: "Maze Challenge",
      description: "Every path tells a story of perseverance",
      icon: Target,
      emoji: "🧩",
      players: "500+ explorers",
      isPopular: false,
      isPaid: false,
      gradient: "from-violet-500 to-purple-500",
      bgGradient: "from-violet-500/20 to-purple-500/20",
    },
    {
      id: "game2048",
      title: "2048 Puzzle",
      description: "Small numbers, infinite possibilities",
      icon: Gamepad2,
      emoji: "🎯",
      players: "300+ thinkers",
      isPopular: false,
      isPaid: false,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      id: "math",
      title: "Math Brain Puzzles",
      description: "Numbers dance, minds flourish",
      icon: Brain,
      emoji: "🧮",
      players: "200+ geniuses",
      isPopular: false,
      isPaid: false,
      gradient: "from-rose-500 to-pink-500",
      bgGradient: "from-rose-500/20 to-pink-500/20",
    },
    {
      id: "wordsearch",
      title: "Word Search Puzzle",
      description: "Hidden treasures in every letter",
      icon: BookOpen,
      emoji: "📝",
      players: "150+ wordsmiths",
      isPopular: true,
      isPaid: true,
      gradient: "from-indigo-500 to-purple-500",
      bgGradient: "from-indigo-500/20 to-purple-500/20",
    },
    {
      id: "codelearn",
      title: "CodeLearn Academy",
      description: "Where dreams become code, code becomes reality",
      icon: Code,
      emoji: "👨‍💻",
      players: "1.2K+ dreamers",
      isPopular: true,
      isPaid: false,
      gradient: "from-cyan-500 to-blue-500",
      bgGradient: "from-cyan-500/20 to-blue-500/20",
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
    if (gameFilter === "featured") return game.isPaid;
    return true; // "all" shows everything
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 font-sans pb-20 md:pb-0">
      {/* Beautiful animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Global Chat System */}
      <MobileChatSystem
        isGlobalChat={true}
        isOpen={showGlobalChat}
        onClose={handleChatClose}
      />

      {/* Floating Chat Button - Enhanced */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={handleChatToggle}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 border border-white/20 backdrop-blur-sm"
        >
          <MessageSquare className="h-6 w-6" />
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-md opacity-50 animate-pulse"></div>
        </Button>
      </div>

      {/* Modern Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent"></div>
        <div className={`relative ${isMobile ? "py-8 px-4" : "py-16 px-6"}`}>
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo and Icon */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full blur-lg opacity-60 animate-pulse"></div>
                <div className="relative w-16 h-16 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                  <span className="text-2xl">🎮</span>
                </div>
              </div>
            </div>

            {/* Main Title */}
            <h1
              className={`font-black bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent mb-2 ${isMobile ? "text-3xl" : "text-6xl"}`}
            >
              {currentTheme.preview} NNC Games
            </h1>

            {/* Unique Slogan */}
            <div
              className={`font-bold text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text mb-4 ${isMobile ? "text-lg" : "text-2xl"}`}
            >
              "Where Dreams Become Play"
            </div>

            {/* Emotional Subtitle */}
            <p
              className={`text-white/80 font-light mb-6 ${isMobile ? "text-sm px-4" : "text-xl"}`}
            >
              ✨ Crafting moments of pure magic, one game at a time ✨
            </p>

            {/* Modern Stats */}
            <div
              className={`flex items-center justify-center gap-6 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              <div className="flex items-center gap-2 text-emerald-300">
                <Heart className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                <span>5K+ Happy Players</span>
              </div>
              <div className="flex items-center gap-2 text-purple-300">
                <Zap className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                <span>Instant Fun</span>
              </div>
              <div className="flex items-center gap-2 text-cyan-300">
                <Star className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
                <span>Premium Experience</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter Section */}
      <div className={`max-w-5xl mx-auto mb-8 ${isMobile ? "px-4" : "px-6"}`}>
        <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-6 border border-white/10">
          <div
            className={`flex items-center justify-center mb-6 ${isMobile ? "flex-col gap-3" : "gap-4"}`}
          >
            <div className="flex items-center gap-2 text-white/80">
              <Filter className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
              <span
                className={`font-medium ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Choose your adventure:
              </span>
            </div>

            <div className="flex items-center gap-2 bg-white/10 rounded-2xl p-1 backdrop-blur-sm">
              <Button
                onClick={() => setGameFilter("all")}
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                className={`transition-all duration-300 rounded-xl font-semibold ${
                  gameFilter === "all"
                    ? "bg-gradient-to-r from-purple-500 to-cyan-500 text-white shadow-lg transform scale-105"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                ✨ All Games ({games.length})
              </Button>

              <Button
                onClick={() => setGameFilter("free")}
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                className={`flex items-center gap-1 transition-all duration-300 rounded-xl font-semibold ${
                  gameFilter === "free"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg transform scale-105"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Gift className="w-3 h-3" />
                💖 Free ({games.filter((g) => !g.isPaid).length})
              </Button>

              <Button
                onClick={() => setGameFilter("featured")}
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                className={`flex items-center gap-1 transition-all duration-300 rounded-xl font-semibold ${
                  gameFilter === "featured"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transform scale-105"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                <Sparkles className="w-3 h-3" />
                🌟 Featured ({games.filter((g) => g.isPaid).length})
              </Button>
            </div>
          </div>

          {/* Emotional Filter Description */}
          <div className="text-center">
            <p className={`text-white/80 ${isMobile ? "text-xs" : "text-sm"}`}>
              {gameFilter === "all" &&
                `🌟 Every game is a new adventure waiting to unfold - your story starts here`}
              {gameFilter === "free" &&
                `💝 Pure joy, zero cost - because true happiness should always be free to share`}
              {gameFilter === "featured" &&
                `✨ Handpicked experiences crafted with love - where passion meets perfection`}
            </p>
          </div>
        </div>
      </div>

      {/* Main Games Grid */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        {filteredGames.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎭</div>
            <h3
              className={`font-bold text-white mb-2 ${isMobile ? "text-xl" : "text-2xl"}`}
            >
              No adventures found
            </h3>
            <p
              className={`text-white/60 mb-6 ${isMobile ? "text-sm" : "text-base"}`}
            >
              Every great story needs the perfect beginning...
            </p>
            <Button
              onClick={() => setGameFilter("all")}
              className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-semibold px-8 py-3 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              ✨ Show All Adventures
            </Button>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}
          >
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
                  className={`backdrop-blur-sm bg-white/10 border border-white/20 hover:border-white/40 transition-all duration-300 h-full relative overflow-hidden group-hover:transform group-hover:scale-105 shadow-lg hover:shadow-2xl ${isMobile ? "hover:scale-[1.02]" : ""}`}
                >
                  {/* Animated background gradient */}
                  <div
                    className={`absolute -inset-1 bg-gradient-to-r ${game.gradient} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-300 animate-pulse`}
                  ></div>

                  {/* Content */}
                  <CardContent
                    className={`relative z-10 ${isMobile ? "p-4" : "p-6"}`}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      {/* Game Icon */}
                      <div className="flex-shrink-0">
                        <div
                          className={`bg-gradient-to-r ${game.bgGradient} backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-r group-hover:${game.gradient}/30 transition-all duration-300 border border-white/20 ${isMobile ? "w-10 h-10" : "w-12 h-12"}`}
                        >
                          <game.icon
                            className={`text-white ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
                          />
                        </div>
                      </div>

                      {/* Game Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`font-bold text-white truncate ${isMobile ? "text-base" : "text-lg"}`}
                          >
                            {game.title}
                          </h3>
                          {game.isPopular && (
                            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-0.5 border-0 shadow-lg animate-pulse">
                              🔥 Hot
                            </Badge>
                          )}
                        </div>
                        <p
                          className={`text-white/80 line-clamp-2 mb-3 leading-relaxed ${isMobile ? "text-xs" : "text-sm"}`}
                        >
                          {game.description}
                        </p>
                        <div
                          className={`flex items-center gap-3 text-white/60 ${isMobile ? "text-xs" : "text-xs"}`}
                        >
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{game.players}</span>
                          </div>
                          {game.isPaid && (
                            <div className="flex items-center gap-1 text-amber-300">
                              <Sparkles className="w-3 h-3" />
                              <span>Featured</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Play Button */}
                    <div className="flex justify-center">
                      <Button
                        className={`bg-gradient-to-r ${game.gradient} text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform group-hover:scale-105 border border-white/20 ${isMobile ? "px-6 py-2 text-sm" : "px-8 py-3"}`}
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isMobile ? "Play" : "Start Adventure"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Beautiful Coming Soon Section */}
        <div className="mt-16 pt-8">
          <div className="backdrop-blur-sm bg-white/5 rounded-3xl p-8 border border-white/10">
            <h2
              className={`font-bold text-white mb-8 text-center ${isMobile ? "text-xl" : "text-2xl"}`}
            >
              🌟 Dreams in Development 🌟
            </h2>
            <div
              className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"}`}
            >
              {comingSoon.map((game, index) => (
                <div
                  key={index}
                  className="text-center p-4 backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 cursor-not-allowed hover:bg-white/20 transition-all duration-300 group"
                >
                  <div
                    className={`mb-2 group-hover:scale-110 transition-transform duration-300 ${isMobile ? "text-xl" : "text-2xl"}`}
                  >
                    {game.emoji}
                  </div>
                  <div
                    className={`font-medium text-white/80 ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {game.name}
                  </div>
                  <div
                    className={`text-white/50 mt-1 ${isMobile ? "text-xs" : "text-xs"}`}
                  >
                    Soon ✨
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Beautiful Stats Section */}
        <div className="mt-16">
          <div
            className={`grid gap-6 text-center ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}
          >
            <div className="backdrop-blur-sm bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl p-6 border border-purple-400/30">
              <div
                className={`font-bold text-purple-300 mb-2 ${isMobile ? "text-2xl" : "text-3xl"}`}
              >
                7
              </div>
              <div
                className={`text-purple-200/80 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                💝 Adventures Ready
              </div>
            </div>
            <div className="backdrop-blur-sm bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl p-6 border border-cyan-400/30">
              <div
                className={`font-bold text-cyan-300 mb-2 ${isMobile ? "text-2xl" : "text-3xl"}`}
              >
                5K+
              </div>
              <div
                className={`text-cyan-200/80 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                🌟 Happy Hearts
              </div>
            </div>
            <div className="backdrop-blur-sm bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl p-6 border border-emerald-400/30">
              <div
                className={`font-bold text-emerald-300 mb-2 ${isMobile ? "text-2xl" : "text-3xl"}`}
              >
                ∞
              </div>
              <div
                className={`text-emerald-200/80 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                💫 Endless Joy
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beautiful Footer */}
      <footer className="backdrop-blur-sm bg-white/5 border-t border-white/20 py-12 px-6 mt-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-6">
            <h3
              className={`font-bold text-white mb-2 ${isMobile ? "text-lg" : "text-xl"}`}
            >
              💫 Crafted with Heart & Soul ✨
            </h3>
            <div
              className={`font-semibold text-transparent bg-gradient-to-r from-purple-300 to-cyan-300 bg-clip-text mb-4 ${isMobile ? "text-sm" : "text-lg"}`}
            >
              "Building bridges between imagination and reality"
            </div>
            <p
              className={`text-white/80 font-light mb-6 ${isMobile ? "text-sm" : "text-lg"}`}
            >
              Every line of code carries our dreams, every feature holds our
              dedication 🎨
            </p>
          </div>

          <div
            className={`flex justify-center gap-4 mb-6 ${isMobile ? "flex-wrap" : ""}`}
          >
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-white/30 text-white backdrop-blur-sm bg-white/10 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 rounded-2xl transition-all duration-300"
            >
              💌 Newsletter
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-white/30 text-white backdrop-blur-sm bg-white/10 hover:bg-gradient-to-r hover:from-cyan-500/20 hover:to-blue-500/20 rounded-2xl transition-all duration-300"
            >
              🐦 Twitter
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="border-white/30 text-white backdrop-blur-sm bg-white/10 hover:bg-gradient-to-r hover:from-emerald-500/20 hover:to-teal-500/20 rounded-2xl transition-all duration-300"
            >
              ☕ Support
            </Button>
          </div>

          <p
            className={`text-white/80 mb-2 ${isMobile ? "text-sm" : "text-base"}`}
          >
            Connect with us:{" "}
            <span className="text-cyan-300 font-semibold">hi@nncgames.com</span>
          </p>

          <p className={`text-white/50 ${isMobile ? "text-xs" : "text-sm"}`}>
            <a
              href="#"
              className="hover:text-white transition-colors duration-300"
            >
              Privacy & Trust Policy ✨
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};
