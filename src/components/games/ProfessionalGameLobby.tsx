import React, { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Crown,
  Dice1,
  Target,
  Gamepad2,
  Brain,
  Star,
  Users,
  Play,
  BookOpen,
  Code,
  Trophy,
  Coins,
  Zap,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfessionalGameLobbyProps {
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

export const ProfessionalGameLobby: React.FC<ProfessionalGameLobbyProps> = ({
  onSelectGame,
}) => {
  const { currentTheme } = useTheme();
  const isMobile = useIsMobile();
  const [selectedCategory, setSelectedCategory] = useState<
    "all" | "free" | "earn"
  >("all");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const categories = [
    { id: "all", label: "All Games", icon: Menu, color: "slate" },
    { id: "free", label: "Free Play", icon: Star, color: "green" },
    { id: "earn", label: "Earn Money", icon: Coins, color: "amber" },
  ];

  const games = [
    {
      id: "codelearn",
      title: "CodeMaster",
      subtitle: "Master Programming",
      description:
        "Unlock the world of programming with interactive lessons and real-world challenges",
      icon: Code,
      category: "free",
      gradient: "from-violet-500 to-purple-600",
      cardBg: "from-violet-50 to-purple-50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      players: "1.2K+ Learning",
      status: "🎓 LEARN",
      earning: "Free Education",
      features: ["6+ Languages", "Interactive Lessons", "Progress Tracking"],
      highlight: true,
      priority: 1,
    },
    {
      id: "chess",
      title: "Chess Master",
      subtitle: "Strategic Battles",
      description: "Classical chess with tournaments and cash prizes",
      icon: Crown,
      category: "earn",
      gradient: "from-amber-500 to-orange-600",
      cardBg: "from-amber-50 to-orange-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      players: "2.5K+ Online",
      status: "�� HOT",
      earning: "₹2,50,000",
      features: ["Live Tournaments", "Quick Matches", "Global Rankings"],
      highlight: true,
      priority: 2,
    },
    {
      id: "ludo",
      title: "Ludo King",
      subtitle: "Board Game Classic",
      description: "Roll dice and race to victory with friends",
      icon: Dice1,
      category: "earn",
      gradient: "from-emerald-500 to-green-600",
      cardBg: "from-emerald-50 to-green-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      players: "1.8K+ Playing",
      status: "⭐ POPULAR",
      earning: "₹1,80,000",
      features: ["2-4 Players", "Quick Rounds", "Real Prizes"],
      highlight: true,
      priority: 3,
    },
    {
      id: "maze",
      title: "Maze Explorer",
      subtitle: "Puzzle Adventure",
      description: "Navigate complex mazes and challenge your mind",
      icon: Target,
      category: "free",
      gradient: "from-indigo-500 to-blue-600",
      cardBg: "from-indigo-50 to-blue-50",
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      players: "500+ Exploring",
      status: "🧩 PUZZLE",
      earning: "Free Play",
      features: ["Brain Training", "Multiple Levels", "Achievements"],
      highlight: false,
      priority: 4,
    },
    {
      id: "game2048",
      title: "2048 Challenge",
      subtitle: "Number Puzzle",
      description: "Combine tiles to reach the ultimate 2048 goal",
      icon: Gamepad2,
      category: "free",
      gradient: "from-cyan-500 to-blue-600",
      cardBg: "from-cyan-50 to-blue-50",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
      players: "300+ Playing",
      status: "🎯 FOCUS",
      earning: "Free Play",
      features: ["3 Difficulty Modes", "Best Score", "Smooth Animations"],
      highlight: false,
      priority: 5,
    },
    {
      id: "math",
      title: "Math Genius",
      subtitle: "Brain Training",
      description: "Boost your arithmetic skills with fun challenges",
      icon: Brain,
      category: "free",
      gradient: "from-rose-500 to-pink-600",
      cardBg: "from-rose-50 to-pink-50",
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
      players: "200+ Learning",
      status: "🧠 SMART",
      earning: "Free Play",
      features: ["6 Question Types", "Timed Challenges", "Progress Stats"],
      highlight: false,
      priority: 6,
    },
    {
      id: "wordsearch",
      title: "Word Hunt",
      subtitle: "Word Puzzles",
      description: "Find hidden words and earn coin rewards",
      icon: BookOpen,
      category: "earn",
      gradient: "from-teal-500 to-emerald-600",
      cardBg: "from-teal-50 to-emerald-50",
      iconBg: "bg-teal-100",
      iconColor: "text-teal-600",
      players: "150+ Hunting",
      status: "💰 COINS",
      earning: "Coin Rewards",
      features: ["Multiplayer Mode", "Smart Hints", "Daily Rewards"],
      highlight: false,
      priority: 7,
    },
  ];

  const filteredGames = games
    .filter((game) => {
      if (selectedCategory === "free") return game.category === "free";
      if (selectedCategory === "earn") return game.category === "earn";
      return true;
    })
    .sort((a, b) => a.priority - b.priority);

  const handleGameSelect = useCallback(
    (gameId: string) => {
      onSelectGame(gameId as any);
    },
    [onSelectGame],
  );

  // Grid layout: 1x1 for mobile, 2x2 for tablet, 3+ for desktop
  const getGridCols = () => {
    if (isMobile) return "grid-cols-1"; // 1x1 for mobile
    return "grid-cols-2 lg:grid-cols-3"; // 2x2 for tablet, 3+ for desktop
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-professional-primary text-3xl lg:text-4xl font-bold">
          Welcome to Game Hub
        </h1>
        <p className="text-professional-secondary text-lg max-w-2xl mx-auto">
          Choose from our collection of exciting games and start playing now!
        </p>

        {/* Stats */}
        <div className="flex justify-center items-center gap-8 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-professional-primary">
              5.2K+
            </div>
            <div className="text-professional-muted text-sm">
              Active Players
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">₹10L+</div>
            <div className="text-professional-muted text-sm">Prizes Won</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">24/7</div>
            <div className="text-professional-muted text-sm">Support</div>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                className={`professional-button size-md flex items-center gap-2 rounded-full ${
                  selectedCategory === category.id
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-white border-gray-200 text-professional-primary hover:bg-gray-50"
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
                <Badge className="ml-1 bg-white/20 text-xs px-2">
                  {category.id === "all"
                    ? games.length
                    : category.id === "free"
                      ? games.filter((g) => g.category === "free").length
                      : games.filter((g) => g.category === "earn").length}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Games Grid - Mobile First 1x1 Layout */}
        <div className={`grid ${getGridCols()} gap-4 lg:gap-6`}>
          {filteredGames.map((game, index) => (
            <Card
              key={game.id}
              className={`professional-card interactive group cursor-pointer ${
                game.highlight ? "ring-2 ring-blue-200 ring-opacity-50" : ""
              }`}
              onClick={() => handleGameSelect(game.id)}
            >
              {/* Card Header with gradient */}
              <div
                className={`h-24 lg:h-32 bg-gradient-to-r ${game.gradient} relative overflow-hidden`}
              >
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 text-gray-800 text-xs font-medium px-2 py-1">
                    {game.status}
                  </Badge>
                </div>

                {/* Player Count */}
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-medium">
                    {game.players.split("+")[0]}+
                  </span>
                </div>

                {/* Game Icon */}
                <div className="absolute bottom-3 left-3">
                  <div
                    className={`w-12 h-12 lg:w-14 lg:h-14 ${game.iconBg} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <game.icon
                      className={`w-6 h-6 lg:w-7 lg:h-7 ${game.iconColor}`}
                    />
                  </div>
                </div>

                {/* Highlight indicator */}
                {game.highlight && (
                  <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-yellow-400">
                    <Star className="absolute -top-4 -left-3 w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <CardContent className="p-4 lg:p-6">
                {/* Game Title */}
                <div className="mb-3">
                  <h3 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">
                    {game.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {game.subtitle}
                  </p>
                </div>

                {/* Game Description */}
                <p className="text-sm lg:text-base text-gray-600 mb-4 leading-relaxed">
                  {game.description}
                </p>

                {/* Features */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-2">
                    {game.features
                      .slice(0, isMobile ? 2 : 3)
                      .map((feature, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md"
                        >
                          {feature}
                        </span>
                      ))}
                    {game.features.length > (isMobile ? 2 : 3) && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                        +{game.features.length - (isMobile ? 2 : 3)} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Earning Info */}
                <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-600">
                      Prize Pool
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      game.category === "earn"
                        ? "text-green-600"
                        : "text-blue-600"
                    }`}
                  >
                    {game.earning}
                  </span>
                </div>

                {/* Play Button */}
                <Button
                  className={`w-full bg-gradient-to-r ${game.gradient} text-white font-semibold py-3 rounded-xl hover:opacity-90 transition-all duration-200 group/btn`}
                >
                  <Play className="w-4 h-4 mr-2 transition-transform duration-200 group-hover/btn:scale-110" />
                  PLAY NOW
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform duration-200 group-hover/btn:translate-x-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredGames.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Gamepad2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Games Found
            </h3>
            <p className="text-gray-500 mb-4">
              No games match your selected category
            </p>
            <Button
              onClick={() => setSelectedCategory("all")}
              variant="outline"
            >
              Show All Games
            </Button>
          </div>
        )}

        {/* Quick Stats Footer */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {games.length}
              </div>
              <div className="text-sm text-gray-500">Total Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">₹10L+</div>
              <div className="text-sm text-gray-500">Total Prizes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">5.2K+</div>
              <div className="text-sm text-gray-500">Active Players</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">24/7</div>
              <div className="text-sm text-gray-500">Support</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
