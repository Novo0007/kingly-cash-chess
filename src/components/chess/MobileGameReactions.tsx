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
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const channelRef = useRef<any>(null);
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Cleanup function
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      try {
        supabase.removeChannel(channelRef.current);
      } catch (error) {
        console.log('Channel cleanup error:', error);
      }
      channelRef.current = null;
    }
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setIsConnected(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Get current user
  const getCurrentUser = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return;
      }

      setCurrentUser(user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      setCurrentUsername(profile?.username || `User${user.id.slice(0, 4)}`);
      console.log('User loaded:', profile?.username);
    } catch (error) {
      console.error('Error getting user:', error);
      toast.error('Please log in to use reactions');
    }
  }, []);

  // Setup realtime channel with improved error handling
  const setupRealtimeChannel = useCallback(() => {
    if (!gameId || !currentUser) {
      console.log('Missing gameId or currentUser for reactions channel');
      return;
    }

    // Clean up existing channel
    cleanup();

    console.log(`Setting up reactions channel for game: ${gameId}`);
    
    const channelName = `game-reactions-${gameId}`;
    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: true, ack: true },
          presence: { key: currentUser }
        }
      })
      .on('broadcast', { event: 'new_reaction' }, (payload) => {
        try {
          console.log('Received reaction broadcast:', payload);
          const newReaction = payload.payload as GameReaction;
          
          if (!newReaction?.id || !newReaction?.emoji) {
            console.log('Invalid reaction payload:', newReaction);
            return;
          }
          
          setReactions(prev => {
            // Prevent duplicates
            if (prev.some(r => r.id === newReaction.id)) {
              return prev;
            }
            
            // Add new reaction and keep only recent ones
            const updated = [...prev, newReaction].slice(-8);
            console.log('Updated reactions:', updated.length);
            return updated;
          });
          
          // Auto-remove reaction after 4 seconds
          const timeout = setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
            timeoutRefs.current.delete(timeout);
          }, 4000);
          
          timeoutRefs.current.add(timeout);
        } catch (error) {
          console.error('Error handling reaction broadcast:', error);
        }
      })
      .subscribe(async (status, error) => {
        console.log(`Reactions channel status: ${status}`, error || '');
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setConnectionAttempts(0);
          console.log('Reactions channel connected successfully');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setIsConnected(false);
          
          // Implement exponential backoff for reconnection
          if (connectionAttempts < 5) {
            const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 10000);
            console.log(`Reconnecting reactions channel in ${delay}ms, attempt ${connectionAttempts + 1}`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setConnectionAttempts(prev => prev + 1);
              setupRealtimeChannel();
            }, delay);
          } else {
            console.log('Max reconnection attempts reached for reactions');
            toast.error('Reactions unavailable - please refresh the page');
          }
        }
      });

    channelRef.current = channel;
  }, [gameId, currentUser, connectionAttempts, cleanup]);

  // Initialize
  useEffect(() => {
    getCurrentUser();
  }, [getCurrentUser]);

  useEffect(() => {
    if (currentUser && gameId) {
      setupRealtimeChannel();
    }
  }, [currentUser, gameId, setupRealtimeChannel]);

  // Send reaction with improved error handling
  const sendReaction = useCallback(async (emoji: string) => {
    if (!currentUser || !channelRef.current || !isConnected) {
      toast.error('Reactions unavailable - check connection');
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
      console.log('Sending reaction:', reaction);
      
      const result = await channelRef.current.send({
        type: 'broadcast',
        event: 'new_reaction',
        payload: reaction
      });

      console.log('Reaction send result:', result);

      if (result === 'ok') {
        setShowEmojiPicker(false);
        // Don't show success toast for better UX
      } else {
        throw new Error('Failed to send reaction');
      }
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('Failed to send reaction');
    }
  }, [currentUser, currentUsername, isConnected]);

  return (
    <>
      {/* Floating Reactions - Optimized for mobile */}
      <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
        {reactions.map((reaction, index) => (
          <div
            key={reaction.id}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 60 + 20}%`,
              top: `${Math.random() * 40 + 30}%`,
              animationDuration: '4s',
              animationFillMode: 'forwards',
              animationDelay: `${index * 0.2}s`,
              transform: 'translateZ(0)', // Force hardware acceleration
              willChange: 'transform, opacity'
            }}
          >
            <div className="bg-black/90 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow-lg backdrop-blur-sm border border-white/20">
              <span className="text-base">{reaction.emoji}</span>
              <span className="text-xs font-medium truncate max-w-16">{reaction.username}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile-optimized Emoji Button */}
      <div className="relative">
        <Button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          variant="outline"
          size="sm"
          disabled={!isConnected || !currentUser}
          className={`border-2 text-white shadow-lg w-12 h-12 p-0 transition-all duration-200 touch-manipulation ${
            isConnected && currentUser
              ? "bg-purple-600 hover:bg-purple-700 border-yellow-400 hover:shadow-xl active:scale-95" 
              : "bg-gray-600 border-gray-500 opacity-50 cursor-not-allowed"
          }`}
          title={isConnected && currentUser ? "React" : "Connecting..."}
        >
          <Smile className="h-5 w-5" />
        </Button>

        {showEmojiPicker && isConnected && currentUser && (
          <Card className="absolute bottom-full mb-2 right-0 bg-black/95 backdrop-blur-sm border-yellow-400 shadow-xl z-50 animate-in slide-in-from-bottom-2 duration-200">
            <CardContent className="p-2">
              <div className="grid grid-cols-4 gap-1">
                {AVAILABLE_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    variant="ghost"
                    size="sm"
                    className="text-lg hover:bg-purple-800/50 w-10 h-10 p-0 transition-all duration-150 hover:scale-110 active:scale-95 touch-manipulation"
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
      {!isConnected && currentUser && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-white"></div>
      )}
    </>
  );
};
