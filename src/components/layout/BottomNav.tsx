import React from "react";
import { Button } from "@/components/ui/button";
import { Crown, Users, DollarSign, User, MessageCircle } from "lucide-react";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
}) => {
  const navItems = [
    { id: "lobby", label: "Games", icon: Crown },
    { id: "friends", label: "Friends", icon: Users },
    { id: "wallet", label: "Wallet", icon: DollarSign },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-xl border-t border-cyan-400/30 safe-area-inset-bottom glow-cyan">
      {/* Futuristic accent line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>

      <div className="flex items-center justify-around px-1 py-2 max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-3 h-auto min-w-0 flex-1 min-h-[56px] transition-all duration-300 relative group font-mono ${
                isActive
                  ? "text-cyan-400 bg-cyan-400/20 scale-105 glow-cyan"
                  : "text-gray-400 hover:text-cyan-300 hover:bg-slate-800/50 active:bg-slate-700/50 active:scale-95 border border-transparent hover:border-cyan-400/20"
              }`}
            >
              <div className="relative">
                <Icon
                  className={`${isActive ? "h-6 w-6" : "h-5 w-5"} transition-all duration-300 ${isActive ? "animate-pulse" : "group-hover:animate-pulse"}`}
                />
                {isActive && (
                  <div className="absolute inset-0 bg-cyan-400/20 rounded-full animate-ping"></div>
                )}
              </div>
              <span
                className={`text-xs font-medium leading-tight tracking-wide ${isActive ? "text-cyan-400" : ""}`}
              >
                {item.label.toUpperCase()}
              </span>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full animate-pulse"></div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Corner accents */}
      <div className="absolute bottom-2 left-2 w-3 h-3 border-l-2 border-b-2 border-cyan-400/30"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 border-r-2 border-b-2 border-cyan-400/30"></div>
    </div>
  );
};
