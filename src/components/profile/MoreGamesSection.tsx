import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Crown,
  Zap,
  Target,
  Gamepad2,
  Trophy,
  Star,
  Download,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface MoreGamesSectionProps {
  onBack: () => void;
}

export const MoreGamesSection = ({ onBack }: MoreGamesSectionProps) => {
  const gameCategories = [
    {
      title: "♟️ Strategy Games",
      games: [
        {
          name: "Chess Arena",
          description: "Classic chess with online multiplayer",
          icon: "♛",
          status: "Available",
          statusColor: "bg-green-500/20 text-green-400 border-green-500/30",
          gradient: "from-purple-600 to-blue-600",
        },
        {
          name: "Checkers Pro",
          description: "Strategic board game",
          icon: "⚫",
          status: "Coming Soon",
          statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-orange-600 to-red-600",
        },
        {
          name: "Go Master",
          description: "Ancient strategy game",
          icon: "⚪",
          status: "Coming Soon",
          statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-gray-600 to-slate-600",
        },
      ],
    },
    {
      title: "🎯 Puzzle Games",
      games: [
        {
          name: "Sudoku Arena",
          description: "Number puzzle challenge",
          icon: "🔢",
          status: "Coming Soon",
          statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-indigo-600 to-purple-600",
        },
        {
          name: "Word Quest",
          description: "Word puzzle adventure",
          icon: "📝",
          status: "Coming Soon",
          statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-green-600 to-teal-600",
        },
      ],
    },
    {
      title: "🎮 Action Games",
      games: [
        {
          name: "Reaction Master",
          description: "Test your reflexes",
          icon: "⚡",
          status: "Beta",
          statusColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          gradient: "from-yellow-600 to-orange-600",
        },
        {
          name: "Memory Challenge",
          description: "Train your memory",
          icon: "🧠",
          status: "Coming Soon",
          statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-pink-600 to-purple-600",
        },
        {
          name: "Speed Typer",
          description: "Typing speed challenge",
          icon: "⌨️",
          status: "Coming Soon",
          statusColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          gradient: "from-slate-600 to-gray-600",
        },
      ],
    },
  ];

  const featuredApps = [
    {
      name: "NNC Tournament",
      description: "Join official tournaments",
      icon: "🏆",
      features: ["Prize Pools", "Rankings", "Live Streaming"],
      gradient: "from-yellow-600 to-orange-600",
    },
    {
      name: "NNC Academy",
      description: "Learn and improve your skills",
      icon: "🎓",
      features: ["Video Lessons", "Practice Puzzles", "Progress Tracking"],
      gradient: "from-blue-600 to-indigo-600",
    },
    {
      name: "NNC Social",
      description: "Connect with other players",
      icon: "👥",
      features: ["Friend System", "Chat Rooms", "Clubs"],
      gradient: "from-green-600 to-cyan-600",
    },
  ];

  return (
    <MobileContainer className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Button
          onClick={onBack}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          🎮 More Games & Apps
        </h1>
      </div>

      {/* Featured Apps */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
          ⭐ Featured Apps
        </h2>
        {featuredApps.map((app, index) => (
          <Card
            key={index}
            className={`bg-gradient-to-r ${app.gradient} border-2 border-white/20 shadow-xl`}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="text-3xl md:text-4xl">{app.icon}</div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-lg md:text-xl mb-1">
                    {app.name}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base mb-3">
                    {app.description}
                  </p>
                  <div className="flex flex-wrap gap-1 md:gap-2 mb-3">
                    {app.features.map((feature, idx) => (
                      <Badge
                        key={idx}
                        className="bg-white/20 text-white border-white/30 text-xs"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Game Categories */}
      {gameCategories.map((category, categoryIndex) => (
        <div key={categoryIndex} className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-white">
            {category.title}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:gap-4">
            {category.games.map((game, gameIndex) => (
              <Card
                key={gameIndex}
                className={`bg-gradient-to-r ${game.gradient} border-2 border-white/20 shadow-xl`}
              >
                <CardContent className="p-4 md:p-5">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="text-2xl md:text-3xl">{game.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-black text-base md:text-lg">
                          {game.name}
                        </h3>
                        <Badge className={`${game.statusColor} text-xs`}>
                          {game.status}
                        </Badge>
                      </div>
                      <p className="text-white/80 text-sm md:text-base mb-3">
                        {game.description}
                      </p>
                      <div className="flex gap-2">
                        {game.status === "Available" ? (
                          <Button
                            size="sm"
                            className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                          >
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Play Now
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white/60 cursor-not-allowed"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {game.status}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Coming Soon Notice */}
      <Card className="bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl">
        <CardContent className="p-4 md:p-6 text-center">
          <div className="space-y-3">
            <h3 className="text-white font-black text-lg md:text-xl">
              🚀 More Games Coming Soon!
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              We're constantly working on new games and features. Stay tuned for
              exciting updates!
            </p>
            <div className="flex justify-center">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Star className="h-4 w-4 mr-2" />
                Get Notified
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MobileContainer>
  );
};
