
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChessBoard } from '@/components/chess/ChessBoard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Clock, 
  Calendar, 
  User,
  Crown,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause
} from 'lucide-react';
import { Chess } from 'chess.js';
import type { Tables } from '@/integrations/supabase/types';

interface GameWithPlayers {
  id: string;
  game_name: string | null;
  game_status: string;
  game_result: string | null;
  winner_id: string | null;
  white_player_id: string | null;
  black_player_id: string | null;
  entry_fee: number;
  prize_amount: number;
  created_at: string;
  updated_at: string | null;
  white_player: { username: string; chess_rating: number; avatar_url?: string } | null;
  black_player: { username: string; chess_rating: number; avatar_url?: string } | null;
  move_history: string[] | null;
  board_state: string | null;
}

interface GameViewerProps {
  game: GameWithPlayers | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GameViewer: React.FC<GameViewerProps> = ({ game, open, onOpenChange }) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [boardPosition, setBoardPosition] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

  useEffect(() => {
    if (game && game.move_history) {
      // Reset to starting position when game changes
      setCurrentMoveIndex(0);
      setIsPlaying(false);
      setBoardPosition('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    }
  }, [game]);

  useEffect(() => {
    if (!game || !game.move_history) return;

    const chess = new Chess();
    
    // Apply moves up to current index
    for (let i = 0; i < currentMoveIndex && i < game.move_history.length; i++) {
      try {
        chess.move(game.move_history[i]);
      } catch (error) {
        console.error('Error applying move:', game.move_history[i], error);
        break;
      }
    }
    
    setBoardPosition(chess.fen());
  }, [currentMoveIndex, game]);

  useEffect(() => {
    if (!isPlaying || !game?.move_history) return;

    const interval = setInterval(() => {
      setCurrentMoveIndex(prev => {
        if (prev >= game.move_history!.length) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, game?.move_history]);

  if (!game) return null;

  const handlePrevMove = () => {
    setCurrentMoveIndex(prev => Math.max(0, prev - 1));
    setIsPlaying(false);
  };

  const handleNextMove = () => {
    if (game.move_history) {
      setCurrentMoveIndex(prev => Math.min(game.move_history!.length, prev + 1));
    }
    setIsPlaying(false);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'white_wins': return 'bg-green-600 text-white';
      case 'black_wins': return 'bg-red-600 text-white';
      case 'draw': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'white_wins': return 'White Wins';
      case 'black_wins': return 'Black Wins';
      case 'draw': return 'Draw';
      default: return 'Unknown';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto wood-card border-amber-600">
        <DialogHeader>
          <DialogTitle className="text-amber-900 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            {game.game_name || 'Chess Game'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              {/* Players */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-300">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={game.white_player?.avatar_url} />
                      <AvatarFallback className="bg-white text-amber-900">
                        {game.white_player?.username?.charAt(0).toUpperCase() || 'W'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-amber-900">
                        {game.white_player?.username || 'Unknown'} (White)
                      </p>
                      <p className="text-sm text-amber-700">
                        Rating: {game.white_player?.chess_rating || 1200}
                      </p>
                    </div>
                  </div>
                  {game.winner_id === game.white_player_id && (
                    <Crown className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-300">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={game.black_player?.avatar_url} />
                      <AvatarFallback className="bg-gray-800 text-white">
                        {game.black_player?.username?.charAt(0).toUpperCase() || 'B'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-amber-900">
                        {game.black_player?.username || 'Unknown'} (Black)
                      </p>
                      <p className="text-sm text-amber-700">
                        Rating: {game.black_player?.chess_rating || 1200}
                      </p>
                    </div>
                  </div>
                  {game.winner_id === game.black_player_id && (
                    <Crown className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Game Result */}
              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-900 font-medium">Result:</span>
                  <Badge className={getResultColor(game.game_result || 'draw')}>
                    {getResultText(game.game_result || 'draw')}
                  </Badge>
                </div>
                
                <div className="text-sm text-amber-700 space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(game.updated_at || game.created_at).toLocaleString()}
                    </span>
                  </div>
                  
                  {game.entry_fee > 0 && (
                    <div className="flex items-center gap-2">
                      <Crown className="h-3 w-3" />
                      <span>Entry Fee: ₹{game.entry_fee}</span>
                      {game.prize_amount > 0 && (
                        <span className="text-green-700 font-medium">
                          | Prize: ₹{game.prize_amount}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Move Counter */}
              <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-300">
                <div className="text-center">
                  <p className="text-amber-900 font-medium">
                    Move: {currentMoveIndex} / {game.move_history?.length || 0}
                  </p>
                  {game.move_history && currentMoveIndex > 0 && (
                    <p className="text-sm text-amber-700 mt-1">
                      Last Move: {game.move_history[currentMoveIndex - 1]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chess Board */}
          <div className="flex justify-center">
            <div className="w-full max-w-2xl">
              <ChessBoard
                boardState={boardPosition}
                onMove={() => {}}
                canMove={false}
                playerColor={null}
                gameStatus="completed"
                isViewOnly={true}
              />
            </div>
          </div>

          {/* Controls */}
          {game.move_history && game.move_history.length > 0 && (
            <div className="flex justify-center items-center gap-4 p-4 bg-amber-50/50 rounded-lg border border-amber-300">
              <Button
                onClick={handlePrevMove}
                disabled={currentMoveIndex === 0}
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-100"
              >
                <ChevronLeft className="h-4 w-4" />
                Prev
              </Button>
              
              <Button
                onClick={handlePlayPause}
                disabled={currentMoveIndex >= game.move_history.length}
                size="sm"
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Play
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleNextMove}
                disabled={!game.move_history || currentMoveIndex >= game.move_history.length}
                size="sm"
                variant="outline"
                className="border-amber-400 text-amber-800 hover:bg-amber-100"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
