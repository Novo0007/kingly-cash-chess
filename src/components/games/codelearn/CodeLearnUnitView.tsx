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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

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
    <div className={isMobile ? "space-y-4" : "space-y-6"}>
      {/* Language Header */}
      <Card className="bg-gradient-to-r from-card/90 to-card/70 border border-border backdrop-blur-sm">
        <CardHeader className={isMobile ? "p-4" : ""}>
          {isMobile ? (
            /* Mobile Layout */
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: language.color }}
                >
                  {language.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg text-foreground mb-1">
                    {language.name} Course
                  </CardTitle>
                  <p className="text-muted-foreground text-xs">
                    {language.description}
                  </p>
                </div>
              </div>

              {languageProgress && (
                <div className="flex justify-between items-center">
                  <div className="text-center">
                    <div className="text-lg font-bold text-foreground">
                      Level {languageProgress.level}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {languageProgress.completedLessons}/
                      {languageProgress.totalLessons} lessons
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {Math.round(
                        (languageProgress.completedLessons /
                          languageProgress.totalLessons) *
                          100,
                      )}
                      %
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Complete
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Progress Bar */}
              {languageProgress && (
                <div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300 shadow-lg"
                      style={{
                        width: `${(languageProgress.completedLessons / languageProgress.totalLessons) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Desktop Layout */
            <div>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold text-white shadow-lg"
                  style={{ backgroundColor: language.color }}
                >
                  {language.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl text-foreground mb-1">
                    {language.name} Course
                  </CardTitle>
                  <p className="text-muted-foreground text-sm">
                    {language.description}
                  </p>
                </div>

                {languageProgress && (
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">
                      Level {languageProgress.level}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {languageProgress.completedLessons}/
                      {languageProgress.totalLessons} lessons
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Progress Bar */}
              {languageProgress && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-muted-foreground text-sm">
                      Course Progress
                    </span>
                    <span className="text-foreground text-sm font-semibold">
                      {Math.round(
                        (languageProgress.completedLessons /
                          languageProgress.totalLessons) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-300 shadow-lg"
                      style={{
                        width: `${(languageProgress.completedLessons / languageProgress.totalLessons) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Units Grid */}
      <div
        className={`grid gap-4 ${isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 gap-6"}`}
      >
        {units.map((unit, index) => {
          const unitProgress = getUnitProgress(unit);
          const isLocked = !unitProgress.isUnlocked;

          return (
            <Card
              key={unit.id}
              className={`group relative overflow-hidden transition-all duration-300 backdrop-blur-sm ${
                isLocked
                  ? "opacity-60 cursor-not-allowed bg-muted/50 border-border"
                  : unitProgress.isCompleted
                    ? "cursor-pointer bg-gradient-to-br from-primary/20 to-accent/20 border-primary/30 hover:from-primary/30 hover:to-accent/30"
                    : "cursor-pointer bg-card border-border hover:border-primary/50 hover:bg-card/80"
              } ${isMobile ? "hover:scale-[1.02]" : "hover:scale-105 hover:shadow-xl"}`}
              onClick={() => !isLocked && onUnitSelect(unit)}
            >
              {/* Progress Indicator */}
              {!isLocked && (
                <div
                  className="absolute top-0 left-0 h-1 bg-gradient-to-r from-primary to-accent shadow-lg"
                  style={{ width: `${unitProgress.progress}%` }}
                />
              )}

              {/* Unit Number Badge */}
              <div
                className={`absolute ${isMobile ? "top-3 right-3" : "top-4 right-4"}`}
              >
                {isLocked ? (
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Lock className="w-4 h-4 text-white/60" />
                  </div>
                ) : unitProgress.isCompleted ? (
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
                    style={{ backgroundColor: unit.color }}
                  >
                    {index + 1}
                  </div>
                )}
              </div>

              <CardHeader className={`${isMobile ? "pb-2 p-4" : "pb-3"}`}>
                <div
                  className={`flex items-start gap-3 ${isMobile ? "pr-10" : "pr-12"}`}
                >
                  <div
                    className={`rounded-xl flex items-center justify-center shadow-md ${
                      isLocked ? "bg-white/20 text-white/60" : "text-white"
                    } ${isMobile ? "w-10 h-10 text-lg" : "w-12 h-12 text-xl"}`}
                    style={{
                      backgroundColor: isLocked ? undefined : unit.color,
                    }}
                  >
                    {unit.icon}
                  </div>

                  <div className="flex-1">
                    <CardTitle
                      className={`mb-1 ${
                        isLocked
                          ? "text-muted-foreground"
                          : unitProgress.isCompleted
                            ? "text-primary"
                            : "text-foreground"
                      } ${isMobile ? "text-base" : "text-lg"}`}
                    >
                      {unit.title}
                    </CardTitle>
                    <p
                      className={`${
                        isLocked
                          ? "text-muted-foreground/60"
                          : "text-muted-foreground"
                      } ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      {unit.description}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent
                className={`${isMobile ? "space-y-3 p-4 pt-0" : "space-y-4"}`}
              >
                {/* Progress Section */}
                {!isLocked && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium text-foreground ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        Progress
                      </span>
                      <span
                        className={`font-bold text-primary ${isMobile ? "text-xs" : "text-sm"}`}
                      >
                        {unitProgress.completedLessons}/
                        {unitProgress.totalLessons}
                      </span>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-300 shadow-lg"
                        style={{ width: `${unitProgress.progress}%` }}
                      />
                    </div>

                    <div
                      className={`text-muted-foreground ${isMobile ? "text-xs" : "text-xs"}`}
                    >
                      {unitProgress.progress}% complete
                    </div>
                  </div>
                )}

                {/* Unit Stats */}
                <div
                  className={`flex items-center justify-between ${isMobile ? "text-xs" : "text-sm"}`}
                >
                  <div
                    className={`flex items-center ${isMobile ? "gap-3" : "gap-4"}`}
                  >
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <BookOpen
                        className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                      />
                      <span>{unit.totalLessons} lessons</span>
                    </div>

                    {!isLocked && unitProgress.isCompleted && (
                      <div className="flex items-center gap-1 text-primary">
                        <Trophy
                          className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                        />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>

                  {!isLocked && !unitProgress.isCompleted && (
                    <div className="flex items-center gap-1 text-accent">
                      <Clock
                        className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                      />
                      <span>~{Math.ceil(unit.totalLessons * 0.5)}h</span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                {isLocked ? (
                  <div className="flex items-center justify-center py-3 px-4 bg-muted/50 rounded-lg backdrop-blur-sm">
                    <Lock
                      className={`text-muted-foreground mr-2 ${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                    />
                    <span
                      className={`text-muted-foreground font-medium ${isMobile ? "text-xs" : "text-sm"}`}
                    >
                      Complete previous unit to unlock
                    </span>
                  </div>
                ) : (
                  <Button
                    className={`w-full transition-all duration-200 font-semibold ${
                      unitProgress.isCompleted
                        ? "bg-gradient-to-r from-primary to-accent hover:opacity-90 shadow-lg"
                        : "bg-primary hover:bg-primary/90 shadow-lg"
                    }`}
                    size={isMobile ? "default" : "lg"}
                  >
                    <div className="flex items-center gap-2">
                      {unitProgress.isCompleted ? (
                        <>
                          <Trophy
                            className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                          />
                          <span className={isMobile ? "text-sm" : ""}>
                            Review Unit
                          </span>
                        </>
                      ) : unitProgress.progress > 0 ? (
                        <>
                          <Play
                            className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                          />
                          <span className={isMobile ? "text-sm" : ""}>
                            Continue
                          </span>
                        </>
                      ) : (
                        <>
                          <Zap
                            className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                          />
                          <span className={isMobile ? "text-sm" : ""}>
                            Start Unit
                          </span>
                        </>
                      )}
                      <ArrowRight
                        className={`${isMobile ? "w-3 h-3" : "w-4 h-4"}`}
                      />
                    </div>
                  </Button>
                )}

                {/* Next Lesson Preview */}
                {!isLocked &&
                  unitProgress.progress > 0 &&
                  unitProgress.progress < 100 && (
                    <div
                      className={`text-muted-foreground text-center pt-2 ${isMobile ? "text-xs" : "text-xs"}`}
                    >
                      Next: Lesson {unitProgress.completedLessons + 1}
                    </div>
                  )}
              </CardContent>

              {/* Completion Badge */}
              {unitProgress.isCompleted && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg shadow-lg">
                  ✓ Complete
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Course Stats */}
      <Card className="bg-gradient-to-r from-card/80 to-card/60 border border-border backdrop-blur-sm">
        <CardContent className={isMobile ? "p-4" : "p-6"}>
          <h3
            className={`font-bold text-foreground mb-4 text-center ${isMobile ? "text-base" : "text-lg"}`}
          >
            Course Overview
          </h3>

          <div
            className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-2 md:grid-cols-4"}`}
          >
            <div className="text-center">
              <div
                className={`font-bold text-primary ${isMobile ? "text-xl" : "text-2xl"}`}
              >
                {units.length}
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Units
              </div>
            </div>

            <div className="text-center">
              <div
                className={`font-bold text-accent ${isMobile ? "text-xl" : "text-2xl"}`}
              >
                {units.reduce((total, unit) => total + unit.totalLessons, 0)}
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Total Lessons
              </div>
            </div>

            <div className="text-center">
              <div
                className={`font-bold text-primary ${isMobile ? "text-xl" : "text-2xl"}`}
              >
                {language.estimatedHours}h
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Estimated Time
              </div>
            </div>

            <div className="text-center">
              <div
                className={`font-bold text-accent ${isMobile ? "text-xl" : "text-2xl"}`}
              >
                {language.difficulty === "beginner"
                  ? "🌱"
                  : language.difficulty === "intermediate"
                    ? "🚀"
                    : "⚡"}
              </div>
              <div
                className={`text-muted-foreground capitalize ${isMobile ? "text-xs" : "text-sm"}`}
              >
                {language.difficulty}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
