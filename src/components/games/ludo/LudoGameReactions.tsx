
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Smile } from 'lucide-react';

interface GameReaction {
  id: string;
  emoji: string;
  user_id: string;
  username: string;
  timestamp: number;
}

interface LudoGameReactionsProps {
  gameId: string;
  isMobile?: boolean;
}

const AVAILABLE_EMOJIS = ['😀', '😎', '😮', '😢', '😡', '👍', '👎', '🔥', '💪', '🤔', '🎯', '🎲'];

export const LudoGameReactions: React.FC<LudoGameReactionsProps> = ({ gameId, isMobile = false }) => {
  const [reactions, setReactions] = useState<GameReaction[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  useEffect(() => {
    getCurrentUser();
    setupRealtimeChannel();
    
    return () => {
      cleanup();
    };
  }, [gameId]);

  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    setIsConnected(false);
  }, []);

  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setCurrentUser(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      setCurrentUsername(profile?.username || 'Anonymous');
    } catch (error) {
      console.error('Error getting user:', error);
    }
  }, []);

  const setupRealtimeChannel = useCallback(() => {
    if (channelRef.current) {
      cleanup();
    }

    const channel = supabase
      .channel(`ludo-reactions-${gameId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: currentUser || 'anonymous' }
        }
      })
      .on('broadcast', { event: 'new_reaction' }, (payload) => {
        try {
          const newReaction = payload.payload as GameReaction;
          
          if (!newReaction || !newReaction.id) return;
          
          setReactions(prev => {
            if (prev.some(r => r.id === newReaction.id)) return prev;
            const updated = [...prev, newReaction];
            return isMobile ? updated.slice(-3) : updated.slice(-5);
          });
          
          // Auto-remove after duration
          const timeout = setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
            timeoutRefs.current.delete(timeout);
          }, isMobile ? 3000 : 4000);
          
          timeoutRefs.current.add(timeout);
        } catch (error) {
          console.error('Error handling ludo reaction:', error);
        }
      })
      .subscribe(async (status) => {
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setTimeout(() => {
            if (channelRef.current === channel) {
              setupRealtimeChannel();
            }
          }, 2000);
        }
      });

    channelRef.current = channel;
  }, [gameId, currentUser, isMobile, cleanup]);

  const sendReaction = useCallback(async (emoji: string) => {
    if (!currentUser || !channelRef.current || !isConnected) {
      toast.error('Please wait for connection or log in');
      return;
    }

    const reaction: GameReaction = {
      id: `${currentUser}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      user_id: currentUser,
      username: currentUsername,
      timestamp: Date.now()
    };

    try {
      const result = await channelRef.current.send({
        type: 'broadcast',
        event: 'new_reaction',
        payload: reaction
      });

      if (result === 'ok') {
        setShowEmojiPicker(false);
        toast.success(`${emoji} sent!`);
      } else {
        throw new Error('Failed to send reaction');
      }
    } catch (error) {
      console.error('Error sending ludo reaction:', error);
      toast.error('Failed to send reaction');
    }
  }, [currentUser, currentUsername, isConnected]);

  const buttonClasses = isMobile 
    ? "w-10 h-10 p-0 text-white shadow-lg border-2 transition-all duration-200"
    : "text-white shadow-lg border-2 transition-all duration-200";

  const cardClasses = isMobile
    ? "absolute bottom-full mb-2 right-0 bg-black/95 backdrop-blur-sm border-yellow-400 shadow-xl z-50"
    : "absolute bottom-full mb-2 right-0 bg-gradient-to-br from-black to-purple-900 border-2 border-yellow-400 shadow-2xl z-50";

  return (
    <>
      {/* Floating Reactions */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((reaction, index) => (
          <div
            key={reaction.id}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 50 + 25}%`,
              top: `${Math.random() * 30 + 35}%`,
              animationDuration: isMobile ? '3s' : '4s',
              animationFillMode: 'forwards',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="bg-black/90 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow-lg backdrop-blur-sm border border-white/20">
              <span className={isMobile ? "text-sm" : "text-base"}>{reaction.emoji}</span>
              <span className="text-xs font-medium truncate max-w-12">{reaction.username}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Emoji Button */}
      <div className="relative">
        <Button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          variant="outline"
          size={isMobile ? "sm" : "default"}
          disabled={!isConnected || !currentUser}
          className={`${buttonClasses} ${
            isConnected && currentUser
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 border-yellow-400 hover:shadow-xl" 
              : "bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed"
          }`}
          title={isConnected && currentUser ? "React to Game" : "Connecting..."}
        >
          <Smile className="h-4 w-4" />
        </Button>

        {showEmojiPicker && isConnected && currentUser && (
          <Card className={cardClasses}>
            <CardContent className="p-2">
              <div className={`grid gap-1 ${isMobile ? 'grid-cols-4' : 'grid-cols-6'}`}>
                {AVAILABLE_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    variant="ghost"
                    size="sm"
                    className="text-base hover:bg-purple-800/50 w-8 h-8 p-0 transition-all duration-150 hover:scale-110"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Connection indicator */}
      {!isConnected && (
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </>
  );
};
