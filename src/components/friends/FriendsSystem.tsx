import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, UserPlus, Check, X, Gamepad2, Star, Crown } from 'lucide-react';
import { ChallengePopup } from './ChallengePopup';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Friendship = Tables<'friendships'>;

interface FriendshipWithProfile extends Friendship {
  friend?: Profile;
}

export const FriendsSystem = () => {
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<FriendshipWithProfile[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(Friendship & { requester?: Profile })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [challengePopup, setChallengePopup] = useState<{open: boolean, friendId: string, friendName: string}>({
    open: false,
    friendId: '',
    friendName: ''
  });
  const [sentChallenges, setSentChallenges] = useState<any[]>([]);

  useEffect(() => {
    getCurrentUser();
    fetchAllUsers();
    fetchFriends();
    fetchPendingRequests();
    fetchSentChallenges();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user?.id || null);
  };

  const fetchAllUsers = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .order('username');

    setAllUsers(data || []);
  };

  const fetchFriends = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('friendships')
      .select('*')
      .eq('status', 'accepted')
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);

    if (data) {
      const friendsWithProfiles = await Promise.all(data.map(async (friendship) => {
        const friendId = friendship.requester_id === user.id ? 
          friendship.addressee_id : friendship.requester_id;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', friendId)
          .single();

        return {
          ...friendship,
          friend: profile
        };
      }));

      setFriends(friendsWithProfiles);
    }
  };

  const fetchPendingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('friendships')
      .select('*')
      .eq('addressee_id', user.id)
      .eq('status', 'pending');

    if (data) {
      const requestsWithProfiles = await Promise.all(data.map(async (request) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', request.requester_id)
          .single();

        return {
          ...request,
          requester: profile
        };
      }));

      setPendingRequests(requestsWithProfiles);
    }
  };

  const fetchSentChallenges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('game_invitations')
      .select(`
        *,
        to_user:profiles!game_invitations_to_user_id_fkey(*),
        chess_game:chess_games(*)
      `)
      .eq('from_user_id', user.id)
      .eq('status', 'pending');

    setSentChallenges(data || []);
  };

  const sendFriendRequest = async (addresseeId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('friendships')
      .insert({
        requester_id: user.id,
        addressee_id: addresseeId,
        status: 'pending'
      });

    if (error) {
      toast.error('Failed to send friend request');
    } else {
      toast.success('Friend request sent!');
      fetchAllUsers();
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to accept friend request');
    } else {
      toast.success('Friend request accepted!');
      fetchFriends();
      fetchPendingRequests();
    }
  };

  const declineFriendRequest = async (requestId: string) => {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', requestId);

    if (error) {
      toast.error('Failed to decline friend request');
    } else {
      toast.success('Friend request declined');
      fetchPendingRequests();
    }
  };

  const createGameInvitation = async (friendId: string, amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check user's wallet balance first
    const { data: wallet } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single();

    if (!wallet || wallet.balance < amount) {
      toast.error('Insufficient balance for this challenge');
      return;
    }

    // Deduct the entry fee from user's wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .update({
        balance: wallet.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (walletError) {
      toast.error('Failed to deduct entry fee');
      return;
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        transaction_type: 'game_entry',
        amount: -amount,
        status: 'completed',
        description: `Entry fee for ₹${amount} challenge`
      });

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
    }

    // Create a new chess game with is_friend_challenge flag
    const { data: gameData, error: gameError } = await supabase
      .from('chess_games')
      .insert({
        white_player_id: user.id,
        entry_fee: amount,
        prize_amount: amount * 2,
        game_status: 'waiting',
        game_name: `Challenge - ₹${amount}`,
        is_friend_challenge: true
      })
      .select()
      .single();

    if (gameError) {
      toast.error('Failed to create challenge');
      return;
    }

    // Create the game invitation
    const { error } = await supabase
      .from('game_invitations')
      .insert({
        from_user_id: user.id,
        to_user_id: friendId,
        game_id: gameData.id,
        entry_fee: amount,
        status: 'pending'
      });

    if (error) {
      toast.error('Failed to send challenge');
    } else {
      toast.success(`₹${amount} challenge sent!`);
      fetchSentChallenges();
    }
  };

  const cancelChallenge = async (invitationId: string, gameId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Cancel the invitation
    const { error: invitationError } = await supabase
      .from('game_invitations')
      .update({ status: 'cancelled' })
      .eq('id', invitationId);

    // Cancel the game
    const { error: gameError } = await supabase
      .from('chess_games')
      .update({ game_status: 'cancelled' })
      .eq('id', gameId);

    if (invitationError || gameError) {
      toast.error('Failed to cancel challenge');
    } else {
      toast.success('Challenge cancelled');
      fetchSentChallenges();
    }
  };

  const openChallengePopup = (friendId: string, friendName: string) => {
    setChallengePopup({
      open: true,
      friendId,
      friendName
    });
  };

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <ChallengePopup
        open={challengePopup.open}
        onOpenChange={(open) => setChallengePopup(prev => ({ ...prev, open }))}
        friendName={challengePopup.friendName}
        onChallenge={(amount) => createGameInvitation(challengePopup.friendId, amount)}
      />

      {/* Sent Challenges */}
      {sentChallenges.length > 0 && (
        <Card className="bg-blue-50 border-2 border-blue-200 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-blue-800 flex items-center gap-3 text-xl font-bold">
              <Gamepad2 className="h-6 w-6 text-blue-600" />
              Sent Challenges ({sentChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sentChallenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-blue-200">
                <div>
                  <p className="text-gray-800 font-bold text-lg">{challenge.to_user?.username}</p>
                  <p className="text-gray-600 text-base font-medium">Challenge: ₹{challenge.entry_fee}</p>
                </div>
                <Button
                  onClick={() => cancelChallenge(challenge.id, challenge.game_id)}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 font-bold px-4 py-2 rounded-lg"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Search Users */}
      <Card className="bg-white border-2 border-gray-200 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-gray-800 flex items-center gap-3 text-xl font-bold">
            <UserPlus className="h-6 w-6 text-blue-600" />
            Find Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-gray-300 text-gray-800 placeholder:text-gray-500 text-lg py-3 px-4 rounded-lg font-medium"
          />
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-gray-800 font-bold text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    {user.username}
                  </p>
                  <p className="text-gray-600 text-base font-medium flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating: {user.chess_rating}
                  </p>
                </div>
                <Button
                  onClick={() => sendFriendRequest(user.id)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-base px-4 py-2 rounded-lg"
                >
                  Add Friend
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card className="bg-orange-50 border-2 border-orange-200 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-3 text-xl font-bold">
              <Users className="h-6 w-6 text-orange-600" />
              Friend Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-orange-200">
                <div>
                  <p className="text-gray-800 font-bold text-lg">{request.requester?.username}</p>
                  <p className="text-gray-600 text-base font-medium">Rating: {request.requester?.chess_rating}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => acceptFriendRequest(request.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 font-bold px-4 py-2 rounded-lg"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => declineFriendRequest(request.id)}
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 font-bold px-4 py-2 rounded-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card className="bg-green-50 border-2 border-green-200 shadow-lg rounded-xl">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-3 text-xl font-bold">
            <Users className="h-6 w-6 text-green-600" />
            My Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friends.length === 0 ? (
            <p className="text-gray-600 text-center py-8 text-lg font-medium">No friends yet. Send some friend requests!</p>
          ) : (
            friends.map((friendship) => (
              <div key={friendship.id} className="flex items-center justify-between p-4 bg-white/70 rounded-lg border border-green-200 hover:bg-white/90 transition-colors">
                <div>
                  <p className="text-gray-800 font-bold text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-600" />
                    {friendship.friend?.username}
                  </p>
                  <div className="flex items-center gap-4 text-base text-gray-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Rating: {friendship.friend?.chess_rating}
                    </span>
                    <span>Games: {friendship.friend?.games_played}</span>
                    <Badge className="bg-green-500 text-white font-bold border border-green-600">
                      Online
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => openChallengePopup(friendship.friend?.id || '', friendship.friend?.username || '')}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 font-bold text-base px-6 py-3 rounded-lg flex items-center gap-2"
                >
                  <Gamepad2 className="h-4 w-4" />
                  Challenge
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
