import React from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Crown,
  Shield,
  Zap,
  Clock,
  Users,
  Trophy,
  BookOpen,
} from "lucide-react";

interface ChessRulesProps {
  onBackToGames: () => void;
}

export const ChessRules: React.FC<ChessRulesProps> = ({ onBackToGames }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBackToGames}
              className="lavender-glass hover:bg-purple-100/50 rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-700 to-indigo-600 bg-clip-text text-transparent">
                Chess Rules Guide
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Master the game of kings with this comprehensive guide to chess
              rules, strategies, and online play
            </p>
          </div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Quick Navigation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Basic Rules", icon: "🏁", href: "#basic-rules" },
              { title: "Piece Movement", icon: "♚", href: "#piece-movement" },
              { title: "Special Moves", icon: "⚡", href: "#special-moves" },
              { title: "Online Play", icon: "🌐", href: "#online-play" },
            ].map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors border border-purple-200/50"
              >
                <span className="text-2xl">{item.icon}</span>
                <span className="font-medium text-purple-700">
                  {item.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Basic Rules Section */}
      <section id="basic-rules" className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            Basic Rules of Chess
          </h2>

          <div className="space-y-6">
            {/* Objective */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold text-purple-600 mb-3">
                1. Objective of the Game
              </h3>
              <p className="text-gray-700 leading-relaxed">
                The goal is to <strong>checkmate</strong> your opponent's king —
                placing it under attack with no legal move to escape.
              </p>
            </div>

            {/* Board Setup */}
            <div className="border-l-4 border-indigo-500 pl-6">
              <h3 className="text-xl font-bold text-indigo-600 mb-3">
                2. Board Setup
              </h3>
              <div className="space-y-3">
                <p className="text-gray-700">
                  The game is played on an <strong>8×8 board</strong> with
                  alternating light and dark squares. The bottom-right square
                  should always be light.
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl">
                  <h4 className="font-semibold text-purple-700 mb-2">
                    Each player starts with:
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">♔</span>
                        <span>1 King</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">♕</span>
                        <span>1 Queen</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">♖</span>
                        <span>2 Rooks</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">♗</span>
                        <span>2 Bishops</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">♘</span>
                        <span>2 Knights</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">♙</span>
                        <span>8 Pawns</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Piece Movement Section */}
      <section id="piece-movement" className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-3xl font-bold text-purple-700 mb-6">
            3. How Each Piece Moves
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                piece: "♙",
                name: "Pawn",
                description:
                  "Moves forward 1 square (2 on its first move); captures diagonally.",
                color: "from-green-500 to-emerald-600",
              },
              {
                piece: "♖",
                name: "Rook",
                description:
                  "Moves any number of squares horizontally or vertically.",
                color: "from-blue-500 to-cyan-600",
              },
              {
                piece: "♗",
                name: "Bishop",
                description: "Moves diagonally any number of squares.",
                color: "from-purple-500 to-violet-600",
              },
              {
                piece: "♘",
                name: "Knight",
                description:
                  "Moves in an 'L' shape (2 in one direction, 1 perpendicular); jumps over pieces.",
                color: "from-orange-500 to-red-600",
              },
              {
                piece: "♕",
                name: "Queen",
                description: "Combines the powers of rook and bishop.",
                color: "from-pink-500 to-rose-600",
              },
              {
                piece: "♔",
                name: "King",
                description: "Moves 1 square in any direction.",
                color: "from-yellow-500 to-amber-600",
              },
            ].map((piece, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200"></div>
                <div className="relative p-4">
                  <div className="flex items-center gap-4 mb-3">
                    <div
                      className={`p-3 bg-gradient-to-r ${piece.color} rounded-xl text-white text-2xl flex items-center justify-center`}
                    >
                      {piece.piece}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {piece.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {piece.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Moves Section */}
      <section id="special-moves" className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
            <Zap className="h-8 w-8 text-purple-600" />
            Special Moves
          </h2>

          <div className="space-y-6">
            {/* Castling */}
            <div className="border-l-4 border-blue-500 pl-6">
              <h3 className="text-xl font-bold text-blue-600 mb-3">
                4. Castling
              </h3>
              <p className="text-gray-700 mb-3">
                A move involving the king and a rook.
              </p>
              <div className="bg-blue-50 p-4 rounded-xl">
                <h4 className="font-semibold text-blue-700 mb-2">
                  Conditions:
                </h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Neither the king nor the rook has moved</li>
                  <li>• No pieces between them</li>
                  <li>
                    • King is not in, moving through, or moving into check
                  </li>
                </ul>
              </div>
            </div>

            {/* En Passant */}
            <div className="border-l-4 border-green-500 pl-6">
              <h3 className="text-xl font-bold text-green-600 mb-3">
                5. En Passant
              </h3>
              <p className="text-gray-700">
                A special pawn capture when a pawn moves two squares forward
                from its starting position and lands beside an opponent's pawn.
                The opponent may capture it as if it had moved only one square.
              </p>
            </div>

            {/* Pawn Promotion */}
            <div className="border-l-4 border-purple-500 pl-6">
              <h3 className="text-xl font-bold text-purple-600 mb-3">
                6. Pawn Promotion
              </h3>
              <p className="text-gray-700">
                When a pawn reaches the 8th rank, it must be promoted to a
                queen, rook, bishop, or knight.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Game End Conditions */}
      <section className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
            <Shield className="h-8 w-8 text-purple-600" />
            Game End Conditions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Check and Checkmate */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-600">
                7. Check and Checkmate
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                  <strong className="text-red-700">Check:</strong>
                  <span className="text-gray-700">
                    {" "}
                    The king is under attack.
                  </span>
                </div>
                <div className="p-3 bg-red-100 rounded-lg border-l-4 border-red-600">
                  <strong className="text-red-800">Checkmate:</strong>
                  <span className="text-gray-700">
                    {" "}
                    The king is in check and cannot escape — this ends the game.
                  </span>
                </div>
              </div>
            </div>

            {/* Draw Conditions */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-600">
                8. Stalemate & Draw Conditions
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <strong className="text-gray-700">Stalemate:</strong>
                  <span className="text-gray-600">
                    {" "}
                    No legal move and not in check — draw.
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>• Threefold repetition (same position 3 times)</p>
                  <p>• 50-move rule (50 moves with no pawn move or capture)</p>
                  <p>• Insufficient material (e.g., only kings left)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Online Chess Specific Rules */}
      <section id="online-play" className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            Online Chess Specific Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Time Controls */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold text-blue-600">
                  10. Time Controls
                </h3>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl space-y-3">
                <p className="text-gray-700">
                  Games often have timers (e.g. <strong>3|0</strong> means 3
                  minutes per player with no increment).
                </p>
                <p className="text-gray-700">
                  Running out of time results in a loss unless the opponent
                  cannot checkmate (draw).
                </p>
              </div>
            </div>

            {/* Fair Play */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-green-600">
                11. Disconnection & Fair Play
              </h3>
              <div className="bg-green-50 p-4 rounded-xl space-y-3">
                <p className="text-gray-700">
                  If you disconnect for too long, you forfeit the game.
                </p>
                <p className="text-gray-700">
                  <strong>Cheating</strong> (using engines or external help) is
                  strictly prohibited and can lead to bans.
                </p>
              </div>
            </div>

            {/* Premoves */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-purple-600">
                12. Premoves
              </h3>
              <div className="bg-purple-50 p-4 rounded-xl">
                <p className="text-gray-700">
                  Some platforms allow "premoves" — moves you make during your
                  opponent's turn that execute instantly if legal.
                </p>
              </div>
            </div>

            {/* Auto-Flag */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-red-600">13. Auto-Flag</h3>
              <div className="bg-red-50 p-4 rounded-xl">
                <p className="text-gray-700">
                  If your clock hits 0, you lose — even if you have a winning
                  position.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips for Players */}
      <section className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-6">
          <h2 className="text-3xl font-bold text-purple-700 mb-6 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            Tips for Players
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                icon: "⚠️",
                tip: 'Always double-check before moving — there\'s no "undo" in online rated games.',
                color: "from-red-50 to-orange-50 border-red-200",
              },
              {
                icon: "⏰",
                tip: "Respect time control and manage your clock wisely.",
                color: "from-blue-50 to-cyan-50 border-blue-200",
              },
              {
                icon: "🤝",
                tip: "Be polite and sportsmanlike in chats or post-game messages.",
                color: "from-green-50 to-emerald-50 border-green-200",
              },
              {
                icon: "🔒",
                tip: "Play on secure and fair platforms (e.g., Chess.com, Lichess.org, FIDE Online Arena).",
                color: "from-purple-50 to-violet-50 border-purple-200",
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl bg-gradient-to-r ${item.color} border`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <p className="text-gray-700 leading-relaxed">{item.tip}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="relative">
        <div className="absolute inset-0 lavender-glass rounded-2xl lavender-shadow"></div>
        <div className="relative z-10 p-8 text-center">
          <h3 className="text-2xl font-bold text-purple-700 mb-4">
            Ready to Play?
          </h3>
          <p className="text-gray-600 mb-6">
            Now that you know the rules, it's time to put your knowledge to the
            test!
          </p>
          <Button
            onClick={onBackToGames}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-xl text-lg font-semibold lavender-shadow"
          >
            Start Playing Chess
          </Button>
        </div>
      </div>
    </div>
  );
};
