import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Lock,
  Play,
  Clock,
  Target,
  Star,
  BookOpen,
  Zap,
  ArrowRight,
  Trophy,
} from "lucide-react";
import { CodeUnit, CodeLesson, UserProgress } from "./CodeLearnTypes";
import { useIsMobile } from "@/hooks/use-mobile";

interface CodeLearnUnitLessonsViewProps {
  unit: CodeUnit;
  lessons: CodeLesson[];
  userProgress: UserProgress | null;
  onLessonSelect: (lesson: CodeLesson) => void;
  onBackToUnits: () => void;
}

export const CodeLearnUnitLessonsView: React.FC<
  CodeLearnUnitLessonsViewProps
> = ({ unit, lessons, userProgress, onLessonSelect, onBackToUnits }) => {
  const isMobile = useIsMobile();

  const getLessonProgress = (lesson: CodeLesson) => {
    const isCompleted = lesson.isCompleted;
    const isUnlocked = lesson.isUnlocked;
    const attempts = lesson.attempts || 0;
    const bestScore = lesson.bestScore || 0;

    return {
      isCompleted,
      isUnlocked,
      attempts,
      bestScore,
    };
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "concept":
        return "📚";
      case "practice":
        return "💪";
      case "challenge":
        return "🎯";
      case "project":
        return "🏗️";
      case "quiz":
        return "🧠";
      default:
        return "📖";
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "text-green-600 bg-green-100";
    if (difficulty <= 3) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const unitProgress = Math.round(
    (unit.completedLessons / unit.totalLessons) * 100,
  );

  return (
    <div className={`${isMobile ? "space-y-4" : "space-y-6"}`}>
      {/* Unit Header */}
      <Card className="bg-gradient-to-r from-card/90 to-card/70 border border-border backdrop-blur-sm">
        <CardHeader className={isMobile ? "p-4" : ""}>
          <div className="flex items-center gap-4">
            <div
              className={`rounded-xl flex items-center justify-center text-white shadow-lg ${isMobile ? "w-12 h-12 text-2xl" : "w-16 h-16 text-3xl"}`}
              style={{ backgroundColor: unit.color }}
            >
              {unit.icon}
            </div>
            <div className="flex-1">
              <CardTitle
                className={`text-foreground mb-1 ${isMobile ? "text-lg" : "text-2xl"}`}
              >
                {unit.title}
              </CardTitle>
              <p
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                {unit.description}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`font-bold text-primary ${isMobile ? "text-lg" : "text-2xl"}`}
              >
                {unitProgress}%
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground text-sm">
                {unit.completedLessons}/{unit.totalLessons} lessons completed
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary to-accent h-3 rounded-full transition-all duration-300 shadow-lg"
                style={{ width: `${unitProgress}%` }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lessons List */}
      <div className={`space-y-4 ${isMobile ? "" : "space-y-6"}`}>
        {lessons.map((lesson, index) => {
          const lessonProgress = getLessonProgress(lesson);
          const isLocked = !lessonProgress.isUnlocked;

          return (
            <Card
              key={lesson.id}
              className={`group relative transition-all duration-300 cursor-pointer ${
                isLocked
                  ? "opacity-60 cursor-not-allowed bg-muted/50 border-border"
                  : lessonProgress.isCompleted
                    ? "bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30 hover:from-primary/30 hover:to-accent/30"
                    : "bg-card border-border hover:border-primary/50 hover:bg-card/80"
              } ${isMobile ? "hover:scale-[1.01]" : "hover:scale-[1.02] hover:shadow-lg"}`}
              onClick={() => !isLocked && onLessonSelect(lesson)}
            >
              {/* Lesson Number Badge */}
              <div
                className={`absolute ${isMobile ? "top-3 left-3" : "top-4 left-4"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md`}
                  style={{ backgroundColor: unit.color }}
                >
                  {index + 1}
                </div>
              </div>

              {/* Completion Status */}
              <div
                className={`absolute ${isMobile ? "top-3 right-3" : "top-4 right-4"}`}
              >
                {isLocked ? (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                ) : lessonProgress.isCompleted ? (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-muted-foreground ml-0.5" />
                  </div>
                )}
              </div>

              <CardContent
                className={`${isMobile ? "p-4 pl-14 pr-14" : "p-6 pl-16 pr-16"}`}
              >
                <div className="space-y-3">
                  {/* Lesson Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">
                        {getTypeIcon(lesson.type)}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getDifficultyColor(lesson.difficulty)}`}
                      >
                        Level {lesson.difficulty}
                      </Badge>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {lesson.type}
                      </Badge>
                    </div>
                    <CardTitle
                      className={`${
                        isLocked
                          ? "text-muted-foreground"
                          : lessonProgress.isCompleted
                            ? "text-primary"
                            : "text-foreground"
                      } ${isMobile ? "text-base" : "text-lg"}`}
                    >
                      {lesson.title}
                    </CardTitle>
                    <p
                      className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"} mt-1`}
                    >
                      {lesson.description}
                    </p>
                  </div>

                  {/* Lesson Stats */}
                  <div
                    className={`flex items-center justify-between ${isMobile ? "text-xs" : "text-sm"}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Target className="w-3 h-3" />
                        <span>{lesson.xpReward} XP</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Star className="w-3 h-3 text-yellow-500" />
                        <span>{lesson.coinReward} coins</span>
                      </div>
                      {lesson.content?.exercises && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <BookOpen className="w-3 h-3" />
                          <span>
                            {lesson.content.exercises.length} exercises
                          </span>
                        </div>
                      )}
                    </div>

                    {lessonProgress.isCompleted && (
                      <div className="flex items-center gap-1 text-primary">
                        <Trophy className="w-3 h-3" />
                        <span>{lessonProgress.bestScore}%</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  {isLocked ? (
                    <div className="flex items-center justify-center py-2 px-4 bg-muted/50 rounded-lg">
                      <Lock className="w-4 h-4 text-muted-foreground mr-2" />
                      <span className="text-muted-foreground text-sm">
                        Complete previous lesson to unlock
                      </span>
                    </div>
                  ) : (
                    <Button
                      className={`w-full ${
                        lessonProgress.isCompleted
                          ? "bg-primary/20 text-primary border-primary/20 hover:bg-primary/30"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                      variant={
                        lessonProgress.isCompleted ? "outline" : "default"
                      }
                      size={isMobile ? "sm" : "default"}
                    >
                      <div className="flex items-center gap-2">
                        {lessonProgress.isCompleted ? (
                          <>
                            <Trophy className="w-4 h-4" />
                            <span>Review Lesson</span>
                          </>
                        ) : lessonProgress.attempts > 0 ? (
                          <>
                            <Play className="w-4 h-4" />
                            <span>Continue</span>
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            <span>Start Lesson</span>
                          </>
                        )}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </Button>
                  )}

                  {/* Attempts Info */}
                  {lessonProgress.attempts > 0 && (
                    <div className="text-center text-muted-foreground text-xs">
                      {lessonProgress.attempts} attempt
                      {lessonProgress.attempts > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Unit Summary */}
      <Card className="bg-gradient-to-r from-card/80 to-card/60 border border-border">
        <CardContent className={`text-center ${isMobile ? "p-4" : "p-6"}`}>
          <h3
            className={`font-bold text-foreground mb-4 ${isMobile ? "text-base" : "text-lg"}`}
          >
            Unit Progress
          </h3>
          <div
            className={`grid gap-4 ${isMobile ? "grid-cols-2" : "grid-cols-4"}`}
          >
            <div className="text-center">
              <div
                className={`font-bold text-primary ${isMobile ? "text-lg" : "text-xl"}`}
              >
                {lessons.length}
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Total Lessons
              </div>
            </div>
            <div className="text-center">
              <div
                className={`font-bold text-accent ${isMobile ? "text-lg" : "text-xl"}`}
              >
                {unit.completedLessons}
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Completed
              </div>
            </div>
            <div className="text-center">
              <div
                className={`font-bold text-primary ${isMobile ? "text-lg" : "text-xl"}`}
              >
                {lessons.reduce((total, lesson) => total + lesson.xpReward, 0)}
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Total XP
              </div>
            </div>
            <div className="text-center">
              <div
                className={`font-bold text-accent ${isMobile ? "text-lg" : "text-xl"}`}
              >
                {lessons.reduce(
                  (total, lesson) => total + lesson.coinReward,
                  0,
                )}
              </div>
              <div
                className={`text-muted-foreground ${isMobile ? "text-xs" : "text-sm"}`}
              >
                Total Coins
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
