
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Users, Coins, Play, Plus, ArrowLeft } from 'lucide-react';

interface DotsAndBoxesLobbyProps {
  onJoinGame: (gameId: string) => void;
  onBackToGameSelection: () => void;
}

interface GameLobbyItem {
  id: string;
  game_name: string | null;
  entry_fee: number;
  prize_amount: number;
  player1_id: string;
  player2_id: string | null;
  game_status: string;
  created_at: string;
  player1?: { username: string };
}

export const DotsAndBoxesLobby: React.FC<DotsAndBoxesLobbyProps> = ({
  onJoinGame,
  onBackToGameSelection
}) => {
  const [games, setGames] = useState<GameLobbyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [gameName, setGameName] = useState('');
  const [entryFee, setEntryFee] = useState(10);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchGames();
    fetchUserBalance();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('dots-boxes-lobby')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'dots_and_boxes_games'
        },
        () => {
          fetchGames();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchGames = async () => {
    const { data, error } = await supabase
      .from('dots_and_boxes_games')
      .select(`
        *,
        player1:profiles!dots_and_boxes_games_player1_id_fkey(username)
      `)
      .eq('game_status', 'waiting')
      .eq('is_friend_challenge', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games');
    } else {
      setGames(data || []);
    }
    setLoading(false);
  };

  const fetchUserBalance = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setUserBalance(data.balance);
    }
  };

  const createGame = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to create a game');
      return;
    }

    if (userBalance < entryFee) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      // Deduct entry fee from user's wallet
      const { error: walletError } = await supabase.rpc('increment_decimal', {
        table_name: 'wallets',
        row_id: user.id,
        column_name: 'balance',
        increment_value: -entryFee
      });

      if (walletError) {
        toast.error('Failed to deduct entry fee');
        return;
      }

      // Create the game
      const { data: gameData, error: gameError } = await supabase
        .from('dots_and_boxes_games')
        .insert({
          player1_id: user.id,
          entry_fee: entryFee,
          prize_amount: entryFee * 2,
          game_name: gameName || `₹${entryFee} Game`,
          horizontal_lines: Array(4).fill(null).map(() => Array(5).fill(false)),
          vertical_lines: Array(5).fill(null).map(() => Array(4).fill(false)),
          boxes: Array(4).fill(null).map(() => Array(4).fill(null)),
          scores: { player1: 0, player2: 0 }
        })
        .select()
        .single();

      if (gameError) {
        console.error('Game creation error:', gameError);
        toast.error('Failed to create game');
        return;
      }

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'game_entry',
          amount: entryFee,
          status: 'completed',
          description: `Entry fee for Dots & Boxes game`
        });

      toast.success('Game created successfully!');
      setShowCreateForm(false);
      setGameName('');
      fetchUserBalance();
      onJoinGame(gameData.id);
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    }
  };

  const joinGame = async (gameId: string, gameEntryFee: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error('Please log in to join a game');
      return;
    }

    if (userBalance < gameEntryFee) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      // Deduct entry fee from user's wallet
      const { error: walletError } = await supabase.rpc('increment_decimal', {
        table_name: 'wallets',
        row_id: user.id,
        column_name: 'balance',
        increment_value: -gameEntryFee
      });

      if (walletError) {
        toast.error('Failed to deduct entry fee');
        return;
      }

      // Join the game
      const { error: gameError } = await supabase
        .from('dots_and_boxes_games')
        .update({
          player2_id: user.id,
          game_status: 'active'
        })
        .eq('id', gameId);

      if (gameError) {
        console.error('Join game error:', gameError);
        toast.error('Failed to join game');
        return;
      }

      // Create transaction record
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'game_entry',
          amount: gameEntryFee,
          status: 'completed',
          description: `Entry fee for joining Dots & Boxes game`
        });

      toast.success('Joined game successfully!');
      fetchUserBalance();
      onJoinGame(gameId);
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-white text-xl">Loading games...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button 
            onClick={onBackToGameSelection}
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Games
          </Button>
          <div>
            <h2 className="text-white text-2xl font-bold">Dots & Boxes Lobby</h2>
            <p className="text-gray-400">Your Balance: ₹{userBalance}</p>
          </div>
        </div>
        
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Game
        </Button>
      </div>

      {showCreateForm && (
        <Card className="bg-slate-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Create New Game</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-white text-sm font-medium">Game Name (Optional)</label>
              <Input
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                placeholder="Enter game name..."
                className="bg-slate-700 border-gray-600 text-white"
              />
            </div>
            
            <div>
              <label className="text-white text-sm font-medium">Entry Fee (₹)</label>
              <Input
                type="number"
                value={entryFee}
                onChange={(e) => setEntryFee(Number(e.target.value))}
                min="1"
                className="bg-slate-700 border-gray-600 text-white"
              />
              <p className="text-gray-400 text-sm mt-1">Prize Pool: ₹{entryFee * 2}</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createGame} className="bg-green-600 hover:bg-green-700">
                Create Game
              </Button>
              <Button 
                onClick={() => setShowCreateForm(false)} 
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {games.length === 0 ? (
          <Card className="bg-slate-800 border-gray-700">
            <CardContent className="text-center py-8">
              <p className="text-gray-400 text-lg">No games available</p>
              <p className="text-gray-500 text-sm">Create a new game to get started!</p>
            </CardContent>
          </Card>
        ) : (
          games.map((game) => (
            <Card key={game.id} className="bg-slate-800 border-gray-700 hover:border-blue-500 transition-colors">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{game.game_name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {game.player1?.username}
                      </span>
                      <span className="flex items-center gap-1">
                        <Coins className="h-4 w-4" />
                        ₹{game.entry_fee}
                      </span>
                      <Badge className="bg-yellow-600 text-white">
                        Prize: ₹{game.prize_amount}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    onClick={() => joinGame(game.id, game.entry_fee)}
                    className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                    disabled={userBalance < game.entry_fee}
                  >
                    <Play className="h-4 w-4" />
                    Join Game
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
