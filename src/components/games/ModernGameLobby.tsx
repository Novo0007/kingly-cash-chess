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
  Clock,
  Users,
  Sparkles,
  MessageSquare,
  Play,
  ArrowRight,
  Trophy,
  BookOpen,
  Zap,
  Gift,
  TrendingUp,
  Shield,
  CheckCircle,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileChatSystem } from "@/components/chat/MobileChatSystem";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface ModernGameLobbyProps {
  onSelectGame: (
    gameType: "chess" | "ludo" | "maze" | "game2048" | "math" | "wordsearch",
  ) => void;
}

export const ModernGameLobby: React.FC<ModernGameLobbyProps> = ({
  onSelectGame,
}) => {
  const { isMobile } = useDeviceType();
  const { currentTheme } = useTheme();
  const [showGlobalChat, setShowGlobalChat] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const games = [
    {
      id: "chess",
      title: "Chess Arena",
      subtitle: "Strategic Battles",
      description: "Master the ancient game of kings with real money prizes",
      icon: Crown,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-50 to-orange-50",
      players: "2.5K+",
      status: "🔥 HOT",
      earning: "₹2,50,000",
      features: ["Tournaments", "Quick Play", "Rankings"],
      image:
        "https://images.unsplash.com/photo-1528819622765-d6bcf132ac11?w=400&h=300&fit=crop",
      isPopular: true,
      isPaid: true,
    },
    {
      id: "ludo",
      title: "Ludo King",
      subtitle: "Classic Board Game",
      description: "Roll the dice and race to victory in this beloved game",
      icon: Dice1,
      gradient: "from-green-500 via-emerald-500 to-teal-500",
      bgGradient: "from-green-50 to-emerald-50",
      players: "1.8K+",
      status: "⭐ NEW",
      earning: "₹1,80,000",
      features: ["2-4 Players", "Quick Match", "Prizes"],
      image:
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=300&fit=crop",
      isPopular: true,
      isPaid: true,
    },
    {
      id: "maze",
      title: "Maze Challenge",
      subtitle: "Puzzle Adventure",
      description: "Navigate through challenging mazes and earn points",
      icon: Target,
      gradient: "from-purple-500 via-violet-500 to-indigo-500",
      bgGradient: "from-purple-50 to-violet-50",
      players: "500+",
      status: "🆓 FREE",
      earning: "Free Play",
      features: ["Brain Training", "Levels", "Leaderboard"],
      image:
        "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=400&h=300&fit=crop",
      isPopular: false,
      isPaid: false,
    },
    {
      id: "game2048",
      title: "2048 Puzzle",
      subtitle: "Number Challenge",
      description: "Combine tiles to reach the ultimate goal of 2048",
      icon: Gamepad2,
      gradient: "from-cyan-500 via-blue-500 to-indigo-500",
      bgGradient: "from-cyan-50 to-blue-50",
      players: "300+",
      status: "🎯 FOCUS",
      earning: "Free Play",
      features: ["3 Modes", "Achievements", "Records"],
      image:
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop",
      isPopular: false,
      isPaid: false,
    },
    {
      id: "math",
      title: "Math Puzzles",
      subtitle: "Brain Training",
      description: "Sharpen your arithmetic skills with timed challenges",
      icon: Brain,
      gradient: "from-pink-500 via-rose-500 to-red-500",
      bgGradient: "from-pink-50 to-rose-50",
      players: "200+",
      status: "🧠 SMART",
      earning: "Free Play",
      features: ["6 Types", "Difficulty", "Progress"],
      image:
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
      isPopular: false,
      isPaid: false,
    },
    {
      id: "wordsearch",
      title: "Word Search",
      subtitle: "Word Puzzles",
      description: "Find hidden words in grids with friends and earn coins",
      icon: BookOpen,
      gradient: "from-emerald-500 via-teal-500 to-green-500",
      bgGradient: "from-emerald-50 to-teal-50",
      players: "150+",
      status: "💰 COINS",
      earning: "Coin Rewards",
      features: ["Multiplayer", "Hints", "Rewards"],
      image:
        "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
      isPopular: true,
      isPaid: true,
    },
  ];

  const handleGameSelect = useCallback(
    (
      gameType: "chess" | "ludo" | "maze" | "game2048" | "math" | "wordsearch",
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

  return (
    <div
      className={`min-h-screen relative overflow-hidden ${
        currentTheme.id === "dreampixels"
          ? "bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50"
          : `bg-gradient-to-br ${currentTheme.gradients.primary}/5 via-background to-${currentTheme.gradients.secondary}/5`
      }`}
    >
      {/* Theme-aware Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-20 left-10 w-72 h-72 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse`}
        ></div>
        <div
          className={`absolute top-40 right-10 w-72 h-72 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse`}
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className={`absolute -bottom-32 left-20 w-72 h-72 bg-gradient-to-r ${currentTheme.gradients.secondary} rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse`}
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Global Chat System */}
      <MobileChatSystem
        isGlobalChat={true}
        isOpen={showGlobalChat}
        onClose={handleChatClose}
      />

      {/* Floating Chat Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <Button
          onClick={handleChatToggle}
          className={`w-16 h-16 rounded-full bg-gradient-to-r ${currentTheme.gradients.primary} text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border-4 border-white`}
        >
          <MessageSquare className="h-7 w-7" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Hero Section */}
        <div
          className={`text-center mb-12 transition-all duration-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div
            className={`inline-flex items-center gap-3 backdrop-blur-sm rounded-full px-6 py-3 mb-6 shadow-lg border ${
              currentTheme.id === "dreampixels"
                ? "bg-white/80 border-purple-200/40"
                : "bg-card/80 border-primary/20"
            }`}
          >
            <div
              className={`w-8 h-8 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full flex items-center justify-center`}
            >
              <span className="text-white text-lg">{currentTheme.preview}</span>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {currentTheme.name} Gaming Platform
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6">
            <span
              className={`bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent`}
            >
              Play & Win
            </span>
            <br />
            <span className="text-gray-800">Real Money</span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            Join thousands of players competing in skill-based games with
            <span className="font-bold text-green-600"> real cash prizes</span>
          </p>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <div className="text-2xl font-black text-gray-800">5K+</div>
              <div className="text-sm text-gray-600">Active Players</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <div className="text-2xl font-black text-green-600">₹10L+</div>
              <div className="text-sm text-gray-600">Prizes Won</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
              <div className="text-2xl font-black text-blue-600">24/7</div>
              <div className="text-sm text-gray-600">Support</div>
            </div>
          </div>
        </div>

        {/* Game Categories Filter */}
        <div
          className={`flex flex-wrap justify-center gap-3 mb-12 transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full px-6 py-3 hover:shadow-lg transition-all duration-300">
            <Trophy className="h-4 w-4 mr-2" />
            All Games
          </Button>
          <Button
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-white/30 rounded-full px-6 py-3 hover:bg-green-500 hover:text-white transition-all duration-300"
          >
            <Gift className="h-4 w-4 mr-2" />
            Free Games
          </Button>
          <Button
            variant="outline"
            className="bg-white/80 backdrop-blur-sm border-white/30 rounded-full px-6 py-3 hover:bg-yellow-500 hover:text-white transition-all duration-300"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Earning Games
          </Button>
        </div>

        {/* Games Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {games.map((game, index) => (
            <div
              key={game.id}
              className={`group cursor-pointer transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
              style={{ transitionDelay: `${400 + index * 100}ms` }}
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
            >
              <Card
                className={`backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-2 overflow-hidden ${
                  currentTheme.id === "dreampixels"
                    ? "bg-white/80 border-purple-200/30"
                    : "bg-card/80 border-primary/20"
                }`}
              >
                {/* Game Image */}
                <div className="relative h-48 overflow-hidden">
                  <OptimizedImage
                    src={game.image}
                    alt={game.title}
                    width={400}
                    height={300}
                    quality={85}
                    className="w-full h-full transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    placeholder="blur"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${currentTheme.gradients.primary} opacity-60`}
                  ></div>

                  {/* Status Badge */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={`border-0 font-bold ${
                        currentTheme.id === "dreampixels"
                          ? "bg-white/90 text-gray-800"
                          : "bg-card/90 text-card-foreground"
                      }`}
                    >
                      {game.status}
                    </Badge>
                  </div>

                  {/* Popular Badge */}
                  {game.isPopular && (
                    <div className="absolute top-4 right-4">
                      <div
                        className={`bg-gradient-to-r ${currentTheme.gradients.accent} text-white rounded-full p-2`}
                      >
                        <Star className="h-4 w-4" />
                      </div>
                    </div>
                  )}

                  {/* Icon */}
                  <div className="absolute bottom-4 left-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                      <game.icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  {/* Players Count */}
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 border border-white/30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-semibold">
                      {game.players} online
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="mb-4">
                    <h3 className="text-2xl font-black text-foreground mb-1">
                      {game.title}
                    </h3>
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {game.subtitle}
                    </p>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {game.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {game.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-100 text-gray-700 text-xs font-semibold px-3 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Earning Info */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-600">
                        Prize Pool
                      </span>
                    </div>
                    <span
                      className={`text-lg font-black ${game.isPaid ? "text-green-600" : "text-blue-600"}`}
                    >
                      {game.earning}
                    </span>
                  </div>

                  {/* Play Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${game.gradient} text-white font-bold py-4 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] group/btn`}
                  >
                    <Play className="h-5 w-5 mr-2 transition-transform duration-300 group-hover/btn:scale-110" />
                    PLAY NOW
                    <ArrowRight className="h-5 w-5 ml-2 transition-transform duration-300 group-hover/btn:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        {/* Trust & Security Section */}
        <div
          className={`bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-8 sm:p-12 text-center transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
            Why Choose Our Platform?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">100% Secure</h3>
              <p className="text-gray-300">
                Bank-level security with encrypted transactions
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fair Play</h3>
              <p className="text-gray-300">
                Certified algorithms ensuring fair gameplay
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Instant Withdrawals
              </h3>
              <p className="text-gray-300">
                Quick and hassle-free money transfers
              </p>
            </div>
          </div>

          <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold px-8 py-4 rounded-2xl hover:shadow-lg transition-all duration-300 transform hover:scale-105">
            Start Playing Now
            <Sparkles className="h-5 w-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
