import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Crown, 
  Clock, 
  Calendar, 
  Trophy,
  X,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Square,
  RotateCcw
} from 'lucide-react';
import { ChessBoard } from '@/components/chess/ChessBoard';

interface GameViewerProps {
  game: any;
  isOpen: boolean;
  onClose: () => void;
}

export const GameViewer: React.FC<GameViewerProps> = ({ game, isOpen, onClose }) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000); // ms between moves

  useEffect(() => {
    if (!isPlaying || !game?.move_history) return;

    const interval = setInterval(() => {
      setCurrentMoveIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= game.move_history.length) {
          setIsPlaying(false);
          return prev;
        }
        return nextIndex;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, game?.move_history]);

  const getCurrentFEN = () => {
    if (!game || !game.move_history || currentMoveIndex === 0) {
      return 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'; // Starting position
    }
    
    // This would need proper chess.js integration to generate FEN from moves
    // For now, return the final board state
    return game.board_state || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  };

  const handlePrevMove = () => {
    setCurrentMoveIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextMove = () => {
    if (game?.move_history) {
      setCurrentMoveIndex(prev => Math.min(game.move_history.length, prev + 1));
    }
  };

  const handleReset = () => {
    setCurrentMoveIndex(0);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 bg-gradient-to-br from-amber-50 to-orange-50">
        <DialogHeader className="p-4 border-b border-amber-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-amber-900 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Analysis: {game.game_name || "Chess Game"}
            </DialogTitle>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Game Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-amber-700">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(game.updated_at || game.created_at).toLocaleDateString()}
            </div>
            <Badge className={`${
              game.game_result === 'white_wins' ? 'bg-green-600' :
              game.game_result === 'black_wins' ? 'bg-red-600' :
              'bg-gray-600'
            } text-white`}>
              {game.game_result?.replace('_', ' ').toUpperCase() || 'DRAW'}
            </Badge>
            {game.entry_fee > 0 && (
              <div className="flex items-center gap-1">
                <Crown className="h-3 w-3 text-yellow-600" />
                <span>₹{game.entry_fee} → ₹{game.prize_amount}</span>
              </div>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-hidden">
          {/* Chess Board */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 bg-amber-50/50 border-amber-300">
              <CardContent className="p-4 h-full flex items-center justify-center">
                <div className="w-full max-w-md aspect-square">
                  <ChessBoard
                    fen={getCurrentFEN()}
                    playerColor="white"
                    disabled={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <Card className="mt-4 bg-amber-50/50 border-amber-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleReset}
                      variant="outline"
                      size="sm"
                      className="border-amber-400 text-amber-800"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handlePrevMove}
                      variant="outline"
                      size="sm"
                      disabled={currentMoveIndex === 0}
                      className="border-amber-400 text-amber-800"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={togglePlayback}
                      variant="outline"
                      size="sm"
                      className="border-amber-400 text-amber-800"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      onClick={handleNextMove}
                      variant="outline"
                      size="sm"
                      disabled={!game.move_history || currentMoveIndex >= game.move_history.length}
                      className="border-amber-400 text-amber-800"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <span>Move {currentMoveIndex}</span>
                    <span>/</span>
                    <span>{game.move_history?.length || 0}</span>
                  </div>

                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="text-xs border border-amber-300 rounded px-2 py-1 bg-amber-50"
                  >
                    <option value={2000}>Slow</option>
                    <option value={1000}>Normal</option>
                    <option value={500}>Fast</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Information & Move History */}
          <div className="flex flex-col gap-4">
            {/* Players */}
            <Card className="bg-amber-50/50 border-amber-300">
              <CardContent className="p-4">
                <h3 className="text-amber-900 font-semibold mb-3">Players</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-white border border-gray-800 rounded-sm"></div>
                      <span className="font-medium">{game.white_player?.username || 'White'}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {game.white_player?.chess_rating || 1200}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gray-800 border border-gray-300 rounded-sm"></div>
                      <span className="font-medium text-white">{game.black_player?.username || 'Black'}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {game.black_player?.chess_rating || 1200}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Move History */}
            <Card className="flex-1 bg-amber-50/50 border-amber-300">
              <CardContent className="p-4 h-full flex flex-col">
                <h3 className="text-amber-900 font-semibold mb-3">Move History</h3>
                <ScrollArea className="flex-1">
                  {game.move_history && game.move_history.length > 0 ? (
                    <div className="space-y-1">
                      {game.move_history.map((move: string, index: number) => (
                        <div
                          key={index}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            index + 1 === currentMoveIndex 
                              ? 'bg-amber-200 border border-amber-400' 
                              : 'hover:bg-amber-100'
                          }`}
                          onClick={() => setCurrentMoveIndex(index + 1)}
                        >
                          <span className="text-xs text-amber-600 w-8">
                            {Math.floor(index / 2) + 1}{index % 2 === 0 ? '.' : '...'}
                          </span>
                          <span className="font-mono text-sm">{move}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-amber-600 py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No move history available</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};