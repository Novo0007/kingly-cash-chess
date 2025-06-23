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
        // Get current winner stats
        const { data: winnerProfile } = await supabase
          .from('profiles')
          .select('games_played, games_won, total_earnings')
          .eq('id', winnerId)
          .single();

        if (winnerProfile) {
          // Update winner's profile
          promises.push(
            supabase
              .from('profiles')
              .update({
                games_played: (winnerProfile.games_played || 0) + 1,
                games_won: (winnerProfile.games_won || 0) + 1,
                total_earnings: (winnerProfile.total_earnings || 0) + game.prize_amount,
                updated_at: new Date().toISOString()
              })
              .eq('id', winnerId)
          );
        }

        // Get current wallet balance
        const { data: winnerWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', winnerId)
          .single();

        if (winnerWallet) {
          // Add winnings to wallet
          promises.push(
            supabase
              .from('wallets')
              .update({
                balance: (winnerWallet.balance || 0) + game.prize_amount,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', winnerId)
          );
        }

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
        const { data: loserProfile } = await supabase
          .from('profiles')
          .select('games_played')
          .eq('id', loserId)
          .single();

        if (loserProfile) {
          promises.push(
            supabase
              .from('profiles')
              .update({
                games_played: (loserProfile.games_played || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', loserId)
          );
        }
      }

      // If it's a draw, update both players' stats
      if (gameResult === 'draw' && game.white_player_id && game.black_player_id) {
        // Get both players' current stats
        const { data: whiteProfile } = await supabase
          .from('profiles')
          .select('games_played')
          .eq('id', game.white_player_id)
          .single();

        const { data: blackProfile } = await supabase
          .from('profiles')
          .select('games_played')
          .eq('id', game.black_player_id)
          .single();

        // Update both players' games played
        if (whiteProfile) {
          promises.push(
            supabase
              .from('profiles')
              .update({
                games_played: (whiteProfile.games_played || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', game.white_player_id)
          );
        }

        if (blackProfile) {
          promises.push(
            supabase
              .from('profiles')
              .update({
                games_played: (blackProfile.games_played || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', game.black_player_id)
          );
        }

        // Get both players' wallet balances
        const { data: whiteWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', game.white_player_id)
          .single();

        const { data: blackWallet } = await supabase
          .from('wallets')
          .select('balance')
          .eq('user_id', game.black_player_id)
          .single();

        // Return entry fees to both players
        const refundAmount = game.entry_fee;
        
        if (whiteWallet) {
          promises.push(
            supabase
              .from('wallets')
              .update({
                balance: (whiteWallet.balance || 0) + refundAmount,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', game.white_player_id)
          );
        }

        if (blackWallet) {
          promises.push(
            supabase
              .from('wallets')
              .update({
                balance: (blackWallet.balance || 0) + refundAmount,
                updated_at: new Date().toISOString()
              })
              .eq('user_id', game.black_player_id)
          );
        }

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
        <div className="text-white text-xl font-bold animate-pulse">🎮 Loading game...</div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="text-center text-white pb-20">
        <h2 className="text-2xl font-bold mb-4">🎲 Game not found</h2>
        <Button onClick={onBackToLobby} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 font-bold text-lg px-6 py-3 rounded-xl shadow-lg">
          🏠 Back to Lobby
        </Button>
      </div>
    );
  }

  const playerCount = getPlayerCount();

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 px-2 sm:px-4">
      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="w-[95vw] max-w-md mx-auto bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-purple-400">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white text-xl font-bold">
              <Lock className="h-6 w-6 text-yellow-400" />
              🔐 Enter Game Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="Enter password"
              value={gamePassword}
              onChange={(e) => setGamePassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              className="bg-white/20 border-white/30 text-white placeholder:text-white/70 font-bold"
            />
            <Button onClick={handlePasswordSubmit} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-bold text-lg">
              🚀 Join Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Game End Dialog */}
      <Dialog open={showGameEndDialog} onOpenChange={setShowGameEndDialog}>
        <DialogContent className="text-center w-[95vw] max-w-md mx-auto bg-gradient-to-br from-purple-600 to-blue-600 border-2 border-purple-400">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2 text-2xl sm:text-3xl text-white font-black">
              {gameEndType === 'win' && <Trophy className="h-8 w-8 text-yellow-400 animate-bounce" />}
              {gameEndType === 'draw' && <Handshake className="h-8 w-8 text-blue-400 animate-bounce" />}
              {gameEndType === 'disconnect' && <Crown className="h-8 w-8 text-green-400 animate-bounce" />}
              🎉 Game Over
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className={`text-xl sm:text-2xl font-black animate-pulse ${
              gameEndType === 'win' ? 'text-yellow-400' :
              gameEndType === 'draw' ? 'text-blue-400' : 'text-green-400'
            }`}>
              {gameEndMessage}
            </div>
            <Button onClick={() => {
              setShowGameEndDialog(false);
              onBackToLobby();
            }} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-bold text-lg">
              🏠 Back to Lobby
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header - Always visible */}
      <div className="flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 p-4 rounded-xl shadow-lg">
        <Button
          onClick={onBackToLobby}
          variant="ghost"
          className="text-white hover:bg-white/20 font-bold text-lg px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          🏠 Back
        </Button>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold px-3 py-1 text-sm">
            🎮 {game.game_status}
          </Badge>
          <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold px-3 py-1 text-sm">
            <Users className="h-4 w-4 mr-1" />
            👥 {playerCount}/2
          </Badge>
          {playerCount === 2 && isSpectator() && (
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-3 py-1 text-sm">
              👁️ Spectating
            </Badge>
          )}
        </div>
      </div>

      {/* Game Info */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 border-2 border-purple-400 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-3 text-xl sm:text-2xl font-black">
            <Crown className="h-6 w-6 text-yellow-400" />
            <span className="truncate">🏆 {game.game_name || 'Chess Championship'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-white font-bold">
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-sm text-blue-200 font-bold">⚪ White Player</p>
              <p className="font-black text-lg truncate">{game.white_player?.username || '⏳ Waiting...'}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-sm text-blue-200 font-bold">⚫ Black Player</p>
              <p className="font-black text-lg truncate">{game.black_player?.username || '⏳ Waiting...'}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-sm text-yellow-200 font-bold">💰 Entry Fee</p>
              <p className="font-black text-xl text-yellow-400">₹{game.entry_fee}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-sm text-green-200 font-bold">🏆 Prize Pool</p>
              <p className="font-black text-xl text-green-400">₹{game.prize_amount}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-sm text-purple-200 font-bold">🎯 Current Turn</p>
              <p className={`font-black text-lg capitalize ${isPlayerTurn() ? 'text-green-400 animate-pulse' : 'text-white'}`}>
                {game.current_turn === 'white' ? '⚪' : '⚫'} {game.current_turn}
                {isPlayerTurn() && (
                  <span className="block text-sm text-green-300">🚀 Your turn!</span>
                )}
              </p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg">
              <p className="text-sm text-pink-200 font-bold">📊 Status</p>
              <p className="font-black text-lg">
                {game.game_status === 'waiting' ? '⏳ Waiting' : 
                 game.game_status === 'active' ? '🔴 Live' : 
                 '✅ ' + game.game_status}
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
        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 border-2 border-yellow-400 shadow-lg">
          <CardContent className="p-4 text-center">
            <p className="text-white font-black text-lg">
              ⏳ Waiting for another player... ({playerCount}/2)
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === 'waiting' && playerCount === 2 && (
        <Card className="bg-gradient-to-r from-blue-500 to-cyan-500 border-2 border-blue-400 shadow-lg">
          <CardContent className="p-4 text-center">
            <p className="text-white font-black text-lg animate-pulse">
              🎉 Both players joined! Starting game...
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === 'active' && (
        <Card className="bg-gradient-to-r from-green-500 to-emerald-500 border-2 border-green-400 shadow-lg">
          <CardContent className="p-4 text-center">
            <p className="text-white font-black text-lg">
              🔴 Game is Live! {isSpectator() ? '👁️ You are spectating.' : isPlayerTurn() ? "🚀 It's your turn!" : `⏳ Waiting for ${game.current_turn} player...`}
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === 'completed' && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-purple-400 shadow-lg">
          <CardContent className="p-4 text-center">
            <p className="text-white font-black text-lg">
              🏁 Game completed! 
              {game.winner_id && game.winner_id === currentUser && ' 🎉 Congratulations, you won!'}
              {game.winner_id && game.winner_id !== currentUser && ' 😔 Better luck next time!'}
              {!game.winner_id && game.game_result === 'draw' && ' 🤝 Game ended in a draw!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
