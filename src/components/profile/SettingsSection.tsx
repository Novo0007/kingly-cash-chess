import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Gamepad2,
  Info,
  Shield,
  BookOpen,
  MessageCircle,
  ExternalLink,
  Smartphone,
  Monitor,
  Palette,
  Bell,
  User,
  Download,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { MoreGamesSection } from "./MoreGamesSection";
import { AboutSection } from "./AboutSection";
import { PrivacyPolicySection } from "./PrivacyPolicySection";
import { UserGuideSection } from "./UserGuideSection";
import { ContactSection } from "./ContactSection";

interface SettingsSectionProps {
  onBack: () => void;
}

export const SettingsSection = ({ onBack }: SettingsSectionProps) => {
  const [currentSection, setCurrentSection] = useState<string | null>(null);

  if (currentSection === "more-games") {
    return <MoreGamesSection onBack={() => setCurrentSection(null)} />;
  }

  if (currentSection === "about") {
    return <AboutSection onBack={() => setCurrentSection(null)} />;
  }

  if (currentSection === "privacy-policy") {
    return <PrivacyPolicySection onBack={() => setCurrentSection(null)} />;
  }

  if (currentSection === "user-guide") {
    return <UserGuideSection onBack={() => setCurrentSection(null)} />;
  }

  if (currentSection === "contact") {
    return <ContactSection onBack={() => setCurrentSection(null)} />;
  }

  const settingsItems = [
    {
      id: "more-games",
      title: "🎮 More Games & Apps",
      description: "Discover more exciting games and applications",
      icon: Gamepad2,
      color: "from-purple-600 to-pink-600",
      borderColor: "border-purple-400",
    },
    {
      id: "about",
      title: "📱 About NNC Games",
      description: "Learn more about our gaming platform",
      icon: Info,
      color: "from-blue-600 to-cyan-600",
      borderColor: "border-blue-400",
    },
    {
      id: "privacy-policy",
      title: "🔒 Privacy Policy",
      description: "Your privacy and data protection",
      icon: Shield,
      color: "from-green-600 to-emerald-600",
      borderColor: "border-green-400",
    },
    {
      id: "user-guide",
      title: "📚 User Guide",
      description: "Learn how to use all features",
      icon: BookOpen,
      color: "from-orange-600 to-red-600",
      borderColor: "border-orange-400",
    },
    {
      id: "contact",
      title: "📞 Contact Support",
      description: "Get help and send feedback",
      icon: MessageCircle,
      color: "from-indigo-600 to-purple-600",
      borderColor: "border-indigo-400",
    },
  ];

  const quickSettings = [
    {
      title: "🔔 Notifications",
      description: "Manage your notification preferences",
      icon: Bell,
      action: () => {
        // Toggle notifications
        alert("Notification settings will be implemented soon!");
      },
    },
    {
      title: "🎨 Theme",
      description: "Choose your preferred theme",
      icon: Palette,
      action: () => {
        // Theme selector
        alert("Theme settings will be implemented soon!");
      },
    },
    {
      title: "📱 App Version",
      description: "Check for updates",
      icon: Download,
      action: () => {
        alert("You are using the latest version!");
      },
    },
  ];

  return (
    <MobileContainer className="space-y-4 md:space-y-6">
      {/* Beautiful Header with Animations */}
      <div className="relative">
        <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl animate-pulse"></div>
        <div className="relative flex items-center gap-4 mb-6 md:mb-8 p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="relative group text-gray-400 hover:text-white hover:bg-gray-800/50 p-3 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-slate-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <ArrowLeft className="relative h-5 w-5 group-hover:-translate-x-1 transition-transform duration-300" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full blur-md opacity-60 animate-pulse"></div>
              <div className="relative w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full flex items-center justify-center">
                ⚙️
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Settings
            </h1>
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Quick Settings with Stunning Design */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-slate-400 to-slate-600 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition-opacity duration-500"></div>
        <Card className="relative backdrop-blur-xl bg-gradient-to-r from-slate-700/80 to-slate-800/80 border-2 border-slate-600/50 shadow-2xl rounded-2xl overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>

          <CardHeader className="pb-4 relative z-10">
            <CardTitle className="text-white font-black text-xl md:text-2xl flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-md opacity-60 animate-pulse"></div>
                <Zap className="relative h-6 w-6 text-yellow-400" />
              </div>
              <span className="bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                ⚡ Quick Settings
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {quickSettings.map((item, index) => (
              <div key={index} className="relative group/item">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity duration-300"></div>
                <Button
                  onClick={item.action}
                  variant="ghost"
                  className="relative w-full justify-start h-auto p-4 md:p-5 bg-slate-600/30 hover:bg-slate-600/60 backdrop-blur-sm border border-slate-500/30 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-400 rounded-full blur-sm opacity-0 group-hover/item:opacity-60 transition-opacity duration-300"></div>
                    <item.icon className="relative h-6 w-6 text-blue-400 mr-4 flex-shrink-0 group-hover/item:text-blue-300 transition-colors duration-300" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="text-white font-bold text-base md:text-lg mb-1 group-hover/item:text-blue-100 transition-colors duration-300">
                      {item.title}
                    </div>
                    <div className="text-gray-400 text-sm md:text-base group-hover/item:text-gray-300 transition-colors duration-300">
                      {item.description}
                    </div>
                  </div>
                  <ExternalLink className="h-5 w-5 text-gray-400 ml-3 group-hover/item:text-white group-hover/item:scale-110 transition-all duration-300" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Main Settings with Stunning Visual Effects */}
      <div className="space-y-4 md:space-y-6">
        {settingsItems.map((item, index) => (
          <div key={item.id} className="relative group">
            <div
              className={`absolute -inset-1 bg-gradient-to-r ${item.color} rounded-2xl blur-xl opacity-60 group-hover:opacity-100 transition-opacity duration-500`}
            ></div>
            <Card
              className={`relative backdrop-blur-xl bg-gradient-to-r ${item.color.replace(/from-(\w+)-(\d+)/, "from-$1-$2/80").replace(/to-(\w+)-(\d+)/, "to-$1-$2/80")} border-2 ${item.borderColor.replace("border-", "border-").replace("-400", "-400/50")} shadow-2xl cursor-pointer transform transition-all duration-300 hover:scale-[1.03] active:scale-[0.97] rounded-2xl overflow-hidden`}
              onClick={() => setCurrentSection(item.id)}
            >
              {/* Floating Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 group-hover:scale-110 transition-transform duration-700"></div>

                {/* Animated Sparkles */}
                <Star
                  className="absolute top-4 right-4 h-4 w-4 text-white/20 animate-pulse"
                  style={{ animationDelay: `${index * 0.2}s` }}
                />
                <Sparkles
                  className="absolute bottom-4 left-4 h-3 w-3 text-white/20 animate-pulse"
                  style={{ animationDelay: `${index * 0.3}s` }}
                />
              </div>

              <CardContent className="p-5 md:p-7 relative z-10">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="relative group/icon">
                    <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative p-3 md:p-4 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 group-hover/icon:scale-110 transition-transform duration-300">
                      <item.icon className="h-7 w-7 md:h-8 md:w-8 text-white drop-shadow-lg" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-black text-xl md:text-2xl mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent group-hover:from-white group-hover:to-yellow-200 transition-all duration-300">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-base md:text-lg font-medium group-hover:text-white/90 transition-colors duration-300">
                      {item.description}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <ExternalLink className="relative h-6 w-6 md:h-7 md:w-7 text-white/60 group-hover:text-white group-hover:scale-110 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {/* App Info with Stunning Design */}
      <div className="relative group">
        <div className="absolute -inset-2 bg-gradient-to-r from-gray-400 via-slate-500 to-gray-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
        <Card className="relative backdrop-blur-xl bg-gradient-to-r from-gray-700/80 to-gray-800/80 border-2 border-gray-600/50 shadow-2xl rounded-3xl overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-tr from-cyan-400/10 to-pink-400/10 rounded-full blur-2xl animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>
          </div>

          <CardContent className="p-6 md:p-8 relative z-10">
            <div className="text-center space-y-4">
              <div className="relative inline-block">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse"></div>
                <div className="relative text-6xl md:text-7xl">🎮</div>
              </div>

              <h3 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                NNC GAMES
              </h3>

              <div className="space-y-2">
                <p className="text-gray-300 font-bold text-lg md:text-xl bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Chess Arena & More
                </p>
                <div className="flex items-center justify-center gap-3">
                  <div className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                    <span className="text-gray-400 text-sm md:text-base font-medium">
                      Version 1.0.0
                    </span>
                  </div>
                  <Star className="h-4 w-4 text-yellow-400 animate-pulse" />
                </div>

                <div className="flex items-center justify-center gap-2 mt-4">
                  <span className="text-gray-500 text-sm">Made with</span>
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-400 rounded-full blur-sm opacity-60 animate-pulse"></div>
                    <span className="relative text-red-400">❤️</span>
                  </div>
                  <span className="text-gray-500 text-sm">for gamers</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileContainer>
  );
};
