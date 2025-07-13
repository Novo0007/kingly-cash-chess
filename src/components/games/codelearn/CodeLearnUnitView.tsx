import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  CheckCircle,
  Play,
  Clock,
  Target,
  Star,
  ArrowRight,
  BookOpen,
  Trophy,
  Zap,
} from "lucide-react";
import { CodeLanguage, UserProgress, CodeUnit } from "./CodeLearnTypes";

interface CodeLearnUnitViewProps {
  language: CodeLanguage;
  units: CodeUnit[];
  userProgress: UserProgress | null;
  onUnitSelect: (unit: CodeUnit) => void;
  onBackToLanguages: () => void;
}

export const CodeLearnUnitView: React.FC<CodeLearnUnitViewProps> = ({
  language,
  units,
  userProgress,
  onUnitSelect,
  onBackToLanguages,
}) => {
  const getUnitProgress = (unit: CodeUnit) => {
    // This would normally check actual lesson completion status
    // For now, simulating based on unit order and some basic logic
    const isUnlocked = unit.isUnlocked;
    const progress = isUnlocked
      ? (unit.completedLessons / unit.totalLessons) * 100
      : 0;
    const isCompleted = progress === 100;

    return {
      isUnlocked,
      progress: Math.round(progress),
      isCompleted,
      completedLessons: unit.completedLessons,
      totalLessons: unit.totalLessons,
    };
  };

  const languageProgress = userProgress?.languageProgress[language.id];

  return (
    <div className="space-y-6">
      {/* Language Header */}
      <Card className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
              style={{ backgroundColor: language.color }}
            >
              {language.icon}
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl text-white mb-1">
                {language.name} Course
              </CardTitle>
              <p className="text-white/80 text-sm">{language.description}</p>
            </div>

            {languageProgress && (
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  Level {languageProgress.level}
                </div>
                <div className="text-white/60 text-sm">
                  {languageProgress.completedLessons}/
                  {languageProgress.totalLessons} lessons
                </div>
              </div>
            )}
          </div>

          {/* Overall Progress Bar */}
          {languageProgress && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">Course Progress</span>
                <span className="text-white text-sm font-semibold">
                  {Math.round(
                    (languageProgress.completedLessons /
                      languageProgress.totalLessons) *
                      100,
                  )}
                  %
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-400 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(languageProgress.completedLessons / languageProgress.totalLessons) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map((unit, index) => {
          const unitProgress = getUnitProgress(unit);
          const isLocked = !unitProgress.isUnlocked;

          return (
            <Card
              key={unit.id}
              className={`group relative overflow-hidden transition-all duration-300 ${
                isLocked
                  ? "opacity-60 cursor-not-allowed bg-gray-100 border-gray-200"
                  : unitProgress.isCompleted
                    ? "cursor-pointer hover:scale-105 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow-xl"
                    : "cursor-pointer hover:scale-105 bg-white border-gray-200 hover:border-blue-300 hover:shadow-xl"
              }`}
              onClick={() => !isLocked && onUnitSelect(unit)}
            >
              {/* Progress Indicator */}
              {!isLocked && (
                <div
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500"
                  style={{ width: `${unitProgress.progress}%` }}
                />
              )}

              {/* Unit Number Badge */}
              <div className="absolute top-4 right-4">
                {isLocked ? (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 text-gray-500" />
                  </div>
                ) : unitProgress.isCompleted ? (
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: unit.color }}
                  >
                    {index + 1}
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start gap-3 pr-12">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
                      isLocked
                        ? "bg-gray-300 text-gray-500"
                        : "text-white shadow-md"
                    }`}
                    style={{
                      backgroundColor: isLocked ? undefined : unit.color,
                    }}
                  >
                    {unit.icon}
                  </div>

                  <div className="flex-1">
                    <CardTitle
                      className={`text-lg mb-1 ${
                        isLocked
                          ? "text-gray-500"
                          : unitProgress.isCompleted
                            ? "text-green-800"
                            : "text-gray-800"
                      }`}
                    >
                      {unit.title}
                    </CardTitle>
                    <p
                      className={`text-sm ${
                        isLocked ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {unit.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progress Section */}
                {!isLocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Progress
                      </span>
                      <span className="text-sm font-bold text-blue-600">
                        {unitProgress.completedLessons}/
                        {unitProgress.totalLessons}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${unitProgress.progress}%` }}
                      />
                    </div>

                    <div className="text-xs text-gray-500">
                      {unitProgress.progress}% complete
                    </div>
                  </div>
                )}

                {/* Unit Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-gray-600">
                      <BookOpen className="w-4 h-4" />
                      <span>{unit.totalLessons} lessons</span>
                    </div>

                    {!isLocked && unitProgress.isCompleted && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Trophy className="w-4 h-4" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>

                  {!isLocked && !unitProgress.isCompleted && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <Clock className="w-4 h-4" />
                      <span>~{Math.ceil(unit.totalLessons * 0.5)}h</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {isLocked ? (
                  <div className="flex items-center justify-center py-3 px-4 bg-gray-100 rounded-lg">
                    <Lock className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-gray-500 text-sm font-medium">
                      Complete previous unit to unlock
                    </span>
                  </div>
                ) : (
                  <Button
                    className={`w-full transition-all duration-200 ${
                      unitProgress.isCompleted
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {unitProgress.isCompleted ? (
                        <>
                          <Trophy className="w-4 h-4" />
                          Review Unit
                        </>
                      ) : unitProgress.progress > 0 ? (
                        <>
                          <Play className="w-4 h-4" />
                          Continue
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          Start Unit
                        </>
                      )}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </Button>
                )}

                {/* Next Lesson Preview */}
                {!isLocked &&
                  unitProgress.progress > 0 &&
                  unitProgress.progress < 100 && (
                    <div className="text-xs text-gray-500 text-center pt-2">
                      Next: Lesson {unitProgress.completedLessons + 1}
                    </div>
                  )}
              </CardContent>

              {/* Completion Badge */}
              {unitProgress.isCompleted && (
                <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded-bl-lg">
                  ✓ Complete
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Course Stats */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardContent className="p-6">
          <h3 className="text-lg font-bold text-indigo-800 mb-4 text-center">
            Course Overview
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">
                {units.length}
              </div>
              <div className="text-sm text-indigo-700">Units</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {units.reduce((total, unit) => total + unit.totalLessons, 0)}
              </div>
              <div className="text-sm text-purple-700">Total Lessons</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {language.estimatedHours}h
              </div>
              <div className="text-sm text-blue-700">Estimated Time</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {language.difficulty === "beginner"
                  ? "🌱"
                  : language.difficulty === "intermediate"
                    ? "🚀"
                    : "⚡"}
              </div>
              <div className="text-sm text-green-700 capitalize">
                {language.difficulty}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
