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
  X,
  Home,
  User,
  FileText,
  Settings,
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
import { StudyMaterials } from "./StudyMaterials";
import { CodeLearnUnitLessonsView } from "./CodeLearnUnitLessonsView";
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
  | "unit-lessons"
  | "lesson"
  | "achievements"
  | "profile"
  | "leaderboard"
  | "study-pdfs";

export const CodeLearnGame: React.FC<CodeLearnGameProps> = ({
  onBack,
  user,
}) => {
  const { currentTheme, isDark } = useTheme();
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
    setIsMobileMenuOpen(false);
  };

  const handleUnitSelect = (unit: CodeUnit) => {
    setSelectedUnit(unit);
    setCurrentView("unit-lessons");
    setIsMobileMenuOpen(false);
  };

  const handleLessonSelect = (lesson: CodeLesson) => {
    setSelectedLesson(lesson);
    setCurrentView("lesson");
    setIsMobileMenuOpen(false);
  };

  const handleLessonComplete = (
    lesson: CodeLesson,
    score: number,
    accuracy: number,
    timeSpent: number,
  ) => {
    if (user?.id) {
      // Calculate XP and coins based on lesson rewards and performance
      const baseXP = lesson.xpReward || 50;
      const baseCoins = lesson.coinReward || 10;

      // Apply accuracy multiplier
      const xpEarned = Math.round(baseXP * accuracy);
      const coinsEarned = Math.round(baseCoins * accuracy);

      const updatedProgress = progressManager.completeLesson(
        user.id,
        lesson.id,
        score,
        xpEarned,
        coinsEarned,
        accuracy,
        timeSpent,
      );
      setUserProgress(updatedProgress);

      // Show completion message
      toast.success(
        `🎉 Lesson completed! +${xpEarned} XP, +${coinsEarned} coins`,
      );
    }
  };

  const handleBackToLanguages = () => {
    setCurrentView("languages");
    setSelectedLanguage(null);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setIsMobileMenuOpen(false);
  };

  const handleBackToUnits = () => {
    if (currentView === "unit-lessons") {
      setCurrentView("units");
      setSelectedUnit(null);
    } else {
      setCurrentView("unit-lessons");
      setSelectedLesson(null);
    }
    setIsMobileMenuOpen(false);
  };

  const handleNavigate = (view: GameView) => {
    setCurrentView(view);
    setIsMobileMenuOpen(false);
  };

  const getViewTitle = () => {
    switch (currentView) {
      case "languages":
        return "Code Master";
      case "units":
        return selectedLanguage?.name || "Units";
      case "unit-lessons":
        return selectedUnit?.title || "Lessons";
      case "lesson":
        return selectedLesson?.title || "Lesson";
      case "achievements":
        return "Achievements";
      case "profile":
        return "Profile";
      case "leaderboard":
        return "Leaderboard";
      case "study-pdfs":
        return "Study Materials";
      default:
        return "Code Master";
    }
  };

  const navigationItems = [
    { id: "languages", label: "Languages", icon: Home },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "profile", label: "Profile", icon: User },
    { id: "leaderboard", label: "Leaderboard", icon: TrendingUp },
    { id: "study-pdfs", label: "Study Materials", icon: FileText },
  ];

  // Mobile Navigation Component
  const MobileNavigation = () => (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => setIsMobileMenuOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-80 max-w-[80vw] bg-card border-l border-border shadow-2xl">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Navigation</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={currentView === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigate(item.id as GameView)}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            );
          })}
        </div>

        {userProgress && (
          <div className="p-4 border-t border-border mt-auto">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Level {userProgress.level}
                </span>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">
                    {userProgress.availableCoins}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>XP Progress</span>
                  <span>{userProgress.totalXP}</span>
                </div>
                <Progress
                  value={(userProgress.totalXP % 1000) / 10}
                  className="h-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm">
                  {userProgress.currentStreak} day streak
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Navigation Overlay */}
      {isMobileMenuOpen && <MobileNavigation />}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={
                  currentView === "languages"
                    ? onBack
                    : currentView === "units"
                      ? handleBackToLanguages
                      : currentView === "unit-lessons"
                        ? handleBackToUnits
                        : currentView === "lesson"
                          ? () => setCurrentView("unit-lessons")
                          : handleBackToLanguages
                }
              >
                <ArrowLeft className="h-4 w-4" />
                {isMobile ? "" : "Back"}
              </Button>

              <div>
                <h1 className="text-lg md:text-xl font-bold">
                  {getViewTitle()}
                </h1>
                {selectedLanguage && currentView !== "languages" && (
                  <p className="text-xs text-muted-foreground">
                    {selectedLanguage.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Progress Indicators - Mobile Optimized */}
              {userProgress && (
                <div className="hidden md:flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Flame className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">
                      {userProgress.currentStreak}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Level {userProgress.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {userProgress.availableCoins}
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile-only progress */}
              {userProgress && isMobile && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    L{userProgress.level}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {userProgress.availableCoins}🪙
                  </Badge>
                </div>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      {!isMobile && currentView === "languages" && (
        <div className="border-b border-border bg-card/50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center gap-4 overflow-x-auto">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={currentView === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavigate(item.id as GameView)}
                    className="flex-shrink-0"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 md:py-6">
        {currentView === "languages" &&
          (isMobile ? (
            <CodeLearnLanguageSelector
              languages={dataService.getLanguages()}
              userProgress={userProgress}
              onLanguageSelect={handleLanguageSelect}
            />
          ) : (
            <ProfessionalCodeLearnLanguageSelector
              languages={dataService.getLanguages()}
              userProgress={userProgress}
              onLanguageSelect={handleLanguageSelect}
            />
          ))}

        {currentView === "units" && selectedLanguage && (
          <CodeLearnUnitView
            language={selectedLanguage}
            units={dataService.getUnitsForLanguage(selectedLanguage.id)}
            userProgress={userProgress}
            onUnitSelect={handleUnitSelect}
            onBackToLanguages={handleBackToLanguages}
          />
        )}

        {currentView === "unit-lessons" && selectedUnit && (
          <CodeLearnUnitLessonsView
            unit={selectedUnit}
            lessons={dataService.getLessonsForUnit(selectedUnit.id)}
            userProgress={userProgress}
            onLessonSelect={handleLessonSelect}
            onBackToUnits={handleBackToUnits}
          />
        )}

        {currentView === "lesson" && selectedLesson && selectedUnit && (
          <CodeLearnLessonView
            lesson={selectedLesson}
            unit={selectedUnit}
            userProgress={userProgress}
            onLessonComplete={handleLessonComplete}
            onBackToUnits={handleBackToUnits}
          />
        )}

        {currentView === "achievements" && (
          <CodeLearnAchievements
            userProgress={userProgress}
            onBack={handleBackToLanguages}
          />
        )}

        {currentView === "profile" && (
          <CodeLearnProfile
            userProgress={userProgress}
            progressManager={progressManager}
            onBack={handleBackToLanguages}
          />
        )}

        {currentView === "leaderboard" && (
          <CodeLearnLeaderboard
            currentUserId={user?.id}
            userProgress={userProgress}
            onBack={handleBackToLanguages}
          />
        )}

        {currentView === "study-pdfs" && (
          <StudyMaterials onBack={handleBackToLanguages} />
        )}
      </div>
    </div>
  );
};
