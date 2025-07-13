import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Trophy,
  Flame,
  Target,
  BookOpen,
  Code,
  Star,
  Award,
  TrendingUp,
  Clock,
  Zap,
  Brain,
  Coins,
} from "lucide-react";
import { CodeLearnLanguageSelector } from "./CodeLearnLanguageSelector";
import { CodeLearnUnitView } from "./CodeLearnUnitView";
import { CodeLearnLessonView } from "./CodeLearnLessonView";
import { CodeLearnAchievements } from "./CodeLearnAchievements";
import { CodeLearnProfile } from "./CodeLearnProfile";
import { CodeLearnLeaderboard } from "./CodeLearnLeaderboard";
import { CodeLearnDataService } from "./CodeLearnData";
import { CodeLearnProgressManager } from "./CodeLearnProgress";
import {
  CodeLanguage,
  UserProgress,
  CodeUnit,
  CodeLesson,
} from "./CodeLearnTypes";
import { toast } from "sonner";
import { useTheme } from "@/contexts/ThemeContext";

interface CodeLearnGameProps {
  onBack: () => void;
  user: any;
}

type GameView =
  | "languages"
  | "units"
  | "lesson"
  | "achievements"
  | "profile"
  | "leaderboard";

export const CodeLearnGame: React.FC<CodeLearnGameProps> = ({
  onBack,
  user,
}) => {
  const { currentTheme } = useTheme();
  const [currentView, setCurrentView] = useState<GameView>("languages");
  const [selectedLanguage, setSelectedLanguage] = useState<CodeLanguage | null>(
    null,
  );
  const [selectedUnit, setSelectedUnit] = useState<CodeUnit | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<CodeLesson | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [dataService] = useState(() => CodeLearnDataService.getInstance());
  const [progressManager] = useState(() =>
    CodeLearnProgressManager.getInstance(),
  );

  useEffect(() => {
    if (user?.id) {
      const progress = progressManager.initializeUserProgress(user.id);
      setUserProgress(progress);
    }
  }, [user?.id, progressManager]);

  useEffect(() => {
    // Listen for achievement notifications
    const handleAchievement = (event: CustomEvent) => {
      const achievement = event.detail;
      toast.success(`🏆 Achievement Unlocked: ${achievement.title}!`, {
        description: achievement.description,
        duration: 5000,
      });
    };

    window.addEventListener(
      "achievementUnlocked",
      handleAchievement as EventListener,
    );
    return () => {
      window.removeEventListener(
        "achievementUnlocked",
        handleAchievement as EventListener,
      );
    };
  }, []);

  const handleLanguageSelect = (language: CodeLanguage) => {
    setSelectedLanguage(language);
    setCurrentView("units");
  };

  const handleUnitSelect = (unit: CodeUnit) => {
    setSelectedUnit(unit);

    // Get first unlocked lesson in unit
    const lessons = dataService.getLessonsForUnit(unit.id);
    const firstLesson = lessons.find((l) => l.isUnlocked) || lessons[0];

    if (firstLesson) {
      setSelectedLesson(firstLesson);
      setCurrentView("lesson");
    }
  };

  const handleLessonComplete = (
    lesson: CodeLesson,
    score: number,
    accuracy: number,
    timeSpent: number,
  ) => {
    if (!userProgress) return;

    // Calculate coin reward based on performance
    const coinReward = progressManager.calculateCoinReward(
      lesson.xpReward,
      accuracy,
      timeSpent < 180, // time bonus for completing under 3 minutes
      Math.min(userProgress.currentStreak * 0.1 + 1, 2), // streak multiplier up to 2x
    );

    // Create session record
    const session = {
      id: Date.now().toString(),
      userId: user.id,
      lessonId: lesson.id,
      startTime: Date.now() - timeSpent * 1000,
      endTime: Date.now(),
      score,
      accuracy,
      xpEarned: lesson.xpReward,
      coinsEarned: coinReward.amount,
      exerciseResults: [], // Would be populated with actual exercise results
      timeSpent,
      hintsUsed: 0,
      completed: true,
    };

    // Update progress
    progressManager.updateProgress(session);
    const updatedProgress = progressManager.getUserProgress();
    setUserProgress(updatedProgress);

    // Show completion toast
    toast.success(
      `Lesson completed! +${lesson.xpReward} XP, +${coinReward.amount} coins`,
      {
        description: `Score: ${Math.round(score)}% • Accuracy: ${Math.round(accuracy * 100)}%${coinReward.bonus ? " • Bonus earned!" : ""}`,
      },
    );

    // Auto-advance to next lesson or back to unit view
    setTimeout(() => {
      const lessons = dataService.getLessonsForUnit(selectedUnit!.id);
      const currentIndex = lessons.findIndex((l) => l.id === lesson.id);
      const nextLesson = lessons[currentIndex + 1];

      if (nextLesson && nextLesson.isUnlocked) {
        setSelectedLesson(nextLesson);
      } else {
        setCurrentView("units");
      }
    }, 2000);
  };

  const renderHeader = () => {
    const dailyGoal = userProgress
      ? progressManager.getDailyGoalProgress()
      : null;
    const streakInfo = userProgress ? progressManager.getStreakInfo() : null;
    const levelInfo = userProgress
      ? progressManager.getXPForNextLevel(userProgress.totalXP)
      : null;

    return (
      <div className="relative mb-6">
        {/* Background Effect */}
        <div
          className={`absolute -inset-4 bg-gradient-to-r ${currentTheme.gradients.primary}/20 rounded-2xl blur-xl animate-pulse`}
        ></div>

        <div className="relative flex items-center gap-4 p-4 backdrop-blur-sm bg-white/5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-md opacity-60 animate-pulse`}
              ></div>
              <div
                className={`relative w-12 h-12 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full flex items-center justify-center text-2xl`}
              >
                💻
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                CodeLearn Academy
              </h1>
              <p className="text-white/80 text-sm">
                Learn programming languages interactively
              </p>
            </div>
          </div>

          {userProgress && (
            <div className="flex items-center gap-4 ml-auto">
              {/* Level Badge */}
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                Level {userProgress.level}
              </Badge>

              {/* Streak */}
              {streakInfo && streakInfo.current > 0 && (
                <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-orange-100 font-bold">
                    {streakInfo.current}
                  </span>
                </div>
              )}

              {/* Total XP */}
              <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-100 font-bold">
                  {userProgress.totalXP.toLocaleString()}
                </span>
              </div>

              {/* Total Coins */}
              <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full">
                <Coins className="w-4 h-4 text-amber-400" />
                <span className="text-amber-100 font-bold">
                  {userProgress.availableCoins.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Bars */}
        {userProgress && dailyGoal && levelInfo && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Daily XP Goal Progress */}
            <Card className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-400/30">
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-green-300 text-sm font-medium">
                    Daily XP Goal
                  </span>
                  <span className="text-green-100 text-sm">
                    {dailyGoal.current}/{dailyGoal.goal} XP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dailyGoal.percentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Coin Goal Progress */}
            <Card className="bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-400/30">
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-amber-300 text-sm font-medium">
                    Daily Coins
                  </span>
                  <span className="text-amber-100 text-sm">
                    {userProgress.todayCoins}/{userProgress.dailyGoalCoins}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-orange-400 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((userProgress.todayCoins / userProgress.dailyGoalCoins) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-400/30">
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-purple-300 text-sm font-medium">
                    Level {userProgress.level}
                  </span>
                  <span className="text-purple-100 text-sm">
                    {levelInfo.current}/{levelInfo.total} XP
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(levelInfo.current / levelInfo.total) * 100}%`,
                    }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  const renderNavigation = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => {
              if (currentView === "lesson") {
                setCurrentView("units");
              } else if (currentView === "units") {
                setCurrentView("languages");
              } else {
                onBack();
              }
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentView === "lesson"
              ? "Back to Units"
              : currentView === "units"
                ? "All Languages"
                : "Back to Games"}
          </Button>

          {selectedLanguage && (
            <Badge className="bg-white/10 text-white border border-white/20">
              {selectedLanguage.icon} {selectedLanguage.name}
            </Badge>
          )}

          {selectedUnit && (
            <Badge className="bg-white/10 text-white border border-white/20">
              {selectedUnit.icon} {selectedUnit.title}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentView("leaderboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <TrendingUp className="w-4 h-4" />
            Leaderboard
          </Button>

          <Button
            onClick={() => setCurrentView("achievements")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            Achievements
          </Button>

          <Button
            onClick={() => setCurrentView("profile")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Target className="w-4 h-4" />
            Profile
          </Button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentView) {
      case "languages":
        return (
          <CodeLearnLanguageSelector
            languages={dataService.getLanguages()}
            userProgress={userProgress}
            onLanguageSelect={handleLanguageSelect}
          />
        );

      case "units":
        if (!selectedLanguage) return null;
        return (
          <CodeLearnUnitView
            language={selectedLanguage}
            units={dataService.getUnitsForLanguage(selectedLanguage.id)}
            userProgress={userProgress}
            onUnitSelect={handleUnitSelect}
            onBackToLanguages={() => setCurrentView("languages")}
          />
        );

      case "lesson":
        if (!selectedLesson || !selectedUnit) return null;
        return (
          <CodeLearnLessonView
            lesson={selectedLesson}
            unit={selectedUnit}
            userProgress={userProgress}
            onLessonComplete={handleLessonComplete}
            onBackToUnits={() => setCurrentView("units")}
          />
        );

      case "achievements":
        return (
          <CodeLearnAchievements
            userProgress={userProgress}
            onBack={() => setCurrentView("languages")}
          />
        );

      case "profile":
        return (
          <CodeLearnProfile
            userProgress={userProgress}
            progressManager={progressManager}
            onBack={() => setCurrentView("languages")}
          />
        );

      case "leaderboard":
        return (
          <CodeLearnLeaderboard
            currentUserId={user?.id}
            onClose={() => setCurrentView("languages")}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen p-4"
      style={{
        background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {renderHeader()}
        {renderNavigation()}
        {renderContent()}
      </div>
    </div>
  );
};
