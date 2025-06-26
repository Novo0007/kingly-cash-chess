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
          ⚙️ Settings
        </h1>
      </div>

      {/* Quick Settings */}
      <Card className="bg-gradient-to-r from-slate-700 to-slate-800 border-2 border-slate-600 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-white font-black text-lg md:text-xl">
            ⚡ Quick Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickSettings.map((item, index) => (
            <Button
              key={index}
              onClick={item.action}
              variant="ghost"
              className="w-full justify-start h-auto p-3 md:p-4 bg-slate-600/50 hover:bg-slate-600/80 border border-slate-500/50 rounded-lg transition-all duration-200"
            >
              <item.icon className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
              <div className="text-left flex-1">
                <div className="text-white font-bold text-sm md:text-base">
                  {item.title}
                </div>
                <div className="text-gray-400 text-xs md:text-sm">
                  {item.description}
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400 ml-2" />
            </Button>
          ))}
        </CardContent>
      </Card>

      {/* Main Settings */}
      <div className="space-y-3 md:space-y-4">
        {settingsItems.map((item) => (
          <Card
            key={item.id}
            className={`bg-gradient-to-r ${item.color} border-2 ${item.borderColor} shadow-xl cursor-pointer transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
            onClick={() => setCurrentSection(item.id)}
          >
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="p-2 md:p-3 bg-white/20 rounded-lg">
                  <item.icon className="h-6 w-6 md:h-7 md:w-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-black text-lg md:text-xl mb-1">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base font-medium">
                    {item.description}
                  </p>
                </div>
                <ExternalLink className="h-5 w-5 md:h-6 md:w-6 text-white/60" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* App Info */}
      <Card className="bg-gradient-to-r from-gray-700 to-gray-800 border-2 border-gray-600 shadow-xl">
        <CardContent className="p-4 md:p-6">
          <div className="text-center space-y-2">
            <h3 className="text-white font-black text-xl md:text-2xl">
              🎮 NNC GAMES
            </h3>
            <p className="text-gray-300 font-bold text-sm md:text-base">
              Chess Arena & More
            </p>
            <p className="text-gray-400 text-xs md:text-sm">Version 1.0.0</p>
            <p className="text-gray-500 text-xs">Made with ❤️ for gamers</p>
          </div>
        </CardContent>
      </Card>
    </MobileContainer>
  );
};
