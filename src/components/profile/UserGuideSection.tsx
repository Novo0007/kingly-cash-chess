import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Play,
  Trophy,
  Wallet,
  Users,
  Settings,
  ChevronRight,
  ChevronDown,
  Lightbulb,
  Target,
  Crown,
  MessageCircle,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface UserGuideSectionProps {
  onBack: () => void;
}

export const UserGuideSection = ({ onBack }: UserGuideSectionProps) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const quickStartSteps = [
    {
      number: 1,
      title: "Create Your Account",
      description: "Sign up with your email and choose a unique username",
      icon: "👤",
    },
    {
      number: 2,
      title: "Complete Your Profile",
      description: "Add your details and customize your gaming profile",
      icon: "✏️",
    },
    {
      number: 3,
      title: "Add Funds (Optional)",
      description: "Add money to your wallet to play in paid tournaments",
      icon: "💰",
    },
    {
      number: 4,
      title: "Start Playing",
      description: "Join a game lobby and start competing with other players",
      icon: "🎮",
    },
  ];

  const guides = [
    {
      id: "gameplay",
      title: "🎮 Game Play Guide",
      icon: Play,
      color: "from-purple-600 to-blue-600",
      sections: [
        {
          title: "Joining Games",
          content: [
            "Navigate to the Games section from the bottom menu",
            "Select your preferred game (Chess, Dots & Boxes, etc.)",
            "Choose between Practice mode or Competitive mode",
            "Wait for matchmaking or create a custom room",
            "Game starts automatically when both players are ready",
          ],
        },
        {
          title: "Game Controls",
          content: [
            "Chess: Tap pieces to select, tap destination to move",
            "Use the chat feature to communicate with opponents",
            "Access game options through the menu button",
            "Resign or request a draw using game controls",
            "View move history by scrolling the move list",
          ],
        },
        {
          title: "Game Rules",
          content: [
            "Standard chess rules apply for all chess games",
            "Time controls vary by game mode (Blitz, Rapid, Classical)",
            "Fair play policies are strictly enforced",
            "Disconnection handling: reconnect within 2 minutes",
            "Report suspicious behavior using the report feature",
          ],
        },
      ],
    },
    {
      id: "wallet",
      title: "💰 Wallet Management",
      icon: Wallet,
      color: "from-green-600 to-emerald-600",
      sections: [
        {
          title: "Adding Funds",
          content: [
            "Go to Wallet section from the bottom menu",
            'Tap "Add Money" and choose your amount',
            "Select payment method (UPI, Cards, Net Banking)",
            "Complete the secure payment process",
            "Funds are added instantly to your account",
          ],
        },
        {
          title: "Withdrawing Money",
          content: [
            "Minimum withdrawal amount is ₹100",
            'Tap "Withdraw" in the Wallet section',
            "Enter bank account details (first time only)",
            "Verify withdrawal with OTP",
            "Money is transferred within 1-2 business days",
          ],
        },
        {
          title: "Transaction History",
          content: [
            "View all transactions in the Wallet section",
            "Filter by type: deposits, withdrawals, winnings",
            "Download statements for tax purposes",
            "Track pending transactions and their status",
            "Contact support for any payment issues",
          ],
        },
      ],
    },
    {
      id: "tournaments",
      title: "🏆 Tournaments",
      icon: Trophy,
      color: "from-yellow-600 to-orange-600",
      sections: [
        {
          title: "Joining Tournaments",
          content: [
            "Browse available tournaments in the Games section",
            "Check entry fee, prize pool, and format",
            "Register before the tournament starts",
            "Tournaments start automatically at scheduled time",
            "Follow the bracket progression to track your matches",
          ],
        },
        {
          title: "Tournament Formats",
          content: [
            "Swiss System: Play multiple rounds against different opponents",
            "Knockout: Single elimination, win or go home",
            "Round Robin: Play against all participants",
            "Arena: Continuous pairing for a set duration",
            "Team tournaments: Compete as part of a team",
          ],
        },
        {
          title: "Prizes & Rankings",
          content: [
            "Prize distribution is automatic after tournament ends",
            "View your tournament history and performance",
            "Earn rating points based on tournament results",
            "Special badges for tournament achievements",
            "Leaderboards updated in real-time",
          ],
        },
      ],
    },
    {
      id: "social",
      title: "👥 Social Features",
      icon: Users,
      color: "from-cyan-600 to-blue-600",
      sections: [
        {
          title: "Friends System",
          content: [
            "Search for friends by username",
            "Send and accept friend requests",
            "View friends' online status and current games",
            "Challenge friends to private games",
            "Share achievements and game results",
          ],
        },
        {
          title: "Chat & Communication",
          content: [
            "Use in-game chat during matches",
            "Join global chat rooms by topic",
            "Create private chat groups with friends",
            "Use emoji and stickers in conversations",
            "Report inappropriate behavior to moderators",
          ],
        },
        {
          title: "Clubs & Communities",
          content: [
            "Join clubs based on your interests",
            "Participate in club tournaments and events",
            "Share strategies and tips with club members",
            "Climb club leaderboards and earn recognition",
            "Create your own club and invite others",
          ],
        },
      ],
    },
  ];

  const tips = [
    {
      icon: "⚡",
      title: "Quick Tip",
      content:
        "Enable notifications to get alerts for game invites and tournament updates!",
    },
    {
      icon: "🎯",
      title: "Pro Tip",
      content:
        "Practice in offline mode to improve your skills before competing online.",
    },
    {
      icon: "🔒",
      title: "Security Tip",
      content:
        "Never share your account credentials with anyone. We will never ask for your password.",
    },
    {
      icon: "💡",
      title: "Strategy Tip",
      content:
        "Watch replays of top players to learn new strategies and improve your game.",
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
          📚 User Guide
        </h1>
      </div>

      {/* Welcome */}
      <Card className="bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-indigo-400 shadow-xl">
        <CardContent className="p-6 md:p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl md:text-6xl">📖</div>
            <h2 className="text-2xl md:text-3xl font-black text-white">
              Welcome to NNC Games!
            </h2>
            <p className="text-indigo-100 text-sm md:text-base">
              This comprehensive guide will help you master all features of our
              gaming platform. From basic gameplay to advanced strategies, we've
              got you covered!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Start */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          🚀 Quick Start Guide
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {quickStartSteps.map((step) => (
            <Card
              key={step.number}
              className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl"
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-500 text-white font-bold rounded-full text-sm md:text-base">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base md:text-lg mb-1">
                      {step.icon} {step.title}
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base">
                      {step.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Detailed Guides */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          📋 Detailed Guides
        </h2>
        {guides.map((guide) => (
          <Card
            key={guide.id}
            className={`bg-gradient-to-r ${guide.color} border-2 border-white/20 shadow-xl`}
          >
            <CardHeader>
              <Button
                onClick={() => toggleSection(guide.id)}
                variant="ghost"
                className="w-full justify-between p-0 h-auto text-left hover:bg-transparent"
              >
                <div className="flex items-center gap-3">
                  <guide.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                  <span className="text-white font-black text-lg md:text-xl">
                    {guide.title}
                  </span>
                </div>
                {expandedSection === guide.id ? (
                  <ChevronDown className="h-5 w-5 text-white" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-white" />
                )}
              </Button>
            </CardHeader>
            {expandedSection === guide.id && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {guide.sections.map((section, index) => (
                    <div key={index} className="bg-white/10 rounded-lg p-4">
                      <h4 className="text-white font-bold text-base md:text-lg mb-3">
                        {section.title}
                      </h4>
                      <ul className="space-y-2">
                        {section.content.map((item, itemIndex) => (
                          <li
                            key={itemIndex}
                            className="flex items-start gap-2"
                          >
                            <span className="text-white/60 mt-1">•</span>
                            <span className="text-white/90 text-sm md:text-base">
                              {item}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Tips & Tricks */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          💡 Tips & Tricks
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {tips.map((tip, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-amber-600 to-orange-600 border-2 border-amber-400 shadow-xl"
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="text-2xl md:text-3xl">{tip.icon}</div>
                  <div>
                    <h3 className="text-white font-bold text-sm md:text-base mb-1">
                      {tip.title}
                    </h3>
                    <p className="text-amber-100 text-xs md:text-sm">
                      {tip.content}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Need More Help */}
      <Card className="bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-gray-600 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <h3 className="text-white font-black text-lg md:text-xl">
              ❓ Need More Help?
            </h3>
            <p className="text-gray-300 text-sm md:text-base">
              Can't find what you're looking for? Our support team is here to
              help!
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button
                variant="outline"
                className="border-gray-500 text-gray-300 hover:bg-gray-700"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                FAQ Section
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MobileContainer>
  );
};
