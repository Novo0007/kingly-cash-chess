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
import { useIsMobile } from "@/hooks/use-mobile";

interface CodeLearnLanguageSelectorProps {
  languages: CodeLanguage[];
  userProgress: UserProgress | null;
  onLanguageSelect: (language: CodeLanguage) => void;
}

export const CodeLearnLanguageSelector: React.FC<
  CodeLearnLanguageSelectorProps
> = ({ languages, userProgress, onLanguageSelect }) => {
  const isMobile = useIsMobile();
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
    <div className={`${isMobile ? "space-y-4" : "space-y-8"}`}>
      {/* Welcome Section */}
      <div
        className={`text-center ${isMobile ? "space-y-3 mb-4" : "space-y-4 mb-8"}`}
      >
        <div className={`${isMobile ? "text-4xl mb-2" : "text-6xl mb-4"}`}>
          👨‍💻
        </div>
        <h2
          className={`font-bold text-foreground mb-2 ${isMobile ? "text-2xl" : "text-4xl"}`}
        >
          Choose Your Programming Language
        </h2>
        <p
          className={`text-muted-foreground max-w-2xl mx-auto ${isMobile ? "text-sm px-2" : "text-lg"}`}
        >
          Start your coding journey with interactive lessons, practice
          exercises, and real-world projects. Master programming languages step
          by step with our Duolingo-style approach.
        </p>

        {userProgress && (
          <div
            className={`flex justify-center items-center mt-4 ${isMobile ? "gap-3" : "gap-6 mt-6"}`}
          >
            <div className="text-center">
              <div
                className={`font-bold text-white ${isMobile ? "text-lg" : "text-2xl"}`}
              >
                {userProgress.totalXP.toLocaleString()}
              </div>
              <div
                className={`text-white/60 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Total XP
              </div>
            </div>
            <div className="text-center">
              <div
                className={`font-bold text-white ${isMobile ? "text-lg" : "text-2xl"}`}
              >
                {userProgress.level}
              </div>
              <div
                className={`text-white/60 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Level
              </div>
            </div>
            <div className="text-center">
              <div
                className={`font-bold text-white ${isMobile ? "text-lg" : "text-2xl"}`}
              >
                {userProgress.completedLessons}
              </div>
              <div
                className={`text-white/60 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Lessons
              </div>
            </div>
            <div className="text-center">
              <div
                className={`font-bold text-white ${isMobile ? "text-lg" : "text-2xl"}`}
              >
                {userProgress.currentStreak}
              </div>
              <div
                className={`text-white/60 ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Streak
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Languages Grid */}
      <div
        className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}`}
      >
        {languages.map((language) => {
          const langProgress = getLanguageProgress(language.id);

          return (
            <Card
              key={language.id}
              className={`group relative overflow-hidden transition-all duration-300 cursor-pointer border-2 backdrop-blur-sm ${
                langProgress.isStarted
                  ? "border-blue-400/50 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 hover:from-blue-500/30 hover:to-indigo-500/30"
                  : "border-white/20 bg-white/10 hover:border-blue-300/50 hover:bg-white/20"
              } ${isMobile ? "hover:scale-[1.02]" : "hover:scale-105 hover:shadow-2xl"}`}
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
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 transition-all duration-300 shadow-lg"
                  style={{ width: `${langProgress.progress}%` }}
                />
              )}

              <CardHeader
                className={`relative z-10 ${isMobile ? "pb-2 p-4" : "pb-3"}`}
              >
                <div
                  className={`flex items-start justify-between ${isMobile ? "mb-2" : "mb-3"}`}
                >
                  <div
                    className={`rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${isMobile ? "w-12 h-12 text-2xl" : "w-16 h-16 text-3xl"}`}
                    style={{ backgroundColor: language.color }}
                  >
                    {language.icon}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      className={`${getDifficultyColor(language.difficulty)} border-0 font-semibold ${isMobile ? "text-xs" : ""}`}
                    >
                      {getDifficultyIcon(language.difficulty)}{" "}
                      {language.difficulty}
                    </Badge>

                    {langProgress.isStarted && (
                      <Badge className="bg-emerald-100/80 text-emerald-800 border-0 backdrop-blur-sm">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span className={isMobile ? "text-xs" : ""}>
                          In Progress
                        </span>
                      </Badge>
                    )}
                  </div>
                </div>

                <CardTitle
                  className={`font-bold text-white group-hover:text-cyan-200 transition-colors ${isMobile ? "text-lg" : "text-xl"}`}
                >
                  {language.name}
                </CardTitle>
                <p
                  className={`text-white/80 leading-relaxed ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  {language.description}
                </p>
              </CardHeader>

              <CardContent
                className={`relative z-10 ${isMobile ? "space-y-3 p-4 pt-0" : "space-y-4"}`}
              >
                {/* Progress Section */}
                {langProgress.isStarted ? (
                  <div className={isMobile ? "space-y-2" : "space-y-3"}>
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium text-white/90 ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        Progress
                      </span>
                      <span
                        className={`font-bold text-cyan-300 ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        {langProgress.completedLessons}/
                        {langProgress.totalLessons} lessons
                      </span>
                    </div>

                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-300 shadow-lg"
                        style={{ width: `${langProgress.progress}%` }}
                      />
                    </div>

                    <div
                      className={`flex justify-between text-white/70 ${isMobile ? "text-xs" : "text-xs"}`}
                    >
                      <span>{langProgress.progress}% complete</span>
                      <span>Level {langProgress.level}</span>
                    </div>

                    {langProgress.accuracy !== undefined && (
                      <div
                        className={`flex items-center gap-2 ${isMobile ? "text-xs" : "text-xs"}`}
                      >
                        <Target className="w-3 h-3 text-emerald-400" />
                        <span className="text-white/70">
                          {Math.round(langProgress.accuracy * 100)}% accuracy
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={isMobile ? "space-y-2" : "space-y-3"}>
                    <div
                      className={`flex items-center justify-between text-white/80 ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen
                          className={isMobile ? "w-3 h-3" : "w-4 h-4"}
                        />
                        <span>{language.totalLessons} lessons</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                        <span>~{language.estimatedHours}h</span>
                      </div>
                    </div>

                    <div
                      className={`text-white/60 ${isMobile ? "text-xs" : "text-xs"}`}
                    >
                      Start your journey with interactive coding exercises
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className={`w-full transition-all duration-200 font-semibold ${
                    langProgress.isStarted
                      ? "bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg shadow-emerald-500/25"
                      : "bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/25"
                  }`}
                  size={isMobile ? "default" : "lg"}
                >
                  <div className="flex items-center gap-2">
                    {langProgress.isStarted ? (
                      <>
                        <TrendingUp
                          className={isMobile ? "w-3 h-3" : "w-4 h-4"}
                        />
                        <span className={isMobile ? "text-sm" : ""}>
                          Continue Learning
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                        <span className={isMobile ? "text-sm" : ""}>
                          Start Learning
                        </span>
                      </>
                    )}
                    <ArrowRight className={isMobile ? "w-3 h-3" : "w-4 h-4"} />
                  </div>
                </Button>

                {/* Quick Stats */}
                {langProgress.isStarted && (
                  <div
                    className={`grid grid-cols-2 gap-3 pt-3 border-t border-white/20 ${isMobile ? "mt-3" : "mt-4"}`}
                  >
                    <div className="text-center">
                      <div
                        className={`font-bold text-cyan-300 ${isMobile ? "text-base" : "text-lg"}`}
                      >
                        {langProgress.level}
                      </div>
                      <div
                        className={`text-white/60 ${isMobile ? "text-xs" : "text-xs"}`}
                      >
                        Level
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-bold text-emerald-300 ${isMobile ? "text-base" : "text-lg"}`}
                      >
                        {Math.round(langProgress.accuracy * 100)}%
                      </div>
                      <div
                        className={`text-white/60 ${isMobile ? "text-xs" : "text-xs"}`}
                      >
                        Accuracy
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Hover Effect Arrow */}
              <div
                className={`absolute opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? "bottom-3 right-3" : "bottom-4 right-4"}`}
              >
                <ArrowRight
                  className={`text-white/80 ${isMobile ? "w-5 h-5" : "w-6 h-6"}`}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feature Highlights */}
      <div
        className={`grid gap-4 ${isMobile ? "grid-cols-1 mt-6" : "grid-cols-1 md:grid-cols-3 gap-6 mt-12"}`}
      >
        <Card className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-400/30 backdrop-blur-sm">
          <CardContent className={`text-center ${isMobile ? "p-4" : "p-6"}`}>
            <div className={`mb-3 ${isMobile ? "text-3xl" : "text-4xl"}`}>
              🎯
            </div>
            <h3
              className={`font-bold text-emerald-200 mb-2 ${isMobile ? "text-sm" : ""}`}
            >
              Interactive Learning
            </h3>
            <p
              className={`text-emerald-100/80 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              Practice with real code examples and instant feedback on your
              progress.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border-blue-400/30 backdrop-blur-sm">
          <CardContent className={`text-center ${isMobile ? "p-4" : "p-6"}`}>
            <div className={`mb-3 ${isMobile ? "text-3xl" : "text-4xl"}`}>
              🏆
            </div>
            <h3
              className={`font-bold text-blue-200 mb-2 ${isMobile ? "text-sm" : ""}`}
            >
              Achievements & Streaks
            </h3>
            <p
              className={`text-blue-100/80 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              Earn badges, maintain streaks, and unlock new challenges as you
              progress.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/20 to-purple-500/20 border-violet-400/30 backdrop-blur-sm">
          <CardContent className={`text-center ${isMobile ? "p-4" : "p-6"}`}>
            <div className={`mb-3 ${isMobile ? "text-3xl" : "text-4xl"}`}>
              📈
            </div>
            <h3
              className={`font-bold text-violet-200 mb-2 ${isMobile ? "text-sm" : ""}`}
            >
              Personalized Path
            </h3>
            <p
              className={`text-violet-100/80 ${isMobile ? "text-xs" : "text-sm"}`}
            >
              Adaptive learning that adjusts to your pace and learning style.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
