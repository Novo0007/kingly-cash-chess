
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Trophy, Target, DollarSign, Calendar, Edit } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export const ProfileSystem = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Tables<'wallets'> | null>(null);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchWallet();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setUsername(data.username);
      setFullName(data.full_name || '');
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

  const updateProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        username,
        full_name: fullName,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    }
  };

  const getRankBadge = (rating: number) => {
    if (rating >= 2000) return { rank: 'Master', color: 'text-purple-400 border-purple-400' };
    if (rating >= 1800) return { rank: 'Expert', color: 'text-blue-400 border-blue-400' };
    if (rating >= 1600) return { rank: 'Advanced', color: 'text-green-400 border-green-400' };
    if (rating >= 1400) return { rank: 'Intermediate', color: 'text-yellow-400 border-yellow-400' };
    return { rank: 'Beginner', color: 'text-gray-400 border-gray-400' };
  };

  const winRate = profile?.games_played ? 
    ((profile.games_won / profile.games_played) * 100).toFixed(1) : '0.0';

  const rankInfo = getRankBadge(profile?.chess_rating || 1200);

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <User className="h-5 w-5" />
              Player Profile
            </CardTitle>
            <Button
              onClick={() => setEditing(!editing)}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Username</label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-2 block">Full Name</label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={updateProfile} className="bg-green-600 hover:bg-green-700">
                  Save Changes
                </Button>
                <Button onClick={() => setEditing(false)} variant="ghost">
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-2xl font-bold text-white">{profile?.username}</h3>
                <p className="text-gray-400">{profile?.full_name || 'No full name set'}</p>
                <div className="mt-2">
                  <Badge variant="outline" className={rankInfo.color}>
                    {rankInfo.rank}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-500">
                  {profile?.chess_rating || 1200}
                </div>
                <p className="text-gray-400">Chess Rating</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/50 border-green-500/20">
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{profile?.games_won || 0}</div>
            <p className="text-gray-400">Games Won</p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{profile?.games_played || 0}</div>
            <p className="text-gray-400">Games Played</p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-yellow-500/20">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">₹{profile?.total_earnings?.toFixed(2) || '0.00'}</div>
            <p className="text-gray-400">Total Earnings</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <Card className="bg-black/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">{winRate}%</div>
              <p className="text-gray-400 text-sm">Win Rate</p>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                ₹{wallet?.balance?.toFixed(2) || '0.00'}
              </div>
              <p className="text-gray-400 text-sm">Current Balance</p>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                ₹{wallet?.locked_balance?.toFixed(2) || '0.00'}
              </div>
              <p className="text-gray-400 text-sm">Locked Balance</p>
            </div>
            <div>
              <div className="text-xl font-bold text-white">
                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </div>
              <p className="text-gray-400 text-sm">Member Since</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievement Badges */}
      <Card className="bg-black/50 border-purple-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {profile?.games_played && profile.games_played >= 1 && (
              <Badge variant="outline" className="text-blue-400 border-blue-400 p-2 text-center">
                First Game
              </Badge>
            )}
            {profile?.games_won && profile.games_won >= 1 && (
              <Badge variant="outline" className="text-green-400 border-green-400 p-2 text-center">
                First Win
              </Badge>
            )}
            {profile?.games_won && profile.games_won >= 10 && (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400 p-2 text-center">
                10 Wins
              </Badge>
            )}
            {profile?.total_earnings && profile.total_earnings >= 100 && (
              <Badge variant="outline" className="text-purple-400 border-purple-400 p-2 text-center">
                ₹100+ Earned
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
