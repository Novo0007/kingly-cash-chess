import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Star,
  Coins,
  Flame,
  Target,
  BookOpen,
  Code,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  Lock,
  Check,
} from "lucide-react";
import { CodeLearnProgressManager } from "@/components/games/codelearn/CodeLearnProgress";
import { CodeLearnDataService } from "@/components/games/codelearn/CodeLearnData";
import {
  UserProgress,
  Achievement,
  LanguageProgress,
  LANGUAGES,
} from "@/components/games/codelearn/CodeLearnTypes";
import { useTheme } from "@/contexts/ThemeContext";

interface CodeLearnSectionProps {
  userId: string;
}

export const CodeLearnSection: React.FC<CodeLearnSectionProps> = ({
  userId,
}) => {
  const { currentTheme } = useTheme();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [progressManager] = useState(() =>
    CodeLearnProgressManager.getInstance(),
  );
  const [dataService] = useState(() => CodeLearnDataService.getInstance());

  useEffect(() => {
    if (userId) {
      const progress = progressManager.initializeUserProgress(userId);
      setUserProgress(progress);
    }
  }, [userId, progressManager]);

  const getAchievementCategoryColor = (category: string) => {
    switch (category) {
      case "streak":
        return "from-orange-500 to-red-500";
      case "completion":
        return "from-green-500 to-emerald-500";
      case "accuracy":
        return "from-blue-500 to-cyan-500";
      case "speed":
        return "from-purple-500 to-pink-500";
      case "exploration":
        return "from-yellow-500 to-orange-500";
      case "milestone":
        return "from-indigo-500 to-purple-500";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getLanguageProgress = (): LanguageProgress[] => {
    if (!userProgress) return [];
    return Object.values(userProgress.languageProgress);
  };

  const getUnlockedAchievements = (): Achievement[] => {
    if (!userProgress) return [];
    return userProgress.achievements.filter((a) => a.isUnlocked);
  };

  const getInProgressAchievements = (): Achievement[] => {
    if (!userProgress) return [];
    return userProgress.achievements.filter(
      (a) => !a.isUnlocked && a.progress > 0,
    );
  };

  const getLockedAchievements = (): Achievement[] => {
    if (!userProgress) return [];
    return userProgress.achievements.filter(
      (a) => !a.isUnlocked && a.progress === 0,
    );
  };

  if (!userProgress) {
    return (
      <Card className="bg-card border border-border rounded-2xl">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">💻</div>
          <h3 className="text-xl font-bold text-foreground mb-2">
            Start Your Coding Journey
          </h3>
          <p className="text-muted-foreground mb-4">
            Begin learning programming languages with interactive lessons!
          </p>
          <Button
            className={`bg-gradient-to-r ${currentTheme.gradients.primary} text-white`}
          >
            <Code className="w-4 h-4 mr-2" />
            Start Learning
          </Button>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = progressManager.getXPForNextLevel(userProgress.totalXP);
  const dailyGoal = progressManager.getDailyGoalProgress();
  const dailyCoins = progressManager.getDailyCoinProgress();
  const streakInfo = progressManager.getStreakInfo();

  return (
    <div className="space-y-6">
      {/* CodeLearn Overview */}
      <Card
        className={`bg-gradient-to-r ${currentTheme.gradients.primary}/10 border border-primary/20 rounded-2xl`}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div
              className={`w-8 h-8 bg-gradient-to-r ${currentTheme.gradients.primary} rounded-lg flex items-center justify-center`}
            >
              <Code className="w-5 h-5 text-white" />
            </div>
            CodeMaster Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
              <Star className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
              <div className="text-lg font-bold text-foreground">
                {userProgress.totalXP.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>

            <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
              <Coins className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <div className="text-lg font-bold text-foreground">
                {userProgress.availableCoins.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Coins</div>
            </div>

            <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <Flame className="w-6 h-6 mx-auto mb-2 text-orange-500" />
              <div className="text-lg font-bold text-foreground">
                {streakInfo.current}
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>

            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <BookOpen className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <div className="text-lg font-bold text-foreground">
                {userProgress.completedLessons}
              </div>
              <div className="text-xs text-muted-foreground">Lessons</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-300 font-medium">
                  Level {userProgress.level}
                </span>
                <span className="text-purple-100">
                  {levelInfo.current}/{levelInfo.total} XP
                </span>
              </div>
              <Progress
                value={(levelInfo.current / levelInfo.total) * 100}
                className="bg-gray-700"
              />
            </div>

            {/* Daily XP Goal */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-green-300 font-medium">Daily XP</span>
                <span className="text-green-100">
                  {dailyGoal.current}/{dailyGoal.goal}
                </span>
              </div>
              <Progress value={dailyGoal.percentage} className="bg-gray-700" />
            </div>

            {/* Daily Coins */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-amber-300 font-medium">Daily Coins</span>
                <span className="text-amber-100">
                  {dailyCoins.current}/{dailyCoins.goal}
                </span>
              </div>
              <Progress value={dailyCoins.percentage} className="bg-gray-700" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language Progress */}
      <Card className="bg-card border border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-500" />
            Language Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LANGUAGES.map((language) => {
              const progress = userProgress.languageProgress[language.id];
              const hasProgress = !!progress;

              return (
                <div
                  key={language.id}
                  className={`p-4 rounded-lg border ${
                    hasProgress
                      ? "bg-muted/20 border-primary/20"
                      : "bg-muted/10 border-muted/20"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${language.color}20` }}
                    >
                      {language.icon}
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {language.name}
                      </div>
                      {hasProgress && (
                        <Badge variant="outline" className="text-xs">
                          Level {progress.level}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {hasProgress ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{progress.completedLessons} lessons</span>
                        <span>{progress.xp} XP</span>
                      </div>
                      <Progress
                        value={
                          (progress.completedLessons / progress.totalLessons) *
                          100
                        }
                        className="h-2"
                      />
                      <div className="text-xs text-muted-foreground">
                        {Math.round(progress.accuracy * 100)}% accuracy
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-muted-foreground">
                      Not started
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unlocked Achievements */}
        <Card className="bg-card border border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Unlocked Achievements ({getUnlockedAchievements().length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-60 overflow-y-auto">
            {getUnlockedAchievements().map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${getAchievementCategoryColor(achievement.category)}/10 border border-green-500/20`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {achievement.description}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className="bg-yellow-500/20 text-yellow-700 text-xs">
                      +{achievement.xpReward} XP
                    </Badge>
                    <Badge className="bg-amber-500/20 text-amber-700 text-xs">
                      +{achievement.coinReward} coins
                    </Badge>
                  </div>
                </div>
                <Check className="w-5 h-5 text-green-500" />
              </div>
            ))}

            {getUnlockedAchievements().length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No achievements unlocked yet. Start learning to earn your first
                achievement!
              </div>
            )}
          </CardContent>
        </Card>

        {/* In Progress Achievements */}
        <Card className="bg-card border border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              In Progress ({getInProgressAchievements().length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-60 overflow-y-auto">
            {getInProgressAchievements().map((achievement) => (
              <div
                key={achievement.id}
                className={`flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r ${getAchievementCategoryColor(achievement.category)}/10 border border-blue-500/20`}
              >
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">
                    {achievement.title}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {achievement.description}
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                    <Progress
                      value={
                        (achievement.progress / achievement.maxProgress) * 100
                      }
                      className="h-1"
                    />
                  </div>
                </div>
                <Clock className="w-5 h-5 text-blue-500" />
              </div>
            ))}

            {getInProgressAchievements().length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                No achievements in progress. Keep learning to make progress!
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Locked Achievements Preview */}
      {getLockedAchievements().length > 0 && (
        <Card className="bg-card border border-border rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-gray-500" />
              Upcoming Achievements ({getLockedAchievements().length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {getLockedAchievements()
                .slice(0, 6)
                .map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-muted/20 opacity-60"
                  >
                    <div className="text-lg opacity-50">{achievement.icon}</div>
                    <div className="flex-1">
                      <div className="font-medium text-muted-foreground">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-muted-foreground/70">
                        {achievement.description}
                      </div>
                    </div>
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
