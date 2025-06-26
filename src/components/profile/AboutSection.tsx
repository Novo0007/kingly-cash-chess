import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Trophy,
  Users,
  Globe,
  Zap,
  Heart,
  Shield,
  Target,
  Star,
  Award,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface AboutSectionProps {
  onBack: () => void;
}

export const AboutSection = ({ onBack }: AboutSectionProps) => {
  const features = [
    {
      icon: Trophy,
      title: "Competitive Gaming",
      description: "Join tournaments and compete with players worldwide",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description:
        "Your data and transactions are protected with bank-level security",
    },
    {
      icon: Zap,
      title: "Real-time Multiplayer",
      description:
        "Experience smooth, lag-free gaming with instant matchmaking",
    },
    {
      icon: Heart,
      title: "Fair Play",
      description:
        "Advanced anti-cheat systems ensure fair competition for all",
    },
    {
      icon: Users,
      title: "Active Community",
      description: "Connect with thousands of players and make new friends",
    },
    {
      icon: Target,
      title: "Skill Development",
      description:
        "Improve your gaming skills with practice modes and tutorials",
    },
  ];

  const stats = [
    { value: "50K+", label: "Active Players", icon: "👥" },
    { value: "1M+", label: "Games Played", icon: "🎮" },
    { value: "15+", label: "Game Modes", icon: "🎯" },
    { value: "99.9%", label: "Uptime", icon: "⚡" },
  ];

  const team = [
    {
      name: "NNC Development Team",
      role: "Full Stack Development",
      description: "Passionate developers creating amazing gaming experiences",
      avatar: "👨‍💻",
    },
    {
      name: "Game Design Team",
      role: "Game Design & UX",
      description: "Crafting engaging and intuitive gaming experiences",
      avatar: "🎨",
    },
    {
      name: "Community Team",
      role: "Community Management",
      description: "Supporting our amazing gaming community 24/7",
      avatar: "🤝",
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
          📱 About NNC Games
        </h1>
      </div>

      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 border-2 border-purple-400 shadow-xl">
        <CardContent className="p-6 md:p-8 text-center">
          <div className="space-y-4">
            <div className="text-6xl md:text-8xl">🎮</div>
            <h2 className="text-3xl md:text-4xl font-black text-white">
              NNC GAMES
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 font-bold">
              Chess Arena & Gaming Platform
            </p>
            <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto">
              The ultimate destination for competitive online gaming. Play
              chess, connect with friends, and compete in tournaments with
              players from around the world.
            </p>
            <div className="flex justify-center">
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 px-4 py-2 text-base">
                <Star className="h-4 w-4 mr-2" />
                Established 2024
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <Card
            key={index}
            className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl"
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl md:text-3xl mb-2">{stat.icon}</div>
              <div className="text-2xl md:text-3xl font-black text-white">
                {stat.value}
              </div>
              <div className="text-xs md:text-sm text-gray-400 font-medium">
                {stat.label}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          ✨ What Makes Us Special
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl"
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <feature.icon className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-base md:text-lg mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300 text-sm md:text-base">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="space-y-3 md:space-y-4">
        <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-2 border-green-400 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 font-black text-lg md:text-xl">
              <Target className="h-5 w-5 md:h-6 md:w-6" />
              🎯 Our Mission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white text-sm md:text-base leading-relaxed">
              To create the most engaging and fair online gaming platform where
              players of all skill levels can compete, learn, and have fun
              together. We believe gaming brings people together and creates
              lasting friendships across the globe.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 border-2 border-blue-400 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 font-black text-lg md:text-xl">
              <Globe className="h-5 w-5 md:h-6 md:w-6" />
              🌍 Our Vision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white text-sm md:text-base leading-relaxed">
              To become the world's leading platform for strategic online games,
              fostering a global community of players who value fair play, skill
              development, and competitive spirit.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Team */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-xl md:text-2xl font-bold text-white">
          👥 Our Team
        </h2>
        <div className="space-y-3">
          {team.map((member, index) => (
            <Card
              key={index}
              className="bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl"
            >
              <CardContent className="p-4 md:p-5">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="text-3xl md:text-4xl">{member.avatar}</div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-base md:text-lg">
                      {member.name}
                    </h3>
                    <p className="text-blue-400 text-sm md:text-base font-medium">
                      {member.role}
                    </p>
                    <p className="text-gray-300 text-xs md:text-sm mt-1">
                      {member.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Contact CTA */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-2 border-purple-400 shadow-xl">
        <CardContent className="p-6 text-center">
          <div className="space-y-3">
            <h3 className="text-white font-black text-lg md:text-xl">
              💬 Get in Touch
            </h3>
            <p className="text-white/80 text-sm md:text-base">
              Have questions, suggestions, or just want to say hi? We'd love to
              hear from you!
            </p>
            <Button className="bg-white/20 hover:bg-white/30 text-white border border-white/30">
              <Heart className="h-4 w-4 mr-2" />
              Contact Us
            </Button>
          </div>
        </CardContent>
      </Card>
    </MobileContainer>
  );
};
