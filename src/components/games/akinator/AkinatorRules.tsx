import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Users,
  Trophy,
  Clock,
  Star,
  Target,
  HelpCircle,
  Lightbulb,
  Zap,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

export const AkinatorRules: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardHeader>
          <div className="text-center">
            <div className="text-6xl mb-4">🔮</div>
            <CardTitle className="text-3xl mb-2">Akinator Rules</CardTitle>
            <p className="text-purple-100">
              Learn how to play the mind-reading guessing game
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Game Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Game Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">
            Akinator is an AI-powered guessing game where I try to read your
            mind and guess any character you're thinking of! Think of any famous
            person, fictional character, historical figure, or celebrity, and
            I'll ask you yes/no questions to narrow down the possibilities.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">Objective</span>
              </div>
              <p className="text-sm text-gray-600">
                Challenge my AI to see if I can guess your character in 20
                questions or less!
              </p>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Characters</span>
              </div>
              <p className="text-sm text-gray-600">
                Movies, books, games, history, cartoons, anime, and more!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            How to Play
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Think of a Character
                </h4>
                <p className="text-sm text-gray-600">
                  Choose any character from movies, books, games, history,
                  cartoons, or real life. The more famous they are, the better
                  chance I have to guess!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Answer Questions
                </h4>
                <p className="text-sm text-gray-600">
                  I'll ask you yes/no questions about your character. Answer
                  honestly by clicking "YES"{" "}
                  <ThumbsUp className="inline h-4 w-4" /> or "NO"{" "}
                  <ThumbsDown className="inline h-4 w-4" />.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Wait for My Guess
                </h4>
                <p className="text-sm text-gray-600">
                  After enough questions, I'll make my guess about who your
                  character is. I'll show you their name and description.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full font-bold text-sm">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-800">
                  Confirm the Result
                </h4>
                <p className="text-sm text-gray-600">
                  Tell me if I guessed correctly or if you stumped me! Either
                  way, you can play again with a new character.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scoring System */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            Scoring System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  1000
                </div>
                <div className="text-sm font-semibold">Starting Score</div>
                <div className="text-xs text-gray-600">
                  You begin with 1000 points
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  -50
                </div>
                <div className="text-sm font-semibold">Per Question</div>
                <div className="text-xs text-gray-600">
                  Points deducted for each question
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  100+
                </div>
                <div className="text-sm font-semibold">Final Score</div>
                <div className="text-xs text-gray-600">
                  Minimum score guaranteed
                </div>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-5 w-5 text-purple-600" />
                <span className="font-semibold">Perfect Game Bonus</span>
              </div>
              <p className="text-sm text-gray-600">
                If I guess your character in 10 questions or less, you get a
                Perfect Game achievement!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6 text-green-600" />
            Character Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Badge variant="secondary" className="p-3 justify-center">
              🎬 Movies & TV
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              📚 Books & Literature
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              🎮 Video Games
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              📺 Cartoons & Anime
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              🏛️ Historical Figures
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              🦸 Superheroes
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              👑 Disney Characters
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              🎭 Celebrities
            </Badge>
            <Badge variant="secondary" className="p-3 justify-center">
              📖 Mythology
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tips & Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            Tips & Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">
                For Better Results:
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Choose well-known characters from popular media
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Answer questions honestly and think carefully
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  Consider all aspects of your character before answering
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-red-600">To Challenge Me:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-red-500">★</span>
                  Think of very obscure or lesser-known characters
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">★</span>
                  Choose characters from very specific niches
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500">★</span>
                  Pick characters with unique or unusual traits
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-purple-600" />
            Game Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold">Smart AI Questions</div>
                  <div className="text-sm text-gray-600">
                    Intelligent question selection for efficient guessing
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Clock className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold">Real-time Timer</div>
                  <div className="text-sm text-gray-600">
                    Track how long each game takes
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-semibold">Statistics Tracking</div>
                  <div className="text-sm text-gray-600">
                    Monitor wins, games played, and perfect games
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-semibold">Character Hints</div>
                  <div className="text-sm text-gray-600">
                    See examples of characters I can guess
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fun Facts */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-center">🔮 Fun Facts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2 text-sm text-gray-600">
            <p>
              🧠 The original Akinator was created in 2007 by French developers
            </p>
            <p>🎯 A good AI can guess most characters in 15-20 questions</p>
            <p>
              🌟 The key is asking questions that eliminate the most
              possibilities
            </p>
            <p>🏆 Can you find a character I don't know? Challenge accepted!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
