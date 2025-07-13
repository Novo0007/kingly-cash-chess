import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Code,
  BookOpen,
  Clock,
  TrendingUp,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Target,
  Play,
} from "lucide-react";
import { CodeLanguage, UserProgress } from "./CodeLearnTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface ProfessionalCodeLearnLanguageSelectorProps {
  languages: CodeLanguage[];
  userProgress: UserProgress | null;
  onLanguageSelect: (language: CodeLanguage) => void;
}

export const ProfessionalCodeLearnLanguageSelector: React.FC<
  ProfessionalCodeLearnLanguageSelectorProps
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
          <Code className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-professional-primary text-3xl lg:text-4xl font-bold">
          Choose Your Programming Language
        </h1>

        <p className="text-professional-secondary max-w-2xl mx-auto text-lg">
          Start your coding journey with interactive lessons, hands-on projects,
          and personalized learning paths.
        </p>

        {/* User Stats */}
        {userProgress && (
          <div className="flex justify-center items-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-professional-primary">
                {userProgress.totalXP.toLocaleString()}
              </div>
              <div className="text-sm text-professional-muted">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                Level {userProgress.level}
              </div>
              <div className="text-sm text-professional-muted">
                Current Level
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {userProgress.completedLessons}
              </div>
              <div className="text-sm text-professional-muted">
                Lessons Completed
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {userProgress.currentStreak}
              </div>
              <div className="text-sm text-professional-muted">Day Streak</div>
            </div>
          </div>
        )}
      </div>

      {/* Languages Grid - Mobile-first 1x1 layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {languages.map((language) => {
          const langProgress = getLanguageProgress(language.id);
          const isRecommended =
            language.id === "study-guide" || language.id === "javascript";

          return (
            <Card
              key={language.id}
              className="group cursor-pointer border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] overflow-hidden bg-white"
              onClick={() => onLanguageSelect(language)}
            >
              {/* Card Header with Language Color */}
              <div
                className="h-32 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${language.color}, ${language.color}dd)`,
                }}
              >
                <div className="absolute inset-0 bg-black/10"></div>

                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1">
                      <Star className="h-3 w-3 mr-1" />
                      RECOMMENDED
                    </Badge>
                  </div>
                )}

                {/* Progress Badge */}
                {langProgress.isStarted && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500/90 text-white text-xs font-semibold px-3 py-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {langProgress.progress}% Complete
                    </Badge>
                  </div>
                )}

                {/* Language Icon */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                    <span className="text-3xl">{language.icon}</span>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="absolute bottom-4 right-4">
                  <Badge
                    className={`text-xs font-medium px-3 py-1 ${
                      language.difficulty === "beginner"
                        ? "bg-green-500/20 text-green-100 border-green-400/30"
                        : language.difficulty === "intermediate"
                          ? "bg-yellow-500/20 text-yellow-100 border-yellow-400/30"
                          : "bg-red-500/20 text-red-100 border-red-400/30"
                    }`}
                  >
                    {language.difficulty.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Language Title */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {language.name}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      <span>{language.totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>~{language.estimatedHours}h</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {language.description}
                </p>

                {/* Progress Section */}
                {langProgress.isStarted ? (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        Your Progress
                      </span>
                      <span className="text-sm text-gray-500">
                        {langProgress.completedLessons}/
                        {langProgress.totalLessons} completed
                      </span>
                    </div>
                    <Progress
                      value={langProgress.progress}
                      className="h-3 mb-3"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Level {langProgress.level}</span>
                      <span>
                        {Math.round(langProgress.accuracy * 100)}% accuracy
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 p-4 bg-gray-50 rounded-xl text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                      {language.totalLessons}
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      Interactive Lessons
                    </div>
                    <div className="text-xs text-gray-400">
                      Start from the basics and build up
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Button
                  className="w-full font-semibold py-3 rounded-xl transition-all duration-200 group/btn"
                  style={{
                    background: `linear-gradient(135deg, ${language.color}, ${language.color}cc)`,
                    color: "white",
                  }}
                >
                  <div className="flex items-center justify-center gap-2">
                    {langProgress.isStarted ? (
                      <>
                        <TrendingUp className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110" />
                        CONTINUE LEARNING
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 transition-transform duration-200 group-hover/btn:scale-110" />
                        START LEARNING
                      </>
                    )}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </div>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Features Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="text-center space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Why Choose CodeLearn Academy?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Interactive Lessons
              </h4>
              <p className="text-gray-600">
                Learn by doing with hands-on coding exercises and real-time
                feedback
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Progress Tracking
              </h4>
              <p className="text-gray-600">
                Monitor your learning journey with detailed analytics and
                insights
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Achievements
              </h4>
              <p className="text-gray-600">
                Earn badges and rewards as you master new programming skills
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
