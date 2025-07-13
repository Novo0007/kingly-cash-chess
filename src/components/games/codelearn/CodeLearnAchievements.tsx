import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Trophy,
  Star,
  ArrowLeft,
  Lock,
  CheckCircle,
  Flame,
  Target,
  Zap,
  Award,
  Crown,
} from "lucide-react";
import { UserProgress, Achievement } from "./CodeLearnTypes";

interface CodeLearnAchievementsProps {
  userProgress: UserProgress | null;
  onBack: () => void;
}

export const CodeLearnAchievements: React.FC<CodeLearnAchievementsProps> = ({
  userProgress,
  onBack,
}) => {
  if (!userProgress) {
    return (
      <div className="text-center text-white">
        <p>No progress data available</p>
        <Button onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  const unlockedAchievements = userProgress.achievements.filter(
    (a) => a.isUnlocked,
  );
  const inProgressAchievements = userProgress.achievements.filter(
    (a) => !a.isUnlocked && a.progress > 0,
  );
  const lockedAchievements = userProgress.achievements.filter(
    (a) => !a.isUnlocked && a.progress === 0,
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "streak":
        return <Flame className="w-5 h-5" />;
      case "completion":
        return <CheckCircle className="w-5 h-5" />;
      case "accuracy":
        return <Target className="w-5 h-5" />;
      case "speed":
        return <Zap className="w-5 h-5" />;
      case "exploration":
        return <Star className="w-5 h-5" />;
      case "milestone":
        return <Crown className="w-5 h-5" />;
      default:
        return <Award className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "streak":
        return "text-orange-500 bg-orange-100";
      case "completion":
        return "text-green-500 bg-green-100";
      case "accuracy":
        return "text-blue-500 bg-blue-100";
      case "speed":
        return "text-purple-500 bg-purple-100";
      case "exploration":
        return "text-indigo-500 bg-indigo-100";
      case "milestone":
        return "text-yellow-500 bg-yellow-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const renderAchievement = (
    achievement: Achievement,
    type: "unlocked" | "progress" | "locked",
  ) => {
    const progressPercentage =
      (achievement.progress / achievement.maxProgress) * 100;

    return (
      <Card
        key={achievement.id}
        className={`transition-all duration-300 ${
          type === "unlocked"
            ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg"
            : type === "progress"
              ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
              : "bg-gray-50 border-gray-200 opacity-60"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${getCategoryColor(achievement.category)}`}
              >
                {getCategoryIcon(achievement.category)}
              </div>

              <div className="flex-1">
                <CardTitle
                  className={`text-lg mb-1 ${
                    type === "locked" ? "text-gray-500" : "text-gray-800"
                  }`}
                >
                  {achievement.title}
                </CardTitle>
                <p
                  className={`text-sm ${
                    type === "locked" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {achievement.description}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              {type === "unlocked" ? (
                <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-bold">Unlocked!</span>
                </div>
              ) : type === "locked" ? (
                <div className="flex items-center gap-1 bg-gray-400 text-white px-2 py-1 rounded-full">
                  <Lock className="w-4 h-4" />
                  <span className="text-xs">Locked</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full">
                  <span className="text-xs font-bold">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              )}

              <div className="text-2xl">{achievement.icon}</div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Progress Bar */}
          {type !== "locked" && (
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    type === "unlocked"
                      ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                      : "bg-gradient-to-r from-blue-400 to-indigo-500"
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}

          {/* Reward */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Reward</span>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-semibold text-yellow-700">
                +{achievement.xpReward} XP
              </span>
            </div>
          </div>

          {/* Unlock Date */}
          {type === "unlocked" && achievement.unlockedAt && (
            <div className="text-xs text-gray-500 text-center pt-2 border-t border-yellow-200">
              Unlocked on{" "}
              {new Date(achievement.unlockedAt).toLocaleDateString()}
            </div>
          )}

          {/* Category Badge */}
          <div className="flex justify-center">
            <Badge
              className={`${getCategoryColor(achievement.category)} border-0 text-xs`}
            >
              {achievement.category.charAt(0).toUpperCase() +
                achievement.category.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center text-2xl">
                🏆
              </div>
              <div>
                <CardTitle className="text-2xl text-white mb-1">
                  Achievements
                </CardTitle>
                <p className="text-white/80 text-sm">
                  Track your learning milestones and earn rewards
                </p>
              </div>
            </div>

            <Button
              onClick={onBack}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Achievement Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-1">
              {unlockedAchievements.length}
            </div>
            <div className="text-sm text-yellow-700">Achievements Unlocked</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {inProgressAchievements.length}
            </div>
            <div className="text-sm text-blue-700">In Progress</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300">
          <CardContent className="p-4 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-1">
              {unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0)}
            </div>
            <div className="text-sm text-gray-700">XP from Achievements</div>
          </CardContent>
        </Card>
      </div>

      {/* Unlocked Achievements */}
      {unlockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Unlocked Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedAchievements.map((achievement) =>
              renderAchievement(achievement, "unlocked"),
            )}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-blue-400" />
            In Progress
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {inProgressAchievements.map((achievement) =>
              renderAchievement(achievement, "progress"),
            )}
          </div>
        </div>
      )}

      {/* Locked Achievements */}
      {lockedAchievements.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-gray-400" />
            Locked Achievements
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lockedAchievements.map((achievement) =>
              renderAchievement(achievement, "locked"),
            )}
          </div>
        </div>
      )}

      {/* Achievement Categories Info */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="text-indigo-800 text-center">
            Achievement Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl mb-2">🔥</div>
              <div className="font-semibold text-orange-700">Streak</div>
              <div className="text-xs text-orange-600">Daily consistency</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">✅</div>
              <div className="font-semibold text-green-700">Completion</div>
              <div className="text-xs text-green-600">Finish lessons</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-semibold text-blue-700">Accuracy</div>
              <div className="text-xs text-blue-600">Perfect scores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold text-purple-700">Speed</div>
              <div className="text-xs text-purple-600">Fast completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">🗺️</div>
              <div className="font-semibold text-indigo-700">Explorer</div>
              <div className="text-xs text-indigo-600">Try new languages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl mb-2">👑</div>
              <div className="font-semibold text-yellow-700">Milestone</div>
              <div className="text-xs text-yellow-600">Major achievements</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
