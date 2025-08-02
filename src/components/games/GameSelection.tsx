import React, { useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Trophy,
  Star,
  Target,
  BookOpen,
  Play,
  ArrowRight,
  CheckCircle,
  Clock,
  Brain,
  Code,
  Image,
  FileText,
  Sparkles,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MobileChatSystem } from "@/components/chat/MobileChatSystem";
import { Button as ChatButton } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../../styles/game-lobby.css";
import { useTheme } from "@/contexts/ThemeContext";

interface GameSelectionProps {
  onSelectGame: (
    gameType:
      | "chess"
      | "math"
      | "wordsearch"
      | "codelearn"
      | "hangman"
      | "akinator"
      | "memory"
      | "fourpics",
  ) => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({
  onSelectGame,
}) => {
  const { isMobile, isTablet } = useDeviceType();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();
  const [showGlobalChat, setShowGlobalChat] = React.useState(false);
  const [gameFilter, setGameFilter] = React.useState<"all" | "free" | "money">(
    "all",
  );

  const handleGameSelect = useCallback(
    (
      gameType:
        | "chess"
        | "math"
        | "wordsearch"
        | "codelearn"
        | "fourpics"
        | "hangman"
        | "akinator"
        | "memory",
    ) => {
      onSelectGame(gameType);
    },
    [onSelectGame],
  );

  const handleFilterChange = useCallback((filter: "all" | "free" | "money") => {
    setGameFilter(filter);
  }, []);

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
        emoji: "♔",
        color: "amber",
        gradient: "from-amber-700 via-orange-700 to-yellow-700",
        lightGradient: "from-amber-100 via-orange-100 to-yellow-100",
        features: [
          "🏆 Tournaments",
          "⚡ Quick Matches",
          "💰 Real Prizes",
          "📈 Rankings",
        ],
        status: "Popular",
        players: "2.5K+ Online",
        isMoneyGame: true,
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
          "👥 Multiplayer Mode",
          "🪙 Coin System",
          "💡 Smart Hints",
          "🏆 Leaderboards",
        ],
        status: "NEW",
        players: "150+ Playing",
        isMoneyGame: true,
      },
      {
        id: "codelearn",
        title: "CodeMaster",
        description:
          "Master programming with interactive lessons, coding challenges, and a supportive community!",
        icon: Code,
        emoji: "👨‍💻",
        color: "indigo",
        gradient: "from-indigo-700 via-blue-700 to-purple-700",
        lightGradient: "from-indigo-100 via-blue-100 to-purple-100",
        features: [
          "🆓 Free Learning",
          "📚 6 Languages",
          "🏆 Achievements",
          "📈 Progress Tracking",
        ],
        status: "LEARN",
        players: "1.2K+ Learning",
        isMoneyGame: false,
      },
      {
        id: "fourpics",
        title: "4 Pics 1 Word",
        description:
          "Guess the word from four pictures - challenging visual puzzles with coin rewards!",
        icon: Image,
        emoji: "🖼️",
        color: "orange",
        gradient: "from-orange-700 via-red-700 to-pink-700",
        lightGradient: "from-orange-100 via-red-100 to-pink-100",
        features: [
          "🖼️ Visual Puzzles",
          "🪙 Coin System",
          "💡 Smart Hints",
          "📈 99 Levels",
        ],
        status: "NEW",
        players: "80+ Playing",
        isMoneyGame: true,
      },
      {
        id: "hangman",
        title: "Hangman",
        description:
          "Classic word guessing game with multiple difficulty levels and categories!",
        icon: FileText,
        emoji: "🎯",
        color: "slate",
        gradient: "from-slate-700 via-gray-700 to-zinc-700",
        lightGradient: "from-slate-100 via-gray-100 to-zinc-100",
        features: [
          "🆓 Free to Play",
          "🎯 Word Guessing",
          "📚 Multiple Categories",
          "⚡ 3 Difficulty Levels",
        ],
        status: "NEW",
        players: "50+ Playing",
        isMoneyGame: false,
      },
      {
        id: "akinator",
        title: "Akinator",
        description:
          "Mind-reading AI genie that guesses any character you think of!",
        icon: Sparkles,
        emoji: "🔮",
        color: "violet",
        gradient: "from-violet-700 via-purple-700 to-indigo-700",
        lightGradient: "from-violet-100 via-purple-100 to-indigo-100",
        features: [
          "🆓 Free to Play",
          "🔮 AI Mind Reading",
          "🧠 Smart Questions",
          "🌟 Hundreds of Characters",
        ],
        status: "NEW",
        players: "120+ Playing",
        isMoneyGame: false,
      },
    ],
    [],
  );

  // Filter games based on selected filter
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      if (gameFilter === "free") return !game.isMoneyGame;
      if (gameFilter === "money") return game.isMoneyGame;
      return true;
    });
  }, [games, gameFilter]);

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        {/* Themed Header */}
        <div className="relative">
          <div
            className={`absolute -inset-4 bg-gradient-to-r ${currentTheme.gradients.primary}/20 rounded-2xl blur-xl animate-pulse`}
          ></div>
          <div
            className={`relative flex items-center gap-4 mb-6 md:mb-8 p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10`}
          >
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

        {/* Global Chat Button */}
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
                  💰 Earn Money ({games.filter((g) => g.isMoneyGame).length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="relative bg-gradient-to-br from-white via-gray-50/80 to-white backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl h-full">
              {/* Status Badge */}
              <div className="absolute top-2 right-2 z-10">
                <Badge
                  className={`bg-gradient-to-r ${game.gradient} text-white border-0 font-bold px-2 py-1 text-xs`}
                >
                  <Star className="h-3 w-3 mr-1" />
                  {game.status}
                </Badge>
              </div>

              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="flex items-center gap-3">
                  <div className="relative">
                    <div
                      className={`p-3 bg-gradient-to-br ${game.gradient} rounded-xl text-white shadow-lg`}
                    >
                      <game.icon className="h-6 w-6" />
                    </div>
                    <div className="absolute -top-1 -right-1 text-lg">
                      {game.emoji}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-gray-800 font-bold text-lg truncate">
                      {game.title}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-600 font-semibold">
                        {game.players}
                      </span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 px-4">
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                  {game.description}
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {game.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100"
                    >
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-700 truncate">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Play Button */}
                <Button
                  onClick={() =>
                    handleGameSelect(
                      game.id as
                        | "chess"
                        | "math"
                        | "wordsearch"
                        | "codelearn"
                        | "fourpics"
                        | "hangman"
                        | "akinator"
                        | "memory",
                    )
                  }
                  className={`w-full bg-gradient-to-r ${game.gradient} text-white border-0 py-4 text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Play className="h-4 w-4" />
                    <span>PLAY NOW</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Button>

                {/* Prize Info */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <Trophy className="h-3 w-3 text-yellow-500" />
                    <span className="text-xs font-semibold text-gray-600">
                      Prize Pool
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold text-green-600">
                      {game.isMoneyGame ? "₹2,50,000" : "FREE"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Rules Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card className="relative bg-gradient-to-br from-blue-500 to-purple-600 border-0 rounded-xl shadow-lg overflow-hidden">
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Chess Rules Guide</h4>
                    <p className="text-white/90 text-sm">Master strategy</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/chess-rules")}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  Learn
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-pink-500 to-rose-600 border-0 rounded-xl shadow-lg overflow-hidden">
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Math Rules Guide</h4>
                    <p className="text-white/90 text-sm">Learn strategies</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/math-rules")}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  Learn
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-emerald-500 to-teal-600 border-0 rounded-xl shadow-lg overflow-hidden">
            <CardContent className="relative p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">Word Search Rules</h4>
                    <p className="text-white/90 text-sm">Master word finding</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/wordsearch-rules")}
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                >
                  Learn
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileContainer>
  );
};