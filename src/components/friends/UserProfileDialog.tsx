
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Trophy, Target, Calendar, Crown } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

interface UserProfileDialogProps {
  profile: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserProfileDialog: React.FC<UserProfileDialogProps> = ({
  profile,
  open,
  onOpenChange,
}) => {
  if (!profile) return null;

  const winRate = profile.games_played > 0 
    ? Math.round((profile.games_won / profile.games_played) * 100) 
    : 0;

  const getRatingColor = (rating: number) => {
    if (rating >= 1800) return 'text-purple-400';
    if (rating >= 1600) return 'text-blue-400';
    if (rating >= 1400) return 'text-green-400';
    if (rating >= 1200) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const getRatingBadge = (rating: number) => {
    if (rating >= 1800) return { label: 'Master', color: 'bg-purple-600' };
    if (rating >= 1600) return { label: 'Expert', color: 'bg-blue-600' };
    if (rating >= 1400) return { label: 'Advanced', color: 'bg-green-600' };
    if (rating >= 1200) return { label: 'Intermediate', color: 'bg-yellow-600' };
    return { label: 'Beginner', color: 'bg-gray-600' };
  };

  const ratingBadge = getRatingBadge(profile.chess_rating || 1200);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-purple-500/50 text-white max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-purple-200">
            Player Profile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Profile Header */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20 border-4 border-purple-400">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-purple-600 text-white text-2xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="text-center">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 justify-center">
                <Crown className="h-5 w-5 text-yellow-400" />
                {profile.username}
              </h3>
              {profile.full_name && (
                <p className="text-gray-300 text-sm">{profile.full_name}</p>
              )}
            </div>

            <Badge className={`${ratingBadge.color} text-white font-bold px-3 py-1`}>
              {ratingBadge.label}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <Star className={`h-6 w-6 mx-auto mb-2 ${getRatingColor(profile.chess_rating || 1200)}`} />
                <p className="text-2xl font-bold text-white">{profile.chess_rating || 1200}</p>
                <p className="text-xs text-gray-400">Chess Rating</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <Trophy className="h-6 w-6 mx-auto mb-2 text-yellow-400" />
                <p className="text-2xl font-bold text-white">{profile.games_won}</p>
                <p className="text-xs text-gray-400">Games Won</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-blue-400" />
                <p className="text-2xl font-bold text-white">{profile.games_played}</p>
                <p className="text-xs text-gray-400">Games Played</p>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-4 text-center">
                <div className="h-6 w-6 mx-auto mb-2 bg-green-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-black">{winRate}%</span>
                </div>
                <p className="text-2xl font-bold text-white">{winRate}%</p>
                <p className="text-xs text-gray-400">Win Rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-gray-300">Member Since</span>
              </div>
              <p className="text-white font-medium">
                {new Date(profile.created_at || '').toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </CardContent>
          </Card>

          {profile.total_earnings && profile.total_earnings > 0 && (
            <Card className="bg-gradient-to-r from-green-900/50 to-emerald-800/50 border-green-500/50">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">💰</span>
                  <span className="text-lg font-bold text-green-300">Total Earnings</span>
                </div>
                <p className="text-2xl font-bold text-white">₹{profile.total_earnings}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
