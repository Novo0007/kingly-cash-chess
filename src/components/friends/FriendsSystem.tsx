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

  useEffect(() => {
    getCurrentUser();
    fetchAllUsers();
    fetchFriends();
    fetchPendingRequests();
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

    // First create a new chess game
    const { data: gameData, error: gameError } = await supabase
      .from('chess_games')
      .insert({
        white_player_id: user.id,
        entry_fee: amount,
        prize_amount: amount * 2,
        game_status: 'waiting',
        game_name: `Epic Challenge - ₹${amount}`
      })
      .select()
      .single();

    if (gameError) {
      toast.error('Failed to create epic challenge');
      return;
    }

    // Then create the game invitation
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
      toast.error('Failed to send epic challenge');
    } else {
      toast.success(`Epic ₹${amount} challenge sent! 🔥`);
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
    <div className="space-y-8">
      <ChallengePopup
        open={challengePopup.open}
        onOpenChange={(open) => setChallengePopup(prev => ({ ...prev, open }))}
        friendName={challengePopup.friendName}
        onChallenge={(amount) => createGameInvitation(challengePopup.friendId, amount)}
      />

      {/* Search Users */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-4 border-yellow-500/30 shadow-2xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3 text-2xl font-black">
            <UserPlus className="h-7 w-7 text-yellow-400 animate-bounce" />
            🔍 Find Epic Warriors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Input
            placeholder="Search legendary players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-700/50 border-2 border-gray-500 text-white placeholder:text-gray-400 text-lg py-3 px-4 rounded-xl font-bold"
          />
          
          <div className="space-y-4 max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-2xl border-2 border-gray-600/50 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div>
                  <p className="text-white font-black text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    {user.username}
                  </p>
                  <p className="text-gray-400 text-base font-bold flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Rating: {user.chess_rating}
                  </p>
                </div>
                <Button
                  onClick={() => sendFriendRequest(user.id)}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 font-bold text-lg px-4 py-2 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300"
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
        <Card className="bg-gradient-to-br from-orange-700 to-red-700 border-4 border-orange-500/40 shadow-2xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-2xl font-black">
              <Users className="h-7 w-7 text-orange-400 animate-pulse" />
              🔔 Friend Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border-2 border-orange-400/50 shadow-lg">
                <div>
                  <p className="text-white font-black text-lg">{request.requester?.username}</p>
                  <p className="text-orange-200 text-base font-bold">Rating: {request.requester?.chess_rating}</p>
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={() => acceptFriendRequest(request.id)}
                    size="sm"
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold px-4 py-2 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300"
                  >
                    <Check className="h-5 w-5" />
                  </Button>
                  <Button
                    onClick={() => declineFriendRequest(request.id)}
                    size="sm"
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 font-bold px-4 py-2 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card className="bg-gradient-to-br from-green-700 to-emerald-700 border-4 border-green-500/40 shadow-2xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-3 text-2xl font-black">
            <Users className="h-7 w-7 text-green-400 animate-pulse" />
            👥 Epic Warriors ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {friends.length === 0 ? (
            <p className="text-gray-300 text-center py-8 text-xl font-bold">No epic warriors yet. Send some friend requests! ⚔️</p>
          ) : (
            friends.map((friendship) => (
              <div key={friendship.id} className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border-2 border-green-400/50 shadow-lg transform hover:scale-105 transition-all duration-300">
                <div>
                  <p className="text-white font-black text-lg flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    {friendship.friend?.username}
                  </p>
                  <div className="flex items-center gap-6 text-base text-gray-300 font-bold">
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      Rating: {friendship.friend?.chess_rating}
                    </span>
                    <span>Games: {friendship.friend?.games_played}</span>
                    <Badge className="bg-gradient-to-r from-green-400 to-emerald-400 text-black font-black border-2 border-green-500 animate-pulse">
                      Online
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => openChallengePopup(friendship.friend?.id || '', friendship.friend?.username || '')}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-black text-lg px-6 py-3 rounded-xl shadow-lg transform hover:scale-110 transition-all duration-300 flex items-center gap-2"
                >
                  <Gamepad2 className="h-5 w-5" />
                  ⚔️ Challenge
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
