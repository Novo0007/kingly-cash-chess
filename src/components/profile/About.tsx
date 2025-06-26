import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Gamepad2,
  Trophy,
  Users,
  Shield,
  Zap,
  Star,
  Target,
  Crown,
  Heart,
  Sparkles,
} from "lucide-react";

export const About = () => {
  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Hero Section */}
      <Card className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 border border-slate-600">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="h-3 w-3 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            NNC Games Arena
          </CardTitle>
          <p className="text-slate-300 text-sm">
            Where Strategy Meets Competition - Your Ultimate Gaming Destination
          </p>
        </CardHeader>
      </Card>

      {/* Mission & Vision */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-400" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-300 leading-relaxed">
            At NNC Games, we're dedicated to creating the ultimate competitive
            gaming experience. Our platform brings together strategy
            enthusiasts, casual gamers, and competitive players in a secure,
            fair, and exciting environment.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <Shield className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-sm">Fair Play</h4>
              <p className="text-slate-400 text-xs">
                Secure & transparent gaming
              </p>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-sm">Community</h4>
              <p className="text-slate-400 text-xs">
                Connect with players worldwide
              </p>
            </div>
            <div className="text-center p-3 bg-slate-700/50 rounded-lg">
              <Trophy className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <h4 className="text-white font-semibold text-sm">Competition</h4>
              <p className="text-slate-400 text-xs">
                Earn rewards & climb rankings
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Platform Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Gamepad2 className="h-5 w-5 text-blue-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Chess Arena
                </h4>
                <p className="text-slate-400 text-xs">
                  Real-time multiplayer chess with ratings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Users className="h-5 w-5 text-green-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Friends System
                </h4>
                <p className="text-slate-400 text-xs">
                  Connect and challenge your friends
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Zap className="h-5 w-5 text-yellow-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold text-sm">Live Chat</h4>
                <p className="text-slate-400 text-xs">
                  Real-time messaging during games
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
              <Trophy className="h-5 w-5 text-purple-400 mt-1" />
              <div>
                <h4 className="text-white font-semibold text-sm">
                  Tournaments
                </h4>
                <p className="text-slate-400 text-xs">
                  Compete in regular tournaments
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Achievements */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Platform Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">10K+</div>
              <div className="text-slate-400 text-xs">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">50K+</div>
              <div className="text-slate-400 text-xs">Games Played</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">25+</div>
              <div className="text-slate-400 text-xs">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">24/7</div>
              <div className="text-slate-400 text-xs">Support</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technology & Security */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-400" />
            Technology & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-300 text-sm leading-relaxed">
            Built with modern web technologies including React, TypeScript, and
            real-time WebSocket connections. We use industry-standard encryption
            and secure payment processing to protect your data and transactions.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              React
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              TypeScript
            </Badge>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Real-time
            </Badge>
            <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Secure
            </Badge>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              Encrypted
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card className="bg-slate-800/80 border border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-400" />
            Get In Touch
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-slate-300 text-sm">
            Have questions or feedback? We'd love to hear from you! Reach out
            through our contact support section or join our community forums.
          </p>
          <div className="text-center p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-purple-500/20">
            <p className="text-white font-semibold">
              Thank you for being part of NNC Games!
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Version 2.0.0 - Built with ❤️ for gamers
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
