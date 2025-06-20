
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Crown, Clock, Users, DollarSign } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type ChessGame = Tables<'chess_games'> & {
  white_player?: Profile | null;
  black_player?: Profile | null;
};

interface GameLobbyProps {
  onJoinGame?: (gameId: string) => void;
}

export const GameLobby = ({ onJoinGame }: GameLobbyProps) => {
  const [games, setGames] = useState<ChessGame[]>([]);
  const [entryFee, setEntryFee] = useState('10');
  const [loading, setLoading] = useState(false);
  const [wallet, setWallet] = useState<Tables<'wallets'> | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchGames();
    fetchWallet();
    
    const gamesSubscription = supabase
      .channel('chess_games_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'chess_games' },
        () => fetchGames()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(gamesSubscription);
    };
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const fetchGames = async () => {
    try {
      const { data: gamesData, error } = await supabase
        .from('chess_games')
        .select('*')
        .eq('game_status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading games:', error);
        return;
      }

      const gamesWithProfiles = await Promise.all((gamesData || []).map(async (game) => {
        const gameWithPlayers: ChessGame = { ...game };
        
        if (game.white_player_id) {
          const { data: whitePlayer, error: whiteError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', game.white_player_id)
            .single();
          
          if (!whiteError) {
            gameWithPlayers.white_player = whitePlayer;
          }
        }
        
        return gameWithPlayers;
      }));

      setGames(gamesWithProfiles);
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const fetchWallet = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single();

    setWallet(data);
  };

  const createGame = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fee = parseFloat(entryFee);
    if (isNaN(fee) || fee < 0) {
      toast.error('Please enter a valid entry fee');
      return;
    }

    if (wallet && wallet.balance < fee) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: (wallet?.balance || 0) - fee,
          locked_balance: (wallet?.locked_balance || 0) + fee
        })
        .eq('user_id', user.id);

      if (walletError) {
        toast.error('Failed to deduct entry fee');
        setLoading(false);
        return;
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'game_entry',
          amount: fee,
          status: 'completed',
          description: `Entry fee for chess game - ₹${fee}`
        });

      if (transactionError) {
        console.error('Transaction record error:', transactionError);
      }

      const { data: gameData, error: gameError } = await supabase
        .from('chess_games')
        .insert({
          white_player_id: user.id,
          entry_fee: fee,
          prize_amount: fee * 2,
        })
        .select()
        .single();

      if (gameError) {
        toast.error('Error creating game');
        await supabase
          .from('wallets')
          .update({
            balance: wallet?.balance || 0,
            locked_balance: wallet?.locked_balance || 0
          })
          .eq('user_id', user.id);
      } else {
        toast.success('Game created successfully!');
        setEntryFee('10');
        fetchWallet();
        if (onJoinGame && gameData) {
          onJoinGame(gameData.id);
        }
      }
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    }

    setLoading(false);
  };

  const joinGame = async (gameId: string, entryFee: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (wallet && wallet.balance < entryFee) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      const { error: walletError } = await supabase
        .from('wallets')
        .update({
          balance: (wallet?.balance || 0) - entryFee,
          locked_balance: (wallet?.locked_balance || 0) + entryFee
        })
        .eq('user_id', user.id);

      if (walletError) {
        toast.error('Failed to deduct entry fee');
        return;
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'game_entry',
          amount: entryFee,
          status: 'completed',
          description: `Entry fee for chess game - ₹${entryFee}`
        });

      if (transactionError) {
        console.error('Transaction record error:', transactionError);
      }

      // Update game to add black player and set status to active
      const { error: gameError } = await supabase
        .from('chess_games')
        .update({
          black_player_id: user.id,
          game_status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (gameError) {
        console.error('Game update error:', gameError);
        toast.error('Error joining game');
        await supabase
          .from('wallets')
          .update({
            balance: wallet?.balance || 0,
            locked_balance: wallet?.locked_balance || 0
          })
          .eq('user_id', user.id);
      } else {
        toast.success('Joined game successfully!');
        fetchWallet();
        if (onJoinGame) {
          onJoinGame(gameId);
        }
      }
    } catch (error) {
      console.error('Error joining game:', error);
      toast.error('Failed to join game');
    }
  };

  return (
    <div className="space-y-6">
      {/* Wallet Balance */}
      <Card className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-yellow-500" />
              <span className="text-white font-medium">Wallet Balance</span>
            </div>
            <div className="text-xl font-bold text-yellow-500">
              ₹{wallet?.balance?.toFixed(2) || '0.00'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Game */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Game
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Entry Fee (₹)</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={entryFee}
              onChange={(e) => setEntryFee(e.target.value)}
              className="bg-gray-800/50 border-gray-600 text-white"
              placeholder="Enter amount"
            />
          </div>
          <Button
            onClick={createGame}
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
          >
            {loading ? 'Creating...' : 'Create Game'}
          </Button>
        </CardContent>
      </Card>

      {/* Available Games */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="h-5 w-5" />
          Available Games
        </h2>
        
        {games.length === 0 ? (
          <Card className="bg-black/30 border-gray-700">
            <CardContent className="p-6 text-center">
              <p className="text-gray-400">No games available. Create one to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {games.map((game) => (
              <Card key={game.id} className="bg-black/50 border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Crown className="h-4 w-4 text-yellow-500" />
                        <span className="text-white font-medium">
                          {game.white_player?.username || 'Anonymous'}
                        </span>
                        <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                          {game.white_player?.chess_rating || 1200}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>Entry: ₹{game.entry_fee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Crown className="h-3 w-3" />
                          <span>Prize: ₹{game.prize_amount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{Math.floor((game.time_control || 600) / 60)} min</span>
                        </div>
                      </div>
                    </div>
                    
                    {game.white_player_id !== currentUser ? (
                      <Button
                        onClick={() => joinGame(game.id, game.entry_fee)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Join Game
                      </Button>
                    ) : (
                      <Badge variant="outline" className="text-yellow-500 border-yellow-500">
                        Your Game
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
