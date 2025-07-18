
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

interface GameReactionsProps {
  gameId: string;
}

const AVAILABLE_EMOJIS = ['😀', '😎', '😮', '😢', '😡', '👍', '👎', '🔥', '💪', '🤔'];

export const GameReactions: React.FC<GameReactionsProps> = ({ gameId }) => {
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
      .channel(`game-reactions-${gameId}`, {
        config: {
          broadcast: { self: true },
          presence: { key: currentUser || 'anonymous' }
        }
      })
      .on('broadcast', { event: 'new_reaction' }, (payload) => {
        try {
          console.log('Received reaction:', payload);
          const newReaction = payload.payload as GameReaction;
          
          if (!newReaction || !newReaction.id) return;
          
          setReactions(prev => {
            if (prev.some(r => r.id === newReaction.id)) return prev;
            return [...prev, newReaction];
          });
          
          // Remove reaction after 5 seconds
          const timeout = setTimeout(() => {
            setReactions(prev => prev.filter(r => r.id !== newReaction.id));
            timeoutRefs.current.delete(timeout);
          }, 5000);
          
          timeoutRefs.current.add(timeout);
        } catch (error) {
          console.error('Error handling reaction:', error);
        }
      })
      .subscribe(async (status) => {
        console.log('Game reactions channel status:', status);
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
  }, [gameId, currentUser, cleanup]);

  const sendReaction = useCallback(async (emoji: string) => {
    if (!currentUser || !channelRef.current || !isConnected) {
      toast.error('Please log in and wait for connection');
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

      console.log('Reaction broadcast result:', result);

      if (result === 'ok') {
        setShowEmojiPicker(false);
        toast.success(`${emoji} sent!`);
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
      <style>
        {`
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(20px) scale(0.8); }
            20% { opacity: 1; transform: translateY(-10px) scale(1.1); }
            80% { opacity: 1; transform: translateY(-20px) scale(1); }
            100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
          }
          .reaction-animation {
            animation: fadeInOut 5s ease-in-out forwards;
          }
        `}
      </style>
      
      <div className="relative">
        {/* Floating Reactions */}
        <div className="fixed inset-0 pointer-events-none z-40">
          {reactions.map((reaction) => (
            <div
              key={reaction.id}
              className="absolute reaction-animation"
              style={{
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 60 + 20}%`,
              }}
            >
              <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1 shadow-lg backdrop-blur-sm">
                <span className="text-lg">{reaction.emoji}</span>
                <span className="text-xs font-medium">{reaction.username}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Emoji Picker Button */}
        <div className="relative">
          <Button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            variant="outline"
            size="sm"
            disabled={!isConnected || !currentUser}
            className={`transition-all duration-200 ${
              isConnected && currentUser
                ? "bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-2 border-yellow-400 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-600 border-gray-500 text-gray-300 opacity-50 cursor-not-allowed"
            }`}
            title={isConnected && currentUser ? "Send Emoji Reaction" : "Login required"}
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          {!isConnected && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          )}

          {/* Emoji Picker */}
          {showEmojiPicker && isConnected && currentUser && (
            <Card className="absolute bottom-full mb-2 right-0 bg-gradient-to-br from-black to-purple-900 border-2 border-yellow-400 shadow-2xl z-50 animate-scale-in">
              <CardContent className="p-2">
                <div className="grid grid-cols-5 gap-1">
                  {AVAILABLE_EMOJIS.map((emoji) => (
                    <Button
                      key={emoji}
                      onClick={() => sendReaction(emoji)}
                      variant="ghost"
                      size="sm"
                      className="text-lg hover:bg-purple-800/50 w-8 h-8 p-0 transition-all duration-150 hover:scale-110"
                      title={`Send ${emoji}`}
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};
