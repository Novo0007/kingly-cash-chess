import React from "react";
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
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { useNavigate } from "react-router-dom";

interface GameSelectionProps {
  onSelectGame: (gameType: "chess" | "ludo") => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({
  onSelectGame,
}) => {
  const { isMobile, isTablet } = useDeviceType();
  const navigate = useNavigate();

  const games = [
    {
      id: "chess",
      title: "Chess Arena",
      description:
        "Classic strategy game with timed matches and real money prizes",
      icon: Crown,
      emoji: "♛",
      color: "purple",
      gradient: "from-purple-500 via-purple-600 to-purple-700",
      lightGradient: "from-purple-100 via-purple-200 to-purple-300",
      features: [
        "🏆 Tournaments",
        "⚡ Quick Matches",
        "💰 Real Prizes",
        "📈 Rankings",
      ],
      status: "Popular",
      players: "2.5K+ Online",
    },
    {
      id: "ludo",
      title: "Ludo King",
      description: "Classic board game with 2-4 players and real money prizes",
      icon: Dice1,
      emoji: "🎲",
      color: "blue",
      gradient: "from-blue-500 via-cyan-500 to-blue-600",
      lightGradient: "from-blue-100 via-cyan-100 to-blue-200",
      features: [
        "👥 2-4 Players",
        "🎯 Strategy",
        "💰 Real Prizes",
        "⚡ Quick Games",
      ],
      status: "Hot",
      players: "1.8K+ Online",
    },
  ];

  const comingSoonGames = [
    { name: "Carrom", emoji: "🏅", progress: 85, eta: "Next Week" },
    { name: "Snake & Ladder", emoji: "🐍", progress: 65, eta: "2 Weeks" },
    { name: "Teen Patti", emoji: "🃏", progress: 45, eta: "1 Month" },
    { name: "Pool", emoji: "🎱", progress: 25, eta: "2 Months" },
  ];

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        {/* Natural Wood Header Background */}
        <div className="relative overflow-hidden">
          {/* Wood Background Effects */}
          <div className="absolute inset-0 wood-gradient-dark rounded-2xl opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-700/20 via-transparent to-orange-600/20 rounded-2xl"></div>

          {/* Natural Floating Elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-gradient-to-r from-amber-600/30 to-orange-600/30 rounded-full blur-xl wood-glow"></div>
          <div
            className="absolute bottom-4 left-4 w-12 h-12 bg-gradient-to-r from-green-700/30 to-emerald-700/30 rounded-full blur-lg wood-glow"
            style={{ animationDelay: "1s" }}
          ></div>

          <Card className="relative bg-transparent border-amber-300/20 backdrop-blur-sm wood-shadow-deep">
            <CardHeader className="text-center pb-6 pt-8">
              <CardTitle>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="relative group">
                    <div className="absolute -inset-3 bg-gradient-to-r from-amber-600 via-orange-600 to-yellow-600 rounded-full blur-xl opacity-60 group-hover:opacity-80 transition-all duration-500"></div>
                    <div className="relative p-3 bg-amber-100/10 backdrop-blur-sm rounded-full border border-amber-200/20">
                      <Gamepad2 className="h-10 w-10 md:h-12 md:w-12 text-amber-100 drop-shadow-lg" />
                    </div>
                    <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                      🏡
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="block text-3xl md:text-4xl lg:text-5xl font-black text-amber-100 drop-shadow-lg font-heading">
                      CHOOSE YOUR
                    </span>
                    <span className="block text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 bg-clip-text text-transparent drop-shadow-lg font-heading">
                      GAME
                    </span>
                  </div>
                </div>
                <p className="text-amber-100/90 text-base md:text-lg font-medium max-w-2xl mx-auto drop-shadow-md font-body">
                  🌲 Select your favorite game and join fellow players in our
                  cozy digital lodge for real prizes!
                </p>

                {/* Stats Bar */}
                <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-amber-200/20">
                  <div className="text-center">
                    <div className="text-amber-100 font-bold text-lg md:text-xl">
                      4.2K+
                    </div>
                    <div className="text-amber-200/80 text-xs">
                      Lodge Members
                    </div>
                  </div>
                  <div className="w-px h-8 bg-amber-200/20"></div>
                  <div className="text-center">
                    <div className="text-amber-100 font-bold text-lg md:text-xl">
                      ₹50L+
                    </div>
                    <div className="text-amber-200/80 text-xs">
                      Daily Prizes
                    </div>
                  </div>
                  <div className="w-px h-8 bg-amber-200/20"></div>
                  <div className="text-center">
                    <div className="text-amber-100 font-bold text-lg md:text-xl">
                      24/7
                    </div>
                    <div className="text-amber-200/80 text-xs">
                      Active Lodge
                    </div>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Main Games - Enhanced Vibrant Design */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {games.map((game, index) => (
            <div key={game.id} className="relative group">
              {/* Hover Glow Effect */}
              <div
                className={`absolute -inset-1 bg-gradient-to-r ${game.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500`}
              ></div>

              <Card className="relative bg-white/95 backdrop-blur-sm border-2 border-gray-100 rounded-3xl shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl overflow-hidden">
                {/* Background Pattern */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${game.lightGradient} rounded-bl-[100px] opacity-20`}
                ></div>

                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <Badge
                    className={`bg-gradient-to-r ${game.gradient} text-white border-0 font-bold px-3 py-1 text-xs`}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    {game.status}
                  </Badge>
                </div>

                <CardHeader className="pb-4 pt-6">
                  <CardTitle className="flex items-center gap-4 text-xl md:text-2xl">
                    <div className="relative group/icon">
                      <div
                        className={`absolute -inset-2 bg-gradient-to-r ${game.gradient} rounded-2xl blur-lg opacity-60 group-hover/icon:opacity-80 transition-all duration-300`}
                      ></div>
                      <div
                        className={`relative p-3 bg-gradient-to-r ${game.gradient} rounded-2xl text-white shadow-lg`}
                      >
                        <game.icon className="h-8 w-8 md:h-10 md:w-10 drop-shadow-lg" />
                      </div>
                      <div className="absolute -top-2 -right-2 text-2xl animate-bounce">
                        {game.emoji}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-800 font-black font-heading">
                        {game.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-green-600 font-semibold">
                            {game.players}
                          </span>
                        </div>
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">Live</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                  <p className="text-gray-600 text-base font-medium leading-relaxed">
                    {game.description}
                  </p>

                  {/* Enhanced Features Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {game.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-all duration-200"
                      >
                        <CheckCircle
                          className={`h-4 w-4 text-${game.color}-500 flex-shrink-0`}
                        />
                        <span className="text-sm font-semibold text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Enhanced Play Button with Animation */}
                  <Button
                    onClick={() => onSelectGame(game.id as "chess" | "ludo")}
                    className={`w-full relative overflow-hidden bg-gradient-to-r ${game.gradient} hover:${game.gradient} text-white border-0 py-4 md:py-5 text-base md:text-lg font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group/btn`}
                  >
                    {/* Button Background Animation */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

                    <div className="relative flex items-center justify-center gap-3">
                      <Play className="h-5 w-5 transition-transform duration-300 group-hover/btn:scale-110" />
                      <span className="font-black">PLAY NOW</span>
                      <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </div>
                  </Button>

                  {/* Quick Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-semibold text-gray-600">
                        Prize Pool
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-black text-green-600">
                        ₹{index === 0 ? "2,50,000" : "1,80,000"}
                      </span>
                      <Sparkles className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
        </div>

        {/* Enhanced Footer with Trust Badges */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10 rounded-2xl"></div>

          <Card className="relative bg-transparent border-gray-600/30 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
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
