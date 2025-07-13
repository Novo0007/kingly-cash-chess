import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  CheckCircle,
  XCircle,
  Clock,
  Star,
  Lightbulb,
  Code,
  ArrowRight,
  ArrowLeft,
  Target,
  Zap,
  BookOpen,
  Play,
} from "lucide-react";
import { CodeLesson, CodeUnit, UserProgress, Exercise } from "./CodeLearnTypes";
import { toast } from "sonner";

interface CodeLearnLessonViewProps {
  lesson: CodeLesson;
  unit: CodeUnit;
  userProgress: UserProgress | null;
  onLessonComplete: (
    lesson: CodeLesson,
    score: number,
    accuracy: number,
    timeSpent: number,
  ) => void;
  onBackToUnits: () => void;
}

export const CodeLearnLessonView: React.FC<CodeLearnLessonViewProps> = ({
  lesson,
  unit,
  userProgress,
  onLessonComplete,
  onBackToUnits,
}) => {
  // Early return if lesson data is invalid
  if (
    !lesson ||
    !lesson.content ||
    !lesson.content.exercises ||
    lesson.content.exercises.length === 0
  ) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mb-4">
              <BookOpen className="w-12 h-12 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Lesson Not Available</h3>
              <p className="text-sm">
                This lesson doesn't have any exercises yet.
              </p>
            </div>
            <Button onClick={onBackToUnits} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Units
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<
    Record<string, string>
  >({});
  const [exerciseResults, setExerciseResults] = useState<
    Record<string, boolean>
  >({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const currentExercise = lesson?.content?.exercises?.[currentExerciseIndex];
  const isLastExercise =
    currentExerciseIndex === (lesson?.content?.exercises?.length ?? 0) - 1;
  const allExercisesAnswered =
    lesson?.content?.exercises?.every(
      (ex) => ex?.id && exerciseAnswers[ex.id],
    ) ?? false;

  // Update time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const handleAnswerChange = (exerciseId: string, answer: string) => {
    setExerciseAnswers((prev) => ({
      ...prev,
      [exerciseId]: answer,
    }));
  };

  const checkAnswer = (exercise: Exercise, userAnswer: string): boolean => {
    const correct = Array.isArray(exercise.correctAnswer)
      ? exercise.correctAnswer.includes(userAnswer)
      : exercise.correctAnswer.toLowerCase().trim() ===
        userAnswer.toLowerCase().trim();

    setExerciseResults((prev) => ({
      ...prev,
      [exercise.id]: correct,
    }));

    return correct;
  };

  const handleSubmitAnswer = () => {
    if (!currentExercise) return;

    const userAnswer = exerciseAnswers[currentExercise.id] || "";
    const isCorrect = checkAnswer(currentExercise, userAnswer);

    setShowExplanation(true);

    if (isCorrect) {
      toast.success("Correct! Well done! 🎉");
    } else {
      toast.error("Not quite right. Check the explanation below.");
    }

    // Auto-advance after showing explanation
    setTimeout(() => {
      if (isLastExercise) {
        handleLessonComplete();
      } else {
        handleNextExercise();
      }
    }, 3000);
  };

  const handleNextExercise = () => {
    setShowExplanation(false);
    setShowHints(false);
    setCurrentExerciseIndex((prev) => prev + 1);
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setShowExplanation(false);
      setShowHints(false);
      setCurrentExerciseIndex((prev) => prev - 1);
    }
  };

  const handleLessonComplete = () => {
    const exercises = lesson?.content?.exercises ?? [];
    const correctAnswers = exercises.filter(
      (ex) => ex?.id && exerciseResults[ex.id],
    ).length;

    const totalExercises = exercises.length;
    const accuracy = correctAnswers / totalExercises;
    const score = accuracy * 100;

    setIsComplete(true);
    setShowResults(true);

    // Call completion callback after a delay to show results
    setTimeout(() => {
      onLessonComplete(lesson, score, accuracy, timeSpent);
    }, 5000);
  };

  const handleShowHint = () => {
    setShowHints(true);
    setHintsUsed((prev) => prev + 1);
  };

  const renderExercise = (exercise: Exercise) => {
    if (!exercise || !exercise.id) {
      return (
        <div className="text-center py-4">
          <p className="text-muted-foreground">Invalid exercise data</p>
        </div>
      );
    }

    const userAnswer = exerciseAnswers[exercise.id] || "";
    const hasAnswered = exerciseResults.hasOwnProperty(exercise.id);
    const isCorrect = exerciseResults[exercise.id];

    switch (exercise.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {exercise.question}
            </h3>

            {exercise.code && (
              <Card className="bg-gray-900 border border-gray-700">
                <CardContent className="p-4">
                  <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                    <code>{exercise.code}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-3">
              {exercise.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswer === option ? "default" : "outline"}
                  className={`text-left justify-start p-4 h-auto ${
                    hasAnswered
                      ? option === exercise.correctAnswer
                        ? "bg-green-100 border-green-400 text-green-800"
                        : userAnswer === option && !isCorrect
                          ? "bg-red-100 border-red-400 text-red-800"
                          : ""
                      : ""
                  }`}
                  onClick={() =>
                    !hasAnswered && handleAnswerChange(exercise.id, option)
                  }
                  disabled={hasAnswered}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span>{option}</span>
                    {hasAnswered && option === exercise.correctAnswer && (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    )}
                    {hasAnswered && userAnswer === option && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </Button>
              ))}
            </div>
          </div>
        );

      case "fill-blank":
      case "code-completion":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {exercise.question}
            </h3>

            {exercise.code && (
              <Card className="bg-gray-900 border border-gray-700">
                <CardContent className="p-4">
                  <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                    <code>{exercise.code}</code>
                  </pre>
                </CardContent>
              </Card>
            )}

            {exercise.type === "code-completion" ? (
              <Textarea
                placeholder="Write your code here..."
                value={userAnswer}
                onChange={(e) =>
                  handleAnswerChange(exercise.id, e.target.value)
                }
                className="font-mono text-sm"
                rows={6}
                disabled={hasAnswered}
              />
            ) : (
              <Input
                placeholder="Your answer..."
                value={userAnswer}
                onChange={(e) =>
                  handleAnswerChange(exercise.id, e.target.value)
                }
                className="font-mono"
                disabled={hasAnswered}
              />
            )}

            {hasAnswered && (
              <div
                className={`p-3 rounded-lg ${
                  isCorrect
                    ? "bg-green-100 border border-green-300"
                    : "bg-red-100 border border-red-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={`font-semibold ${
                      isCorrect ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {isCorrect ? "Correct!" : "Incorrect"}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="text-sm text-gray-700">
                    <strong>Correct answer:</strong>{" "}
                    <code className="bg-gray-200 px-1 rounded">
                      {exercise.correctAnswer}
                    </code>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return <div>Exercise type not implemented</div>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (showResults && isComplete) {
    const exercises = lesson?.content?.exercises ?? [];
    const correctAnswers = exercises.filter(
      (ex) => ex?.id && exerciseResults[ex.id],
    ).length;
    const totalExercises = exercises.length;
    const accuracy = correctAnswers / totalExercises;
    const score = accuracy * 100;

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="bg-gradient-to-br from-green-50 to-blue-50 border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="text-6xl mb-4">🎉</div>
            <CardTitle className="text-3xl text-gray-800 mb-2">
              Lesson Complete!
            </CardTitle>
            <p className="text-gray-600">
              Great job completing "{lesson.title}"
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-blue-600">
                  {Math.round(score)}%
                </div>
                <div className="text-sm text-gray-600">Score</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-green-600">
                  {correctAnswers}/{totalExercises}
                </div>
                <div className="text-sm text-gray-600">Correct</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-purple-600">
                  +{lesson.xpReward}
                </div>
                <div className="text-sm text-gray-600">XP Earned</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border">
                <div className="text-3xl font-bold text-orange-600">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-sm text-gray-600">Time</div>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="text-center">
              {accuracy === 1.0 ? (
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 text-lg">
                  🏆 Perfect Score!
                </Badge>
              ) : accuracy >= 0.8 ? (
                <Badge className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-4 py-2 text-lg">
                  ⭐ Excellent Work!
                </Badge>
              ) : accuracy >= 0.6 ? (
                <Badge className="bg-gradient-to-r from-blue-400 to-purple-500 text-white px-4 py-2 text-lg">
                  👍 Good Job!
                </Badge>
              ) : (
                <Badge className="bg-gradient-to-r from-gray-400 to-gray-600 text-white px-4 py-2 text-lg">
                  📚 Keep Practicing!
                </Badge>
              )}
            </div>

            <div className="text-center text-gray-600 text-sm">
              Advancing to next lesson in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Lesson Header */}
      <Card className="bg-gradient-to-r from-white/10 to-white/5 border border-white/20 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white"
                style={{ backgroundColor: unit.color }}
              >
                {unit.icon}
              </div>
              <div>
                <CardTitle className="text-xl text-white mb-1">
                  {lesson.title}
                </CardTitle>
                <p className="text-white/80 text-sm">{lesson.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{formatTime(timeSpent)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span className="text-sm">+{lesson.xpReward} XP</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/80 text-sm">
                Exercise {currentExerciseIndex + 1} of{" "}
                {lesson.content.exercises.length}
              </span>
              <span className="text-white text-sm">
                {Math.round(
                  ((currentExerciseIndex + 1) /
                    lesson.content.exercises.length) *
                    100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentExerciseIndex + 1) / lesson.content.exercises.length) * 100}%`,
                }}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Lesson Content */}
      {lesson.content.explanation && currentExerciseIndex === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Concept Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{lesson.content.explanation}</p>

            {lesson.content.codeExample && (
              <Card className="bg-gray-900 border border-gray-700">
                <CardContent className="p-4">
                  <pre className="text-green-400 font-mono text-sm overflow-x-auto">
                    <code>{lesson.content.codeExample}</code>
                  </pre>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      )}

      {/* Current Exercise */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="w-5 h-5" />
            Exercise {currentExerciseIndex + 1}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentExercise ? (
            renderExercise(currentExercise)
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No exercises available for this lesson.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hints */}
      {lesson.content.hints && lesson.content.hints.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <Lightbulb className="w-5 h-5" />
                Need Help?
              </CardTitle>
              {!showHints && (
                <Button
                  onClick={handleShowHint}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 border-blue-300 hover:bg-blue-100"
                >
                  Show Hint
                </Button>
              )}
            </div>
          </CardHeader>
          {showHints && (
            <CardContent>
              <ul className="space-y-2">
                {lesson.content.hints.map((hint, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-blue-700"
                  >
                    <span className="text-blue-500 font-bold">•</span>
                    <span className="text-sm">{hint}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      )}

      {/* Explanation */}
      {showExplanation && currentExercise && currentExercise.explanation && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Explanation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">{currentExercise.explanation}</p>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          onClick={handlePreviousExercise}
          variant="outline"
          disabled={currentExerciseIndex === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          {currentExercise &&
            exerciseAnswers[currentExercise.id] &&
            !exerciseResults.hasOwnProperty(currentExercise.id) && (
              <Button
                onClick={handleSubmitAnswer}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Submit Answer
              </Button>
            )}

          {currentExercise &&
            exerciseResults.hasOwnProperty(currentExercise.id) &&
            !isLastExercise && (
              <Button
                onClick={handleNextExercise}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 flex items-center gap-2"
              >
                Next Exercise
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}

          {currentExercise &&
            exerciseResults.hasOwnProperty(currentExercise.id) &&
            isLastExercise && (
              <Button
                onClick={handleLessonComplete}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 flex items-center gap-2"
              >
                Complete Lesson
                <Star className="w-4 h-4" />
              </Button>
            )}
        </div>
      </div>
    </div>
  );
};
