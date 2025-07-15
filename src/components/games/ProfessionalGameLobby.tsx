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
  Image,
  FileText,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { FloatingActionButton } from "@/components/ui/floating-action-button";

interface ProfessionalGameLobbyProps {
  onSelectGame: (
    gameType:
      | "chess"
      | "ludo"
      | "maze"
      | "game2048"
      | "math"
      | "wordsearch"
      | "codelearn"
      | "fourpics"
      | "hangman",
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
  const [showAllGames, setShowAllGames] = useState(false);

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
    {
      id: "fourpics",
      title: "4 Pics 1 Word",
      subtitle: "Visual Word Puzzle",
      description: "Guess the word from four pictures and earn coins",
      icon: Image,
      category: "earn",
      gradient: "from-orange-500 to-red-600",
      cardBg: "from-orange-50 to-red-50",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      players: "80+ Playing",
      status: "🖼️ NEW",
      earning: "Coin Rewards",
      features: ["99 Levels", "Smart Hints", "Visual Puzzles"],
      highlight: false,
      priority: 8,
    },
    {
      id: "hangman",
      title: "Hangman Classic",
      subtitle: "Word Guessing Game",
      description: "Classic word guessing with multiple difficulty levels",
      icon: FileText,
      category: "free",
      gradient: "from-gray-500 to-slate-600",
      cardBg: "from-gray-50 to-slate-50",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      players: "50+ Playing",
      status: "🎯 CLASSIC",
      earning: "Free Play",
      features: ["3 Difficulty Levels", "Word Categories", "Hints Available"],
      highlight: false,
      priority: 9,
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

  // Grid layout: 2x2 for all screen sizes with mobile optimization
  const getGridCols = () => {
    return "grid-cols-2"; // 2x2 grid for all screen sizes
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section - Mobile Optimized */}
      <div className="text-center space-y-4 px-4">
        <div
          className={`w-16 h-16 mx-auto bg-gradient-to-r ${currentTheme.gradients.primary} rounded-2xl flex items-center justify-center shadow-lg mb-4`}
        >
          <Gamepad2 className="w-8 h-8 text-white" />
        </div>

        <h1
          className={`${isMobile ? "text-2xl" : "text-3xl lg:text-4xl"} font-bold bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent`}
        >
          Game Hub
        </h1>
        <p
          className={`${isMobile ? "text-sm" : "text-lg"} text-muted-foreground max-w-2xl mx-auto`}
        >
          {isMobile
            ? "Choose from exciting games and start playing!"
            : "Choose from our collection of exciting games and start playing now!"}
        </p>

        {/* Stats - Mobile Responsive */}
        <div
          className={`flex justify-center items-center ${isMobile ? "gap-4" : "gap-8"} mt-6`}
        >
          <div className="text-center">
            <div
              className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-foreground`}
            >
              5.2K+
            </div>
            <div
              className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
            >
              {isMobile ? "Players" : "Active Players"}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-green-600`}
            >
              ₹10L+
            </div>
            <div
              className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
            >
              {isMobile ? "Prizes" : "Prizes Won"}
            </div>
          </div>
          <div className="text-center">
            <div
              className={`${isMobile ? "text-lg" : "text-2xl"} font-bold text-blue-600`}
            >
              24/7
            </div>
            <div
              className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
            >
              Support
            </div>
          </div>
        </div>
      </div>

      {/* Quick Access Section - Mobile Only */}
      {isMobile && (
        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Access
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {games.slice(0, 4).map((game) => (
              <button
                key={game.id}
                onClick={() => handleGameSelect(game.id)}
                className="flex flex-col items-center p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div
                  className={`w-10 h-10 ${game.iconBg} rounded-lg flex items-center justify-center mb-2`}
                >
                  <game.icon className={`w-5 h-5 ${game.iconColor}`} />
                </div>
                <span className="text-xs font-medium text-foreground text-center leading-tight">
                  {game.title.split(" ")[0]}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Category Filter - Mobile Optimized */}
        <div className="mb-6">
          <div
            className={`flex ${isMobile ? "justify-center" : "flex-wrap gap-3 justify-center lg:justify-start"} ${isMobile ? "gap-2" : "gap-3"}`}
          >
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id as any)}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                className={`flex items-center gap-2 ${isMobile ? "rounded-full px-4 py-2 text-sm" : "rounded-full"} ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white border-0 shadow-lg`
                    : "bg-card border-border text-foreground hover:bg-accent"
                }`}
              >
                <category.icon
                  className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                />
                {isMobile ? category.label.split(" ")[0] : category.label}
                <Badge
                  className={`ml-1 ${selectedCategory === category.id ? "bg-white/20" : "bg-muted"} text-xs px-2`}
                >
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

        {/* Games Grid - Mobile Optimized 2x2 Layout */}
        <div className={`grid ${getGridCols()} gap-3 md:gap-4 lg:gap-6`}>
          {(showAllGames ? filteredGames : filteredGames.slice(0, 4)).map(
            (game, index) => (
              <Card
                key={game.id}
                className="professional-card interactive group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-lg bg-card border border-border rounded-xl overflow-hidden"
                onClick={() => handleGameSelect(game.id)}
              >
                {/* Game Content - Icon and Name Only */}
                <div className="flex flex-col items-center justify-center p-6 h-full min-h-[120px] space-y-4">
                  {/* Game Icon */}
                  <div
                    className={`w-16 h-16 ${game.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <game.icon className={`w-8 h-8 ${game.iconColor}`} />
                  </div>

                  {/* Game Name */}
                  <h3 className="text-lg font-bold text-foreground text-center leading-tight">
                    {game.title}
                  </h3>
                </div>
              </Card>
            ),
          )}
        </div>

        {/* Show More/Less Button */}
        {filteredGames.length > 4 && (
          <div className="text-center mt-6">
            <Button
              onClick={() => setShowAllGames(!showAllGames)}
              variant="outline"
              className="bg-card border-border text-foreground hover:bg-accent px-8 py-3 rounded-full"
            >
              {showAllGames ? (
                <>
                  <Menu className="w-4 h-4 mr-2" />
                  Show Less Games
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Show All Games ({filteredGames.length})
                </>
              )}
            </Button>
          </div>
        )}

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

      {/* Floating Action Button for Mobile */}
      <FloatingActionButton onGameSelect={handleGameSelect} />
    </div>
  );
};

<script type="text/javascript">
	atOptions = {
		'key' : '2e0fab1f66abf373fe75b48440aae0c3',
		'format' : 'iframe',
		'height' : 50,
		'width' : 320,
		'params' : {}
	};
</script>
<script type="text/javascript" src="//www.highperformanceformat.com/2e0fab1f66abf373fe75b48440aae0c3/invoke.js"></script>
