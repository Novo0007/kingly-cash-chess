import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  Heart,
  Smile,
  ThumbsUp,
  Gift,
  Trophy,
  Sparkles,
  Rocket,
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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="text-gray-600 mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Oops! 🤔
              </h3>
              <p className="text-lg text-gray-600">
                This lesson is still being prepared for you!
              </p>
            </div>
            <Button
              onClick={onBackToUnits}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Lessons
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
  const [hearts, setHearts] = useState(3); // Lives system for kids
  const [streakCount, setStreakCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);

  const currentExercise = lesson?.content?.exercises?.[currentExerciseIndex];
  const isLastExercise =
    currentExerciseIndex === (lesson?.content?.exercises?.length ?? 0) - 1;
  const allExercisesAnswered =
    lesson?.content?.exercises?.every(
      (ex) => ex?.id && exerciseAnswers[ex.id],
    ) ?? false;

  const progressPercentage =
    ((currentExerciseIndex + 1) / (lesson?.content?.exercises?.length ?? 1)) *
    100;

  // Update time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  // Handle answer submission with kid-friendly feedback
  const handleAnswerSubmit = () => {
    if (!currentExercise?.id || !exerciseAnswers[currentExercise.id]) {
      toast.error("Please write your answer first! 📝");
      return;
    }

    const userAnswer = exerciseAnswers[currentExercise.id].trim().toLowerCase();
    const correctAnswers = currentExercise.expectedOutput || [];
    const isCorrect = correctAnswers.some(
      (answer) =>
        answer.toLowerCase().trim() === userAnswer ||
        userAnswer.includes(answer.toLowerCase().trim()),
    );

    setExerciseResults({
      ...exerciseResults,
      [currentExercise.id]: isCorrect,
    });

    if (isCorrect) {
      setStreakCount((prev) => prev + 1);
      setShowCelebration(true);

      // Fun success messages for kids
      const successMessages = [
        "🎉 Amazing work! You're a coding superstar!",
        "🚀 Fantastic! You nailed it!",
        "⭐ Brilliant! You're getting so good at this!",
        "🎯 Perfect! You're on fire!",
        "👏 Excellent! You're a natural coder!",
      ];

      toast.success(
        successMessages[Math.floor(Math.random() * successMessages.length)],
      );

      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      setHearts((prev) => Math.max(0, prev - 1));

      const encouragementMessages = [
        "💪 Don't worry! Try again - you've got this!",
        "🤗 Almost there! Give it another shot!",
        "💡 Close one! Let's try a different approach!",
        "🌟 Learning is fun! Try once more!",
      ];

      toast.error(
        encouragementMessages[
          Math.floor(Math.random() * encouragementMessages.length)
        ],
      );
    }

    setShowExplanation(true);
  };

  const handleNextExercise = () => {
    if (isLastExercise) {
      handleLessonComplete();
    } else {
      setCurrentExerciseIndex((prev) => prev + 1);
      setShowExplanation(false);
      setShowHints(false);
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex((prev) => prev - 1);
      setShowExplanation(false);
      setShowHints(false);
    }
  };

  const handleLessonComplete = () => {
    const correctAnswers =
      Object.values(exerciseResults).filter(Boolean).length;
    const totalExercises = lesson.content.exercises.length;
    const accuracy = correctAnswers / totalExercises;
    const score = Math.round(accuracy * 100 * (1 + streakCount * 0.1)); // Bonus for streak

    setIsComplete(true);
    setShowResults(true);

    // Super celebratory completion message
    if (accuracy >= 0.8) {
      toast.success("🎊 WOW! You completed the lesson! You're amazing! 🌟");
    } else {
      toast.success("🎉 Great job completing the lesson! Keep practicing! 💪");
    }

    onLessonComplete(lesson, score, accuracy, timeSpent);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (showResults) {
    const correctAnswers =
      Object.values(exerciseResults).filter(Boolean).length;
    const totalExercises = lesson.content.exercises.length;
    const accuracy = correctAnswers / totalExercises;
    const score = Math.round(accuracy * 100 * (1 + streakCount * 0.1));

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-purple-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-bounce">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">
                🎉 Lesson Complete! 🎉
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                You're doing amazing! Keep up the great work!
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-blue-700">{score}</div>
                <div className="text-blue-600 font-semibold">Points Earned</div>
              </div>

              <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-green-700">
                  {Math.round(accuracy * 100)}%
                </div>
                <div className="text-green-600 font-semibold">Accuracy</div>
              </div>

              <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-purple-700">
                  {formatTime(timeSpent)}
                </div>
                <div className="text-purple-600 font-semibold">Time Taken</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl p-6">
                <div className="text-3xl font-bold text-yellow-700">
                  {streakCount}
                </div>
                <div className="text-yellow-600 font-semibold">
                  Streak Bonus
                </div>
              </div>
            </div>

            {accuracy >= 0.9 && (
              <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 mb-6 border-2 border-pink-300">
                <div className="flex items-center justify-center gap-2 text-pink-700">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-lg font-bold">
                    Perfect Score! You're a coding genius! 🌟
                  </span>
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={onBackToUnits}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Continue Learning!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      {/* Celebration Animation */}
      {showCelebration && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-ping">🎉</div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header with Progress */}
        <Card className="mb-6 border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button
                onClick={onBackToUnits}
                variant="outline"
                className="bg-white/80 hover:bg-white border-2 border-gray-200 rounded-xl"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <div className="flex items-center gap-4">
                {/* Hearts/Lives */}
                <div className="flex items-center gap-1">
                  {[...Array(3)].map((_, i) => (
                    <Heart
                      key={i}
                      className={`w-6 h-6 ${
                        i < hearts
                          ? "text-red-500 fill-red-500"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Timer */}
                <div className="flex items-center gap-2 bg-blue-100 px-3 py-1 rounded-full">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-700 font-semibold">
                    {formatTime(timeSpent)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-800">
                  {lesson.title}
                </h1>
                <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                  {currentExerciseIndex + 1} of{" "}
                  {lesson.content.exercises.length}
                </Badge>
              </div>

              <Progress
                value={progressPercentage}
                className="h-3 bg-gray-200"
              />
              <p className="text-sm text-gray-600 mt-1">
                {Math.round(progressPercentage)}% complete
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Main Exercise Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exercise Question */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Code className="w-4 h-4 text-white" />
                </div>
                Exercise {currentExerciseIndex + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4">
                <p className="text-lg text-gray-800 leading-relaxed">
                  {currentExercise?.question}
                </p>
              </div>

              {currentExercise?.codeSnippet && (
                <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm overflow-x-auto">
                  <pre className="text-green-400 whitespace-pre-wrap">
                    {currentExercise.codeSnippet}
                  </pre>
                </div>
              )}

              {/* Hints Button */}
              <Button
                onClick={() => setShowHints(!showHints)}
                variant="outline"
                className="w-full bg-yellow-100 hover:bg-yellow-200 border-yellow-300 text-yellow-800"
              >
                <Lightbulb className="w-4 h-4 mr-2" />
                {showHints ? "Hide Hints" : "Need a Hint?"} 💡
              </Button>

              {showHints && currentExercise?.hints && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">
                    Helpful Hints:
                  </h4>
                  <ul className="space-y-1">
                    {currentExercise.hints.map((hint, index) => (
                      <li key={index} className="text-yellow-700 text-sm">
                        💡 {hint}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Answer Section */}
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                Your Answer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentExercise?.type === "code" ? (
                <Textarea
                  placeholder="Write your code here... 🚀"
                  value={exerciseAnswers[currentExercise?.id || ""] || ""}
                  onChange={(e) =>
                    setExerciseAnswers({
                      ...exerciseAnswers,
                      [currentExercise?.id || ""]: e.target.value,
                    })
                  }
                  className="font-mono text-sm min-h-[200px] bg-gray-50 border-2 border-gray-200 rounded-xl"
                  disabled={showExplanation}
                />
              ) : (
                <Input
                  placeholder="Type your answer here... ✨"
                  value={exerciseAnswers[currentExercise?.id || ""] || ""}
                  onChange={(e) =>
                    setExerciseAnswers({
                      ...exerciseAnswers,
                      [currentExercise?.id || ""]: e.target.value,
                    })
                  }
                  className="text-lg p-4 bg-gray-50 border-2 border-gray-200 rounded-xl"
                  disabled={showExplanation}
                />
              )}

              {!showExplanation ? (
                <Button
                  onClick={handleAnswerSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={!exerciseAnswers[currentExercise?.id || ""]}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Check My Answer! 🎯
                </Button>
              ) : (
                <div className="space-y-4">
                  {/* Result Display */}
                  <div
                    className={`p-4 rounded-xl ${
                      exerciseResults[currentExercise?.id || ""]
                        ? "bg-green-100 border-2 border-green-300"
                        : "bg-red-100 border-2 border-red-300"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {exerciseResults[currentExercise?.id || ""] ? (
                        <>
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          <span className="text-lg font-bold text-green-700">
                            Awesome! That's correct! 🎉
                          </span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-6 h-6 text-red-600" />
                          <span className="text-lg font-bold text-red-700">
                            Not quite right, but great try! 💪
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Explanation */}
                  {currentExercise?.explanation && (
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">
                        📚 Learn More:
                      </h4>
                      <p className="text-blue-700">
                        {currentExercise.explanation}
                      </p>
                    </div>
                  )}

                  {/* Navigation */}
                  <div className="flex gap-3">
                    {currentExerciseIndex > 0 && (
                      <Button
                        onClick={handlePreviousExercise}
                        variant="outline"
                        className="flex-1 bg-gray-100 hover:bg-gray-200 border-2 border-gray-300 rounded-xl"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>
                    )}

                    <Button
                      onClick={handleNextExercise}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold"
                    >
                      {isLastExercise ? (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Complete Lesson! 🏆
                        </>
                      ) : (
                        <>
                          Next
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Streak Display */}
        {streakCount > 0 && (
          <Card className="mt-6 border-0 shadow-xl bg-gradient-to-r from-orange-100 to-yellow-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-2 text-orange-700">
                <Zap className="w-6 h-6" />
                <span className="text-lg font-bold">
                  {streakCount} correct in a row! You're on fire! 🔥
                </span>
                <Zap className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
