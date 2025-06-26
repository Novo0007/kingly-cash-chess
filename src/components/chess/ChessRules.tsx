import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Crown,
  Castle,
  Zap,
  Target,
  Clock,
  Users,
  Shield,
  Trophy,
  AlertTriangle,
  CheckCircle,
  Circle,
  ArrowLeft,
  ChevronRight,
  Gamepad2,
  Timer,
  Globe,
  Flag,
  MessageSquare,
  Eye,
  Swords,
} from "lucide-react";

interface ChessRulesProps {
  onBack?: () => void;
}

export const ChessRules = ({ onBack }: ChessRulesProps) => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* Header */}
      <Card className="lavender-glass lavender-shadow-lg border-purple-200/50">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div className="flex-1" />
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
              <Crown className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Chess Rules Guide
            </CardTitle>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Master the royal game with this comprehensive guide to chess rules,
            strategies, and online play
          </p>
        </CardHeader>
      </Card>

      {/* Table of Contents */}
      <Card className="lavender-glass lavender-shadow border-purple-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-600">
            <Circle className="h-5 w-5" />
            Quick Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: "objective", title: "Game Objective", icon: Target },
              { id: "setup", title: "Board Setup", icon: Gamepad2 },
              { id: "pieces", title: "Piece Movement", icon: Swords },
              { id: "special", title: "Special Moves", icon: Zap },
              { id: "endgame", title: "Game End", icon: Flag },
              { id: "online", title: "Online Rules", icon: Globe },
            ].map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="justify-start h-auto p-3 hover:bg-purple-50"
                onClick={() => scrollToSection(item.id)}
              >
                <item.icon className="h-4 w-4 mr-2 text-purple-500" />
                <span className="text-left">{item.title}</span>
                <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Objective */}
          <Card
            id="objective"
            className="lavender-glass lavender-shadow border-purple-200/50"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Target className="h-6 w-6" />
                1. Objective of the Game
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  The goal is to checkmate your opponent's king — placing it
                  under attack with no legal move to escape.
                </p>
                <Badge
                  variant="secondary"
                  className="bg-purple-100 text-purple-700"
                >
                  <Crown className="h-3 w-3 mr-1" />
                  Victory Condition
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Board Setup */}
          <Card
            id="setup"
            className="lavender-glass lavender-shadow border-purple-200/50"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Gamepad2 className="h-6 w-6" />
                2. Board Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700">
                  The game is played on an 8×8 board with alternating light and
                  dark squares.
                </p>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-amber-800 font-medium">
                    ⚠️ The bottom-right square should always be light.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800">
                      Each player starts with:
                    </h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Crown className="h-3 w-3 text-yellow-500" />1 King
                      </li>
                      <li className="flex items-center gap-2">
                        <Crown className="h-3 w-3 text-purple-500" />1 Queen
                      </li>
                      <li className="flex items-center gap-2">
                        <Castle className="h-3 w-3 text-gray-500" />2 Rooks
                      </li>
                      <li className="flex items-center gap-2">
                        <Triangle className="h-3 w-3 text-green-500" />2 Bishops
                      </li>
                      <li className="flex items-center gap-2">
                        <Swords className="h-3 w-3 text-blue-500" />2 Knights
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="h-3 w-3 text-orange-500" />8 Pawns
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="font-semibold text-blue-800 mb-2">
                      Setup Tip
                    </h5>
                    <p className="text-sm text-blue-700">
                      Remember: "Queen on her color" - the white queen starts on
                      a light square, black queen on a dark square.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Piece Movement */}
          <Card
            id="pieces"
            className="lavender-glass lavender-shadow border-purple-200/50"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Swords className="h-6 w-6" />
                3. How Each Piece Moves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    piece: "Pawn",
                    icon: Circle,
                    color: "text-orange-500",
                    movement:
                      "Moves forward 1 square (2 on its first move); captures diagonally.",
                    bg: "bg-orange-50 border-orange-200",
                  },
                  {
                    piece: "Rook",
                    icon: Castle,
                    color: "text-gray-500",
                    movement:
                      "Moves any number of squares horizontally or vertically.",
                    bg: "bg-gray-50 border-gray-200",
                  },
                  {
                    piece: "Bishop",
                    icon: Triangle,
                    color: "text-green-500",
                    movement: "Moves diagonally any number of squares.",
                    bg: "bg-green-50 border-green-200",
                  },
                  {
                    piece: "Knight",
                    icon: Swords,
                    color: "text-blue-500",
                    movement:
                      'Moves in an "L" shape (2 in one direction, 1 perpendicular); jumps over pieces.',
                    bg: "bg-blue-50 border-blue-200",
                  },
                  {
                    piece: "Queen",
                    icon: Crown,
                    color: "text-purple-500",
                    movement: "Combines the powers of rook and bishop.",
                    bg: "bg-purple-50 border-purple-200",
                  },
                  {
                    piece: "King",
                    icon: Crown,
                    color: "text-yellow-500",
                    movement: "Moves 1 square in any direction.",
                    bg: "bg-yellow-50 border-yellow-200",
                  },
                ].map((piece, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${piece.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <piece.icon className={`h-5 w-5 mt-0.5 ${piece.color}`} />
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {piece.piece}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {piece.movement}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Moves */}
          <Card
            id="special"
            className="lavender-glass lavender-shadow border-purple-200/50"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Zap className="h-6 w-6" />
                🔄 Special Moves
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Castling */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Castle className="h-5 w-5 text-blue-500" />
                  4. Castling
                </h4>
                <p className="text-gray-700">
                  A move involving the king and a rook.
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">
                    Conditions:
                  </h5>
                  <ul className="space-y-1 text-sm text-blue-700">
                    <li>• Neither the king nor the rook has moved</li>
                    <li>• No pieces between them</li>
                    <li>
                      • King is not in, moving through, or moving into check
                    </li>
                  </ul>
                </div>
              </div>

              <Separator />

              {/* En Passant */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Circle className="h-5 w-5 text-orange-500" />
                  5. En Passant
                </h4>
                <p className="text-gray-700">
                  A special pawn capture when a pawn moves two squares forward
                  from its starting position and lands beside an opponent's
                  pawn.
                </p>
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-700">
                    The opponent may capture it as if it had moved only one
                    square.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Pawn Promotion */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  6. Pawn Promotion
                </h4>
                <p className="text-gray-700">
                  When a pawn reaches the 8th rank, it must be promoted to a
                  queen, rook, bishop, or knight.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Game End Conditions */}
          <Card
            id="endgame"
            className="lavender-glass lavender-shadow border-purple-200/50"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Flag className="h-6 w-6" />
                🛑 Game End Conditions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Check and Checkmate */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  7. Check and Checkmate
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Check
                    </h5>
                    <p className="text-sm text-red-700">
                      The king is under attack.
                    </p>
                  </div>
                  <div className="p-4 bg-red-100 border border-red-300 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      Checkmate
                    </h5>
                    <p className="text-sm text-red-700">
                      The king is in check and cannot escape — this ends the
                      game.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stalemate */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Circle className="h-5 w-5 text-gray-500" />
                  8. Stalemate
                </h4>
                <p className="text-gray-700">
                  A player has no legal move and is not in check — the game is a
                  draw.
                </p>
              </div>

              <Separator />

              {/* Draw Conditions */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  9. Draw Conditions
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    "Stalemate",
                    "Threefold repetition (same position repeated 3 times)",
                    "50-move rule (50 moves with no pawn move or capture)",
                    "Insufficient material (e.g., only kings left)",
                  ].map((condition, index) => (
                    <div
                      key={index}
                      className="p-3 bg-green-50 border border-green-200 rounded-lg"
                    >
                      <p className="text-sm text-green-700">• {condition}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Online Chess Rules */}
          <Card
            id="online"
            className="lavender-glass lavender-shadow border-purple-200/50"
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Globe className="h-6 w-6" />
                🌐 Online Chess Specific Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Time Controls */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  10. Time Controls
                </h4>
                <p className="text-gray-700">
                  Games often have timers (e.g. 3|0 means 3 minutes per player
                  with no increment).
                </p>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Running out of time results in a loss unless the opponent
                    cannot checkmate (draw).
                  </p>
                </div>
              </div>

              <Separator />

              {/* Fair Play */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  11. Disconnection & Fair Play
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h5 className="font-semibold text-yellow-800 mb-2">
                      Disconnection
                    </h5>
                    <p className="text-sm text-yellow-700">
                      If you disconnect for too long, you forfeit the game.
                    </p>
                  </div>
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h5 className="font-semibold text-red-800 mb-2">
                      Fair Play
                    </h5>
                    <p className="text-sm text-red-700">
                      Cheating (using engines or external help) is strictly
                      prohibited and can lead to bans.
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Premoves */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-500" />
                  12. Premoves
                </h4>
                <p className="text-gray-700">
                  Some platforms allow "premoves" — moves you make during your
                  opponent's turn that execute instantly if legal.
                </p>
              </div>

              <Separator />

              {/* Auto-Flag */}
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                  <Timer className="h-5 w-5 text-red-500" />
                  13. Auto-Flag
                </h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">
                    If your clock hits 0, you lose — even if you have a winning
                    position.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Tips & Quick Reference */}
        <div className="space-y-6">
          {/* Tips for Players */}
          <Card className="lavender-glass lavender-shadow border-purple-200/50 sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600 text-lg">
                <CheckCircle className="h-5 w-5" />✅ Tips for Players
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  {[
                    {
                      icon: Eye,
                      title: "Think Before You Move",
                      tip: 'Always double-check before moving — there\'s no "undo" in online rated games.',
                      color: "text-blue-500",
                    },
                    {
                      icon: Clock,
                      title: "Respect Time Control",
                      tip: "Manage your time wisely. Don't spend too much time on early moves.",
                      color: "text-green-500",
                    },
                    {
                      icon: MessageSquare,
                      title: "Be Sportsmanlike",
                      tip: "Be polite and sportsmanlike in chats or post-game messages.",
                      color: "text-purple-500",
                    },
                    {
                      icon: Shield,
                      title: "Play Fair",
                      tip: "Play on secure and fair platforms (e.g., Chess.com, Lichess.org, FIDE Online Arena).",
                      color: "text-orange-500",
                    },
                    {
                      icon: Target,
                      title: "Focus on Safety",
                      tip: "Always keep your king safe. Castle early in most games.",
                      color: "text-red-500",
                    },
                    {
                      icon: Swords,
                      title: "Control the Center",
                      tip: "Try to control the center squares (e4, e5, d4, d5) with your pawns and pieces.",
                      color: "text-indigo-500",
                    },
                  ].map((tip, index) => (
                    <div
                      key={index}
                      className="p-3 bg-white/50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start gap-3">
                        <tip.icon className={`h-4 w-4 mt-0.5 ${tip.color}`} />
                        <div>
                          <h5 className="font-semibold text-gray-800 text-sm mb-1">
                            {tip.title}
                          </h5>
                          <p className="text-xs text-gray-600">{tip.tip}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Quick Reference */}
          <Card className="lavender-glass lavender-shadow border-purple-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600 text-lg">
                <Trophy className="h-5 w-5" />
                Quick Reference
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
                  <h5 className="font-semibold text-purple-800 text-sm mb-1">
                    Piece Values
                  </h5>
                  <div className="text-xs text-purple-700 space-y-1">
                    <div className="flex justify-between">
                      <span>Pawn</span>
                      <span>1 point</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Knight/Bishop</span>
                      <span>3 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rook</span>
                      <span>5 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Queen</span>
                      <span>9 points</span>
                    </div>
                    <div className="flex justify-between">
                      <span>King</span>
                      <span>Priceless</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                  <h5 className="font-semibold text-green-800 text-sm mb-1">
                    Common Time Controls
                  </h5>
                  <div className="text-xs text-green-700 space-y-1">
                    <div>• Bullet: 1+0, 2+1</div>
                    <div>• Blitz: 3+0, 5+0</div>
                    <div>• Rapid: 10+0, 15+10</div>
                    <div>• Classical: 30+0, 90+30</div>
                  </div>
                </div>

                <div className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg">
                  <h5 className="font-semibold text-orange-800 text-sm mb-1">
                    Remember
                  </h5>
                  <div className="text-xs text-orange-700">
                    Practice makes perfect! The more you play, the better you'll
                    understand these rules in action.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Triangle component for Bishop icon
const Triangle = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M13.73 4a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
  </svg>
);
