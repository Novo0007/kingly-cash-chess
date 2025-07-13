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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  const navigationItems = [
    {
      id: "games",
      label: "Games",
      icon: Gamepad2,
      gradient: "from-violet-500 to-purple-500",
      shadowColor: "shadow-violet-500/25",
      bgColor: "bg-violet-500/20",
    },
    {
      id: "tournaments",
      label: "Tournaments",
      icon: Crown,
      gradient: "from-pink-500 to-rose-500",
      shadowColor: "shadow-pink-500/25",
      bgColor: "bg-pink-500/20",
    },
    {
      id: "rankings",
      label: "Rankings",
      icon: Trophy,
      gradient: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/25",
      bgColor: "bg-amber-500/20",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: Wallet,
      gradient: "from-emerald-500 to-teal-500",
      shadowColor: "shadow-emerald-500/25",
      bgColor: "bg-emerald-500/20",
    },
    // Profile button removed - now accessible through header dropdown
  ];

  if (isAdmin) {
    navigationItems.push({
      id: "admin",
      label: "Admin",
      icon: Shield,
      gradient: "from-red-500 to-pink-500",
      shadowColor: "shadow-red-500/25",
      bgColor: "bg-red-500/20",
    });
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Modern curved background with enhanced blur */}
      <div className="absolute inset-0">
        {/* Main background with rounded top corners */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl border-t border-white/20">
          {/* Modern rounded top corners */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-transparent via-white/5 to-transparent rounded-t-3xl"></div>
        </div>

        {/* Gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>

        {/* Subtle glow effect */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
      </div>

      {/* Navigation container */}
      <div className="relative">
        {/* Safe area padding */}
        <div className={`px-4 ${isMobile ? "py-2 pb-4" : "py-3"}`}>
          {/* Navigation items */}
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <Button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  variant="ghost"
                  className={`
                    relative flex flex-col items-center justify-center transition-all duration-300 group
                    ${isMobile ? "p-2 min-h-[56px] min-w-[56px] rounded-2xl" : "p-3 min-h-[64px] min-w-[64px] rounded-3xl"}
                    ${
                      isActive
                        ? `bg-gradient-to-br ${item.gradient} text-white shadow-xl ${item.shadowColor} transform scale-110 border border-white/20`
                        : `text-white/70 hover:text-white hover:${item.bgColor} hover:backdrop-blur-sm border border-transparent hover:border-white/10`
                    }
                  `}
                >
                  {/* Enhanced glow effect for active state */}
                  {isActive && (
                    <>
                      <div
                        className={`absolute -inset-2 bg-gradient-to-br ${item.gradient} rounded-3xl blur-xl opacity-40 animate-pulse`}
                      ></div>
                      <div
                        className={`absolute -inset-1 bg-gradient-to-br ${item.gradient} rounded-2xl blur-md opacity-20`}
                      ></div>
                    </>
                  )}

                  {/* Icon and label */}
                  <div className="relative z-10 flex flex-col items-center">
                    <Icon
                      className={`transition-all duration-300 mb-1 ${
                        isMobile ? "h-5 w-5" : "h-6 w-6"
                      } ${
                        isActive
                          ? "scale-110 drop-shadow-lg"
                          : "group-hover:scale-105 group-hover:drop-shadow-md"
                      }`}
                    />
                    <span
                      className={`font-semibold transition-all duration-300 ${
                        isMobile ? "text-xs" : "text-xs"
                      } ${
                        isActive
                          ? "text-white drop-shadow-sm"
                          : "group-hover:text-white"
                      }`}
                    >
                      {isMobile && item.label.length > 8
                        ? item.label.substring(0, 6) + ".."
                        : item.label}
                    </span>
                  </div>

                  {/* Admin badge */}
                  {item.id === "admin" && (
                    <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs scale-75 rounded-full animate-pulse shadow-lg">
                      Admin
                    </Badge>
                  )}

                  {/* Interactive indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-lg"></div>
                  )}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Home indicator for iOS-like appearance */}
        <div className="flex justify-center pb-1">
          <div className="w-32 h-1 bg-white/30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
