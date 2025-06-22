
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Trophy, Target, Crown, Edit2, Save, X, RefreshCw } from 'lucide-react';
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
      <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Player Profile
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="sm"
                disabled={refreshing}
                className="text-blue-400 hover:bg-blue-500/10"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              {!editing ? (
                <Button
                  onClick={() => setEditing(true)}
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:bg-blue-500/10"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              ) : (
                <div className="flex gap-1">
                  <Button
                    onClick={handleSave}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:bg-green-500/10"
                  >
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {editing ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="username" className="text-white">Username</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="full_name" className="text-white">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-gray-800/50 border-gray-600 text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div>
                <h3 className="text-2xl font-bold text-white">{profile.username}</h3>
                {profile.full_name && (
                  <p className="text-gray-300">{profile.full_name}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getRatingBadgeColor(profile.chess_rating || 1200)}>
                  <Crown className="h-3 w-3 mr-1" />
                  {profile.chess_rating || 1200} - {getRatingTitle(profile.chess_rating || 1200)}
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-black/50 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-green-400 flex items-center gap-2 text-sm">
              <Trophy className="h-4 w-4" />
              Games Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {profile.games_won || 0}
            </div>
            <p className="text-xs text-gray-400">
              Win Rate: {getWinRate()}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-blue-400 flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Games Played
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {profile.games_played || 0}
            </div>
            <p className="text-xs text-gray-400">
              Total matches
            </p>
          </CardContent>
        </Card>

        <Card className="bg-black/50 border-yellow-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-400 flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              ₹{(profile.total_earnings || 0).toFixed(2)}
            </div>
            <p className="text-xs text-gray-400">
              All-time winnings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Summary */}
      {wallet && (
        <Card className="bg-black/50 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Current Wallet Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">
              ₹{wallet.balance.toFixed(2)}
            </div>
            {wallet.locked_balance > 0 && (
              <p className="text-sm text-gray-400 mt-1">
                Locked Balance: ₹{wallet.locked_balance.toFixed(2)}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
