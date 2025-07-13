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
  Menu,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
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
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<GameView>("languages");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className="relative mb-4 md:mb-6">
        {/* Mobile-friendly Background Effect */}
        <div
          className={`absolute -inset-2 md:-inset-4 bg-gradient-to-r ${currentTheme.gradients.primary}/20 rounded-xl md:rounded-2xl blur-xl animate-pulse`}
        ></div>

        <div className="relative p-3 md:p-4 backdrop-blur-sm bg-white/5 rounded-xl md:rounded-2xl border border-white/10">
          {/* Mobile Header Layout */}
          {isMobile ? (
            <div className="space-y-3">
              {/* Top Row - Icon and Title */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${currentTheme.gradients.accent} rounded-full blur-md opacity-60 animate-pulse`}
                  ></div>
                  <div
                    className={`relative w-10 h-10 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-full flex items-center justify-center text-lg`}
                  >
                    💻
                  </div>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent">
                    CodeLearn Academy
                  </h1>
                  <p className="text-white/80 text-xs">
                    Learn programming interactively
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              {userProgress && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 bg-purple-500/20 px-2 py-1 rounded-full">
                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                      Lv.{userProgress.level}
                    </Badge>
                  </div>

                  {streakInfo && streakInfo.current > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/20 px-2 py-1 rounded-full">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span className="text-orange-100 font-bold text-xs">
                        {streakInfo.current}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-100 font-bold text-xs">
                      {userProgress.totalXP.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span className="text-amber-100 font-bold text-xs">
                      {userProgress.availableCoins.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Header Layout */
            <div className="flex items-center gap-4">
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
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1">
                    Level {userProgress.level}
                  </Badge>

                  {streakInfo && streakInfo.current > 0 && (
                    <div className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-100 font-bold">
                        {streakInfo.current}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-yellow-500/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-100 font-bold">
                      {userProgress.totalXP.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-500/20 px-3 py-1 rounded-full">
                    <Coins className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-100 font-bold">
                      {userProgress.availableCoins.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile-friendly Progress Bars */}
        {userProgress && dailyGoal && levelInfo && (
          <div
            className={`mt-3 md:mt-4 grid gap-3 md:gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-3"}`}
          >
            {/* Daily XP Goal Progress */}
            <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 backdrop-blur-sm">
              <CardContent className={`${isMobile ? "p-3" : "p-4"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-emerald-300 font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    Daily XP Goal
                  </span>
                  <span
                    className={`text-emerald-100 ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {dailyGoal.current}/{dailyGoal.goal} XP
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dailyGoal.percentage}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            {/* Daily Coin Goal Progress */}
            <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 backdrop-blur-sm">
              <CardContent className={`${isMobile ? "p-3" : "p-4"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-amber-300 font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    Daily Coins
                  </span>
                  <span
                    className={`text-amber-100 ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {userProgress.todayCoins}/{userProgress.dailyGoalCoins}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
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
            <Card className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-400/30 backdrop-blur-sm">
              <CardContent className={`${isMobile ? "p-3" : "p-4"}`}>
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`text-violet-300 font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    Level {userProgress.level}
                  </span>
                  <span
                    className={`text-violet-100 ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    {levelInfo.current}/{levelInfo.total} XP
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-violet-400 to-purple-400 h-2 rounded-full transition-all duration-300"
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
      <div
        className={`mb-4 md:mb-6 ${isMobile ? "space-y-3" : "flex items-center justify-between"}`}
      >
        {/* Back Button and Breadcrumbs */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => {
              if (currentView === "lesson") {
                setCurrentView("units");
              } else if (currentView === "units") {
                setCurrentView("languages");
              } else if (
                currentView === "achievements" ||
                currentView === "profile" ||
                currentView === "leaderboard"
              ) {
                setCurrentView("languages");
              } else {
                onBack();
              }
            }}
            variant="outline"
            size={isMobile ? "sm" : "sm"}
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <ArrowLeft className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`} />
            <span className={isMobile ? "text-xs" : "text-sm"}>
              {currentView === "lesson"
                ? "Units"
                : currentView === "units"
                  ? "Languages"
                  : currentView === "achievements" ||
                      currentView === "profile" ||
                      currentView === "leaderboard"
                    ? "Languages"
                    : "Games"}
            </span>
          </Button>

          {selectedLanguage && (
            <Badge className="bg-white/10 text-white border border-white/20 text-xs">
              {selectedLanguage.icon}{" "}
              {isMobile
                ? selectedLanguage.name.substring(0, 8) +
                  (selectedLanguage.name.length > 8 ? "..." : "")
                : selectedLanguage.name}
            </Badge>
          )}

          {selectedUnit && (
            <Badge className="bg-white/10 text-white border border-white/20 text-xs">
              {selectedUnit.icon}{" "}
              {isMobile
                ? selectedUnit.title.substring(0, 10) +
                  (selectedUnit.title.length > 10 ? "..." : "")
                : selectedUnit.title}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        {isMobile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentView("leaderboard")}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20 px-3"
              >
                <TrendingUp className="w-3 h-3" />
                <span className="text-xs">Ranks</span>
              </Button>

              <Button
                onClick={() => setCurrentView("achievements")}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20 px-3"
              >
                <Trophy className="w-3 h-3" />
                <span className="text-xs">Awards</span>
              </Button>

              <Button
                onClick={() => setCurrentView("profile")}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 bg-white/10 border-white/20 text-white hover:bg-white/20 px-3"
              >
                <Target className="w-3 h-3" />
                <span className="text-xs">Profile</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setCurrentView("leaderboard")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <TrendingUp className="w-4 h-4" />
              Leaderboard
            </Button>

            <Button
              onClick={() => setCurrentView("achievements")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Trophy className="w-4 h-4" />
              Achievements
            </Button>

            <Button
              onClick={() => setCurrentView("profile")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Target className="w-4 h-4" />
              Profile
            </Button>
          </div>
        )}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    CodeLearn Academy
                  </h1>
                  <p className="text-sm text-gray-500">
                    Professional Programming Education
                  </p>
                </div>
              </div>
            </div>

            {/* User Progress Stats */}
            {userProgress && (
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm font-bold text-indigo-600">
                    Level {userProgress.level}
                  </div>
                  <div className="text-xs text-gray-500">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-amber-600">
                    {userProgress.availableCoins}
                  </div>
                  <div className="text-xs text-gray-500">Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-emerald-600">
                    {userProgress.totalXP}
                  </div>
                  <div className="text-xs text-gray-500">Total XP</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {renderNavigation()}
        <div className="mt-6">{renderContent()}</div>
      </div>
    </div>
  );
};
