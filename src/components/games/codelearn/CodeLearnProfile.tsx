import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Target,
  Flame,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Code,
  Trophy,
} from "lucide-react";
import { UserProgress, CodeLearnProgressManager } from "./CodeLearnTypes";

interface CodeLearnProfileProps {
  userProgress: UserProgress | null;
  progressManager: CodeLearnProgressManager;
  onBack: () => void;
}

export const CodeLearnProfile: React.FC<CodeLearnProfileProps> = ({
  userProgress,
  progressManager,
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

  const levelInfo = progressManager.getXPForNextLevel(userProgress.totalXP);
  const dailyGoal = progressManager.getDailyGoalProgress();
  const streakInfo = progressManager.getStreakInfo();
  const unlockedAchievements = progressManager.getUnlockedAchievements();

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getLanguageStats = () => {
    return Object.values(userProgress.languageProgress || {}).map((lang) => ({
      ...lang,
      progressPercentage: (lang.completedLessons / lang.totalLessons) * 100,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-3xl">
                👨‍💻
              </div>
              <div>
                <CardTitle className="text-3xl text-white mb-1">
                  Your Profile
                </CardTitle>
                <p className="text-white/80 text-sm">
                  Track your coding journey and achievements
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

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-purple-600 mb-2">
              {userProgress.level}
            </div>
            <div className="text-sm text-purple-700 mb-3">Current Level</div>
            <div className="w-full bg-purple-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-400 to-pink-500 h-2 rounded-full"
                style={{
                  width: `${(levelInfo.current / levelInfo.total) * 100}%`,
                }}
              />
            </div>
            <div className="text-xs text-purple-600 mt-1">
              {levelInfo.current}/{levelInfo.total} XP to next level
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-yellow-600 mb-2">
              {userProgress.totalXP.toLocaleString()}
            </div>
            <div className="text-sm text-yellow-700">Total XP</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-300">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Flame className="w-6 h-6 text-orange-500" />
              <div className="text-4xl font-bold text-orange-600">
                {userProgress.currentStreak}
              </div>
            </div>
            <div className="text-sm text-orange-700">Day Streak</div>
            <div className="text-xs text-orange-600 mt-1">
              Best: {userProgress.longestStreak} days
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
          <CardContent className="p-6 text-center">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {userProgress.completedLessons}
            </div>
            <div className="text-sm text-green-700">Lessons Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Today's Progress</span>
              <span className="font-semibold">
                {dailyGoal.current}/{dailyGoal.goal} XP
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(dailyGoal.percentage, 100)}%` }}
              />
            </div>
            <div className="text-sm text-gray-600">
              {dailyGoal.percentage >= 100 ? (
                <span className="text-green-600 font-semibold">
                  🎉 Goal completed!
                </span>
              ) : (
                `${Math.round(100 - dailyGoal.percentage)}% remaining`
              )}
            </div>
          </CardContent>
        </Card>

        {/* Time Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Time Spent Learning
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatTime(userProgress.totalTimeSpent)}
                </div>
                <div className="text-sm text-gray-600">Total Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(
                    userProgress.totalTimeSpent /
                      Math.max(userProgress.completedLessons, 1),
                  )}
                  m
                </div>
                <div className="text-sm text-gray-600">Avg per Lesson</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Last active: {formatDate(userProgress.lastActiveDate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-500" />
            Language Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {getLanguageStats().length > 0 ? (
            <div className="space-y-4">
              {getLanguageStats().map((lang) => (
                <div key={lang.languageId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold capitalize">
                        {lang.languageId}
                      </span>
                      <Badge className="bg-blue-100 text-blue-800 text-xs">
                        Level {lang.level}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-600">
                      {lang.completedLessons}/{lang.totalLessons} lessons
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-400 to-purple-500 h-2 rounded-full"
                      style={{ width: `${lang.progressPercentage}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{Math.round(lang.progressPercentage)}% complete</span>
                    <span>{Math.round(lang.accuracy * 100)}% accuracy</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No language progress yet</p>
              <p className="text-sm">
                Start a lesson to see your progress here!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {unlockedAchievements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.slice(-6).map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold text-yellow-800">
                      {achievement.title}
                    </div>
                    <div className="text-sm text-yellow-600">
                      +{achievement.xpReward} XP
                    </div>
                  </div>
                  {achievement.unlockedAt && (
                    <div className="text-xs text-yellow-600">
                      {formatDate(achievement.unlockedAt)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No achievements yet</p>
              <p className="text-sm">
                Complete lessons to earn your first achievements!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => {
            /* Reset progress handler */
          }}
          variant="outline"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Reset Progress
        </Button>
        <Button
          onClick={() => {
            /* Export progress handler */
          }}
          variant="outline"
        >
          Export Progress
        </Button>
      </div>
    </div>
  );
};
