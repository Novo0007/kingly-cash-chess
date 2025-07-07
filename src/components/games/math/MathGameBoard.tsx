import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Zap,
  Target,
  Brain,
  CheckCircle,
  XCircle,
  Lightbulb,
  SkipForward,
  Timer,
  TrendingUp,
} from "lucide-react";
import { MathGameState, MathQuestion } from "./MathGameLogic";
import { cn } from "@/lib/utils";

interface MathGameBoardProps {
  gameState: MathGameState;
  onAnswer: (answer: number) => void;
  onUseHint: () => string | null;
  onSkipQuestion: () => boolean;
  onTimeUpdate: (timeRemaining: number) => void;
  className?: string;
}

export const MathGameBoard: React.FC<MathGameBoardProps> = ({
  gameState,
  onAnswer,
  onUseHint,
  onSkipQuestion,
  onTimeUpdate,
  className,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(gameState.timeRemaining);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus !== "playing" || !gameState.currentQuestion) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = Math.max(0, prev - 1);
        onTimeUpdate(newTime);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState.gameStatus, gameState.currentQuestion, onTimeUpdate]);

  // Reset states when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(false);
    setTimeLeft(gameState.timeRemaining);
    setHintMessage(null);
    setIsAnswering(false);
  }, [gameState.currentQuestion?.id, gameState.timeRemaining]);

  // Auto-advance after showing result
  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => {
        setShowResult(false);
        setSelectedAnswer(null);
        setIsAnswering(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showResult]);

  const handleAnswerSelect = (answer: number) => {
    if (showResult || isAnswering || gameState.gameStatus !== "playing") return;

    setSelectedAnswer(answer);
    setIsAnswering(true);

    const correct = onAnswer(answer);
    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleHintClick = () => {
    const hint = onUseHint();
    if (hint) {
      setHintMessage(hint);
      setTimeout(() => setHintMessage(null), 3000);
    }
  };

  const getTimeColor = () => {
    const percentage = timeLeft / (gameState.currentQuestion?.timeLimit || 10);
    if (percentage > 0.6) return "text-green-600";
    if (percentage > 0.3) return "text-yellow-600";
    return "text-red-600";
  };

  const getProgressColor = () => {
    const percentage = timeLeft / (gameState.currentQuestion?.timeLimit || 10);
    if (percentage > 0.6) return "bg-green-500";
    if (percentage > 0.3) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getDifficultyColor = () => {
    switch (gameState.difficulty) {
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getQuestionTypeIcon = (type: MathQuestion["type"]) => {
    switch (type) {
      case "addition":
        return "➕";
      case "subtraction":
        return "➖";
      case "multiplication":
        return "✖️";
      case "division":
        return "➗";
      case "missing":
        return "🔢";
      case "pattern":
        return "🔁";
      default:
        return "🧮";
    }
  };

  if (!gameState.currentQuestion) {
    return (
      <Card className={cn("w-full max-w-2xl mx-auto", className)}>
        <CardContent className="p-8 text-center">
          <Brain className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading next question...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Game Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm font-semibold">Score</span>
            </div>
            <div className="text-xl font-bold">
              {gameState.score.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-semibold">Correct</span>
            </div>
            <div className="text-xl font-bold">{gameState.correctAnswers}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-semibold">Streak</span>
            </div>
            <div className="text-xl font-bold">{gameState.streak}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Question</span>
            </div>
            <div className="text-xl font-bold">
              {gameState.questionIndex}/
              {gameState.gameMode === "endless"
                ? "∞"
                : gameState.totalQuestions}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Question Card */}
      <Card className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 shadow-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">
                {getQuestionTypeIcon(gameState.currentQuestion.type)}
              </div>
              <div>
                <Badge className={getDifficultyColor()}>
                  {gameState.difficulty} Mode
                </Badge>
                <Badge className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                  {gameState.currentQuestion.type}
                </Badge>
              </div>
            </div>

            {/* Timer */}
            <div className="text-center">
              <div className={cn("text-2xl font-bold", getTimeColor())}>
                <Timer className="h-5 w-5 inline mr-1" />
                {timeLeft}s
              </div>
              <Progress
                value={
                  (timeLeft / (gameState.currentQuestion.timeLimit || 10)) * 100
                }
                className="w-24 h-2 mt-1"
              />
            </div>
          </div>

          <CardTitle className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              {gameState.currentQuestion.question}
            </div>
            <p className="text-lg text-gray-600 font-normal">
              Choose the correct answer:
            </p>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Hint Message */}
          {hintMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <Lightbulb className="h-5 w-5 inline mr-2 text-yellow-600" />
              <span className="text-yellow-800 font-medium">{hintMessage}</span>
            </div>
          )}

          {/* Answer Options */}
          <div className="grid grid-cols-2 gap-4">
            {gameState.currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrectOption =
                option === gameState.currentQuestion!.correctAnswer;

              let buttonClass =
                "h-16 md:h-20 text-xl md:text-2xl font-bold transition-all duration-200 transform hover:scale-105";

              if (showResult) {
                if (isCorrectOption) {
                  buttonClass +=
                    " bg-green-500 hover:bg-green-500 text-white border-green-600";
                } else if (isSelected && !isCorrectOption) {
                  buttonClass +=
                    " bg-red-500 hover:bg-red-500 text-white border-red-600";
                } else {
                  buttonClass +=
                    " bg-gray-200 text-gray-500 cursor-not-allowed";
                }
              } else if (isSelected) {
                buttonClass += " bg-blue-500 text-white border-blue-600";
              } else {
                buttonClass +=
                  " bg-white hover:bg-blue-50 text-gray-800 border-gray-300 hover:border-blue-300";
              }

              return (
                <Button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult || isAnswering}
                  className={buttonClass}
                  variant="outline"
                >
                  <div className="flex items-center justify-center gap-3">
                    {showResult && isCorrectOption && (
                      <CheckCircle className="h-6 w-6" />
                    )}
                    {showResult && isSelected && !isCorrectOption && (
                      <XCircle className="h-6 w-6" />
                    )}
                    <span>{option}</span>
                  </div>
                </Button>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 pt-4">
            <Button
              onClick={handleHintClick}
              disabled={gameState.hintsUsed >= gameState.maxHints || showResult}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-4 w-4" />
              Hint ({gameState.maxHints - gameState.hintsUsed} left)
            </Button>

            <Button
              onClick={onSkipQuestion}
              disabled={gameState.skipsUsed >= gameState.maxSkips || showResult}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SkipForward className="h-4 w-4" />
              Skip ({gameState.maxSkips - gameState.skipsUsed} left)
            </Button>
          </div>

          {/* Result Animation */}
          {showResult && (
            <div className="text-center py-4">
              {isCorrect ? (
                <div className="space-y-2 animate-pulse">
                  <div className="text-6xl">🎉</div>
                  <div className="text-xl font-bold text-green-600">
                    Correct!
                  </div>
                  {gameState.streak > 1 && (
                    <div className="text-sm text-purple-600 font-semibold">
                      🔥 {gameState.streak} streak!
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 animate-pulse">
                  <div className="text-6xl">❌</div>
                  <div className="text-xl font-bold text-red-600">
                    Correct answer: {gameState.currentQuestion.correctAnswer}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Bar */}
      {gameState.gameMode !== "endless" && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Progress
              </span>
              <span className="text-sm font-medium text-gray-600">
                {gameState.questionIndex - 1}/{gameState.totalQuestions}{" "}
                completed
              </span>
            </div>
            <Progress
              value={
                ((gameState.questionIndex - 1) / gameState.totalQuestions) * 100
              }
              className="h-3"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
