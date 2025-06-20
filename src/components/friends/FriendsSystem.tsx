
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Users, UserPlus, Check, X, Gamepad2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;
type Friendship = Tables<'friendships'> & {
  requester?: Profile;
  addressee?: Profile;
};

export const FriendsSystem = () => {
  const [allUsers, setAllUsers] = useState<Profile[]>([]);
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);

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

  const createGameInvitation = async (friendId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create a new game invitation
    const { error } = await supabase
      .from('game_invitations')
      .insert({
        from_user_id: user.id,
        to_user_id: friendId,
        entry_fee: 10.00,
        status: 'pending'
      });

    if (error) {
      toast.error('Failed to send game invitation');
    } else {
      toast.success('Game invitation sent!');
    }
  };

  const filteredUsers = allUsers.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search Users */}
      <Card className="bg-black/50 border-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Find Players
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-800/50 border-gray-600 text-white"
          />
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">{user.username}</p>
                  <p className="text-gray-400 text-sm">Rating: {user.chess_rating}</p>
                </div>
                <Button
                  onClick={() => sendFriendRequest(user.id)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
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
        <Card className="bg-black/50 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="h-5 w-5" />
              Friend Requests ({pendingRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">{request.requester?.username}</p>
                  <p className="text-gray-400 text-sm">Rating: {request.requester?.chess_rating}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => acceptFriendRequest(request.id)}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => declineFriendRequest(request.id)}
                    size="sm"
                    variant="destructive"
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
      <Card className="bg-black/50 border-green-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Friends ({friends.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {friends.length === 0 ? (
            <p className="text-gray-400 text-center py-4">No friends yet. Send some friend requests!</p>
          ) : (
            friends.map((friendship) => (
              <div key={friendship.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div>
                  <p className="text-white font-medium">{friendship.friend?.username}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>Rating: {friendship.friend?.chess_rating}</span>
                    <span>Games: {friendship.friend?.games_played}</span>
                    <Badge variant="outline" className="text-green-400 border-green-400">
                      Online
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => createGameInvitation(friendship.friend?.id || '')}
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700 flex items-center gap-2"
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
