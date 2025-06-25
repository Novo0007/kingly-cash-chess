
import React from "react";
import { Button } from "@/components/ui/button";
import { Gamepad2, Users, DollarSign, User } from "lucide-react";

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentView,
  onViewChange,
}) => {
  const navItems = [
    { id: "games", label: "Games", icon: Gamepad2 },
    { id: "friends", label: "Friends", icon: Users },
    { id: "wallet", label: "Wallet", icon: DollarSign },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-gray-700 safe-area-inset-bottom">
      <div className="flex items-center justify-around px-1 py-2 max-w-sm mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (item.id === "games" && (currentView === "lobby" || currentView === "game" || currentView === "dots-and-boxes"));

          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={`flex flex-col items-center gap-1 px-2 py-3 h-auto min-w-0 flex-1 min-h-[56px] transition-all duration-200 ${
                isActive
                  ? "text-blue-400 bg-blue-500/15 scale-105"
                  : "text-gray-400 hover:text-white hover:bg-gray-800/50 active:bg-gray-700/50 active:scale-95"
              }`}
            >
              <Icon
                className={`${isActive ? "h-6 w-6" : "h-5 w-5"} transition-all duration-200`}
              />
              <span
                className={`text-xs font-medium leading-tight ${isActive ? "text-blue-400" : ""}`}
              >
                {item.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};
