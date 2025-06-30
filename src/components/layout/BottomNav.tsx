import React from "react";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Users,
  DollarSign,
  User,
  Zap,
  Star,
  Sparkles,
} from "lucide-react";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
}) => {
  const navItems = [
    {
      id: "games",
      label: "Games",
      icon: Gamepad2,
      emoji: "🎮",
      color: "purple",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "friends",
      label: "Friends",
      icon: Users,
      emoji: "👥",
      color: "blue",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: DollarSign,
      emoji: "💰",
      color: "green",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      emoji: "👤",
      color: "orange",
      gradient: "from-orange-500 to-yellow-500",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Ultra-Transparent Glass Background */}
      <div className="absolute inset-0 backdrop-blur-2xl border-t border-white/10 rounded-t-3xl overflow-hidden transition-all duration-500 ease-out">
        {/* Minimal transparent gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/15 to-cyan-600/20 rounded-t-3xl transition-opacity duration-700"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-t-3xl"></div>

        {/* Subtle animated background elements */}
        <div className="absolute top-0 left-1/4 w-12 h-12 bg-gradient-to-r from-yellow-400/10 to-orange-400/10 rounded-full blur-2xl animate-pulse transition-all duration-1000"></div>
        <div
          className="absolute top-0 right-1/4 w-10 h-10 bg-gradient-to-r from-pink-400/10 to-purple-400/10 rounded-full blur-xl animate-pulse transition-all duration-1000"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* Enhanced Navigation Content */}
      <div className="relative z-10 flex items-center justify-around px-2 py-3 max-w-sm mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive =
            currentView === item.id ||
            (item.id === "games" &&
              (currentView === "lobby" ||
                currentView === "game" ||
                currentView === "ludo-lobby" ||
                currentView === "ludo-game"));

          return (
            <div key={item.id} className="relative group flex-1">
              {/* Enhanced Active Background Glow */}
              {isActive && (
                <div
                  className={`absolute -inset-3 bg-gradient-to-r ${item.gradient} rounded-3xl blur-2xl opacity-60 electric-pulse`}
                ></div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange(item.id)}
                className={`relative flex flex-col items-center gap-2 px-3 py-4 h-auto w-full min-h-[72px] rounded-2xl transition-all duration-500 ease-out transform tap-target ${
                  isActive
                    ? `text-white bg-gradient-to-b ${item.gradient}/15 scale-110 shadow-xl border border-white/20 backdrop-blur-lg`
                    : "text-white/60 hover:text-white/90 hover:bg-white/5 active:bg-white/10 active:scale-95 hover:scale-105 hover:backdrop-blur-sm"
                }`}
              >
                {/* Smooth Background Effects */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-700 ease-out">
                  {isActive && (
                    <>
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient}/20 animate-pulse transition-opacity duration-1000`}
                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-white/3 to-transparent transition-opacity duration-500"></div>
                    </>
                  )}
                </div>

                {/* Smooth Icon Container */}
                <div className="relative transition-all duration-500 ease-out">
                  {isActive && (
                    <div
                      className={`absolute -inset-2 bg-gradient-to-r ${item.gradient} rounded-full blur-lg opacity-50 transition-all duration-700 ease-out`}
                    ></div>
                  )}
                  <div
                    className={`relative p-2 rounded-xl transition-all duration-500 ease-out transform ${
                      isActive
                        ? `bg-gradient-to-r ${item.gradient}/80 shadow-lg scale-110 backdrop-blur-sm`
                        : "bg-white/8 backdrop-blur-sm hover:bg-white/12"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 transition-all duration-500 ease-out ${
                        isActive
                          ? "text-white drop-shadow-lg"
                          : "text-white/70 hover:text-white/90"
                      }`}
                    />
                  </div>
                </div>

                {/* Smooth Label */}
                <span
                  className={`text-xs font-bold leading-tight transition-all duration-500 ease-out font-heading ${
                    isActive
                      ? "text-white drop-shadow-lg"
                      : "text-white/70 hover:text-white/90"
                  }`}
                >
                  {item.label}
                </span>

                {/* Enhanced Active Indicators */}
                {isActive && (
                  <>
                    {/* Floating Emoji */}
                    <div className="absolute -top-1 -right-1 text-lg animate-bounce filter drop-shadow-lg">
                      {item.emoji}
                    </div>

                    {/* Bottom indicator dots */}
                    <div className="absolute -bottom-1 flex gap-1">
                      <div
                        className={`w-1.5 h-1.5 bg-${item.color}-400 rounded-full animate-pulse shadow-lg`}
                      ></div>
                      <div
                        className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-lg"
                        style={{ animationDelay: "0.3s" }}
                      ></div>
                      <div
                        className={`w-1.5 h-1.5 bg-${item.color}-400 rounded-full animate-pulse shadow-lg`}
                        style={{ animationDelay: "0.6s" }}
                      ></div>
                    </div>

                    {/* Side glow effects */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-r from-white/50 to-transparent rounded-r-full"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-l from-white/50 to-transparent rounded-l-full"></div>
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Enhanced Bottom Gaming Elements */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-3 text-xs">
          <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse filter drop-shadow-lg" />
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse"></div>
            <div
              className="w-1 h-1 bg-white rounded-full animate-pulse"
              style={{ animationDelay: "0.3s" }}
            ></div>
            <div
              className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{ animationDelay: "0.6s" }}
            ></div>
          </div>
          <Sparkles
            className="h-3 w-3 text-cyan-300 animate-pulse filter drop-shadow-lg"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      </div>

      {/* Top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
    </div>
  );
};
