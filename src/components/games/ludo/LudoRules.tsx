import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dice1,
  Users,
  Trophy,
  Target,
  Crown,
  Star,
  CheckCircle,
  AlertCircle,
  Home,
  Flag,
} from "lucide-react";

interface LudoRulesProps {
  onBack?: () => void;
}

export const LudoRules = ({ onBack }: LudoRulesProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 pb-20 px-2 sm:px-4">
      {/* Header */}
      <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-2 border-blue-400 shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Ludo Rules Guide
          </CardTitle>
          <p className="text-lg text-blue-200 max-w-2xl mx-auto">
            Master the classic board game with this comprehensive guide to Ludo
            rules, strategies, and online play
          </p>
        </CardHeader>
      </Card>

      {/* Quick Navigation */}
      <Card className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 border-2 border-blue-400/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-blue-300 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {[
              { id: "basics", label: "Game Basics", icon: Dice1 },
              { id: "setup", label: "Game Setup", icon: Users },
              { id: "gameplay", label: "How to Play", icon: Target },
              { id: "winning", label: "Winning", icon: Trophy },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center gap-2 p-2 rounded bg-blue-800/30 hover:bg-blue-800/50 text-blue-200 hover:text-white transition-colors"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Game Basics */}
      <Card
        id="basics"
        className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 border-2 border-blue-400/50 shadow-lg"
      >
        <CardHeader>
          <CardTitle className="text-blue-300 flex items-center gap-2">
            <Dice1 className="h-6 w-6" />
            🎲 Game Basics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-blue-100">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-blue-300 font-bold">What is Ludo?</h4>
              <p className="text-sm">
                Ludo is a classic board game for 2-4 players where the objective
                is to move all four of your pieces from start to finish before
                your opponents.
              </p>

              <h4 className="text-blue-300 font-bold">Equipment</h4>
              <ul className="text-sm space-y-1">
                <li>• Cross-shaped board with colored paths</li>
                <li>• 4 pieces per player (red, blue, green, yellow)</li>
                <li>• One six-sided die</li>
                <li>• Home areas for each player</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-blue-300 font-bold">Game Duration</h4>
              <p className="text-sm">
                A typical Ludo game lasts 15-30 minutes, depending on the number
                of players and luck with dice rolls.
              </p>

              <h4 className="text-blue-300 font-bold">Age Range</h4>
              <p className="text-sm">
                Suitable for players aged 6 and above. Easy to learn but
                challenging to master!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Game Setup */}
      <Card
        id="setup"
        className="bg-gradient-to-br from-green-900/40 to-blue-900/40 border-2 border-green-400/50 shadow-lg"
      >
        <CardHeader>
          <CardTitle className="text-green-300 flex items-center gap-2">
            <Users className="h-6 w-6" />
            👥 Game Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-green-100">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-green-300 font-bold">Starting Position</h4>
              <ul className="text-sm space-y-1">
                <li>
                  • Each player chooses a color (red, blue, green, yellow)
                </li>
                <li>• All 4 pieces start in the home area</li>
                <li>• Red player goes first, then clockwise</li>
                <li>• Each player gets one die roll per turn</li>
              </ul>

              <h4 className="text-green-300 font-bold">Board Layout</h4>
              <ul className="text-sm space-y-1">
                <li>• 4 colored corners (home areas)</li>
                <li>• Cross-shaped path around the board</li>
                <li>• Safe squares marked with stars</li>
                <li>• Central finishing area</li>
              </ul>
            </div>

            <div className="bg-green-900/20 p-3 rounded border border-green-400/30">
              <h4 className="text-green-300 font-bold mb-2">
                Player Colors & Starting
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span>Red - Bottom left (starts first)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span>Blue - Top left</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span>Green - Top right</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span>Yellow - Bottom right</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How to Play */}
      <Card
        id="gameplay"
        className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-400/50 shadow-lg"
      >
        <CardHeader>
          <CardTitle className="text-purple-300 flex items-center gap-2">
            <Target className="h-6 w-6" />
            🎯 How to Play
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-purple-100">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-purple-300 font-bold">Basic Turn</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Roll the die</li>
                  <li>Move a piece the number shown</li>
                  <li>Turn passes to next player</li>
                  <li>Special rules for 6s (see below)</li>
                </ol>

                <h4 className="text-purple-300 font-bold">Moving Pieces</h4>
                <ul className="text-sm space-y-1">
                  <li>• Must roll 6 to move out of home</li>
                  <li>• Move clockwise around the board</li>
                  <li>• Can't move backwards</li>
                  <li>• Multiple pieces can be in play</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-purple-300 font-bold">Rolling a 6</h4>
                <ul className="text-sm space-y-1">
                  <li>• Get another turn (bonus roll)</li>
                  <li>• Can move a piece out of home</li>
                  <li>• Can move any piece already in play</li>
                  <li>• Maximum 3 consecutive 6s</li>
                </ul>

                <h4 className="text-purple-300 font-bold">Capturing</h4>
                <ul className="text-sm space-y-1">
                  <li>• Land on opponent's piece to capture</li>
                  <li>• Captured piece returns to home</li>
                  <li>• Get bonus turn after capturing</li>
                  <li>• Safe squares protect from capture</li>
                </ul>
              </div>
            </div>

            <div className="bg-purple-900/20 p-4 rounded border border-purple-400/30">
              <h4 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Safe Squares
              </h4>
              <p className="text-sm">
                Pieces on safe squares (marked with stars) cannot be captured.
                These include: starting squares, certain path squares, and the
                colored path leading to home.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Winning */}
      <Card
        id="winning"
        className="bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-2 border-yellow-400/50 shadow-lg"
      >
        <CardHeader>
          <CardTitle className="text-yellow-300 flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            🏆 Winning the Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-yellow-100">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-yellow-300 font-bold">How to Win</h4>
              <ul className="text-sm space-y-1">
                <li>• Move all 4 pieces to the center</li>
                <li>• Must reach center by exact count</li>
                <li>• First player to do this wins</li>
                <li>• Game ends immediately upon winning</li>
              </ul>

              <h4 className="text-yellow-300 font-bold">Reaching Home</h4>
              <ul className="text-sm space-y-1">
                <li>• Enter your colored path</li>
                <li>• Move up the home column</li>
                <li>• Need exact roll to enter center</li>
                <li>• Can't overshoot the center</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-yellow-300 font-bold">Strategy Tips</h4>
              <ul className="text-sm space-y-1">
                <li>• Get multiple pieces out early</li>
                <li>• Use 6s wisely</li>
                <li>• Block opponents when possible</li>
                <li>• Protect pieces near home</li>
                <li>• Time your moves for captures</li>
              </ul>

              <div className="bg-yellow-900/20 p-3 rounded border border-yellow-400/30">
                <h4 className="text-yellow-300 font-bold mb-2">
                  Exact Roll Rule
                </h4>
                <p className="text-sm">
                  To enter the center, you must roll the exact number needed. If
                  you roll too high, you cannot move that piece and must choose
                  another.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Online Specific Rules */}
      <Card className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-2 border-cyan-400/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-cyan-300 flex items-center gap-2">
            <Crown className="h-6 w-6" />
            💰 Online Ludo Specific Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-cyan-100">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-cyan-300 font-bold">Game Modes</h4>
              <ul className="text-sm space-y-1">
                <li>• 2-4 player games</li>
                <li>• Entry fee determines prize pool</li>
                <li>• Winner takes 90% of total fees</li>
                <li>• Automatic matchmaking</li>
              </ul>

              <h4 className="text-cyan-300 font-bold">Disconnection Rules</h4>
              <ul className="text-sm space-y-1">
                <li>• 10-second reconnection timer</li>
                <li>• Auto-forfeit if not reconnected</li>
                <li>• Game continues with remaining players</li>
                <li>• Fair play guaranteed</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-cyan-300 font-bold">Turn Timer</h4>
              <ul className="text-sm space-y-1">
                <li>• 30 seconds per turn</li>
                <li>• Auto-pass if time expires</li>
                <li>• No pausing during active games</li>
                <li>• Real-time gameplay</li>
              </ul>

              <div className="bg-cyan-900/20 p-3 rounded border border-cyan-400/30">
                <h4 className="text-cyan-300 font-bold mb-2 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Fair Play
                </h4>
                <p className="text-sm">
                  Our platform ensures fair play with anti-cheat measures,
                  verified random dice rolls, and secure payment processing for
                  all prize distributions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Reference */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-600 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-300 flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            📋 Quick Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="text-gray-300 font-bold">Key Numbers</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• 2-4 players</li>
                <li>• 4 pieces per player</li>
                <li>• 52 squares on board</li>
                <li>• 6 to exit home</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-gray-300 font-bold">Special Moves</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Roll 6: Extra turn</li>
                <li>• Capture: Extra turn</li>
                <li>• 3 sixes: Skip turn</li>
                <li>• Exact to center</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="text-gray-300 font-bold">Safe Zones</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Starting squares</li>
                <li>• Star-marked squares</li>
                <li>• Home approach path</li>
                <li>• Center area</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-400/50 shadow-lg">
        <CardHeader>
          <CardTitle className="text-indigo-300 flex items-center gap-2">
            <Star className="h-6 w-6" />
            💡 Pro Tips & Strategy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-indigo-100">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="text-indigo-300 font-bold">Opening Strategy</h4>
              <ul className="text-sm space-y-1">
                <li>• Focus on getting 2-3 pieces out early</li>
                <li>• Don't rush all pieces at once</li>
                <li>• Keep some pieces safe at home initially</li>
                <li>• Use first 6s to get pieces in play</li>
              </ul>

              <h4 className="text-indigo-300 font-bold">Mid-Game Tactics</h4>
              <ul className="text-sm space-y-1">
                <li>• Form blockades with multiple pieces</li>
                <li>• Target isolated opponent pieces</li>
                <li>• Use safe squares strategically</li>
                <li>• Calculate risks vs rewards</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-indigo-300 font-bold">Endgame Focus</h4>
              <ul className="text-sm space-y-1">
                <li>• Protect pieces near home stretch</li>
                <li>• Plan exact rolls needed for center</li>
                <li>• Don't leave pieces vulnerable</li>
                <li>• Finish strong with calculated moves</li>
              </ul>

              <div className="bg-indigo-900/20 p-3 rounded border border-indigo-400/30">
                <h4 className="text-indigo-300 font-bold mb-2">Remember</h4>
                <p className="text-sm">
                  Ludo combines luck and strategy. While dice rolls are random,
                  smart positioning and timing can significantly improve your
                  chances of winning!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
