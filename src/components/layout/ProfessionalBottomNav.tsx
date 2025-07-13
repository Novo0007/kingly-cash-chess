import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Trophy,
  Wallet,
  UserCircle,
  Shield,
  Crown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn, componentStyles } from "@/utils/designSystem";

interface ProfessionalBottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAdmin?: boolean;
}

export const ProfessionalBottomNav: React.FC<ProfessionalBottomNavProps> = ({
  currentView,
  onViewChange,
  isAdmin = false,
}) => {
  const isMobile = useIsMobile();

  const navigationItems = [
    {
      id: "games",
      label: "Home",
      icon: Home,
      color: "blue",
    },
    {
      id: "tournaments",
      label: "Events",
      icon: Crown,
      color: "purple",
    },
    {
      id: "rankings",
      label: "Rankings",
      icon: Trophy,
      color: "amber",
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: Wallet,
      color: "emerald",
    },
    {
      id: "profile",
      label: "Profile",
      icon: UserCircle,
      color: "gray",
    },
  ];

  // Add admin tab if user is admin
  if (isAdmin) {
    navigationItems.push({
      id: "admin",
      label: "Admin",
      icon: Shield,
      color: "red",
    });
  }

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-white border-t border-gray-200",
        "backdrop-blur-lg bg-white/95",
        "shadow-lg",
      )}
    >
      {/* Navigation Container */}
      <div
        className={cn(
          "px-4",
          isMobile ? "py-2 pb-4" : "py-3",
          "safe-area-inset-bottom",
        )}
      >
        {/* Navigation Items */}
        <div className="flex justify-around items-center">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <Button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                variant="ghost"
                className={cn(
                  "relative flex flex-col items-center justify-center",
                  "transition-all duration-200",
                  "rounded-xl",
                  isMobile
                    ? "p-2 min-h-[60px] min-w-[60px]"
                    : "p-3 min-h-[64px] min-w-[64px]",
                  isActive
                    ? cn("bg-blue-50 text-blue-600", "shadow-sm")
                    : cn(
                        "text-gray-500 hover:text-gray-700",
                        "hover:bg-gray-50",
                      ),
                )}
              >
                {/* Icon */}
                <Icon
                  className={cn(
                    "transition-all duration-200",
                    isMobile ? "h-5 w-5 mb-1" : "h-6 w-6 mb-1",
                    isActive ? "scale-110" : "group-hover:scale-105",
                  )}
                />

                {/* Label */}
                <span
                  className={cn(
                    "font-medium transition-all duration-200",
                    isMobile ? "text-xs" : "text-xs",
                    isActive ? "text-blue-600" : "text-gray-500",
                  )}
                >
                  {item.label}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div
                    className={cn(
                      "absolute -top-1 left-1/2 transform -translate-x-1/2",
                      "w-1 h-1 bg-blue-600 rounded-full",
                    )}
                  />
                )}

                {/* Admin Badge */}
                {item.id === "admin" && (
                  <Badge
                    className={cn(
                      "absolute -top-1 -right-1",
                      "bg-red-500 text-white text-xs",
                      "scale-75 rounded-full",
                      "animate-pulse shadow-sm",
                    )}
                  >
                    •
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* iOS-style Home Indicator */}
      <div className="flex justify-center pb-2">
        <div className="w-32 h-1 bg-gray-300 rounded-full opacity-60"></div>
      </div>
    </nav>
  );
};

export { ProfessionalBottomNav as BottomNav };
export default ProfessionalBottomNav;
