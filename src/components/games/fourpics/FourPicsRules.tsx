import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Target,
  Lightbulb,
  Coins,
  Trophy,
  Clock,
  Eye,
  Star,
  Gift,
  Lock,
  TrendingUp,
  AlertCircle,
  Shield,
} from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";

interface FourPicsRulesProps {
  onBack: () => void;
}

export const FourPicsRules: React.FC<FourPicsRulesProps> = ({ onBack }) => {
  return (
    <MobileContainer>
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>

            <div className="text-center">
              <CardTitle className="text-3xl mb-2">4 Pics 1 Word</CardTitle>
              <p className="text-blue-100">Rules & Regulations</p>
            </div>
          </CardHeader>
        </Card>

        {/* How to Play */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              How to Play
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800 min-w-[24px] h-6 flex items-center justify-center">
                  1
                </Badge>
                <p className="text-sm">
                  Look at the four pictures displayed on your screen
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800 min-w-[24px] h-6 flex items-center justify-center">
                  2
                </Badge>
                <p className="text-sm">
                  Find the common word that connects all four images
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800 min-w-[24px] h-6 flex items-center justify-center">
                  3
                </Badge>
                <p className="text-sm">Type your answer in the input field</p>
              </div>
              <div className="flex items-start gap-3">
                <Badge className="bg-blue-100 text-blue-800 min-w-[24px] h-6 flex items-center justify-center">
                  4
                </Badge>
                <p className="text-sm">
                  Submit your answer to complete the level
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hint System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Hint System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Need help? Use coins to purchase hints that will help you solve
              the puzzle!
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <div>
                    <div className="font-medium text-sm">Reveal Letter</div>
                    <div className="text-xs text-gray-500">
                      Shows a random letter from the word
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">5-10</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-sm">Highlight Images</div>
                    <div className="text-xs text-gray-500">
                      Highlights related images
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">10-15</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Star className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium text-sm">Word Length</div>
                    <div className="text-xs text-gray-500">
                      Shows the number of letters
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-600">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-medium">15-25</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coin System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-yellow-600" />
              Coin System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Gift className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium text-sm">Earning Coins</div>
                  <div className="text-xs text-gray-500">
                    Complete levels to earn coins. Bonus coins for perfect
                    performance!
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                <div>
                  <div className="font-medium text-sm">Spending Coins</div>
                  <div className="text-xs text-gray-500">
                    Use coins to purchase hints when you're stuck
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-sm">Purchasing Coins</div>
                  <div className="text-xs text-gray-500">
                    Buy more coins using your wallet money
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <h4 className="font-medium text-green-800 text-sm mb-2">
                Bonus Rewards:
              </h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• +5 coins for completing without hints</li>
                <li>• +3 coins for completing under 30 seconds</li>
                <li>• +2 coins for solving in one attempt</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Level System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-600" />
              Level System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge className="bg-green-100 text-green-800">Easy</Badge>
                <div>
                  <div className="font-medium text-sm">Levels 1-30</div>
                  <div className="text-xs text-gray-500">
                    Simple words, clear images
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                <div>
                  <div className="font-medium text-sm">Levels 31-60</div>
                  <div className="text-xs text-gray-500">
                    Moderate challenge, some abstract concepts
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className="bg-red-100 text-red-800">Hard</Badge>
                <div>
                  <div className="font-medium text-sm">Levels 61-99</div>
                  <div className="text-xs text-gray-500">
                    Complex words, challenging imagery
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-sm">
                <Lock className="h-4 w-4 inline mr-1" />
                Levels unlock progressively. Complete previous levels to access
                new ones!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Scoring System */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Scoring System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="font-medium text-sm">Time Bonus</div>
                <div className="text-xs text-gray-500">
                  Faster completion = more coins
                </div>
              </div>

              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="font-medium text-sm">Accuracy Bonus</div>
                <div className="text-xs text-gray-500">
                  Fewer attempts = more coins
                </div>
              </div>

              <div className="text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="font-medium text-sm">Perfect Score</div>
                <div className="text-xs text-gray-500">
                  No hints used = maximum reward
                </div>
              </div>

              <div className="text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="font-medium text-sm">Streak Bonus</div>
                <div className="text-xs text-gray-500">
                  Consecutive perfect levels
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rules & Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Rules & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">Fair Play</div>
                  <div className="text-xs text-gray-500">
                    Play fairly and don't use external tools or assistance
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">One Account</div>
                  <div className="text-xs text-gray-500">
                    Use only one account per person
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">Appropriate Content</div>
                  <div className="text-xs text-gray-500">
                    All content is family-friendly and appropriate for all ages
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-sm">Progress Saving</div>
                  <div className="text-xs text-gray-500">
                    Your progress is automatically saved and synced across
                    devices
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips & Strategies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Tips & Strategies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 text-sm mb-3">
                Pro Tips:
              </h4>
              <ul className="text-xs text-yellow-700 space-y-2">
                <li>
                  • Look for common themes or concepts between all four images
                </li>
                <li>
                  • Think about different meanings of words (literal vs.
                  metaphorical)
                </li>
                <li>
                  • Consider categories like animals, objects, actions, or
                  emotions
                </li>
                <li>• Use the letter hint first if you're completely stuck</li>
                <li>
                  • Save coins by trying to solve without hints when possible
                </li>
                <li>• Take your time - there's no time pressure!</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Support & Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Having trouble or found a bug? We're here to help!
              </p>
              <div className="space-y-2">
                <p className="text-xs text-gray-500">
                  📧 Email: support@gameplatform.com
                </p>
                <p className="text-xs text-gray-500">
                  💬 In-game help available in settings
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="pt-4">
          <Button
            onClick={onBack}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Game
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
};
