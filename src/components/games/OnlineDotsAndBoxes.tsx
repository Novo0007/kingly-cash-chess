
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Trophy, Users, Clock } from 'lucide-react';

interface OnlineDotsAndBoxesProps {
  gameId: string;
  onBackToLobby: () => void;
}

interface GameState {
  id: string;
  player1_id: string;
  player2_id: string | null;
  current_player: string;
  horizontal_lines: boolean[][];
  vertical_lines: boolean[][];
  boxes: ('player1' | 'player2' | null)[][];
  scores: { player1: number; player2: number };
  game_status: string;
  entry_fee: number;
  prize_amount: number;
  winner_id: string | null;
  player1?: { username: string };
  player2?: { username: string };
}

export const OnlineDotsAndBoxes: React.FC<OnlineDotsAndBoxesProps> = ({
  gameId,
  onBackToLobby
}) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUser();
    fetchGameState();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'dots_and_boxes_games',
          filter: `id=eq.${gameId}`
        },
        () => {
          fetchGameState();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dots_and_boxes_moves',
          filter: `game_id=eq.${gameId}`
        },
        () => {
          fetchGameState();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUserId(user?.id || null);
  };

  const fetchGameState = async () => {
    const { data, error } = await supabase
      .from('dots_and_boxes_games')
      .select(`
        *,
        player1:profiles!dots_and_boxes_games_player1_id_fkey(username),
        player2:profiles!dots_and_boxes_games_player2_id_fkey(username)
      `)
      .eq('id', gameId)
      .single();

    if (error) {
      console.error('Error fetching game state:', error);
      toast.error('Failed to load game');
      return;
    }

    if (data) {
      setGameState({
        ...data,
        horizontal_lines: data.horizontal_lines as boolean[][],
        vertical_lines: data.vertical_lines as boolean[][],
        boxes: data.boxes as ('player1' | 'player2' | null)[][],
        scores: data.scores as { player1: number; player2: number }
      });
    }
    setLoading(false);
  };

  const makeMove = async (type: 'horizontal' | 'vertical', row: number, col: number) => {
    if (!gameState || !currentUserId) return;
    
    const isPlayer1 = currentUserId === gameState.player1_id;
    const isPlayer2 = currentUserId === gameState.player2_id;
    
    if (!isPlayer1 && !isPlayer2) {
      toast.error('You are not part of this game');
      return;
    }

    const isMyTurn = (gameState.current_player === 'player1' && isPlayer1) ||
                     (gameState.current_player === 'player2' && isPlayer2);

    if (!isMyTurn) {
      toast.error('Not your turn');
      return;
    }

    if (gameState.game_status !== 'active') {
      toast.error('Game is not active');
      return;
    }

    // Check if the line is already drawn
    if (type === 'horizontal' && gameState.horizontal_lines[row][col]) {
      toast.error('Line already drawn');
      return;
    }
    if (type === 'vertical' && gameState.vertical_lines[row][col]) {
      toast.error('Line already drawn');
      return;
    }

    try {
      // Update the game state
      const newHorizontalLines = [...gameState.horizontal_lines];
      const newVerticalLines = [...gameState.vertical_lines];
      const newBoxes = [...gameState.boxes];
      const newScores = { ...gameState.scores };

      if (type === 'horizontal') {
        newHorizontalLines[row][col] = true;
      } else {
        newVerticalLines[row][col] = true;
      }

      // Check for completed boxes
      let boxesCompleted = 0;
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 4; c++) {
          if (!newBoxes[r][c]) {
            const top = newHorizontalLines[r][c];
            const bottom = newHorizontalLines[r + 1][c];
            const left = newVerticalLines[r][c];
            const right = newVerticalLines[r][c + 1];
            
            if (top && bottom && left && right) {
              newBoxes[r][c] = gameState.current_player as 'player1' | 'player2';
              newScores[gameState.current_player as 'player1' | 'player2']++;
              boxesCompleted++;
            }
          }
        }
      }

      // Determine next player
      const nextPlayer = boxesCompleted > 0 ? gameState.current_player : 
                        (gameState.current_player === 'player1' ? 'player2' : 'player1');

      // Check if game is over
      const totalBoxes = newScores.player1 + newScores.player2;
      const isGameOver = totalBoxes === 16;
      let winnerId = null;
      let gameStatus = 'active';

      if (isGameOver) {
        gameStatus = 'completed';
        if (newScores.player1 > newScores.player2) {
          winnerId = gameState.player1_id;
        } else if (newScores.player2 > newScores.player1) {
          winnerId = gameState.player2_id;
        }
        // Handle tie case (winnerId remains null)
      }

      // Update the game in the database
      const { error: updateError } = await supabase
        .from('dots_and_boxes_games')
        .update({
          horizontal_lines: newHorizontalLines,
          vertical_lines: newVerticalLines,
          boxes: newBoxes,
          scores: newScores,
          current_player: nextPlayer,
          game_status: gameStatus,
          winner_id: winnerId
        })
        .eq('id', gameId);

      if (updateError) {
        console.error('Error updating game:', updateError);
        toast.error('Failed to make move');
        return;
      }

      // Record the move
      await supabase
        .from('dots_and_boxes_moves')
        .insert({
          game_id: gameId,
          player_id: currentUserId,
          move_type: type,
          move_row: row,
          move_col: col,
          boxes_completed: boxesCompleted
        });

      // Handle game completion
      if (isGameOver && winnerId) {
        // Award prize to winner
        await supabase.rpc('increment_decimal', {
          table_name: 'wallets',
          row_id: winnerId,
          column_name: 'balance',
          increment_value: gameState.prize_amount
        });

        // Create transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: winnerId,
            transaction_type: 'game_winning',
            amount: gameState.prize_amount,
            status: 'completed',
            description: `Prize for winning Dots & Boxes game`
          });

        toast.success('Game completed!');
      }

    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-xl">Game not found</div>
      </div>
    );
  }

  const isPlayer1 = currentUserId === gameState.player1_id;
  const isPlayer2 = currentUserId === gameState.player2_id;
  const isMyTurn = (gameState.current_player === 'player1' && isPlayer1) ||
                   (gameState.current_player === 'player2' && isPlayer2);

  return (
    <div className="flex flex-col items-center p-4 space-y-6">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={onBackToLobby}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Lobby
          </Button>
          
          <Badge className="bg-yellow-600 text-white flex items-center gap-1">
            <Trophy className="h-4 w-4" />
            Prize: ₹{gameState.prize_amount}
          </Badge>
        </div>

        <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6 rounded-xl shadow-2xl border-4 border-yellow-400">
          <div className="text-white text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Dots & Boxes - Online Match</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className={`p-3 rounded-lg ${isPlayer1 ? 'bg-blue-600' : 'bg-slate-700'}`}>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-bold">{gameState.player1?.username}</span>
                </div>
                <p className="text-sm">Score: {gameState.scores.player1}</p>
              </div>
              
              <div className={`p-3 rounded-lg ${isPlayer2 ? 'bg-red-600' : 'bg-slate-700'}`}>
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-bold">{gameState.player2?.username || 'Waiting...'}</span>
                </div>
                <p className="text-sm">Score: {gameState.scores.player2}</p>
              </div>
            </div>

            {gameState.game_status === 'waiting' && (
              <p className="text-yellow-400 font-bold flex items-center justify-center gap-2">
                <Clock className="h-4 w-4" />
                Waiting for another player...
              </p>
            )}
            
            {gameState.game_status === 'active' && (
              <p className="text-sm">
                {isMyTurn ? "Your turn!" : `${gameState.current_player === 'player1' ? gameState.player1?.username : gameState.player2?.username}'s turn`}
              </p>
            )}
            
            {gameState.game_status === 'completed' && (
              <p className="text-xl font-bold text-yellow-400">
                {gameState.winner_id === gameState.player1_id ? `${gameState.player1?.username} Wins!` :
                 gameState.winner_id === gameState.player2_id ? `${gameState.player2?.username} Wins!` :
                 'Game Tied!'}
              </p>
            )}
          </div>

          <div className="grid grid-cols-9 gap-1 bg-white p-4 rounded-lg">
            {Array(9).fill(null).map((_, rowIndex) => 
              Array(9).fill(null).map((_, colIndex) => {
                const isDot = rowIndex % 2 === 0 && colIndex % 2 === 0;
                const isHorizontalLine = rowIndex % 2 === 0 && colIndex % 2 === 1;
                const isVerticalLine = rowIndex % 2 === 1 && colIndex % 2 === 0;
                const isBox = rowIndex % 2 === 1 && colIndex % 2 === 1;

                if (isDot) {
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className="w-4 h-4 bg-black rounded-full"
                    />
                  );
                }

                if (isHorizontalLine) {
                  const lineRow = Math.floor(rowIndex / 2);
                  const lineCol = Math.floor(colIndex / 2);
                  const isDrawn = gameState.horizontal_lines[lineRow]?.[lineCol];
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => makeMove('horizontal', lineRow, lineCol)}
                      className={`w-8 h-1 transition-colors ${
                        isDrawn ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      } ${!isMyTurn || gameState.game_status !== 'active' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={!isMyTurn || gameState.game_status !== 'active' || isDrawn}
                    />
                  );
                }

                if (isVerticalLine) {
                  const lineRow = Math.floor(rowIndex / 2);
                  const lineCol = Math.floor(colIndex / 2);
                  const isDrawn = gameState.vertical_lines[lineRow]?.[lineCol];
                  
                  return (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => makeMove('vertical', lineRow, lineCol)}
                      className={`w-1 h-8 transition-colors ${
                        isDrawn ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                      } ${!isMyTurn || gameState.game_status !== 'active' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      disabled={!isMyTurn || gameState.game_status !== 'active' || isDrawn}
                    />
                  );
                }

                if (isBox) {
                  const boxRow = Math.floor(rowIndex / 2);
                  const boxCol = Math.floor(colIndex / 2);
                  const boxOwner = gameState.boxes[boxRow]?.[boxCol];
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`w-8 h-8 flex items-center justify-center rounded ${
                        boxOwner === 'player1' ? 'bg-blue-200 text-blue-800' :
                        boxOwner === 'player2' ? 'bg-red-200 text-red-800' :
                        'bg-gray-100'
                      }`}
                    >
                      {boxOwner && (
                        <span className="text-xs font-bold">
                          {boxOwner === 'player1' ? '1' : '2'}
                        </span>
                      )}
                    </div>
                  );
                }

                return <div key={`${rowIndex}-${colIndex}`} className="w-4 h-4" />;
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
