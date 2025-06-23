import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Trophy, Target, Crown, Edit2, Save, X, RefreshCw, LogOut } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

export const ProfileSystem = () => {
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [wallet, setWallet] = useState<Tables<'wallets'> | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
  });

  useEffect(() => {
    fetchProfile();
    fetchWallet();

    // Auto-refresh every 15 seconds to catch updates
    const autoRefreshInterval = setInterval(() => {
      fetchProfile();
      fetchWallet();
    }, 15000);

    // Subscribe to real-time changes
    const profileSubscription = supabase
      .channel('profile_changes')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'profiles'
        },
        () => {
          console.log('Profile updated, refreshing...');
          fetchProfile();
        }
      )
      .subscribe();

    return () => {
      clearInterval(autoRefreshInterval);
      supabase.removeChannel(profileSubscription);
    };
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast.error('Error loading profile');
      } else {
        setProfile(data);
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching wallet:', error);
      } else {
        setWallet(data);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchWallet()]);
    setRefreshing(false);
    toast.success('Profile data refreshed!');
  };

  const handleSave = async () => {
    if (!profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.full_name,
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        full_name: profile.full_name || '',
      });
    }
    setEditing(false);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully!');
      // The auth state change will be handled by the parent component
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const getWinRate = () => {
    if (!profile || !profile.games_played || profile.games_played === 0) return 0;
    return Math.round((profile.games_won / profile.games_played) * 100);
  };

  const getRatingBadgeColor = (rating: number) => {
    if (rating >= 2000) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (rating >= 1600) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (rating >= 1200) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const getRatingTitle = (rating: number) => {
    if (rating >= 2000) return 'Master';
    if (rating >= 1600) return 'Expert';
    if (rating >= 1200) return 'Intermediate';
    return 'Beginner';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
        <p className="text-gray-400">Unable to load your profile information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 border-2 border-purple-400 shadow-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6 text-yellow-400" />
              <span className="font-black text-xl">👤 Player Profile</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="text-blue-200 hover:bg-white/20 font-bold"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {!editing ? (
                <Button
                  onClick={() => setEditing(true)}
                  variant="ghost"
                  size="sm"
                  className="text-green-200 hover:bg-white/20 font-bold"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    onClick={handleSave}
                    variant="ghost"
                    size="sm"
                    className="text-green-200 hover:bg-white/20 font-bold"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="sm"
                    className="text-red-200 hover:bg-white/20 font-bold"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-red-200 hover:bg-red-500/20 font-bold ml-2"
              >
                <LogOut className="h-4 w-4 mr-1" />
                🚪 Sign Out
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white font-bold">📝 Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-white/20 border-white/30 text-white font-bold placeholder:text-white/70"
                />
              </div>
              <div>
                <Label htmlFor="full_name" className="text-white font-bold">👤 Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-white/20 border-white/30 text-white font-bold placeholder:text-white/70"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <h3 className="text-3xl font-black text-white">🎮 {profile.username}</h3>
                {profile.full_name && (
                  <p className="text-blue-200 font-bold text-lg">{profile.full_name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`${getRatingBadgeColor(profile.chess_rating || 1200)} font-bold text-lg px-4 py-2`}>
                  <Crown className="h-4 w-4 mr-2 text-yellow-400" />
                  ⭐ {profile.chess_rating || 1200} - {getRatingTitle(profile.chess_rating || 1200)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-600 to-emerald-700 border-2 border-green-400 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-100 flex items-center gap-2 font-black text-lg">
              <Trophy className="h-5 w-5 text-yellow-400" />
              🏆 Games Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">
              {profile.games_won || 0}
            </div>
            <p className="text-sm text-green-200 font-bold">
              📊 Win Rate: {getWinRate()}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600 to-cyan-700 border-2 border-blue-400 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-100 flex items-center gap-2 font-black text-lg">
              <Target className="h-5 w-5 text-yellow-400" />
              🎯 Games Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">
              {profile.games_played || 0}
            </div>
            <p className="text-sm text-blue-200 font-bold">
              📈 Total matches
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-600 to-orange-700 border-2 border-yellow-400 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-100 flex items-center gap-2 font-black text-lg">
              <Crown className="h-5 w-5 text-yellow-400" />
              💰 Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-white">
              ₹{(profile.total_earnings || 0).toFixed(2)}
            </div>
            <p className="text-sm text-yellow-200 font-bold">
              🎊 All-time winnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Summary */}
      {wallet && (
        <Card className="bg-gradient-to-br from-purple-600 to-pink-700 border-2 border-purple-400 shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 font-black text-xl">
              <Trophy className="h-6 w-6 text-yellow-400" />
              💳 Current Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-yellow-400">
              ₹{wallet.balance.toFixed(2)}
            </div>
            {wallet.locked_balance > 0 && (
              <p className="text-lg text-purple-200 font-bold mt-2">
                🔒 Locked Balance: ₹{wallet.locked_balance.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
