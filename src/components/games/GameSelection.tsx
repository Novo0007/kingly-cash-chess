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
      features: [
        "🏆 Tournaments",
        "⚡ Quick Matches",
        "💰 Real Prizes",
        "📈 Rankings",
      ],
    },
    {
      id: "ludo",
      title: "Ludo King",
      description: "Classic board game with 2-4 players and real money prizes",
      icon: Dice1,
      emoji: "🎲",
      color: "blue",
      features: [
        "👥 2-4 Players",
        "🎯 Strategy",
        "💰 Real Prizes",
        "⚡ Quick Games",
      ],
    },
  ];

  const comingSoonGames = [
    { name: "Carrom", emoji: "🏅", progress: 60 },
    { name: "Snake & Ladder", emoji: "🐍", progress: 45 },
    { name: "Teen Patti", emoji: "🃏", progress: 30 },
  ];

  return (
    <MobileContainer maxWidth="xl">
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <Card className="lavender-card lavender-shadow border-purple-200/50">
          <CardHeader className="text-center pb-3">
            <CardTitle className="lavender-text">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="relative">
                  <Gamepad2 className="h-8 w-8 md:h-10 md:w-10 text-purple-500" />
                  {!isMobile && (
                    <Star className="h-3 w-3 text-purple-400 absolute -top-1 -right-1" />
                  )}
                </div>
                <span className="text-2xl md:text-3xl font-bold lavender-text-gradient">
                  Choose Your Game
                </span>
              </div>
              <p className="text-purple-600 text-sm md:text-base font-normal max-w-2xl mx-auto">
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
              className="lavender-card lavender-shadow-lg border-purple-200/50 transition-all duration-300 hover:scale-105 hover:lavender-shadow-lg"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-purple-600 flex items-center gap-3 text-lg md:text-xl">
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
                <p className="text-purple-700 text-sm md:text-base">
                  {game.description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-2">
                  {game.features.map((feature, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-purple-100/50 text-purple-700 border-purple-200 text-xs p-2 justify-center"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Play Button */}
                <Button
                  onClick={() => onSelectGame(game.id as "chess" | "ludo")}
                  className="w-full lavender-button py-3 md:py-4 text-sm md:text-base"
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
        <Card className="lavender-card lavender-shadow border-purple-200/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-purple-600 text-center flex items-center justify-center gap-2 text-lg md:text-xl">
              <Star className="h-5 w-5 text-purple-400" />
              🚀 Coming Soon
              <Star className="h-5 w-5 text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {comingSoonGames.map((game, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-3xl md:text-4xl">{game.emoji}</div>
                  <h4 className="text-purple-700 font-semibold text-xs md:text-sm">
                    {game.name}
                  </h4>
                  <div className="w-full bg-purple-100 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${game.progress}%` }}
                    ></div>
                  </div>
                  <span className="text-purple-500 text-xs">
                    {game.progress}%
                  </span>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <p className="text-purple-600 text-xs md:text-sm">
                More exciting games are in development! Stay tuned for updates.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Chess Rules Quick Access */}
        <Card className="lavender-card lavender-shadow border-indigo-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-indigo-500" />
                <div>
                  <h4 className="text-indigo-700 font-semibold text-sm">
                    Learn Chess Rules
                  </h4>
                  <p className="text-indigo-600 text-xs">
                    Master the game with our comprehensive guide
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate("/chess-rules")}
                variant="outline"
                size="sm"
                className="text-indigo-600 border-indigo-300 hover:bg-indigo-50 text-xs px-3 py-2"
              >
                View Guide
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center">
          <p className="text-purple-500 text-xs md:text-sm">
            🎯 Play responsibly • 🔒 Secure platform • 💰 Fair play guaranteed
          </p>
        </div>
      </div>
    </MobileContainer>
  );
};
