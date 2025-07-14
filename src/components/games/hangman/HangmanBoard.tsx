import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Star,
  Target,
  Lightbulb,
  Heart,
  Trophy,
  Zap,
} from "lucide-react";
import { HangmanGameState } from "./HangmanGameLogic";
import { useDeviceType } from "@/hooks/use-mobile";

interface HangmanBoardProps {
  gameState: HangmanGameState;
  onGuessLetter: (letter: string) => void;
  onUseHint?: () => void;
  onNewGame: () => void;
  canUseHint?: boolean;
}

export const HangmanBoard: React.FC<HangmanBoardProps> = ({
  gameState,
  onGuessLetter,
  onUseHint,
  onNewGame,
  canUseHint = true,
}) => {
  const { isMobile } = useDeviceType();

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const getHangmanDrawing = (wrongGuesses: number) => {
    const stages = [
      "😊", // 0 - Happy
      "😐", // 1 - Neutral
      "😟", // 2 - Worried
      "😰", // 3 - Anxious
      "😨", // 4 - Fearful
      "😱", // 5 - Shocked
      "😵", // 6 - Dizzy
      "💀", // 7 - Game Over
    ];
    return stages[Math.min(wrongGuesses, stages.length - 1)];
  };

  const getLivesColor = (lives: number, maxLives: number) => {
    const percentage = (lives / maxLives) * 100;
    if (percentage > 60) return "text-green-500";
    if (percentage > 30) return "text-yellow-500";
    return "text-red-500";
  };

  const getProgressColor = (timeLeft: number) => {
    if (timeLeft > 120) return "bg-green-500";
    if (timeLeft > 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const remainingLives = gameState.maxWrongGuesses - gameState.wrongGuesses;
  const timeProgress = (gameState.timeLeft / 180) * 100;

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-4">
      {/* Game Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-800">Score</span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {gameState.score}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-800">
                Level
              </span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              {gameState.level}
            </div>
          </CardContent>
        </Card>

        <Card
          className={`bg-gradient-to-br ${remainingLives > 3 ? "from-green-50 to-green-100 border-green-200" : remainingLives > 1 ? "from-yellow-50 to-yellow-100 border-yellow-200" : "from-red-50 to-red-100 border-red-200"}`}
        >
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart
                className={`h-4 w-4 ${getLivesColor(remainingLives, gameState.maxWrongGuesses)}`}
              />
              <span
                className={`text-sm font-semibold ${getLivesColor(remainingLives, gameState.maxWrongGuesses)}`}
              >
                Lives
              </span>
            </div>
            <div
              className={`text-lg font-bold ${getLivesColor(remainingLives, gameState.maxWrongGuesses)}`}
            >
              {remainingLives}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-3 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-semibold text-orange-800">
                Time
              </span>
            </div>
            <div className="text-lg font-bold text-orange-900">
              {Math.floor(gameState.timeLeft / 60)}:
              {(gameState.timeLeft % 60).toString().padStart(2, "0")}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Progress Bar */}
      <Card className="bg-white/50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-gray-600" />
            <div className="flex-1">
              <Progress value={timeProgress} className="h-3" />
            </div>
            <span className="text-sm font-semibold text-gray-700">
              {gameState.timeLeft}s
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Main Game Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hangman Drawing & Word */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-center">
              <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 px-4 py-1">
                {gameState.category.charAt(0).toUpperCase() +
                  gameState.category.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Hangman Visual */}
            <div className="text-center">
              <div className="text-8xl md:text-9xl mb-4 animate-pulse">
                {getHangmanDrawing(gameState.wrongGuesses)}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {gameState.wrongGuesses === 0 && "Perfect! Keep going! 😊"}
                {gameState.wrongGuesses > 0 &&
                  gameState.wrongGuesses < 3 &&
                  "Still looking good! 😐"}
                {gameState.wrongGuesses >= 3 &&
                  gameState.wrongGuesses < 5 &&
                  "Be careful now! 😟"}
                {gameState.wrongGuesses >= 5 &&
                  gameState.wrongGuesses < 7 &&
                  "Critical situation! 😰"}
                {gameState.wrongGuesses >= 7 && "Game Over! 💀"}
              </div>
            </div>

            {/* Word Display */}
            <div className="text-center space-y-4">
              <div
                className={`font-mono text-3xl md:text-4xl font-bold tracking-wider ${isMobile ? "text-2xl" : ""}`}
              >
                {gameState.guessedWord.map((letter, index) => (
                  <span
                    key={index}
                    className={`inline-block mx-1 pb-2 border-b-4 ${
                      letter === "_"
                        ? "border-gray-400 text-gray-400"
                        : "border-green-500 text-green-600 animate-bounce"
                    } min-w-[2rem] text-center`}
                  >
                    {letter}
                  </span>
                ))}
              </div>

              {/* Hint Section */}
              {gameState.hint && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-800">
                      Hint
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 font-medium text-center">
                    {gameState.hint}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alphabet & Controls */}
        <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-lg font-bold text-gray-800">
              Choose a Letter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alphabet Grid */}
            <div
              className={`grid ${isMobile ? "grid-cols-6" : "grid-cols-7"} gap-2`}
            >
              {alphabet.map((letter) => {
                const isGuessed = gameState.guessedLetters.includes(letter);
                const isCorrect = isGuessed && gameState.word.includes(letter);
                const isWrong = isGuessed && !gameState.word.includes(letter);

                return (
                  <Button
                    key={letter}
                    onClick={() => onGuessLetter(letter)}
                    disabled={isGuessed || gameState.isGameOver}
                    className={`
                      ${isMobile ? "h-10 text-sm" : "h-12 text-base"} 
                      font-bold transition-all duration-300 hover:scale-105
                      ${
                        isCorrect
                          ? "bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-lg"
                          : isWrong
                            ? "bg-red-500 hover:bg-red-600 text-white border-red-600 opacity-50"
                            : isGuessed
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-600 shadow-md"
                      }
                    `}
                  >
                    {letter}
                  </Button>
                );
              })}
            </div>

            {/* Guessed Letters Display */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-gray-700">
                Your Guesses:
              </h4>
              <div className="flex flex-wrap gap-1">
                {gameState.guessedLetters.map((letter) => (
                  <Badge
                    key={letter}
                    className={`${
                      gameState.word.includes(letter)
                        ? "bg-green-100 text-green-800 border-green-300"
                        : "bg-red-100 text-red-800 border-red-300"
                    } text-xs font-semibold`}
                  >
                    {letter}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t">
              {!gameState.isGameOver && canUseHint && onUseHint && (
                <Button
                  onClick={onUseHint}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-2"
                >
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Get Hint (-5 points)
                </Button>
              )}

              {gameState.isGameOver && (
                <Button
                  onClick={onNewGame}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {gameState.isWon ? "Next Level" : "Try Again"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Game Over Overlay */}
      {gameState.isGameOver && (
        <Card
          className={`border-4 ${gameState.isWon ? "border-green-400 bg-green-50" : "border-red-400 bg-red-50"} shadow-xl`}
        >
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-6xl mb-4">
                {gameState.isWon ? "🎉" : "😢"}
              </div>
              <h2
                className={`text-2xl font-bold ${gameState.isWon ? "text-green-800" : "text-red-800"}`}
              >
                {gameState.isWon ? "Congratulations!" : "Game Over!"}
              </h2>
              <p
                className={`text-lg ${gameState.isWon ? "text-green-700" : "text-red-700"}`}
              >
                {gameState.isWon
                  ? `You solved "${gameState.word}" and earned ${gameState.score} points!`
                  : `The word was "${gameState.word}". Better luck next time!`}
              </p>
              <div className="flex justify-center gap-4 mt-6">
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                  <Trophy className="h-4 w-4 mr-2" />
                  Score: {gameState.score}
                </Badge>
                <Badge className="bg-purple-100 text-purple-800 px-4 py-2">
                  <Target className="h-4 w-4 mr-2" />
                  Level: {gameState.level}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
