
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

interface MobileGameReactionsProps {
  gameId: string;
}

const AVAILABLE_EMOJIS = ['😀', '😎', '😮', '😢', '😡', '👍', '👎', '🔥'];

export const MobileGameReactions: React.FC<MobileGameReactionsProps> = ({ gameId }) => {
  const [reactions, setReactions] = useState<GameReaction[]>([]);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
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
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
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
      .channel(`mobile-game-reactions-${gameId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: currentUser || 'anonymous' }
        }
      })
      .on('broadcast', { event: 'new_reaction' }, (payload) => {
        try {
          console.log('Mobile received reaction:', payload);
          const newReaction = payload.payload as GameReaction;
          
          if (!newReaction || !newReaction.id) return;
          
          setReactions(prev => {
            if (prev.some(r => r.id === newReaction.id)) return prev;
            const updated = [...prev, newReaction];
            return updated.slice(-5); // Keep only last 5 reactions for mobile performance
          });
          
          // Auto-remove after 3 seconds for mobile performance
          const timeout = setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
            timeoutRefs.current.delete(timeout);
          }, 3000);
          
          timeoutRefs.current.add(timeout);
        } catch (error) {
          console.error('Error handling mobile reaction:', error);
        }
      })
      .subscribe(async (status) => {
        console.log('Mobile reactions channel status:', status);
        setIsConnected(status === 'SUBSCRIBED');
        
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          // Retry connection after a delay
          if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Retrying mobile reactions connection...');
            setupRealtimeChannel();
          }, 2000);
        }
      });

    channelRef.current = channel;
  }, [gameId, currentUser, cleanup]);

  const sendReaction = useCallback(async (emoji: string) => {
    if (!currentUser || !channelRef.current || !isConnected) {
      toast.error('Please wait for connection or log in');
      return;
    }

    const reaction: GameReaction = {
      id: `mobile_${currentUser}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      emoji,
      user_id: currentUser,
      username: currentUsername,
      timestamp: Date.now()
    };

    try {
      console.log('Sending mobile reaction:', reaction);
      
      const result = await channelRef.current.send({
        type: 'broadcast',
        event: 'new_reaction',
        payload: reaction
      });

      console.log('Mobile reaction send result:', result);

      if (result === 'ok') {
        setShowEmojiPicker(false);
        toast.success(`${emoji} sent!`);
      } else {
        throw new Error('Failed to send reaction');
      }
    } catch (error) {
      console.error('Error sending mobile reaction:', error);
      toast.error('Failed to send reaction');
      // Try to reconnect
      setupRealtimeChannel();
    }
  }, [currentUser, currentUsername, isConnected, setupRealtimeChannel]);

  const handleEmojiButtonClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isConnected || !currentUser) {
      toast.error('Please wait for connection or log in');
      return;
    }
    
    setShowEmojiPicker(!showEmojiPicker);
  }, [isConnected, currentUser, showEmojiPicker]);

  const handleEmojiClick = useCallback((emoji: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sendReaction(emoji);
  }, [sendReaction]);

  return (
    <>
      {/* Floating Reactions - Optimized for mobile */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((reaction, index) => (
          <div
            key={reaction.id}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 50 + 25}%`,
              top: `${Math.random() * 30 + 35}%`,
              animationDuration: '3s',
              animationFillMode: 'forwards',
              animationDelay: `${index * 0.1}s`
            }}
          >
            <div className="bg-black/90 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow-lg backdrop-blur-sm border border-white/20">
              <span className="text-sm">{reaction.emoji}</span>
              <span className="text-xs font-medium truncate max-w-12">{reaction.username}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-optimized Emoji Button */}
      <div className="relative">
        <Button
          onClick={handleEmojiButtonClick}
          onTouchEnd={handleEmojiButtonClick}
          variant="outline"
          size="sm"
          disabled={!isConnected || !currentUser}
          className={`border-2 text-white shadow-lg w-12 h-12 p-0 transition-all duration-200 touch-manipulation ${
            isConnected && currentUser
              ? "bg-purple-600 hover:bg-purple-700 border-yellow-400 hover:shadow-xl active:scale-95" 
              : "bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed"
          }`}
          title={isConnected && currentUser ? "React" : "Connecting..."}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          <Smile className="h-5 w-5" />
        </Button>

        {showEmojiPicker && isConnected && currentUser && (
          <Card className="absolute bottom-full mb-2 right-0 bg-black/95 backdrop-blur-sm border-yellow-400 shadow-xl z-50 animate-scale-in">
            <CardContent className="p-2">
              <div className="grid grid-cols-4 gap-2">
                {AVAILABLE_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={handleEmojiClick(emoji)}
                    onTouchEnd={handleEmojiClick(emoji)}
                    variant="ghost"
                    size="sm"
                    className="text-lg hover:bg-purple-800/50 w-10 h-10 p-0 transition-all duration-150 hover:scale-110 active:scale-95 touch-manipulation"
                    style={{ WebkitTapHighlightColor: 'transparent' }}
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
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      )}
    </>
  );
};
