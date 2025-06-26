import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Crown,
  Grid3X3,
  Trophy,
  Zap,
  Star,
  Sparkles,
  Target,
  Gamepad2,
} from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface GameSelectionProps {
  onSelectGame: (gameType: "chess" | "dots-and-boxes") => void;
}

export const GameSelection: React.FC<GameSelectionProps> = ({
  onSelectGame,
}) => {
  const games = [
    {
      id: "chess",
      title: "Chess Arena",
      description:
        "Classic strategy game with timed matches and real money prizes",
      icon: Crown,
      emoji: "♛",
      gradient: "from-yellow-600 via-orange-600 to-red-600",
      borderColor: "border-yellow-400/50",
      glowColor: "from-yellow-400 via-orange-400 to-red-400",
      features: [
        "🏆 Tournaments",
        "⚡ Quick Matches",
        "💰 Real Prizes",
        "📈 Rankings",
      ],
    },
    {
      id: "dots-and-boxes",
      title: "Dots & Boxes",
      description: "Connect dots to complete boxes and dominate the grid",
      icon: Grid3X3,
      emoji: "📦",
      gradient: "from-blue-600 via-cyan-600 to-teal-600",
      borderColor: "border-blue-400/50",
      glowColor: "from-blue-400 via-cyan-400 to-teal-400",
      features: [
        "🎯 Strategy",
        "⚡ Fast Paced",
        "🧠 Mind Games",
        "🔥 Addictive",
      ],
    },
  ];

  const comingSoonGames = [
    { name: "Ludo King", emoji: "🎲", progress: 75 },
    { name: "Carrom", emoji: "🏅", progress: 60 },
    { name: "Snake & Ladder", emoji: "🐍", progress: 45 },
    { name: "Teen Patti", emoji: "🃏", progress: 30 },
  ];

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full blur-2xl opacity-60 animate-pulse"></div>
          <div className="relative text-6xl md:text-7xl">🎮</div>
        </div>
        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
          Choose Your Game
        </h1>
        <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto">
          Select your favorite game and start competing with players worldwide
          for real money prizes!
        </p>
      </div>

      {/* Main Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        {games.map((game, index) => (
          <div key={game.id} className="relative group">
            {/* Glow Effect */}
            <div
              className={`absolute -inset-2 bg-gradient-to-r ${game.glowColor} rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
            ></div>

            <div
              className={`relative backdrop-blur-xl bg-gradient-to-br ${game.gradient}/80 border-2 ${game.borderColor} shadow-2xl rounded-3xl overflow-hidden transform hover:scale-[1.02] transition-all duration-500 cursor-pointer`}
            >
              {/* Animated Background Elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl animate-pulse"></div>
                <div
                  className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>

                {/* Floating Gaming Icons */}
                <div
                  className="absolute top-4 right-4 text-white/20 animate-bounce"
                  style={{ animationDelay: "0s" }}
                >
                  {game.emoji}
                </div>
                <Star
                  className="absolute bottom-4 left-4 h-4 w-4 text-white/20 animate-pulse"
                  style={{ animationDelay: "0.5s" }}
                />
                <Sparkles
                  className="absolute top-1/2 right-8 h-3 w-3 text-white/20 animate-pulse"
                  style={{ animationDelay: "1s" }}
                />
              </div>

              <div className="relative z-10 p-6 md:p-8">
                {/* Game Icon and Title */}
                <div className="text-center mb-6">
                  <div className="relative inline-block mb-4">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                      <game.icon className="h-12 w-12 md:h-16 md:w-16 text-white drop-shadow-lg mx-auto" />
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-4xl font-black text-white mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    {game.title}
                  </h2>

                  <p className="text-white/90 text-base md:text-lg font-medium leading-relaxed">
                    {game.description}
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {game.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20"
                    >
                      <span className="text-white/90 text-sm font-medium">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Play Button */}
                <Button
                  onClick={() =>
                    onSelectGame(game.id as "chess" | "dots-and-boxes")
                  }
                  className="w-full relative group/btn bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/30 text-white font-black text-lg md:text-xl py-4 md:py-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl overflow-hidden"
                >
                  {/* Button Background Animation */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/20 to-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>

                  <div className="relative flex items-center justify-center gap-3">
                    <Zap className="h-6 w-6 text-yellow-400" />
                    <span>Play Now</span>
                    <Trophy className="h-6 w-6 text-yellow-400" />
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Coming Soon Section */}
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-gray-400 to-gray-600 rounded-3xl blur-xl opacity-40"></div>
        <div className="relative backdrop-blur-xl bg-gradient-to-r from-gray-700/80 to-gray-800/80 border-2 border-gray-600/50 shadow-2xl rounded-3xl overflow-hidden p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-black text-white mb-6 text-center flex items-center justify-center gap-3">
            <Star className="h-6 w-6 text-yellow-400" />
            🚀 Coming Soon
            <Star className="h-6 w-6 text-yellow-400" />
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {comingSoonGames.map((game, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-3">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-300">
                    {game.emoji}
                  </div>
                </div>

                <h4 className="text-white font-bold text-sm md:text-base mb-2">
                  {game.name}
                </h4>

                <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${game.progress}%` }}
                  ></div>
                </div>

                <span className="text-gray-400 text-xs">{game.progress}%</span>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-gray-300 text-sm md:text-base">
              More exciting games are in development! Stay tuned for updates.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Message */}
      <div className="text-center">
        <p className="text-gray-400 text-sm">
          🎯 Play responsibly • 🔒 Secure platform • 💰 Fair play guaranteed
        </p>
      </div>
    </div>
  );
};
