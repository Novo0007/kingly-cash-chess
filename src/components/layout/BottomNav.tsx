import React from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, DollarSign, User, Zap, Star } from "lucide-react";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
}) => {
  const navItems = [
    { id: "games", label: "Games", icon: Gamepad2, emoji: "🎮" },
    { id: "friends", label: "Friends", icon: Users, emoji: "👥" },
    { id: "wallet", label: "Wallet", icon: DollarSign, emoji: "💰" },
    { id: "profile", label: "Profile", icon: User, emoji: "👤" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Lavender Glass Background */}
      <div className="absolute inset-0 lavender-glass border-t-2 border-purple-300/50 rounded-t-3xl">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/10 via-lavender-100/15 to-indigo-100/10 rounded-t-3xl"></div>
      </div>

      {/* Navigation Content */}
      <div className="relative z-10 flex items-center justify-around px-3 py-4 max-w-md mx-auto">
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
            <div key={item.id} className="relative group">
              {/* Active Background Glow */}
              {isActive && (
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 via-lavender-400 to-indigo-400 rounded-2xl blur-xl opacity-60 lavender-pulse"></div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewChange(item.id)}
                className={`relative flex flex-col items-center gap-1 px-4 py-4 h-auto min-w-0 flex-1 min-h-[68px] rounded-2xl transition-all duration-300 transform ${
                  isActive
                    ? "text-purple-700 bg-gradient-to-b from-purple-100/40 to-lavender-200/40 scale-110 lavender-shadow border border-purple-300/50"
                    : "text-purple-500 hover:text-purple-700 hover:bg-purple-50/30 active:bg-purple-100/50 active:scale-95 hover:scale-105"
                }`}
              >
                {/* Background Effects */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 animate-pulse"></div>
                  )}
                </div>

                {/* Icon Container */}
                <div className="relative">
                  {isActive && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-60"></div>
                  )}
                  <div
                    className={`relative transition-all duration-300 ${isActive ? "transform scale-110" : ""}`}
                  >
                    <Icon
                      className={`h-6 w-6 transition-all duration-300 ${isActive ? "text-white drop-shadow-lg" : ""}`}
                    />
                  </div>
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-bold leading-tight transition-all duration-300 ${
                    isActive
                      ? "text-white drop-shadow-lg"
                      : "text-gray-400 group-hover:text-gray-300"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active Indicator Dots */}
                {isActive && (
                  <div className="absolute -bottom-1 flex gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
                    <div
                      className="w-1 h-1 bg-purple-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                )}

                {/* Floating Emoji for Active State */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 text-lg animate-bounce">
                    {item.emoji}
                  </div>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Bottom Gaming Elements */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-4 text-xs opacity-30">
          <Star className="h-3 w-3 text-yellow-400 animate-pulse" />
          <Zap
            className="h-3 w-3 text-blue-400 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
          <Star
            className="h-3 w-3 text-purple-400 animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>
      </div>
    </div>
  );
};
