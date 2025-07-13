import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  X,
  Code,
  Crown,
  Target,
  Gamepad2,
  Brain,
  BookOpen,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface FloatingActionButtonProps {
  onGameSelect: (gameId: string) => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onGameSelect,
}) => {
  const { currentTheme } = useTheme();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(false);

  const quickGames = [
    { id: "codelearn", icon: Code, label: "Code", color: "bg-violet-500" },
    { id: "chess", icon: Crown, label: "Chess", color: "bg-amber-500" },
    { id: "maze", icon: Target, label: "Maze", color: "bg-indigo-500" },
    { id: "game2048", icon: Gamepad2, label: "2048", color: "bg-cyan-500" },
  ];

  if (!isMobile) return null;

  const handleGameSelect = (gameId: string) => {
    onGameSelect(gameId);
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-20 right-4 z-40">
      {/* Quick Game Buttons */}
      {isExpanded && (
        <div className="flex flex-col gap-3 mb-4 animate-in slide-in-from-bottom-4 duration-300">
          {quickGames.map((game, index) => (
            <button
              key={game.id}
              onClick={() => handleGameSelect(game.id)}
              className={`${game.color} w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform transition-all duration-200 hover:scale-110 text-white`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <game.icon className="w-5 h-5" />
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-14 h-14 rounded-full bg-gradient-to-r ${currentTheme.gradients.primary} hover:opacity-90 shadow-xl transform transition-all duration-300 ${
          isExpanded ? "rotate-45 scale-110" : "rotate-0 scale-100"
        }`}
      >
        {isExpanded ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Plus className="w-6 h-6 text-white" />
        )}
      </Button>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};
