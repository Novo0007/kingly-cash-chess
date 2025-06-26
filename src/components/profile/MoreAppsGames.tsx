import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Gamepad2,
  Trophy,
  Star,
  Download,
  ExternalLink,
  Play,
  Clock,
  Users,
  Target,
  Zap,
  Crown,
  Puzzle,
  Dice1,
  Swords,
  Brain,
  Rocket,
  Heart,
  Globe,
  Smartphone,
  Bell,
} from "lucide-react";

export const MoreAppsGames = () => {
  const featuredGames = [
    {
      id: "dots-boxes",
      title: "Dots and Boxes",
      description:
        "Classic paper-and-pencil strategy game with multiplayer competition",
      status: "available",
      players: "2.5K+",
      rating: 4.8,
      icon: Target,
      color: "from-blue-500 to-cyan-500",
      features: ["Real-time Multiplayer", "Tournaments", "Rating System"],
    },
    {
      id: "chess-variants",
      title: "Chess Variants",
      description:
        "Experience chess like never before with exciting game modes",
      status: "coming-soon",
      players: "Coming Soon",
      rating: 5.0,
      icon: Crown,
      color: "from-purple-500 to-pink-500",
      features: ["King of the Hill", "Chess960", "Atomic Chess"],
    },
    {
      id: "puzzle-rush",
      title: "Puzzle Rush",
      description:
        "Solve chess puzzles quickly to improve your tactical skills",
      status: "beta",
      players: "1.2K+",
      rating: 4.6,
      icon: Puzzle,
      color: "from-green-500 to-emerald-500",
      features: ["Daily Puzzles", "Speed Challenges", "Skill Ratings"],
    },
  ];

  const upcomingGames = [
    {
      title: "Card Arena",
      description: "Multiplayer card games including Poker, Rummy, and more",
      eta: "Q1 2025",
      icon: Dice1,
      color: "text-red-400",
    },
    {
      title: "Word Battles",
      description: "Competitive word games and vocabulary challenges",
      eta: "Q2 2025",
      icon: Brain,
      color: "text-orange-400",
    },
    {
      title: "Strategy Conquest",
      description: "Real-time strategy battles with tactical gameplay",
      eta: "Q3 2025",
      icon: Swords,
      color: "text-purple-400",
    },
    {
      title: "Racing League",
      description: "Fast-paced racing competitions with friends",
      eta: "Q4 2025",
      icon: Rocket,
      color: "text-blue-400",
    },
  ];

  const platforms = [
    { name: "Web", icon: Globe, available: true },
    { name: "Android", icon: Smartphone, available: true },
    { name: "iOS", icon: Smartphone, available: false, coming: "Soon" },
  ];

  const handleGameAction = (gameId: string, action: string) => {
    if (action === "play" && gameId === "dots-boxes") {
      toast.success("Redirecting to Dots and Boxes!");
    } else if (action === "download") {
      toast.info("Download link coming soon!");
    } else {
      toast.info(`${action} for ${gameId} - Coming soon!`);
    }
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center">
              <Gamepad2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-white">
            Our Games Collection
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Discover more exciting games from the NNC Games universe
          </p>
        </CardHeader>
      </Card>

      {/* Platform Availability */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-cyan-400" />
            Available Platforms
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className="text-center p-3 bg-slate-700/30 rounded-lg"
              >
                <platform.icon
                  className={`h-6 w-6 mx-auto mb-2 ${platform.available ? "text-green-400" : "text-slate-500"}`}
                />
                <h4 className="text-white font-semibold text-sm">
                  {platform.name}
                </h4>
                {platform.available ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 mt-1 text-xs">
                    Available
                  </Badge>
                ) : (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 mt-1 text-xs">
                    {platform.coming}
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Featured Games */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-400" />
            Featured Games
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {featuredGames.map((game) => (
            <Card
              key={game.id}
              className="bg-slate-700/30 border border-slate-600"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${game.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <game.icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-white font-semibold text-lg">
                          {game.title}
                        </h3>
                        <p className="text-slate-400 text-sm">
                          {game.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {game.status === "available" && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Available
                          </Badge>
                        )}
                        {game.status === "beta" && (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            Beta
                          </Badge>
                        )}
                        {game.status === "coming-soon" && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                            Coming Soon
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="text-slate-300">{game.players}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-slate-300">{game.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {game.features.map((feature, index) => (
                        <Badge
                          key={index}
                          className="bg-slate-600/50 text-slate-300 text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {game.status === "available" ? (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => handleGameAction(game.id, "play")}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Play Now
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            onClick={() =>
                              handleGameAction(game.id, "download")
                            }
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-400 hover:bg-slate-700/50"
                          disabled
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          {game.status === "beta" ? "Join Beta" : "Notify Me"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      {/* Upcoming Games */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Rocket className="h-5 w-5 text-purple-400" />
            Upcoming Games
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingGames.map((game, index) => (
              <Card
                key={index}
                className="bg-slate-700/20 border border-slate-600/50"
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <game.icon className={`h-6 w-6 ${game.color} mt-1`} />
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1">
                        {game.title}
                      </h4>
                      <p className="text-slate-400 text-xs mb-2">
                        {game.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-slate-600/50 text-slate-300 text-xs">
                          {game.eta}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-400 hover:bg-slate-700/50 h-7 px-2 text-xs"
                          onClick={() =>
                            toast.info(
                              `Notifications enabled for ${game.title}!`,
                            )
                          }
                        >
                          Notify Me
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Development */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            Why Choose NNC Games?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                <Zap className="h-5 w-5 text-yellow-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    Real-time Competition
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Instant matchmaking with players worldwide
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                <Trophy className="h-5 w-5 text-orange-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    Earn Rewards
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Win real money and exclusive prizes
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    Growing Community
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Join thousands of passionate gamers
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-700/20 rounded-lg">
                <Heart className="h-5 w-5 text-red-400 mt-1" />
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    Regular Updates
                  </h4>
                  <p className="text-slate-400 text-xs">
                    New features and games every month
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Platform Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">15K+</div>
              <div className="text-slate-400 text-xs">Active Players</div>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-green-400">100K+</div>
              <div className="text-slate-400 text-xs">Games Played</div>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-purple-400">5+</div>
              <div className="text-slate-400 text-xs">Games Available</div>
            </div>
            <div className="text-center p-3 bg-slate-700/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-400">4.8</div>
              <div className="text-slate-400 text-xs">Average Rating</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Newsletter Signup */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600">
        <CardContent className="text-center py-6">
          <h3 className="text-white font-semibold mb-2">Stay Updated</h3>
          <p className="text-slate-400 text-sm mb-4">
            Be the first to know about new games, features, and special events!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
              onClick={() =>
                toast.success("You'll be notified about new games and updates!")
              }
            >
              <Bell className="h-4 w-4 mr-2" />
              Get Updates
            </Button>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
              onClick={() =>
                window.open("https://discord.gg/nncgames", "_blank")
              }
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Join Discord
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardContent className="text-center py-4">
          <p className="text-slate-400 text-sm">
            More games are in development! Your feedback helps us create better
            gaming experiences.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            © 2024 NNC Games • Building the future of competitive gaming
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
