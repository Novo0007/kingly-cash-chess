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
import { ProfessionalCodeLearnLanguageSelector } from "./ProfessionalCodeLearnLanguageSelector";
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
      <div className="mb-6">
        {/* Progress Cards */}
        {userProgress && dailyGoal && levelInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Daily XP Goal Progress */}
            <Card className="bg-card border border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      Daily XP Goal
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dailyGoal.current}/{dailyGoal.goal} XP
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dailyGoal.percentage}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {dailyGoal.percentage}% complete
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card className="bg-card border border-border shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      Level {userProgress.level}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {levelInfo.current}/{levelInfo.total} XP
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`bg-gradient-to-r ${currentTheme.gradients.primary} h-2 rounded-full transition-all duration-300`}
                    style={{
                      width: `${(levelInfo.current / levelInfo.total) * 100}%`,
                    }}
                  ></div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {Math.round((levelInfo.current / levelInfo.total) * 100)}% to
                  next level
                </div>
              </CardContent>
            </Card>

            {/* Streak & Coins */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-bold text-gray-900">
                        {streakInfo?.current || 0}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-gray-900">
                        {userProgress.availableCoins}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">Coins</div>
                  </div>
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
        {/* Back Button and Breadcrumbs */}
        <div className="flex items-center gap-3">
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
            size="sm"
            className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">
              {currentView === "lesson"
                ? "Back to Units"
                : currentView === "units"
                  ? "Back to Languages"
                  : currentView === "achievements" ||
                      currentView === "profile" ||
                      currentView === "leaderboard"
                    ? "Back to Languages"
                    : "Back to Games"}
            </span>
          </Button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {selectedLanguage && (
              <>
                <span>/</span>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 text-xs"
                >
                  {selectedLanguage.icon} {selectedLanguage.name}
                </Badge>
              </>
            )}
            {selectedUnit && (
              <>
                <span>/</span>
                <Badge
                  variant="secondary"
                  className="bg-gray-100 text-gray-700 text-xs"
                >
                  {selectedUnit.icon} {selectedUnit.title}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setCurrentView("leaderboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <TrendingUp className="w-4 h-4" />
            {isMobile ? "Ranks" : "Leaderboard"}
          </Button>

          <Button
            onClick={() => setCurrentView("achievements")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Trophy className="w-4 h-4" />
            {isMobile ? "Awards" : "Achievements"}
          </Button>

          <Button
            onClick={() => setCurrentView("profile")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
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
          <ProfessionalCodeLearnLanguageSelector
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
    <div className="min-h-screen bg-background">
      {/* Professional Header */}
      <div className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-xl flex items-center justify-center`}
                >
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    CodeLearn Academy
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Professional Programming Education
                  </p>
                </div>
              </div>
            </div>

            {/* User Progress Stats */}
            {userProgress && (
              <div className="hidden sm:flex items-center gap-6">
                <div className="text-center">
                  <div className="text-sm font-bold text-primary">
                    Level {userProgress.level}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Current Level
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-amber-600">
                    {userProgress.availableCoins}
                  </div>
                  <div className="text-xs text-muted-foreground">Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-emerald-600">
                    {userProgress.totalXP}
                  </div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
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
