import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Users,
  Wallet,
  UserCircle,
  Shield,
  Gamepad2,
  Trophy,
  Crown,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { getThemeClasses, getThemeHoverEffect } from "@/utils/themeUtils";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin?: boolean;
}

export const BottomNav = ({
  currentView,
  onViewChange,
  isAdmin,
}: BottomNavProps) => {
  const { currentTheme } = useTheme();
  const navigationItems = [
    {
      id: "games",
      label: "Games",
      icon: Gamepad2,
      gradient: "from-blue-500 to-purple-600",
    },
    {
      id: "tournaments",
      label: "Tournaments",
      icon: Crown,
      gradient: "from-purple-500 to-pink-600",
    },

    {
      id: "rankings",
      label: "Rankings",
      icon: Trophy,
      gradient: "from-amber-500 to-yellow-600",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: Wallet,
      gradient: "from-orange-500 to-red-600",
    },
    // Profile button removed - now accessible through header dropdown
  ];

  if (isAdmin) {
    navigationItems.push({
      id: "admin",
      label: "Admin",
      icon: Shield,
      gradient: "from-red-500 to-pink-600",
    });
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 ${getThemeClasses(currentTheme)}`}
    >
      {/* Glass background with blur effect */}
      <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border-t border-white/20 shadow-2xl"></div>

      {/* Theme-aware gradient overlay for depth */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${currentTheme.gradients.primary.replace("from-", "from-").replace("-500", "-500/30").replace("to-", "to-").replace("-600", "-600/10")} to-transparent`}
      ></div>

      <div className="relative safe-area-inset-bottom">
        <div className="flex justify-around items-center py-3 px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <Button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                variant="ghost"
                className={`
                  flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-h-[64px] min-w-[64px] relative touch-target hover-button group
                  ${
                    isActive
                      ? `bg-gradient-to-br ${item.gradient} text-white shadow-lg transform scale-105`
                      : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
                  }
                `}
              >
                {/* Active state glow effect */}
                {isActive && (
                  <div
                    className={`absolute -inset-1 bg-gradient-to-br ${item.gradient} rounded-2xl blur-lg opacity-30 animate-pulse`}
                  ></div>
                )}

                <div className="relative z-10 flex flex-col items-center">
                  <Icon
                    className={`h-6 w-6 mb-1 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                  />
                  <span
                    className={`text-xs font-semibold transition-all duration-300 ${isActive ? "text-white" : ""}`}
                  >
                    {item.label}
                  </span>
                </div>

                {item.id === "admin" && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs scale-75 rounded-full animate-pulse">
                    Admin
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
