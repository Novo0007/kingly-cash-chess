import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Trophy,
  Zap,
  Star,
  Sparkles,
  Target,
  Gamepad2,
  BookOpen,
  Dice1,
  Play,
  ArrowRight,
  CheckCircle,
  Clock,
  Brain,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MobileChatSystem } from "@/components/chat/MobileChatSystem";
import { Button as ChatButton } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/game-lobby.css";
import { useTheme } from "@/contexts/ThemeContext";
import { TournamentSection } from "./tournaments/TournamentSection";

interface GameSelectionProps {
  onSelectGame: (
    gameType: "chess" | "ludo" | "maze" | "game2048" | "math" | "wordsearch",
  ) => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({
  onSelectGame,
}) => {
  const { isMobile, isTablet } = useDeviceType();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [showGlobalChat, setShowGlobalChat] = React.useState(false);
  const [gameFilter, setGameFilter] = React.useState<
    "all" | "free" | "money" | "tournaments"
  >("all");
  const [isLoading, setIsLoading] = React.useState(true);

  // Simulate initial loading for smooth appearance
  React.useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // Memoize click handlers for better performance
  const handleGameSelect = useCallback(
    (
      gameType: "chess" | "ludo" | "maze" | "game2048" | "math" | "wordsearch",
    ) => {
      onSelectGame(gameType);
    },
    [onSelectGame],
  );

  const handleFilterChange = useCallback(
    (filter: "all" | "free" | "money" | "tournaments") => {
      setGameFilter(filter);
    },
    [],
  );

  const handleChatToggle = useCallback(() => {
    setShowGlobalChat((prev) => !prev);
  }, []);

  const handleChatClose = useCallback(() => {
    setShowGlobalChat(false);
  }, []);

  const games = useMemo(
    () => [
      {
        id: "chess",
        title: "Chess Arena",
        description:
          "Classic strategy game with timed matches and real money prizes",
        icon: Crown,
        emoji: "♛",
        color: "amber",
        gradient: "from-amber-700 via-orange-700 to-yellow-700",
        lightGradient: "from-amber-100 via-orange-100 to-yellow-100",
        features: [
          "��� Tournaments",
          "⚡ Quick Matches",
          "💰 Real Prizes",
          "📈 Rankings",
        ],
        status: "Popular",
        players: "2.5K+ Online",
        isMoneyGame: true,
      },
      {
        id: "ludo",
        title: "Ludo King",
        description:
          "Classic board game with 2-4 players and real money prizes",
        icon: Dice1,
        emoji: "🎲",
        color: "green",
        gradient: "from-green-700 via-emerald-700 to-green-800",
        lightGradient: "from-green-100 via-emerald-100 to-green-200",
        features: [
          "👥 2-4 Players",
          "🎯 Strategy",
          "💰 Real Prizes",
          "⚡ Quick Games",
        ],
        status: "Hot",
        players: "1.8K+ Online",
        isMoneyGame: true,
      },
      {
        id: "maze",
        title: "Maze Challenge",
        description:
          "Navigate labyrinth puzzles and earn points - completely FREE!",
        icon: Target,
        emoji: "🧩",
        color: "purple",
        gradient: "from-purple-700 via-indigo-700 to-blue-700",
        lightGradient: "from-purple-100 via-indigo-100 to-blue-100",
        features: [
          "🆓 Free to Play",
          "🧠 Brain Training",
          "🏆 Leaderboards",
          "⚡ Multiple Levels",
        ],
        status: "NEW",
        players: "500+ Playing",
        isMoneyGame: false,
      },
      {
        id: "game2048",
        title: "2048 Puzzle",
        description:
          "Combine numbered tiles to reach 2048 - addictive puzzle game!",
        icon: Gamepad2,
        emoji: "🎯",
        color: "cyan",
        gradient: "from-cyan-700 via-blue-700 to-indigo-700",
        lightGradient: "from-cyan-100 via-blue-100 to-indigo-100",
        features: [
          "🆓 Free to Play",
          "🧠 Brain Training",
          "��� Leaderboards",
          "⚡ 3 Difficulty Modes",
        ],
        status: "NEW",
        players: "300+ Playing",
        isMoneyGame: false,
      },
      {
        id: "math",
        title: "Math: Brain Puzzles",
        description: "Improve arithmetic skills with fun, timed math puzzles!",
        icon: Brain,
        emoji: "🧮",
        color: "pink",
        gradient: "from-pink-700 via-rose-700 to-red-700",
        lightGradient: "from-pink-100 via-rose-100 to-red-100",
        features: [
          "🆓 Free to Play",
          "🧠 6 Question Types",
          "⏱️ 3 Difficulty Levels",
          "🎮 Multiple Game Modes",
        ],
        status: "NEW",
        players: "200+ Playing",
        isMoneyGame: false,
      },
      {
        id: "wordsearch",
        title: "Word Search Puzzle",
        description:
          "Find hidden words in grids - multiplayer word puzzles with coin rewards!",
        icon: BookOpen,
        emoji: "📝",
        color: "emerald",
        gradient: "from-emerald-700 via-teal-700 to-green-700",
        lightGradient: "from-emerald-100 via-teal-100 to-green-100",
        features: [
          "��� Multiplayer Mode",
          "🪙 Coin System",
          "💡 Smart Hints",
          "🏆 Leaderboards",
        ],
        status: "NEW",
        players: "150+ Playing",
        isMoneyGame: true,
      },
    ],
    [],
  );

  // Filter games based on selected filter - memoized for performance
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (gameFilter === "free") return !game.isMoneyGame;
      if (gameFilter === "money") return game.isMoneyGame;
      return true; // "all" shows everything
    });
  }, [games, gameFilter]);

  const comingSoonGames = useMemo(
    () => [
      { name: "Carrom", emoji: "🏅", progress: 85, eta: "Next Week" },
      { name: "Snake & Ladder", emoji: "🐍", progress: 65, eta: "2 Weeks" },
      { name: "Teen Patti", emoji: "🃏", progress: 45, eta: "1 Month" },
      { name: "Pool", emoji: "🎱", progress: 25, eta: "2 Months" },
    ],
    [],
  );

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6 transform-optimized">
        {/* Themed Header */}
        <div className="relative">
          <div
            className={`absolute -inset-4 bg-gradient-to-r ${currentTheme.gradients.primary}/20 rounded-2xl blur-xl animate-pulse`}
          ></div>
          <div className="relative flex items-center gap-4 mb-6 md:mb-8 p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-md opacity-60 animate-pulse`}
                ></div>
                <div
                  className={`relative w-10 h-10 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full flex items-center justify-center`}
                >
                  🎮
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                {currentTheme.preview} Game Hub
              </h1>
            </div>
          </div>
        </div>
        {/* Global Chat Button - Only show on mobile/tablet */}
        {(isMobile || isTablet) && (
          <div className="fixed bottom-20 left-4 z-30">
            <ChatButton
              onClick={handleChatToggle}
              size="lg"
              className="w-14 h-14 rounded-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-xl border-2 border-white transition-all duration-300 transform hover:scale-110"
            >
              <MessageSquare className="h-6 w-6 text-white" />
            </ChatButton>
          </div>
        )}

        {/* Global Chat System */}
        <MobileChatSystem
          isGlobalChat={true}
          isOpen={showGlobalChat}
          onClose={handleChatClose}
        />

        {/* Game Filter Options */}
        <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Filter Games
                  </h3>
                  <p className="text-sm text-gray-600">
                    Choose your preferred game type
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
                <Button
                  onClick={() => handleFilterChange("all")}
                  variant={gameFilter === "all" ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    gameFilter === "all"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  All Games ({games.length})
                </Button>

                <Button
                  onClick={() => handleFilterChange("free")}
                  variant={gameFilter === "free" ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    gameFilter === "free"
                      ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Star className="h-4 w-4" />
                  🆓 Free Games ({games.filter((g) => !g.isMoneyGame).length})
                </Button>

                <Button
                  onClick={() => handleFilterChange("money")}
                  variant={gameFilter === "money" ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    gameFilter === "money"
                      ? "bg-gradient-to-r from-yellow-600 to-yellow-700 text-white hover:from-yellow-700 hover:to-yellow-800 shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Trophy className="h-4 w-4" />
                  💰 Earn Money ({games.filter((g) => g.isMoneyGame).length})
                </Button>

                <Button
                  onClick={() => handleFilterChange("tournaments")}
                  variant={gameFilter === "tournaments" ? "default" : "ghost"}
                  size="sm"
                  className={`flex items-center gap-2 transition-all duration-300 ${
                    gameFilter === "tournaments"
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-lg"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Crown className="h-4 w-4" />
                  🏆 Tournaments
                </Button>
              </div>
            </div>

            {/* Filter Description */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                {gameFilter === "all" &&
                  "🎮 Showing all available games - both free and earning opportunities"}
                {gameFilter === "free" &&
                  "🆓 Showing free-to-play games - enjoy without any cost!"}
                {gameFilter === "money" &&
                  "💰 Showing games where you can earn real money prizes!"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Main Games - Enhanced Vibrant Design */}
        {filteredGames.length === 0 ? (
          <Card className="col-span-full bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                No Games Found
              </h3>
              <p className="text-gray-600 mb-4">
                No games match your current filter selection.
              </p>
              <Button
                onClick={() => setGameFilter("all")}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Show All Games
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 transform-optimized">
            {filteredGames.map((game, index) => (
              <div key={game.id} className="relative group game-card">
                {/* Hover Glow Effect */}
                <div
                  className={`absolute -inset-1 bg-gradient-to-r ${game.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500`}
                ></div>

                <Card className="relative bg-gradient-to-br from-white via-gray-50/80 to-white backdrop-blur-md border border-gray-200/50 rounded-2xl md:rounded-3xl shadow-xl transition-all duration-500 ease-out hover:scale-[1.02] hover:shadow-2xl overflow-hidden h-full transform-gpu will-change-transform">
                  {/* Animated Background Pattern */}
                  <div
                    className={`absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br ${game.lightGradient} rounded-bl-[50px] md:rounded-bl-[100px] opacity-30 animate-pulse`}
                  ></div>

                  {/* Smooth gradient overlay */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${game.lightGradient} opacity-5`}
                  ></div>

                  {/* Status Badge */}
                  <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10">
                    <Badge
                      className={`bg-gradient-to-r ${game.gradient} text-white border-0 font-bold px-2 py-1 text-xs`}
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {game.status}
                    </Badge>
                  </div>

                  <CardHeader className="pb-3 pt-4 md:pb-4 md:pt-6 px-3 md:px-6">
                    <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 text-lg md:text-xl lg:text-2xl">
                      <div className="relative group/icon flex-shrink-0">
                        {/* Glowing background effect */}
                        <div
                          className={`absolute -inset-2 md:-inset-3 bg-gradient-to-r ${game.gradient} rounded-2xl md:rounded-3xl blur-xl opacity-40 group-hover/icon:opacity-70 transition-all duration-500 animate-pulse`}
                        ></div>

                        {/* Main icon container with 3D effect */}
                        <div
                          className={`relative p-3 md:p-4 bg-gradient-to-br ${game.gradient} rounded-2xl md:rounded-3xl text-white shadow-2xl transform transition-all duration-300 group-hover/icon:scale-110 group-hover/icon:rotate-3 before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/20 before:to-transparent before:rounded-2xl md:before:rounded-3xl`}
                        >
                          <game.icon className="h-7 w-7 md:h-9 md:w-9 lg:h-12 lg:w-12 drop-shadow-2xl relative z-10 filter brightness-110" />
                        </div>

                        {/* Floating emoji with smooth animation */}
                        <div className="absolute -top-2 -right-2 md:-top-3 md:-right-3 text-xl md:text-3xl animate-bounce transform transition-all duration-300 group-hover/icon:scale-125">
                          {game.emoji}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-gray-800 font-black font-heading truncate">
                          {game.title}
                        </div>
                        <div className="flex items-center gap-1 md:gap-2 mt-1 flex-wrap">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs md:text-sm text-green-600 font-semibold">
                              {game.players}
                            </span>
                          </div>
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">Live</span>
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4 md:space-y-6 px-3 md:px-6">
                    <p className="text-gray-600 text-sm md:text-base font-medium leading-relaxed line-clamp-2">
                      {game.description}
                    </p>

                    {/* Enhanced Features Grid - Mobile Optimized */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                      {game.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 p-2 md:p-3 bg-gray-50 rounded-lg md:rounded-xl border border-gray-100 hover:bg-gray-100 transition-all duration-200"
                        >
                          <CheckCircle
                            className={`h-3 w-3 md:h-4 md:w-4 text-${game.color}-500 flex-shrink-0`}
                          />
                          <span className="text-xs md:text-sm font-semibold text-gray-700 truncate">
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Enhanced Play Button with Smooth Animations */}
                    <Button
                      onClick={() =>
                        handleGameSelect(
                          game.id as
                            | "chess"
                            | "ludo"
                            | "maze"
                            | "game2048"
                            | "math"
                            | "wordsearch",
                        )
                      }
                      className={`w-full relative overflow-hidden bg-gradient-to-r ${game.gradient} hover:from-opacity-90 text-white border-0 py-4 md:py-5 lg:py-6 text-sm md:text-base lg:text-lg font-bold rounded-2xl md:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 ease-out transform hover:scale-[1.03] hover:-translate-y-1 group/btn will-change-transform`}
                    >
                      {/* Multiple layered background animations */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000 ease-out"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                      {/* Pulsing glow effect */}
                      <div
                        className={`absolute -inset-1 bg-gradient-to-r ${game.gradient} rounded-2xl md:rounded-3xl blur-xl opacity-0 group-hover/btn:opacity-50 transition-all duration-500 animate-pulse`}
                      ></div>

                      <div className="relative flex items-center justify-center gap-2 md:gap-3 z-10">
                        <Play className="h-4 w-4 md:h-5 md:w-5 transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-12 filter drop-shadow-lg" />
                        <span className="font-black tracking-wide drop-shadow-sm">
                          PLAY NOW
                        </span>
                        <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-all duration-300 group-hover/btn:translate-x-2 group-hover/btn:scale-110 filter drop-shadow-lg" />
                      </div>
                    </Button>

                    {/* Quick Stats - Mobile Optimized */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                        <span className="text-xs md:text-sm font-semibold text-gray-600">
                          Prize Pool
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm md:text-lg font-black text-green-600">
                          {game.isMoneyGame
                            ? `₹${game.id === "chess" ? "2,50,000" : "1,80,000"}`
                            : "FREE"}
                        </span>
                        <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-yellow-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}

        {/* Enhanced Coming Soon Section */}
        <div className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 rounded-3xl opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-3xl"></div>

          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-full blur-xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-r from-pink-400/30 to-purple-400/30 rounded-full blur-lg animate-pulse"
            style={{ animationDelay: "1.5s" }}
          ></div>

          <Card className="relative bg-transparent border-white/20 backdrop-blur-sm shadow-2xl">
            <CardHeader className="text-center pb-6">
              <CardTitle>
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Star
                    className="h-6 w-6 text-yellow-300 animate-spin"
                    style={{ animationDuration: "3s" }}
                  />
                  <span className="text-2xl md:text-3xl font-black text-white drop-shadow-lg font-heading">
                    🚀 COMING SOON
                  </span>
                  <Star
                    className="h-6 w-6 text-yellow-300 animate-spin"
                    style={{
                      animationDuration: "3s",
                      animationDirection: "reverse",
                    }}
                  />
                </div>
                <p className="text-white/90 text-sm md:text-base font-medium">
                  Get ready for more amazing games and bigger prizes!
                </p>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {comingSoonGames.map((game, index) => (
                  <div key={index} className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/30 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-all duration-300"></div>

                    <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 md:p-6 text-center transition-all duration-300 hover:bg-white/20 hover:scale-105">
                      <div className="text-4xl md:text-5xl mb-3 group-hover:scale-110 transition-transform duration-300">
                        {game.emoji}
                      </div>

                      <h4 className="text-white font-bold text-sm md:text-base mb-2 font-heading">
                        {game.name}
                      </h4>

                      <div className="space-y-2">
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 h-2 rounded-full transition-all duration-1000 relative overflow-hidden"
                            style={{ width: `${game.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-xs">
                          <span className="text-white/90 font-semibold">
                            {game.progress}%
                          </span>
                          <Badge className="bg-white/20 text-white border-white/30 text-xs">
                            {game.eta}
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-white/80 font-medium">
                        {game.progress > 80
                          ? "Almost Ready!"
                          : game.progress > 50
                            ? "In Development"
                            : "Planning Phase"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center mt-6 pt-6 border-t border-white/20">
                <p className="text-white/90 text-sm md:text-base font-medium">
                  ✨ More exciting games are in development! Join our community
                  for early access.
                </p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div
                    className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.3s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"
                    style={{ animationDelay: "0.6s" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Game Rules Section */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          <Card className="relative bg-gradient-to-br from-blue-500 to-purple-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg font-heading">
                      Chess Rules Guide
                    </h4>
                    <p className="text-white/90 text-sm font-medium">
                      Master strategy with our comprehensive guide
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/chess-rules")}
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold"
                >
                  Learn
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-green-500 to-cyan-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-cyan-400/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Dice1 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg font-heading">
                      Ludo Rules Guide
                    </h4>
                    <p className="text-white/90 text-sm font-medium">
                      Learn tactics for this classic board game
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/ludo-rules")}
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold"
                >
                  Learn
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-purple-500 to-indigo-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg font-heading">
                      Maze Rules Guide
                    </h4>
                    <p className="text-white/90 text-sm font-medium">
                      Learn puzzle-solving strategies and tips
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/maze-rules")}
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold"
                >
                  Learn
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-cyan-500 to-blue-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Gamepad2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg font-heading">
                      2048 Rules Guide
                    </h4>
                    <p className="text-white/90 text-sm font-medium">
                      Master the addictive number puzzle game
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/game2048-rules")}
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold"
                >
                  Learn
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-pink-500 to-rose-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-rose-400/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg font-heading">
                      Math Rules Guide
                    </h4>
                    <p className="text-white/90 text-sm font-medium">
                      Learn arithmetic puzzle strategies and tips
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/math-rules")}
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold"
                >
                  Learn
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-emerald-500 to-teal-600 border-0 rounded-2xl shadow-xl overflow-hidden group hover:scale-[1.02] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20"></div>
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-lg font-heading">
                      Word Search Rules
                    </h4>
                    <p className="text-white/90 text-sm font-medium">
                      Master word-finding strategies and multiplayer tactics
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/wordsearch-rules")}
                  variant="secondary"
                  className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 px-4 py-2 rounded-xl font-semibold"
                >
                  Learn
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Footer with Trust Badges */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 rounded-2xl"></div>

          <Card className="relative bg-transparent border-gray-600/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-8">
                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-xl">
                    <Target className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">
                      Play Responsibly
                    </div>
                    <div className="text-gray-400 text-xs">
                      Safe Gaming Environment
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">
                      Secure Platform
                    </div>
                    <div className="text-gray-400 text-xs">
                      Bank-Level Security
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-xl">
                    <Trophy className="h-5 w-5 text-purple-400" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-sm">
                      Fair Play
                    </div>
                    <div className="text-gray-400 text-xs">
                      Guaranteed Integrity
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-600/30">
                <p className="text-gray-400 text-sm font-medium">
                  © 2024 NNC Games • Licensed Gaming Platform • 24/7 Support
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star className="h-3 w-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-bold">
                    4.8/5 Rating
                  </span>
                  <span className="text-gray-500 text-xs">
                    from 10K+ reviews
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
};
