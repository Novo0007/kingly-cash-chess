import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Trophy, 
  Users, 
  Clock, 
  Gift, 
  Star,
  MapPin,
  ArrowRight,
  Filter,
  Search
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { SplitText } from '@/components/ui/split-text';
import { GlassSurface } from '@/components/ui/glass-surface';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type EventRow = Database['public']['Tables']['events']['Row'];
type EventParticipantRow = Database['public']['Tables']['event_participants']['Row'];
type EventRewardRow = Database['public']['Tables']['event_rewards']['Row'];

interface Event extends EventRow {
  current_participants?: number;
}

export const EventsSystem: React.FC = () => {
  const { currentTheme } = useTheme();
  const isMobile = useIsMobile();
  const [events, setEvents] = useState<Event[]>([]);
  const [userRewards, setUserRewards] = useState<EventRewardRow[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [filter, setFilter] = useState<'all' | 'tournament' | 'challenge' | 'special' | 'community'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'ended'>('upcoming');
  const [loading, setLoading] = useState(true);

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user);
        // Get user profile for username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .maybeSingle();
        setCurrentUser({ ...session.user, username: profile?.username });
      }
    };
    getCurrentUser();
  }, []);

  // Fetch events and user rewards
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch events with participant counts
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            event_participants(count)
          `)
          .order('start_date', { ascending: true });

        if (eventsError) throw eventsError;

        // Transform data to include participant counts
        const eventsWithCounts = eventsData?.map(event => ({
          ...event,
          current_participants: event.event_participants?.[0]?.count || 0
        })) || [];

        setEvents(eventsWithCounts);

        // Fetch user rewards if logged in
        if (currentUser?.id) {
          const { data: rewardsData, error: rewardsError } = await supabase
            .from('event_rewards')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('claimed', false);

          if (!rewardsError) {
            setUserRewards(rewardsData || []);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id]);

  const handleJoinEvent = async (eventId: string) => {
    if (!currentUser) {
      toast.error('Please login to join events');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('join_event', {
        event_id_param: eventId,
        user_id_param: currentUser.id,
        username_param: currentUser.username || 'Anonymous'
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; entry_fee_paid?: number };

      if (result.success) {
        toast.success(`Successfully joined event! ${result.entry_fee_paid > 0 ? `Entry fee: ₹${result.entry_fee_paid}` : ''}`);
        // Refresh events data
        window.location.reload();
      } else {
        toast.error(result.error || 'Failed to join event');
      }
    } catch (error) {
      console.error('Error joining event:', error);
      toast.error('Failed to join event');
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase.rpc('claim_event_reward', {
        reward_id_param: rewardId,
        user_id_param: currentUser.id
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; amount_claimed?: number };

      if (result.success) {
        toast.success(`Reward claimed! ₹${result.amount_claimed} added to your wallet`);
        // Remove from unclaimed rewards
        setUserRewards(prev => prev.filter(r => r.id !== rewardId));
      } else {
        toast.error(result.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Failed to claim reward');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading events...</p>
        </div>
      </div>
    );
  }

  const filteredEvents = events.filter(event => {
    const typeMatch = filter === 'all' || event.event_type === filter;
    const statusMatch = statusFilter === 'all' || event.status === statusFilter;
    return typeMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return 'bg-green-500 text-white';
      case 'upcoming': return 'bg-blue-500 text-white';
      case 'ended': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tournament': return Trophy;
      case 'challenge': return Star;
      case 'special': return Gift;
      case 'community': return Users;
      default: return Calendar;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${currentTheme.gradients.primary} rounded-2xl flex items-center justify-center shadow-lg`}>
          <Calendar className="w-8 h-8 text-white" />
        </div>
        
        <SplitText
          text="Events & Tournaments"
          animation="slide"
          direction="up"
          stagger={50}
          splitBy="word"
          trigger={true}
          className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold bg-gradient-to-r ${currentTheme.gradients.accent} bg-clip-text text-transparent`}
        />
        
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join exciting tournaments, challenges, and community events to win amazing prizes
        </p>
      </div>

      {/* Unclaimed Rewards */}
      {userRewards.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-500" />
            Unclaimed Rewards
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userRewards.map((reward) => (
              <Card key={reward.id} className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Rank #{reward.rank} Reward</p>
                      <p className="text-2xl font-bold text-green-600">₹{reward.reward_amount}</p>
                    </div>
                    <Button onClick={() => handleClaimReward(reward.id)} className="bg-green-600 hover:bg-green-700">
                      Claim Reward
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <GlassSurface className="p-4 rounded-xl" blur="md" opacity={0.1}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'tournament', 'challenge', 'special', 'community'] as const).map((type) => (
              <Button
                key={type}
                onClick={() => setFilter(type)}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                className={`capitalize ${filter === type ? `bg-gradient-to-r ${currentTheme.gradients.primary} text-white` : ''}`}
              >
                {type === 'all' ? 'All Events' : type}
              </Button>
            ))}
          </div>
          
          {/* Status Filter */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'upcoming', 'live', 'ended'] as const).map((status) => (
              <Button
                key={status}
                onClick={() => setStatusFilter(status)}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                className={`capitalize ${statusFilter === status ? 'bg-secondary text-secondary-foreground' : ''}`}
              >
                {status === 'all' ? 'All Status' : status}
              </Button>
            ))}
          </div>
        </div>
      </GlassSurface>

      {/* Featured Events */}
      {filteredEvents.some(event => event.featured) && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Featured Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredEvents.filter(event => event.featured).map((event) => {
              const TypeIcon = getTypeIcon(event.event_type);
              const startDate = new Date(event.start_date);
              const endDate = new Date(event.end_date);
              const prizePool = event.prize_pool > 0 ? `₹${event.prize_pool}` : 'Free';
              
              return (
                <Card key={event.id} className="overflow-hidden border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <TypeIcon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          <Badge className={`${getStatusColor(event.status)} text-xs`}>
                            {event.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDate(startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.current_participants}/{event.max_participants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-green-600">{prizePool}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gift className="w-4 h-4 text-muted-foreground" />
                        <span>{event.entry_fee === 0 ? 'Free' : `₹${event.entry_fee}`}</span>
                      </div>
                    </div>

                    <Button className="w-full" disabled={event.status === 'ended'} onClick={() => handleJoinEvent(event.id)}>
                      {event.status === 'live' ? 'Join Now' : event.status === 'upcoming' ? 'Register' : 'View Results'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Events */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">
          {filter === 'all' ? 'All Events' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Events`}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.filter(event => !event.featured).map((event) => {
            const TypeIcon = getTypeIcon(event.event_type);
            const startDate = new Date(event.start_date);
            const prizePool = event.prize_pool > 0 ? `₹${event.prize_pool}` : 'Free';
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <TypeIcon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{event.title}</CardTitle>
                        <Badge className={`${getStatusColor(event.status)} text-xs`}>
                          {event.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.current_participants}/{event.max_participants}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold text-green-600">
                        <Trophy className="w-3 h-3" />
                        {prizePool}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {event.entry_fee === 0 ? 'Free' : `₹${event.entry_fee}`}
                      </span>
                    </div>
                  </div>

                  <Button size="sm" className="w-full" disabled={event.status === 'ended'} onClick={() => handleJoinEvent(event.id)}>
                    {event.status === 'live' ? 'Join' : event.status === 'upcoming' ? 'Register' : 'Results'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Events Found</h3>
            <p className="text-muted-foreground">No events match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );
};