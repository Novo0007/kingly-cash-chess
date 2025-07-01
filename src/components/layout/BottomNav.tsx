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
      emoji: "🏡",
      color: "amber",
      gradient: "from-amber-700 to-orange-700",
    },
    {
      id: "friends",
      label: "Friends",
      icon: Users,
      emoji: "🤝",
      color: "green",
      gradient: "from-green-700 to-emerald-700",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: DollarSign,
      emoji: "💰",
      color: "yellow",
      gradient: "from-yellow-700 to-amber-700",
    },
    {
      id: "profile",
      label: "Profile",
      icon: User,
      emoji: "🌲",
      color: "orange",
      gradient: "from-orange-700 to-red-700",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom">
      {/* Natural Wood Glass Background */}
      <div className="absolute inset-0 backdrop-blur-xl border-t border-amber-300/20 rounded-t-2xl overflow-hidden transition-all duration-300 ease-out wood-glass">
        {/* Wood transparent gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-800/25 via-orange-700/20 to-yellow-700/25 rounded-t-2xl transition-opacity duration-500"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/15 via-transparent to-transparent rounded-t-2xl"></div>

        {/* Subtle wood grain background elements */}
        <div className="absolute top-0 left-1/4 w-8 h-8 bg-gradient-to-r from-amber-600/12 to-orange-600/12 rounded-full blur-2xl opacity-70"></div>
        <div className="absolute top-0 right-1/4 w-6 h-6 bg-gradient-to-r from-green-700/12 to-emerald-700/12 rounded-full blur-xl opacity-70"></div>
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
                className={`relative flex flex-col items-center gap-2 px-3 py-4 h-auto w-full min-h-[72px] rounded-xl transition-all duration-300 ease-out transform tap-target ${
                  isActive
                    ? `text-amber-100 bg-gradient-to-b ${item.gradient}/20 scale-110 wood-shadow border border-amber-300/30 backdrop-blur-lg`
                    : "text-amber-200/70 hover:text-amber-100/90 hover:bg-amber-100/5 active:bg-amber-100/10 active:scale-95 hover:scale-105 hover:backdrop-blur-sm"
                }`}
              >
                {/* Smooth Background Effects */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden transition-all duration-700 ease-out">
                  {isActive && (
                    <>
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${item.gradient}/20 transition-opacity duration-1000`}
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

                {/* Smooth Active Indicators */}
                {isActive && (
                  <>
                    {/* Floating Emoji */}
                    <div className="absolute -top-1 -right-1 text-lg animate-bounce filter drop-shadow-lg transition-all duration-500 ease-out">
                      {item.emoji}
                    </div>

                    {/* Bottom indicator dots */}
                    <div className="absolute -bottom-1 flex gap-1 transition-all duration-700 ease-out">
                      <div
                        className={`w-1.5 h-1.5 bg-${item.color}-400/60 rounded-full shadow-md transition-all duration-500`}
                      ></div>
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full shadow-md transition-all duration-500"></div>
                      <div
                        className={`w-1.5 h-1.5 bg-${item.color}-400/60 rounded-full shadow-md transition-all duration-500`}
                      ></div>
                    </div>

                    {/* Side glow effects */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-r from-white/30 to-transparent rounded-r-full transition-all duration-700 ease-out"></div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-l from-white/30 to-transparent rounded-l-full transition-all duration-700 ease-out"></div>
                  </>
                )}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Subtle Bottom Gaming Elements */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center transition-all duration-1000 ease-out">
        <div className="flex items-center gap-3 text-xs opacity-50">
          <Sparkles className="h-3 w-3 text-yellow-300/50 filter drop-shadow-md transition-all duration-500" />
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-yellow-400/40 rounded-full transition-all duration-500"></div>
            <div className="w-1 h-1 bg-white/40 rounded-full transition-all duration-500"></div>
            <div className="w-1 h-1 bg-cyan-400/40 rounded-full transition-all duration-500"></div>
          </div>
          <Sparkles className="h-3 w-3 text-cyan-300/50 filter drop-shadow-md transition-all duration-500" />
        </div>
      </div>

      {/* Subtle Top edge glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent transition-all duration-500"></div>
    </div>
  );
};
