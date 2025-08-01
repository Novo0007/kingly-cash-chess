import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  Star,
  Trophy,
  Target,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  Crown,
  Flame,
  Brain,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MathLevelSystem, MathLevel, LevelProgress } from "./MathLevelSystem";
import { useTheme } from "@/contexts/ThemeContext";

interface MathLevelSelectorProps {
  levelSystem: MathLevelSystem;
  onSelectLevel: (levelNumber: number) => void;
  onBack: () => void;
}

export const MathLevelSelector: React.FC<MathLevelSelectorProps> = ({
  levelSystem,
  onSelectLevel,
  onBack,
}) => {
  const { currentTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState(0);
  const [progress, setProgress] = useState<LevelProgress>(
    levelSystem.getProgress(),
  );
  const [levels, setLevels] = useState<MathLevel[]>(levelSystem.getAllLevels());

  const levelsPerPage = 12;
  const totalPages = Math.ceil(levels.length / levelsPerPage);

  useEffect(() => {
    setProgress(levelSystem.getProgress());
    setLevels(levelSystem.getAllLevels());
  }, [levelSystem]);

  const getCurrentPageLevels = () => {
    const startIndex = currentPage * levelsPerPage;
    const endIndex = startIndex + levelsPerPage;
    return levels.slice(startIndex, endIndex);
  };

  const getLevelIcon = (level: MathLevel) => {
    if (!level.unlocked) return Lock;
    if (progress.levelsCompleted.includes(level.level)) return CheckCircle;
    if (level.eliminationMode) return Flame;
    if (level.difficulty === "hard") return Zap;
    if (level.difficulty === "medium") return Brain;
    return Target;
  };

  const getLevelColor = (level: MathLevel) => {
    if (!level.unlocked) return "bg-gray-400";
    if (progress.levelsCompleted.includes(level.level)) return "bg-green-500";
    if (level.eliminationMode) return "bg-red-500";
    if (level.difficulty === "hard") return "bg-purple-500";
    if (level.difficulty === "medium") return "bg-orange-500";
    return "bg-blue-500";
  };

  const getLevelTextColor = (level: MathLevel) => {
    if (!level.unlocked) return "text-gray-600";
    if (progress.levelsCompleted.includes(level.level)) return "text-green-800";
    if (level.eliminationMode) return "text-red-800";
    if (level.difficulty === "hard") return "text-purple-800";
    if (level.difficulty === "medium") return "text-orange-800";
    return "text-blue-800";
  };

  const handleLevelSelect = (level: MathLevel) => {
    if (!level.unlocked) return;
    onSelectLevel(level.level);
  };

  const goToPage = (pageNumber: number) => {
    setCurrentPage(Math.max(0, Math.min(totalPages - 1, pageNumber)));
  };

  const goToCurrentLevel = () => {
    const currentLevelPage = Math.floor(
      (progress.currentLevel - 1) / levelsPerPage,
    );
    setCurrentPage(currentLevelPage);
  };

  return (
    <div className="w-full space-y-6 px-2 sm:px-4">
      {/* Header */}
      <div className="relative">
        <div
          className={`absolute -inset-4 bg-gradient-to-r ${currentTheme.gradients.primary}/20 rounded-2xl blur-xl animate-pulse`}
        ></div>
        <div className="relative flex items-center gap-4 mb-6 md:mb-8 p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-md opacity-60 animate-pulse`}
              ></div>
              <div
                className={`relative w-10 h-10 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full flex items-center justify-center`}
              >
                🎯
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
              Level Selection
            </h1>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {progress.currentLevel}
              </div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {progress.levelsCompleted.length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {progress.longestStreak}
              </div>
              <div className="text-sm text-gray-600">Best Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(levelSystem.getAccuracy() * 100)}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(levelSystem.getCompletionRate() * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${levelSystem.getCompletionRate() * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center">
            <Badge
              className={`${getLevelTextColor({ unlocked: true, difficulty: "easy", eliminationMode: false } as MathLevel)} bg-white border px-3 py-1`}
            >
              {levelSystem.getRankTitle()}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Page Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 0}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage + 1} of {totalPages}
          </span>
          <Button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button onClick={goToCurrentLevel} variant="outline" size="sm">
          <Target className="h-4 w-4 mr-2" />
          Go to Current Level
        </Button>
      </div>

      {/* Level Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {getCurrentPageLevels().map((level) => {
          const Icon = getLevelIcon(level);
          const isCompleted = progress.levelsCompleted.includes(level.level);
          const isCurrent = level.level === progress.currentLevel;

          return (
            <Card
              key={level.level}
              className={`relative cursor-pointer transition-all duration-200 hover:scale-105 border-2 ${
                !level.unlocked
                  ? "opacity-50 cursor-not-allowed border-gray-200"
                  : isCompleted
                    ? "border-green-300 bg-green-50"
                    : isCurrent
                      ? "border-blue-300 bg-blue-50 ring-2 ring-blue-200"
                      : level.eliminationMode
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 hover:border-blue-300"
              }`}
              onClick={() => handleLevelSelect(level)}
            >
              {isCurrent && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  →
                </div>
              )}

              <CardContent className="p-3 text-center space-y-2">
                <div
                  className={`w-10 h-10 ${getLevelColor(level)} rounded-full flex items-center justify-center mx-auto`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm">Level {level.level}</div>
                  <div
                    className="text-xs text-gray-600 truncate"
                    title={level.name}
                  >
                    {level.name.replace(`Level ${level.level}: `, "")}
                  </div>
                </div>

                <div className="space-y-1">
                  {level.eliminationMode && (
                    <Badge className="text-xs bg-red-100 text-red-800 border-red-200">
                      Elimination
                    </Badge>
                  )}
                  <Badge
                    className={`text-xs ${getLevelTextColor(level)} bg-white border`}
                  >
                    {level.difficulty}
                  </Badge>
                </div>

                {level.unlocked && (
                  <Button
                    size="sm"
                    className="w-full h-6 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLevelSelect(level);
                    }}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    Play
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Level Details */}
      <Card className="bg-gradient-to-r from-gray-50 to-blue-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg">Level Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Target className="h-4 w-4" />
                Regular Levels
              </h4>
              <p className="text-gray-600">
                Levels 1-20: Practice mode with mistakes allowed
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Flame className="h-4 w-4 text-red-500" />
                Elimination Mode
              </h4>
              <p className="text-gray-600">
                Levels 21+: One mistake eliminates you!
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-500" />
                Master Levels
              </h4>
              <p className="text-gray-600">
                Levels 80+: Ultimate mathematical challenges
              </p>
            </div>
          </div>

          <div className="border-t pt-3">
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                Easy (1-20)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                Medium (21-60)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                Hard (61-99)
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                Completed
              </span>
              <span className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                Locked
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Button onClick={onBack} variant="outline" className="flex-1">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Lobby
        </Button>

        {progress.currentLevel <= 99 && (
          <Button
            onClick={() => handleLevelSelect(progress.currentLevel as any)}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Continue Level {progress.currentLevel}
          </Button>
        )}
      </div>
    </div>
  );
};
