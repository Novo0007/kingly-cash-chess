import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ChessBoard } from './ChessBoard';
import { TimeControl } from './TimeControl';
import { ChatSystem } from '@/components/chat/ChatSystem';
import { GameReactions } from './GameReactions';
import { MobileGameReactions } from './MobileGameReactions';
import { DisconnectionTracker } from './DisconnectionTracker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, 
  Users, 
  Clock, 
  Crown,
  ArrowLeft,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { Chess } from 'chess.js';
import { MobileContainer } from '@/components/layout/MobileContainer';
import { useDeviceType } from '@/hooks/use-mobile';
import type { Tables } from '@/integrations/supabase/types';

interface GameData extends Tables<'chess_games'> {
  white_player?: { 
    username: string; 
    chess_rating: number; 
    avatar_url?: string;
  };
  black_player?: { 
    username: string; 
    chess_rating: number; 
    avatar_url?: string;
  };
  white_time_updated_at?: string;
  black_time_updated_at?: string;
}

interface GamePageProps {
  gameId?: string;
  onBack?: () => void;
}

export const GamePage = ({ gameId: propGameId, onBack }: GamePageProps) => {
  const [game, setGame] = useState<GameData | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<{white: number, black: number}>({white: 600, black: 600});
  const [isPlayerTurn, setIsPlayerTurn] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [showGameEndDialog, setShowGameEndDialog] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [endReason, setEndReason] = useState<string>('');
  const [showMobileReactions, setShowMobileReactions] = useState(false);
  const [gameEndProcessed, setGameEndProcessed] = useState(false);
  
  const { gameId: urlGameId } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  const gameSubscriptionRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use prop gameId first, fallback to URL parameter
  const gameId = propGameId || urlGameId;

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate('/');
    }
  }, [onBack, navigate]);

  useEffect(() => {
    // Check if gameId is valid before proceeding
    if (!gameId || gameId === 'undefined') {
      console.error('Invalid gameId:', gameId);
      toast.error('Invalid game ID');
      handleBack();
      return;
    }
    
    fetchGame();
    fetchUser();
  }, [gameId, handleBack]);

  useEffect(() => {
    if (game && currentUser) {
      const playerColor = game.white_player_id === currentUser ? 'white' : 'black';
      const isWhiteTurn = game.current_turn === 'white';
      const isBlackTurn = game.current_turn === 'black';
      setIsPlayerTurn(
        (playerColor === 'white' && isWhiteTurn) ||
        (playerColor === 'black' && isBlackTurn)
      );
    }
  }, [game, currentUser]);

  useEffect(() => {
    if (game && gameStarted && !gameEnded) {
      setupTimeTracking();
    }
    return () => clearInterval(intervalRef.current || null);
  }, [game, gameStarted, gameEnded]);

  useEffect(() => {
    if (gameId && currentUser) {
      subscribeToGameChanges();
    }
    return () => {
      if (gameSubscriptionRef.current) {
        supabase.removeChannel(gameSubscriptionRef.current);
      }
      clearInterval(intervalRef.current || null);
    };
  }, [gameId, currentUser]);

  const fetchGame = async () => {
    // Early return if gameId is invalid
    if (!gameId || gameId === 'undefined') {
      console.error('Cannot fetch game: invalid gameId');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // First, fetch the game data
      const { data: gameData, error: gameError } = await supabase
        .from('chess_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (gameError) {
        console.error('Error fetching game data:', gameError);
        throw gameError;
      }
      
      // Then, fetch the player data separately
      const whitePlayerPromise = gameData.white_player_id ? 
        supabase
          .from('profiles')
          .select('username, chess_rating, avatar_url')
          .eq('id', gameData.white_player_id)
          .single() : 
        Promise.resolve({ data: null, error: null });

      const blackPlayerPromise = gameData.black_player_id ? 
        supabase
          .from('profiles')
          .select('username, chess_rating, avatar_url')
          .eq('id', gameData.black_player_id)
          .single() : 
        Promise.resolve({ data: null, error: null });

      const [whitePlayerResult, blackPlayerResult] = await Promise.all([
        whitePlayerPromise,
        blackPlayerPromise
      ]);

      const completeGameData: GameData = {
        ...gameData,
        white_player: whitePlayerResult.data,
        black_player: blackPlayerResult.data,
        white_time_updated_at: gameData.updated_at,
        black_time_updated_at: gameData.updated_at
      };
      
      setGame(completeGameData);
      
      // Set initial time remaining based on game data
      setTimeRemaining({
        white: gameData.white_time_remaining || 600,
        black: gameData.black_time_remaining || 600
      });

      setGameStarted(gameData.game_status !== 'waiting');
    } catch (error) {
      console.error('Error fetching game:', error);
      toast.error('Failed to load game');
      // Redirect back after a delay
      setTimeout(() => handleBack(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUser(user.id);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const subscribeToGameChanges = () => {
    if (!gameId) return;

    gameSubscriptionRef.current = supabase
      .channel('game_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'chess_games', filter: `id=eq.${gameId}` },
        (payload) => {
          console.log('Change received!', payload);
          if (payload.new) {
            const updatedGame = payload.new as GameData;
            setGame(prevGame => ({
              ...updatedGame,
              white_player: prevGame?.white_player,
              black_player: prevGame?.black_player,
              white_time_updated_at: updatedGame.updated_at,
              black_time_updated_at: updatedGame.updated_at
            }));

            // Update time remaining if available
            setTimeRemaining({
              white: updatedGame.white_time_remaining || 0,
              black: updatedGame.black_time_remaining || 0
            });

            setGameStarted(updatedGame.game_status !== 'waiting');
          }
        }
      )
      .subscribe();
  };

  const setupTimeTracking = () => {
    if (!game || gameEnded) return;

    clearInterval(intervalRef.current || null);

    intervalRef.current = setInterval(() => {
      if (!game || gameEnded) {
        clearInterval(intervalRef.current || null);
        return;
      }

      const now = Date.now();
      const whiteLastUpdate = new Date(game.white_time_updated_at || game.created_at).getTime();
      const blackLastUpdate = new Date(game.black_time_updated_at || game.created_at).getTime();

      const whiteElapsedTime = game.current_turn === 'white' ? (now - whiteLastUpdate) / 1000 : 0;
      const blackElapsedTime = game.current_turn === 'black' ? (now - blackLastUpdate) / 1000 : 0;

      const newWhiteTime = Math.max(0, game.white_time_remaining! - whiteElapsedTime);
      const newBlackTime = Math.max(0, game.black_time_remaining! - blackElapsedTime);

      setTimeRemaining({
        white: newWhiteTime,
        black: newBlackTime
      });

      if (newWhiteTime <= 0 || newBlackTime <= 0) {
        const winner = newWhiteTime <= 0 ? 'black' : 'white';
        handleGameEnd(`${winner}_wins` as any, winner, 'Time out');
        clearInterval(intervalRef.current || null);
      }
    }, 250);
  };

  const handleGameEnd = async (result: 'white_wins' | 'black_wins' | 'draw', winnerType: 'white' | 'black' | 'draw', reason: string = '') => {
    if (!game || !currentUser || gameEndProcessed) return;
    
    console.log('Game ending with result:', result, 'winner:', winnerType, 'reason:', reason);
    setGameEndProcessed(true);
    
    try {
      const chess = new Chess();
      if (game.board_state) {
        chess.load(game.board_state);
      }
      
      let winnerId = null;
      let gameResult = result;
      
      if (winnerType === 'white') {
        winnerId = game.white_player_id;
        gameResult = 'white_wins';
      } else if (winnerType === 'black') {
        winnerId = game.black_player_id;
        gameResult = 'black_wins';
      } else {
        gameResult = 'draw';
      }

      console.log('Updating game with result:', gameResult, 'winner:', winnerId);
      
      // Update game status
      const { error: gameError } = await supabase
        .from('chess_games')
        .update({
          game_status: 'completed',
          game_result: gameResult,
          winner_id: winnerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', game.id);

      if (gameError) {
        console.error('Error updating game:', gameError);
        throw gameError;
      }

      // Update player statistics
      const whitePlayerId = game.white_player_id;
      const blackPlayerId = game.black_player_id;
      
      if (whitePlayerId && blackPlayerId) {
        // Update games played for both players
        await Promise.all([
          supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: whitePlayerId,
            column_name: 'games_played',
            increment_value: 1
          }),
          supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: blackPlayerId,
            column_name: 'games_played',
            increment_value: 1
          })
        ]);

        // Update winner's games won count
        if (winnerId) {
          await supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: winnerId,
            column_name: 'games_won',
            increment_value: 1
          });
        }

        // Handle prize money if there's an entry fee
        if (game.entry_fee > 0 && winnerId && game.prize_amount > 0) {
          console.log('Processing prize money:', game.prize_amount, 'for winner:', winnerId);
          
          // Add prize money to winner's wallet
          const { error: walletError } = await supabase.rpc('increment_decimal', {
            table_name: 'wallets',
            row_id: winnerId,
            column_name: 'balance',
            increment_value: game.prize_amount
          });

          if (walletError) {
            console.error('Error updating winner wallet:', walletError);
          } else {
            console.log('Prize money added to winner wallet successfully');
            
            // Create transaction record for the prize
            const { error: txError } = await supabase
              .from('transactions')
              .insert({
                user_id: winnerId,
                transaction_type: 'game_winning',
                amount: game.prize_amount,
                status: 'completed',
                description: `Prize money from chess game: ${game.game_name || 'Chess Game'}`
              });

            if (txError) {
              console.error('Error creating prize transaction:', txError);
            }

            // Update winner's total earnings
            const { error: earningsError } = await supabase.rpc('increment_decimal', {
              table_name: 'profiles',
              row_id: winnerId,
              column_name: 'total_earnings',
              increment_value: game.prize_amount
            });

            if (earningsError) {
              console.error('Error updating total earnings:', earningsError);
            }
          }
        }
      }

      // Set game end state
      setGameEnded(true);
      setGameResult(gameResult);
      setWinner(winnerId);
      setEndReason(reason);
      setShowGameEndDialog(true);
      
      // Show success message to winner
      if (winnerId === currentUser) {
        if (game.entry_fee > 0) {
          toast.success(`🎉 You won! Prize money ₹${game.prize_amount} has been added to your wallet!`);
        } else {
          toast.success('🎉 Congratulations! You won the game!');
        }
      } else if (winnerId) {
        toast.info('Game ended. Better luck next time!');
      } else {
        toast.info('Game ended in a draw!');
      }

    } catch (error) {
      console.error('Error ending game:', error);
      toast.error('Error ending game. Please try again.');
      setGameEndProcessed(false);
    }
  };

  const handleMove = async (from: string, to: string, promotion?: string) => {
    if (!game || !currentUser || gameEnded) return;

    try {
      const chess = new Chess();
      if (game.board_state) {
        chess.load(game.board_state);
      }

      const move = promotion ? { from, to, promotion } : { from, to };
      const result = chess.move(move);
      if (!result) {
        toast.error('Invalid move');
        return;
      }

      const newFen = chess.fen();
      const isWhiteTurn = chess.turn() === 'w';
      const newTurn = isWhiteTurn ? 'white' : 'black';

      // Optimistically update the UI
      setGame(prevGame => ({
        ...prevGame!,
        board_state: newFen,
        current_turn: newTurn,
        move_history: [...(prevGame?.move_history || []), result.san],
        white_time_updated_at: new Date().toISOString(),
        black_time_updated_at: new Date().toISOString()
      }));

      // Persist the move to the database
      const { data, error } = await supabase
        .from('chess_games')
        .update({
          board_state: newFen,
          current_turn: newTurn,
          move_history: [...(game.move_history || []), result.san],
          updated_at: new Date().toISOString()
        })
        .eq('id', game.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating game:', error);
        toast.error('Failed to make move. Please try again.');
        setGame(game);
      } else {
        console.log('Move persisted successfully:', data);
        setIsPlayerTurn(isWhiteTurn ? game.white_player_id === currentUser : game.black_player_id === currentUser);
      }
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Invalid move. Please try again.');
    }
  };

  const handleGiveUp = async () => {
    if (!game || !currentUser || gameEnded) return;

    const winnerType = game.white_player_id === currentUser ? 'black' : 'white';
    await handleGameEnd(
      `${winnerType}_wins` as any,
      winnerType,
      'Opponent gave up'
    );
  };

  const handleClaimDraw = async () => {
    if (!game || !currentUser || gameEnded) return;

    await handleGameEnd(
      'draw',
      'draw',
      'Draw claimed'
    );
  };
  
  const handlePlayerDisconnected = useCallback(async (playerId: string) => {
    if (!game || !currentUser || gameEnded) return;
    
    console.log('Player disconnected:', playerId);
    
    const isWhitePlayer = game.white_player_id === playerId;
    const isBlackPlayer = game.black_player_id === playerId;
    
    if (isWhitePlayer || isBlackPlayer) {
      const winnerType = isWhitePlayer ? 'black' : 'white';
      await handleGameEnd(
        `${winnerType}_wins` as any,
        winnerType,
        'Opponent disconnected'
      );
    }
  }, [game, currentUser, gameEnded, handleGameEnd]);

  if (loading) {
    return (
      <MobileContainer>
        <div className="flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin"></div>
        </div>
      </MobileContainer>
    );
  }

  if (!game || !gameId) {
    return (
      <MobileContainer>
        <Card className="bg-card border border-border rounded-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Game not found</p>
            <Button 
              onClick={handleBack} 
              className="mt-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </MobileContainer>
    );
  }

  const playerColor = game.white_player_id === currentUser ? 'white' : 'black';
  const opponent = playerColor === 'white' ? game.black_player : game.white_player;
  const isYourTurn = (game.current_turn === 'white' && playerColor === 'white') || (game.current_turn === 'black' && playerColor === 'black');

  return (
    <MobileContainer>
      {/* Game End Dialog */}
      {showGameEndDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <Card className="bg-card border border-border rounded-2xl w-[90vw] max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-xl font-bold">Game Over!</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {gameResult === 'draw' ? (
                <p className="text-center text-muted-foreground">The game ended in a draw.</p>
              ) : (
                <>
                  {winner === currentUser ? (
                    <div className="text-center">
                      <Trophy className="h-10 w-10 mx-auto text-yellow-500 mb-2" />
                      <p className="text-lg font-bold">Congratulations! You won!</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <User className="h-10 w-10 mx-auto text-red-500 mb-2" />
                      <p className="text-lg font-bold">You lost the game.</p>
                    </div>
                  )}
                </>
              )}
              <p className="text-center text-muted-foreground">Reason: {endReason}</p>
              <div className="flex justify-center">
                <Button onClick={() => navigate('/')}>Back to Home</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="space-y-4">
        {/* Opponent Info */}
        <Card className="bg-card border border-border rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={opponent?.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {opponent?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-semibold">{opponent?.username}</p>
                <p className="text-sm text-muted-foreground">Rating: {opponent?.chess_rating}</p>
              </div>
            </div>
            <DisconnectionTracker 
              gameId={gameId}
              currentUser={currentUser}
              whitePlayerId={game.white_player_id}
              blackPlayerId={game.black_player_id}
              gameStatus={game.game_status}
              onPlayerDisconnected={handlePlayerDisconnected}
            />
          </CardContent>
        </Card>

        {/* Time Controls */}
        <Card className="bg-card border border-border rounded-2xl">
          <CardContent className="p-4 grid grid-cols-2 gap-4">
            <TimeControl 
              whiteTime={timeRemaining.white}
              blackTime={timeRemaining.black}
              currentTurn={game.current_turn === 'white' ? 'white' : 'black'}
              gameStatus={game.game_status}
              onTimeUp={(player) => {
                const winnerType = player === 'white' ? 'black' : 'white';
                handleGameEnd(`${winnerType}_wins` as any, winnerType, 'Time out');
              }}
              isActive={game.game_status === 'active' && !gameEnded}
            />
          </CardContent>
        </Card>

        {/* Chess Board */}
        <Card className="bg-card border border-border rounded-2xl">
          <CardContent className="p-4">
            <ChessBoard
              fen={game.board_state || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
              onMove={handleMove}
              playerColor={playerColor}
              disabled={!isYourTurn || gameEnded}
              isPlayerTurn={isYourTurn && !gameEnded}
            />
          </CardContent>
        </Card>

        {/* Game Actions */}
        <Card className="bg-card border border-border rounded-2xl">
          <CardContent className="p-4 flex items-center justify-around">
            <Button onClick={handleGiveUp} disabled={gameEnded}>Give Up</Button>
            <Button onClick={handleClaimDraw} disabled={gameEnded}>Claim Draw</Button>
            {isMobile && (
              <Button onClick={() => setShowMobileReactions(true)}>
                Reactions
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Chat System */}
        <Card className="bg-card border border-border rounded-2xl">
          <CardHeader>
            <CardTitle>Game Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChatSystem gameId={gameId} />
          </CardContent>
        </Card>
      </div>

      {/* Reactions (Desktop Only) */}
      {!isMobile && gameId && (
        <div className="fixed bottom-4 left-4 bg-card border border-border rounded-2xl p-4">
          <GameReactions gameId={gameId} />
        </div>
      )}

      {/* Reactions (Mobile Only) */}
      {isMobile && gameId && (
        <div className="fixed bottom-4 right-4">
          <MobileGameReactions gameId={gameId} />
        </div>
      )}
    </MobileContainer>
  );
};
