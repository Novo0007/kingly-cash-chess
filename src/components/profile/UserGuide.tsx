import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  BookOpen,
  Play,
  Trophy,
  Users,
  MessageSquare,
  Wallet,
  Settings,
  Star,
  Target,
  Gamepad2,
  Crown,
  Shield,
  Zap,
  Gift,
  ChevronRight,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export const UserGuide = () => {
  const sections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: Play,
      color: "text-green-400",
      description: "Learn the basics of NNC Games platform",
    },
    {
      id: "chess",
      title: "Chess Arena",
      icon: Crown,
      color: "text-purple-400",
      description: "Master the chess gameplay and features",
    },
    {
      id: "wallet",
      title: "Wallet & Payments",
      icon: Wallet,
      color: "text-yellow-400",
      description: "Manage your funds and transactions",
    },
    {
      id: "social",
      title: "Social Features",
      icon: Users,
      color: "text-blue-400",
      description: "Connect with friends and chat",
    },
    {
      id: "tournaments",
      title: "Tournaments",
      icon: Trophy,
      color: "text-orange-400",
      description: "Compete in tournaments and events",
    },
    {
      id: "settings",
      title: "Account Settings",
      icon: Settings,
      color: "text-cyan-400",
      description: "Customize your gaming experience",
    },
  ];

  const quickTips = [
    {
      title: "Quick Match",
      description:
        "Click 'Find Game' to instantly match with players of similar skill level",
      icon: Zap,
    },
    {
      title: "Rating System",
      description:
        "Your chess rating updates after each game based on performance",
      icon: Star,
    },
    {
      title: "Safe Payments",
      description: "All transactions are encrypted and processed securely",
      icon: Shield,
    },
    {
      title: "Fair Play",
      description: "Anti-cheat systems ensure fair and competitive gameplay",
      icon: Target,
    },
  ];

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-xl font-bold text-white">
            User Guide
          </CardTitle>
          <p className="text-slate-400 text-sm">
            Everything you need to know to master NNC Games
          </p>
        </CardHeader>
      </Card>

      {/* Quick Tips */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-400" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickTips.map((tip, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"
              >
                <tip.icon className="h-5 w-5 text-blue-400 mt-1 flex-shrink-0" />
                <div>
                  <h4 className="text-white font-semibold text-sm">
                    {tip.title}
                  </h4>
                  <p className="text-slate-400 text-xs">{tip.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Guide Sections */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-purple-400" />
            Complete Guide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {/* Getting Started */}
            <AccordionItem
              value="getting-started"
              className="border border-slate-600 rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Play className="h-5 w-5 text-green-400" />
                  <span className="text-white font-semibold">
                    Getting Started
                  </span>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">
                    Essential
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      1. Create Your Account
                    </h4>
                    <ul className="space-y-2 text-slate-300 text-sm pl-4">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Sign up with email and create a unique username
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Verify your email address for account security
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Complete your profile with display name and preferences
                      </li>
                    </ul>
                  </div>

                  <Separator className="bg-slate-600/50" />

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      2. Navigate the Platform
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          🏠 Home
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Quick access to games and recent activity
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          🎮 Games
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Browse and join available games
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          👥 Friends
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Manage friends and send challenges
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          👤 Profile
                        </h5>
                        <p className="text-slate-400 text-xs">
                          View stats and manage settings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Chess Arena */}
            <AccordionItem
              value="chess"
              className="border border-slate-600 rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-purple-400" />
                  <span className="text-white font-semibold">Chess Arena</span>
                  <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                    Popular
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Game Modes
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-slate-700/20 rounded">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        <div>
                          <span className="text-white text-sm font-medium">
                            Quick Match
                          </span>
                          <p className="text-slate-400 text-xs">
                            Instant matchmaking with similar-rated players
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/20 rounded">
                        <Users className="h-4 w-4 text-blue-400" />
                        <div>
                          <span className="text-white text-sm font-medium">
                            Friend Challenge
                          </span>
                          <p className="text-slate-400 text-xs">
                            Play against friends and build your network
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/20 rounded">
                        <Trophy className="h-4 w-4 text-orange-400" />
                        <div>
                          <span className="text-white text-sm font-medium">
                            Tournament
                          </span>
                          <p className="text-slate-400 text-xs">
                            Compete in organized tournaments for prizes
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-slate-600/50" />

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Game Controls
                    </h4>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li>• Click and drag pieces to move them</li>
                      <li>
                        • Right-click to highlight squares and draw arrows
                      </li>
                      <li>• Use the resign button if you want to forfeit</li>
                      <li>• Offer draws using the draw button</li>
                      <li>• Chat with your opponent during the game</li>
                    </ul>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
                      <div>
                        <h5 className="text-blue-300 font-semibold text-sm">
                          Rating System
                        </h5>
                        <p className="text-blue-200 text-xs mt-1">
                          Your rating changes based on game results and opponent
                          strength. Higher ratings unlock special tournaments
                          and rewards!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Wallet & Payments */}
            <AccordionItem
              value="wallet"
              className="border border-slate-600 rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Wallet className="h-5 w-5 text-yellow-400" />
                  <span className="text-white font-semibold">
                    Wallet & Payments
                  </span>
                  <Badge className="bg-yellow-500/20 text-yellow-400 text-xs">
                    Important
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Adding Funds
                    </h4>
                    <ul className="space-y-2 text-slate-300 text-sm pl-4">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Go to Wallet section and click "Add Funds"
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Choose from multiple payment methods
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Enter amount and complete secure payment
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Funds appear instantly in your account
                      </li>
                    </ul>
                  </div>

                  <Separator className="bg-slate-600/50" />

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Withdrawals
                    </h4>
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-300 text-sm">
                        💰 Withdraw your winnings easily! Minimum withdrawal:
                        ₹100. Processing time: 1-3 business days.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Entry Fees & Winnings
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          Game Entry
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Pay entry fees to join competitive games
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          Win Rewards
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Earn money and bonuses from victories
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Social Features */}
            <AccordionItem
              value="social"
              className="border border-slate-600 rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-400" />
                  <span className="text-white font-semibold">
                    Social Features
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Friends System
                    </h4>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li>• Search for players by username</li>
                      <li>• Send and accept friend requests</li>
                      <li>• View friends' online status and recent games</li>
                      <li>• Challenge friends to private matches</li>
                      <li>• Share achievements and milestones</li>
                    </ul>
                  </div>

                  <Separator className="bg-slate-600/50" />

                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Chat Features
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-blue-400 mb-2" />
                        <h5 className="text-white text-sm font-medium">
                          Game Chat
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Communicate during matches
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <Users className="h-4 w-4 text-green-400 mb-2" />
                        <h5 className="text-white text-sm font-medium">
                          Friend Chat
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Private messaging with friends
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Tournaments */}
            <AccordionItem
              value="tournaments"
              className="border border-slate-600 rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-orange-400" />
                  <span className="text-white font-semibold">Tournaments</span>
                  <Badge className="bg-orange-500/20 text-orange-400 text-xs">
                    Exciting
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Tournament Types
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-2 bg-slate-700/20 rounded">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <div>
                          <span className="text-white text-sm font-medium">
                            Daily Tournaments
                          </span>
                          <p className="text-slate-400 text-xs">
                            Regular competitions with moderate entry fees
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/20 rounded">
                        <Crown className="h-4 w-4 text-purple-400" />
                        <div>
                          <span className="text-white text-sm font-medium">
                            Premium Events
                          </span>
                          <p className="text-slate-400 text-xs">
                            High-stakes tournaments with bigger prizes
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-2 bg-slate-700/20 rounded">
                        <Gift className="h-4 w-4 text-green-400" />
                        <div>
                          <span className="text-white text-sm font-medium">
                            Free Rolls
                          </span>
                          <p className="text-slate-400 text-xs">
                            No entry fee tournaments for practice
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Trophy className="h-4 w-4 text-orange-400 mt-0.5" />
                      <div>
                        <h5 className="text-orange-300 font-semibold text-sm">
                          Pro Tip
                        </h5>
                        <p className="text-orange-200 text-xs mt-1">
                          Start with free tournaments to practice, then
                          gradually move to higher stakes as your skills
                          improve!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Settings */}
            <AccordionItem
              value="settings"
              className="border border-slate-600 rounded-lg"
            >
              <AccordionTrigger className="px-4 py-3 hover:bg-slate-700/30">
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5 text-cyan-400" />
                  <span className="text-white font-semibold">
                    Account Settings
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-white font-semibold text-sm">
                      Customize Your Experience
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          🎵 Sound Settings
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Enable/disable game sounds and notifications
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          🌙 Theme Options
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Choose between light and dark modes
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          🔔 Notifications
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Control game alerts and friend activity
                        </p>
                      </div>
                      <div className="p-3 bg-slate-700/20 rounded-lg">
                        <h5 className="text-white text-sm font-medium mb-1">
                          🔒 Privacy
                        </h5>
                        <p className="text-slate-400 text-xs">
                          Manage your privacy and security settings
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Need More Help */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardContent className="text-center py-6">
          <h3 className="text-white font-semibold mb-2">Still Need Help?</h3>
          <p className="text-slate-400 text-sm mb-4">
            Our support team is available 24/7 to help you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="border-blue-600 text-blue-400 hover:bg-blue-500/10"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Contact Support
            </Button>
            <Button
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-500/10"
            >
              <Users className="h-4 w-4 mr-2" />
              Join Community
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <Card className="bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600">
        <CardContent className="text-center py-4">
          <p className="text-slate-400 text-sm">
            This guide is regularly updated with new features and improvements.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Last updated: December 2024 • Version 2.0
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
