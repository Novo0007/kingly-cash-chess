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

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'tournament' | 'challenge' | 'special' | 'community';
  status: 'upcoming' | 'live' | 'ended';
  startDate: Date;
  endDate: Date;
  participants: number;
  maxParticipants: number;
  prizePool: string;
  gameType: string;
  location?: string;
  entryFee: number;
  difficulty: 'easy' | 'medium' | 'hard';
  featured?: boolean;
}

export const EventsSystem: React.FC = () => {
  const { currentTheme } = useTheme();
  const isMobile = useIsMobile();
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'tournament' | 'challenge' | 'special' | 'community'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'live' | 'ended'>('upcoming');

  // Mock events data
  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: '1',
        title: 'Chess Masters Championship',
        description: 'Monthly championship for chess masters with premium rewards',
        type: 'tournament',
        status: 'upcoming',
        startDate: new Date('2024-02-15T18:00:00'),
        endDate: new Date('2024-02-15T22:00:00'),
        participants: 245,
        maxParticipants: 500,
        prizePool: '₹50,000',
        gameType: 'Chess',
        entryFee: 100,
        difficulty: 'hard',
        featured: true
      },
      {
        id: '2',
        title: 'Math Genius Sprint',
        description: 'Speed math challenge for all skill levels',
        type: 'challenge',
        status: 'live',
        startDate: new Date('2024-02-10T10:00:00'),
        endDate: new Date('2024-02-20T23:59:00'),
        participants: 1250,
        maxParticipants: 2000,
        prizePool: '₹25,000',
        gameType: 'Math',
        entryFee: 0,
        difficulty: 'medium',
        featured: true
      },
      {
        id: '3',
        title: 'Word Hunt Arena',
        description: 'Community word search competition with daily prizes',
        type: 'community',
        status: 'upcoming',
        startDate: new Date('2024-02-18T15:00:00'),
        endDate: new Date('2024-02-25T15:00:00'),
        participants: 89,
        maxParticipants: 200,
        prizePool: '₹15,000',
        gameType: 'Word Search',
        entryFee: 50,
        difficulty: 'easy'
      },
      {
        id: '4',
        title: 'Memory Master Challenge',
        description: 'Test your memory skills in this intensive challenge',
        type: 'special',
        status: 'upcoming',
        startDate: new Date('2024-02-22T20:00:00'),
        endDate: new Date('2024-02-22T21:30:00'),
        participants: 156,
        maxParticipants: 300,
        prizePool: '₹20,000',
        gameType: 'Memory',
        entryFee: 75,
        difficulty: 'medium'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter(event => {
    const typeMatch = filter === 'all' || event.type === filter;
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
              const TypeIcon = getTypeIcon(event.type);
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
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{event.participants}/{event.maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-green-600">{event.prizePool}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Gift className="w-4 h-4 text-muted-foreground" />
                        <span>{event.entryFee === 0 ? 'Free' : `₹${event.entryFee}`}</span>
                      </div>
                    </div>

                    <Button className="w-full" disabled={event.status === 'ended'}>
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
            const TypeIcon = getTypeIcon(event.type);
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
                        {formatDate(event.startDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {event.participants}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 font-semibold text-green-600">
                        <Trophy className="w-3 h-3" />
                        {event.prizePool}
                      </span>
                      <span className="flex items-center gap-1">
                        <Gift className="w-3 h-3" />
                        {event.entryFee === 0 ? 'Free' : `₹${event.entryFee}`}
                      </span>
                    </div>
                  </div>

                  <Button size="sm" className="w-full" disabled={event.status === 'ended'}>
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