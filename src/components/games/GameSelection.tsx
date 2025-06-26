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
  const { isMobile, isTablet } = useDeviceType();

  const games = [
    {
      id: "chess",
      title: "Chess Arena",
      description:
        "Classic strategy game with timed matches and real money prizes",
      icon: Crown,
      emoji: "♛",
      color: "yellow",
      features: [
        "🏆 Tournaments",
        "��� Quick Matches",
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
      color: "blue",
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

  // Mobile-optimized lavender styles
  const cardGradient = isMobile
    ? "lavender-card border border-purple-200"
    : "lavender-card lavender-shadow-lg";

  const animationClass = isMobile
    ? ""
    : "transition-all duration-300 hover:scale-105 hover:lavender-shadow-lg";

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <Card
          className={`${cardGradient} ${animationClass} border-purple-300/50`}
        >
          <CardHeader className="text-center pb-3">
            <CardTitle className="lavender-text">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="relative">
                  <Gamepad2 className="h-8 w-8 md:h-10 md:w-10 text-blue-400" />
                  {!isMobile && (
                    <Star className="h-3 w-3 text-yellow-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <span className="text-2xl md:text-3xl font-bold">
                  Choose Your Game
                </span>
              </div>
              <p className="text-slate-300 text-sm md:text-base font-normal max-w-2xl mx-auto">
                Select your favorite game and start competing with players
                worldwide for real money prizes!
              </p>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Main Games */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {games.map((game, index) => (
            <Card
              key={game.id}
              className={`${cardGradient} ${animationClass} ${game.color === "yellow" ? "border-yellow-600/30" : "border-blue-600/30"}`}
            >
              <CardHeader className="pb-3">
                <CardTitle
                  className={`${game.color === "yellow" ? "text-yellow-400" : "text-blue-400"} flex items-center gap-3 text-lg md:text-xl`}
                >
                  <div className="relative">
                    <game.icon className="h-6 w-6 md:h-7 md:w-7" />
                    {!isMobile && (
                      <div className="text-lg absolute -top-2 -right-2">
                        {game.emoji}
                      </div>
                    )}
                  </div>
                  {game.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-300 text-sm md:text-base">
                  {game.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  {game.features.map((feature, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-slate-700/50 text-slate-300 text-xs p-2 justify-center"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Play Button */}
                <Button
                  onClick={() =>
                    onSelectGame(game.id as "chess" | "dots-and-boxes")
                  }
                  className={`w-full ${game.color === "yellow" ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"} text-white font-bold py-3 md:py-4 text-sm md:text-base`}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Play Now
                  <Trophy className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coming Soon Section */}
        <Card
          className={`${cardGradient} ${animationClass} border-gray-600/30`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="text-gray-400 text-center flex items-center justify-center gap-2 text-lg md:text-xl">
              <Star className="h-5 w-5 text-yellow-400" />
              🚀 Coming Soon
              <Star className="h-5 w-5 text-yellow-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {comingSoonGames.map((game, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl">{game.emoji}</div>
                  <h4 className="text-white font-semibold text-xs md:text-sm">
                    {game.name}
                  </h4>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className={`${game.color === "yellow" ? "bg-yellow-500" : "bg-blue-500"} h-2 rounded-full transition-all duration-1000`}
                      style={{ width: `${game.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-slate-400 text-xs">
                    {game.progress}%
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-slate-400 text-xs md:text-sm">
                More exciting games are in development! Stay tuned for updates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center">
          <p className="text-slate-400 text-xs md:text-sm">
            🎯 Play responsibly • 🔒 Secure platform • 💰 Fair play guaranteed
          </p>
        </div>
      </div>
    </MobileContainer>
  );
};
