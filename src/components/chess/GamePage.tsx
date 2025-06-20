
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChessBoard } from './ChessBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Crown, Clock, ArrowLeft } from 'lucide-react';
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

  useEffect(() => {
    getCurrentUser();
    fetchGame();
    
    // Subscribe to game changes
    const gameSubscription = supabase
      .channel(`game_${gameId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'chess_games', filter: `id=eq.${gameId}` },
        (payload) => {
          console.log('Game updated:', payload);
          fetchGame();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gameSubscription);
    };
  }, [gameId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const fetchGame = async () => {
    try {
      const { data: gameData, error } = await supabase
        .from('chess_games')
        .select('*')
        .eq('id', gameId)
        .single();

      if (error) {
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

      console.log('Fetched game:', gameWithPlayers);
      setGame(gameWithPlayers);
    } catch (error) {
      console.error('Error fetching game:', error);
      toast.error('Error loading game');
    } finally {
      setLoading(false);
    }
  };

  const handleMove = async (from: string, to: string) => {
    if (!game || !currentUser) return;

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

    try {
      // Update game state
      const newMoveHistory = [...(game.move_history || []), `${from}-${to}`];
      const nextTurn = game.current_turn === 'white' ? 'black' : 'white';

      const { error } = await supabase
        .from('chess_games')
        .update({
          move_history: newMoveHistory,
          current_turn: nextTurn,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (error) {
        toast.error('Failed to make move');
        console.error('Move error:', error);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Game not found</h2>
        <Button onClick={onBackToLobby} className="bg-yellow-500 hover:bg-yellow-600">
          Back to Lobby
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={onBackToLobby}
          variant="ghost"
          className="text-white hover:bg-gray-800"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Lobby
        </Button>
        <Badge variant="outline" className="text-yellow-500 border-yellow-500">
          {game.game_status}
        </Badge>
      </div>

      {/* Game Info */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Game Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-white">
            <div>
              <p className="text-sm text-gray-400">White Player</p>
              <p className="font-medium">{game.white_player?.username || 'Waiting...'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Black Player</p>
              <p className="font-medium">{game.black_player?.username || 'Waiting...'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Entry Fee</p>
              <p className="font-medium">₹{game.entry_fee}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Prize</p>
              <p className="font-medium">₹{game.prize_amount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Turn</p>
              <p className="font-medium capitalize">{game.current_turn}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Time Control</p>
              <p className="font-medium">{Math.floor((game.time_control || 600) / 60)} minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chess Board */}
      <div className="flex justify-center">
        <ChessBoard
          fen={game.board_state}
          onMove={handleMove}
          playerColor={getPlayerColor()}
          disabled={game.game_status !== 'active'}
        />
      </div>

      {/* Game Status */}
      {game.game_status === 'waiting' && !game.black_player_id && (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-yellow-500 font-medium">
              Waiting for another player to join...
            </p>
          </CardContent>
        </Card>
      )}

      {game.game_status === 'active' && (
        <Card className="bg-green-500/10 border-green-500/30">
          <CardContent className="p-4 text-center">
            <p className="text-green-500 font-medium">
              Game is active! Current turn: {game.current_turn}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
