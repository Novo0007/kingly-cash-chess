import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Code,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  Lock,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Target,
} from "lucide-react";
import { CodeLanguage, UserProgress } from "./CodeLearnTypes";

interface CodeLearnLanguageSelectorProps {
  languages: CodeLanguage[];
  userProgress: UserProgress | null;
  onLanguageSelect: (language: CodeLanguage) => void;
}

export const CodeLearnLanguageSelector: React.FC<
  CodeLearnLanguageSelectorProps
> = ({ languages, userProgress, onLanguageSelect }) => {
  const getLanguageProgress = (languageId: string) => {
    if (!userProgress?.languageProgress[languageId]) {
      return { progress: 0, level: 0, isStarted: false };
    }

    const langProgress = userProgress.languageProgress[languageId];
    const progress =
      (langProgress.completedLessons / langProgress.totalLessons) * 100;

    return {
      progress: Math.round(progress),
      level: langProgress.level,
      isStarted: true,
      completedLessons: langProgress.completedLessons,
      totalLessons: langProgress.totalLessons,
      accuracy: langProgress.accuracy,
    };
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "text-green-500 bg-green-100";
      case "intermediate":
        return "text-orange-500 bg-orange-100";
      case "advanced":
        return "text-red-500 bg-red-100";
      default:
        return "text-gray-500 bg-gray-100";
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "🌱";
      case "intermediate":
        return "🚀";
      case "advanced":
        return "⚡";
      default:
        return "📚";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4 mb-8">
        <div className="text-6xl mb-4">👨‍💻</div>
        <h2 className="text-4xl font-bold text-white mb-2">
          Choose Your Programming Language
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Start your coding journey with interactive lessons, practice
          exercises, and real-world projects. Master programming languages step
          by step with our Duolingo-style approach.
        </p>

        {userProgress && (
          <div className="flex justify-center items-center gap-6 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {userProgress.totalXP.toLocaleString()}
              </div>
              <div className="text-white/60 text-sm">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {userProgress.level}
              </div>
              <div className="text-white/60 text-sm">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {userProgress.completedLessons}
              </div>
              <div className="text-white/60 text-sm">Lessons Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {userProgress.currentStreak}
              </div>
              <div className="text-white/60 text-sm">Day Streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Languages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language) => {
          const langProgress = getLanguageProgress(language.id);

          return (
            <Card
              key={language.id}
              className={`group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer border-2 ${
                langProgress.isStarted
                  ? "border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50"
                  : "border-gray-200 bg-white hover:border-blue-300"
              }`}
              onClick={() => onLanguageSelect(language)}
            >
              {/* Background Gradient Overlay */}
              <div
                className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity"
                style={{ backgroundColor: language.color }}
              />

              {/* Progress Bar at Top */}
              {langProgress.isStarted && (
                <div
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-300"
                  style={{ width: `${langProgress.progress}%` }}
                />
              )}

              <CardHeader className="relative z-10 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: language.color }}
                  >
                    {language.icon}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={`${getDifficultyColor(language.difficulty)} border-0 font-semibold`}
                    >
                      {getDifficultyIcon(language.difficulty)}{" "}
                      {language.difficulty}
                    </Badge>

                    {langProgress.isStarted && (
                      <Badge className="bg-green-100 text-green-800 border-0">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>

                <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {language.name}
                </CardTitle>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {language.description}
                </p>
              </CardHeader>

              <CardContent className="relative z-10 space-y-4">
                {/* Progress Section */}
                {langProgress.isStarted ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {langProgress.completedLessons}/
                        {langProgress.totalLessons} lessons
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${langProgress.progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{langProgress.progress}% complete</span>
                      <span>Level {langProgress.level}</span>
                    </div>

                    {langProgress.accuracy !== undefined && (
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="w-3 h-3 text-green-500" />
                        <span className="text-gray-600">
                          {Math.round(langProgress.accuracy * 100)}% accuracy
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{language.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>~{language.estimatedHours}h</span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Start your journey with interactive coding exercises
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className={`w-full transition-all duration-200 ${
                    langProgress.isStarted
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                      : "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                  }`}
                  size="lg"
                >
                  <div className="flex items-center gap-2">
                    {langProgress.isStarted ? (
                      <>
                        <TrendingUp className="w-4 h-4" />
                        Continue Learning
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4" />
                        Start Learning
                      </>
                    )}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </Button>

                {/* Quick Stats */}
                {langProgress.isStarted && (
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">
                        {langProgress.level}
                      </div>
                      <div className="text-xs text-gray-500">Level</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-600">
                        {Math.round(langProgress.accuracy * 100)}%
                      </div>
                      <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Hover Effect Arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-6 h-6 text-blue-500" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="font-bold text-green-800 mb-2">
              Interactive Learning
            </h3>
            <p className="text-green-700 text-sm">
              Practice with real code examples and instant feedback on your
              progress.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">🏆</div>
            <h3 className="font-bold text-blue-800 mb-2">
              Achievements & Streaks
            </h3>
            <p className="text-blue-700 text-sm">
              Earn badges, maintain streaks, and unlock new challenges as you
              progress.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="font-bold text-purple-800 mb-2">
              Personalized Path
            </h3>
            <p className="text-purple-700 text-sm">
              Adaptive learning that adjusts to your pace and learning style.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
