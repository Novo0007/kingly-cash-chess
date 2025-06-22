import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChessBoard } from './ChessBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Crown, Clock, ArrowLeft, Users, Lock, Trophy, Handshake } from 'lucide-react';
import { Chess } from 'chess.js';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type ChessGame = Tables<'chess_games'> & {
  white_player?: Profile | null;
  black_player?: Profile | null;
};

interface GamePageProps {
  gameId: string;
  onBackToLobby: () => void;
}

export const GamePage = ({ gameId, onBackToLobby }: GamePageProps) => {
  const [game, setGame] = useState<ChessGame | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamePassword, setGamePassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showGameEndDialog, setShowGameEndDialog] = useState(false);
  const [gameEndMessage, setGameEndMessage] = useState('');
  const [gameEndType, setGameEndType] = useState<'win' | 'draw' | 'disconnect'>('win');
  const [lastActiveTime, setLastActiveTime] = useState<number>(Date.now());
  const [presenceTracked, setPresenceTracked] = useState(false);

  useEffect(() => {
    getCurrentUser();
    fetchGame();
    
    // Auto-refresh game state every 7 seconds
    const autoRefreshInterval = setInterval(() => {
      if (!loading) {
        fetchGame();
      }
    }, 7000);
    
    // Subscribe to real-time game changes
    const gameSubscription = supabase
      .channel(`game_${gameId}`)
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'chess_games',
          filter: `id=eq.${gameId}`
        },
        (payload) => {
          console.log('Real-time game update received:', payload);
          if (payload.new) {
            fetchGame();
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up game subscription and auto-refresh');
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(gameSubscription);
    };
  }, [gameId, loading]);

  // Separate effect for presence tracking
  useEffect(() => {
    if (!currentUser || !game) return;

    const isPlayer = currentUser === game.white_player_id || currentUser === game.black_player_id;
    if (!isPlayer || game.game_status !== 'active') return;

    // Track user presence
    const presenceChannel = supabase
      .channel(`presence_${gameId}`)
      .on('presence', { event: 'sync' }, () => {
        console.log('Presence synced');
        setLastActiveTime(Date.now());
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
        setLastActiveTime(Date.now());
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
        // Only trigger disconnection check after a reasonable delay
        setTimeout(() => checkForDisconnection(), 20000); // 20 seconds delay
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && currentUser && !presenceTracked) {
          await presenceChannel.track({ 
            user_id: currentUser, 
            online_at: new Date().toISOString(),
            last_seen: Date.now()
          });
          setPresenceTracked(true);
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
      setPresenceTracked(false);
    };
  }, [currentUser, game?.id, game?.game_status]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const checkForDisconnection = async () => {
    if (!game || game.game_status !== 'active' || !currentUser) return;

    const isPlayer = currentUser === game.white_player_id || currentUser === game.black_player_id;
    if (!isPlayer) return;

    // Get current presence state
    const presenceState = supabase.channel(`presence_${gameId}`).presenceState();
    const presentUserIds = Object.keys(presenceState);
    
    // Check if both players are present
    const whitePresent = presentUserIds.some(key => 
      presenceState[key].some((presence: any) => presence.user_id === game.white_player_id)
    );
    const blackPresent = presentUserIds.some(key => 
      presenceState[key].some((presence: any) => presence.user_id === game.black_player_id)
    );

    // Only trigger disconnection if one player is clearly absent for extended time
    if ((!whitePresent || !blackPresent) && game.game_status === 'active') {
      // Additional check: verify the game hasn't been updated recently (within last 45 seconds)
      const gameAge = Date.now() - new Date(game.updated_at!).getTime();
      if (gameAge > 45000) { // 45 seconds
        setTimeout(async () => {
          // Final check before marking as disconnected
          const { data: currentGame } = await supabase
            .from('chess_games')
            .select('game_status, updated_at')
            .eq('id', gameId)
            .single();

          if (currentGame?.game_status === 'active') {
            const finalGameAge = Date.now() - new Date(currentGame.updated_at!).getTime();
            if (finalGameAge > 60000) { // 60 seconds total
              await handleGameDisqualification();
            }
          }
        }, 15000); // Additional 15 second delay
      }
    }
  };

  const handleGameDisqualification = async () => {
    if (!game || !currentUser) return;

    const winnerId = currentUser === game.white_player_id ? game.black_player_id : game.white_player_id;
    const loserId = currentUser;
    
    await completeGame(winnerId, loserId, 'abandoned');
    
    setGameEndType('disconnect');
    setGameEndMessage('Opponent disconnected. You win!');
    setShowGameEndDialog(true);
    toast.success('You won by forfeit!');
  };

  const completeGame = async (winnerId: string | null, loserId: string | null, gameResult: 'white_wins' | 'black_wins' | 'draw' | 'abandoned') => {
    if (!game) return;

    try {
      // Update game status
      const { error: gameError } = await supabase
        .from('chess_games')
        .update({
          game_status: 'completed' as any,
          winner_id: winnerId,
          game_result: gameResult as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (gameError) {
        console.error('Error updating game:', gameError);
        return;
      }

      // Update player statistics and process winnings
      const promises = [];

      // Update winner's stats and add winnings
      if (winnerId) {
        // Update winner's profile
        promises.push(
          supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: winnerId,
            column_name: 'games_played',
            increment_value: 1
          })
        );
        promises.push(
          supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: winnerId,
            column_name: 'games_won',
            increment_value: 1
          })
        );
        promises.push(
          supabase.rpc('increment_decimal', {
            table_name: 'profiles',
            row_id: winnerId,
            column_name: 'total_earnings',
            increment_value: game.prize_amount
          })
        );

        // Add winnings to wallet
        promises.push(
          supabase.rpc('increment_decimal', {
            table_name: 'wallets',
            row_id: winnerId,
            column_name: 'balance',
            increment_value: game.prize_amount
          })
        );

        // Create winning transaction
        promises.push(
          supabase
            .from('transactions')
            .insert({
              user_id: winnerId,
              transaction_type: 'game_winning',
              amount: game.prize_amount,
              status: 'completed',
              description: `Won game: ${game.game_name || 'Chess Game'}`
            })
        );
      }

      // Update loser's stats (only games played)
      if (loserId) {
        promises.push(
          supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: loserId,
            column_name: 'games_played',
            increment_value: 1
          })
        );
      }

      // If it's a draw, update both players' stats
      if (gameResult === 'draw' && game.white_player_id && game.black_player_id) {
        // Update both players' games played
        promises.push(
          supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: game.white_player_id,
            column_name: 'games_played',
            increment_value: 1
          })
        );
        promises.push(
          supabase.rpc('increment', {
            table_name: 'profiles',
            row_id: game.black_player_id,
            column_name: 'games_played',
            increment_value: 1
          })
        );

        // Return entry fees to both players
        const refundAmount = game.entry_fee;
        promises.push(
          supabase.rpc('increment_decimal', {
            table_name: 'wallets',
            row_id: game.white_player_id,
            column_name: 'balance',
            increment_value: refundAmount
          })
        );
        promises.push(
          supabase.rpc('increment_decimal', {
            table_name: 'wallets',
            row_id: game.black_player_id,
            column_name: 'balance',
            increment_value: refundAmount
          })
        );

        // Create refund transactions
        promises.push(
          supabase
            .from('transactions')
            .insert({
              user_id: game.white_player_id,
              transaction_type: 'refund',
              amount: refundAmount,
              status: 'completed',
              description: `Draw refund: ${game.game_name || 'Chess Game'}`
            })
        );
        promises.push(
          supabase
            .from('transactions')
            .insert({
              user_id: game.black_player_id,
              transaction_type: 'refund',
              amount: refundAmount,
              status: 'completed',
              description: `Draw refund: ${game.game_name || 'Chess Game'}`
            })
        );
      }

      await Promise.all(promises);
      console.log('Game completion processing finished successfully');
    } catch (error) {
      console.error('Error processing game completion:', error);
    }
  };

  const fetchGame = async () => {
    try {
      console.log('Fetching game data for:', gameId);
      const { data: gameData, error } = await supabase
        .from('chess_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
        console.error('Error fetching game:', error);
        toast.error('Error loading game');
        return;
      }

      // Fetch player profiles
      const gameWithPlayers: ChessGame = { ...gameData };
      
      if (gameData.white_player_id) {
        const { data: whitePlayer } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', gameData.white_player_id)
          .single();
        gameWithPlayers.white_player = whitePlayer;
      }
      
      if (gameData.black_player_id) {
        const { data: blackPlayer } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', gameData.black_player_id)
          .single();
        gameWithPlayers.black_player = blackPlayer;
      }

      console.log('Game data updated:', {
        id: gameWithPlayers.id,
        board_state: gameWithPlayers.board_state,
        current_turn: gameWithPlayers.current_turn,
        move_history: gameWithPlayers.move_history?.length || 0,
        status: gameWithPlayers.game_status
      });
      
      setGame(gameWithPlayers);

      // Check for game end conditions
      if (gameWithPlayers.game_status === 'completed' && !showGameEndDialog) {
        let message = '';
        let type: 'win' | 'draw' | 'disconnect' = 'win';
        
        if (gameWithPlayers.game_result === 'draw') {
          message = 'Game ended in a draw!';
          type = 'draw';
        } else if (gameWithPlayers.game_result === 'abandoned') {
          message = gameWithPlayers.winner_id === currentUser ? 'You won by forfeit!' : 'You lost by forfeit!';
          type = 'disconnect';
        } else if (gameWithPlayers.winner_id === currentUser) {
          message = 'Congratulations! You won! 🎉';
          type = 'win';
        } else {
          message = 'Game over. Better luck next time!';
          type = 'win';
        }
        
        setGameEndMessage(message);
        setGameEndType(type);
        setShowGameEndDialog(true);
      }

      // Auto-start game if both players are present and status is still waiting
      if (gameWithPlayers.game_status === 'waiting' && 
          gameWithPlayers.white_player_id && 
          gameWithPlayers.black_player_id) {
        console.log('Both players present, starting game...');
        await supabase
          .from('chess_games')
          .update({
            game_status: 'active' as any,
            updated_at: new Date().toISOString()
          })
          .eq('id', gameId);
      }
    } catch (error) {
      console.error('Error fetching game:', error);
      toast.error('Error loading game');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!game) return;
    
    // For demo purposes, accept any password. In production, you'd verify against a stored hash
    if (gamePassword.length >= 4) {
      setShowPasswordDialog(false);
      toast.success('Password accepted!');
    } else {
      toast.error('Password must be at least 4 characters');
    }
  };

  const handleMove = async (from: string, to: string) => {
    if (!game || !currentUser) {
      console.log('No game or user found');
      return;
    }

    // Check if it's the player's turn
    const isWhitePlayer = currentUser === game.white_player_id;
    const isBlackPlayer = currentUser === game.black_player_id;
    
    if (!isWhitePlayer && !isBlackPlayer) {
      toast.error('You are not a player in this game');
      return;
    }

    const isPlayerTurn = (game.current_turn === 'white' && isWhitePlayer) || 
                        (game.current_turn === 'black' && isBlackPlayer);

    if (!isPlayerTurn) {
      toast.error('Not your turn');
      return;
    }

    // Ensure game is active
    if (game.game_status !== 'active') {
      if (game.game_status === 'waiting') {
        toast.error('Waiting for another player to join');
      } else {
        toast.error('Game is not active');
      }
      return;
    }

    try {
      console.log('Attempting move:', from, 'to', to);
      
      // Create a chess instance with current board state
      const chess = new Chess(game.board_state || undefined);
      
      // Try to make the move
      const move = chess.move({ from, to });
      if (!move) {
        toast.error('Invalid move');
        return;
      }

      console.log('Valid move made:', move);

      // Update game state in real-time
      const newMoveHistory = [...(game.move_history || []), `${from}-${to}`];
      const nextTurn = game.current_turn === 'white' ? 'black' : 'white';
      const newBoardState = chess.fen();

      // Check for game end conditions
      let gameStatus: 'waiting' | 'active' | 'completed' | 'cancelled' = game.game_status;
      let winnerId = null;
      let gameResult = null;

      if (chess.isCheckmate()) {
        gameStatus = 'completed';
        winnerId = game.current_turn === 'white' ? game.white_player_id : game.black_player_id;
        gameResult = game.current_turn === 'white' ? 'white_wins' : 'black_wins';
        toast.success(`Checkmate! ${game.current_turn === 'white' ? 'White' : 'Black'} wins!`);
        
        // Handle game completion
        const loserId = game.current_turn === 'white' ? game.black_player_id : game.white_player_id;
        await completeGame(winnerId, loserId, gameResult as any);
      } else if (chess.isDraw()) {
        gameStatus = 'completed';
        gameResult = 'draw';
        toast.success('Game ended in a draw!');
        
        // Handle draw
        await completeGame(null, null, 'draw');
      } else if (chess.isCheck()) {
        toast.info(`${nextTurn === 'white' ? 'White' : 'Black'} is in check!`);
      }

      console.log('Updating database with:', {
        move_history: newMoveHistory,
        current_turn: nextTurn,
        board_state: newBoardState,
        game_status: gameStatus
      });

      const { error } = await supabase
        .from('chess_games')
        .update({
          move_history: newMoveHistory,
          current_turn: nextTurn,
          board_state: newBoardState,
          game_status: gameStatus as any,
          winner_id: winnerId,
          game_result: gameResult as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (error) {
        toast.error('Failed to make move');
        console.error('Move error:', error);
      } else {
        console.log('Move successfully saved to database');
        setLastActiveTime(Date.now()); // Update last active time on successful move
      }
    } catch (error) {
      console.error('Error making move:', error);
      toast.error('Failed to make move');
    }
  };

  const getPlayerColor = () => {
    if (!game || !currentUser) return 'white';
    return currentUser === game.white_player_id ? 'white' : 'black';
  };

  const isPlayerTurn = () => {
    if (!game || !currentUser) return false;
    const isWhitePlayer = currentUser === game.white_player_id;
    const isBlackPlayer = currentUser === game.black_player_id;
    
    if (!isWhitePlayer && !isBlackPlayer) return false;
    
    return (game.current_turn === 'white' && isWhitePlayer) || 
           (game.current_turn === 'black' && isBlackPlayer);
  };

  const isSpectator = () => {
    if (!game || !currentUser) return true;
    return currentUser !== game.white_player_id && currentUser !== game.black_player_id;
  };

  const getPlayerCount = () => {
    if (!game) return 0;
    let count = 0;
    if (game.white_player_id) count++;
    if (game.black_player_id) count++;
    return count;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center text-white pb-20">
        <h2 className="text-2xl font-bold mb-4">Game not found</h2>
        <Button onClick={onBackToLobby} className="bg-yellow-500 hover:bg-yellow-600">
          Back to Lobby
        </Button>
      </div>
    );
  }

  const playerCount = getPlayerCount();

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 px-2 sm:px-0">
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Lock className="h-4 w-4 sm:h-5 sm:w-5" />
              Enter Game Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={gamePassword}
              onChange={(e) => setGamePassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="text-sm sm:text-base"
            />
            <Button onClick={handlePasswordSubmit} className="w-full text-sm sm:text-base">
              Join Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game End Dialog */}
      <Dialog open={showGameEndDialog} onOpenChange={setShowGameEndDialog}>
        <DialogContent className="text-center w-[95vw] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-xl sm:text-2xl">
              {gameEndType === 'win' && <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />}
              {gameEndType === 'draw' && <Handshake className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />}
              {gameEndType === 'disconnect' && <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />}
              Game Over
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`text-lg sm:text-xl font-bold animate-bounce ${
              gameEndType === 'win' ? 'text-yellow-500' :
              gameEndType === 'draw' ? 'text-blue-500' : 'text-green-500'
            }`}>
              {gameEndMessage}
            </div>
            <Button onClick={() => {
              setShowGameEndDialog(false);
              onBackToLobby();
            }} className="w-full text-sm sm:text-base">
              Back to Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBackToLobby}
          variant="ghost"
          className="text-white hover:bg-gray-800 text-sm sm:text-base px-2 sm:px-4"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-1 sm:gap-2">
          <Badge variant="outline" className="text-yellow-500 border-yellow-500 text-xs px-1 sm:px-2">
            {game.game_status}
          </Badge>
          <Badge variant="outline" className="text-blue-500 border-blue-500 text-xs px-1 sm:px-2">
            <Users className="h-2 w-2 sm:h-3 sm:w-3 mr-0.5 sm:mr-1" />
            {playerCount}/2
          </Badge>
          {playerCount === 2 && isSpectator() && (
            <Badge variant="outline" className="text-purple-500 border-purple-500 text-xs px-1 sm:px-2">
              Spectating
            </Badge>
          )}
        </div>
      </div>

      {/* Game Info */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
          <CardTitle className="text-white flex items-center gap-2 text-base sm:text-xl">
            <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
            <span className="truncate">{game.game_name || 'Chess Game'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-4 text-white text-xs sm:text-base">
            <div>
              <p className="text-xs text-gray-400">White Player</p>
              <p className="font-medium truncate">{game.white_player?.username || 'Waiting...'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Black Player</p>
              <p className="font-medium truncate">{game.black_player?.username || 'Waiting...'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Entry Fee</p>
              <p className="font-medium">₹{game.entry_fee}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Prize</p>
              <p className="font-medium">₹{game.prize_amount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Current Turn</p>
              <p className={`font-medium capitalize text-xs sm:text-sm ${isPlayerTurn() ? 'text-green-400 animate-pulse' : ''}`}>
                {game.current_turn}
                {isPlayerTurn() && (
                  <span className="hidden sm:inline"> (Your turn)</span>
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Status</p>
              <p className="font-medium text-xs sm:text-sm">
                {game.game_status === 'waiting' ? 'Waiting' : 
                 game.game_status === 'active' ? 'Active' : 
                 game.game_status}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chess Board */}
      <div className="w-full" key={`${game.board_state}-${game.current_turn}-${Date.now()}`}>
        <ChessBoard
          fen={game.board_state}
          onMove={handleMove}
          playerColor={getPlayerColor()}
          disabled={game.game_status !== 'active' || isSpectator()}
          isPlayerTurn={isPlayerTurn() && game.game_status === 'active' && !isSpectator()}
        />
      </div>

      {/* Game Status Messages */}
      {game.game_status === 'waiting' && playerCount < 2 && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-yellow-500 font-medium text-sm">
              Waiting for another player... ({playerCount}/2)
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === 'waiting' && playerCount === 2 && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-blue-500 font-medium text-sm">
              Both players joined! Starting game...
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === 'active' && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-green-500 font-medium text-sm">
              Game is active! {isSpectator() ? 'You are spectating.' : isPlayerTurn() ? "It's your turn!" : `Waiting for ${game.current_turn} player...`}
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === 'completed' && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-3 sm:p-4 text-center">
            <p className="text-blue-500 font-medium text-sm">
              Game completed! 
              {game.winner_id && game.winner_id === currentUser && ' Congratulations, you won! 🎉'}
              {game.winner_id && game.winner_id !== currentUser && ' Better luck next time!'}
              {!game.winner_id && game.game_result === 'draw' && ' Game ended in a draw!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
