
import React, { useState, useEffect } from 'react';
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
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    getCurrentUser();
    setupRealtimeChannel();
    
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [gameId]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUser(user.id);

    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    setCurrentUsername(profile?.username || 'Anonymous');
  };

  const setupRealtimeChannel = () => {
    const gameChannel = supabase
      .channel(`game-reactions-${gameId}`)
      .on('broadcast', { event: 'reaction' }, (payload) => {
        console.log('Received reaction broadcast:', payload);
        const newReaction = payload.payload as GameReaction;
        
        setReactions(prev => {
          // Avoid duplicates
          if (prev.some(r => r.id === newReaction.id)) {
            return prev;
          }
          return [...prev, newReaction];
        });
        
        // Remove reaction after 5 seconds
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 5000);
      })
      .subscribe(async (status) => {
        console.log('Game reactions channel status:', status);
      });
    
    setChannel(gameChannel);
  };

  const sendReaction = async (emoji: string) => {
    if (!currentUser || !channel) {
      toast.error('Please log in to send reactions');
      return;
    }

    const reaction: GameReaction = {
      id: `${currentUser}_${Date.now()}_${Math.random()}`,
      emoji,
      user_id: currentUser,
      username: currentUsername,
      timestamp: Date.now()
    };

    console.log('Sending reaction:', reaction);

    try {
      // Send the reaction via broadcast
      const result = await channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: reaction
      });

      console.log('Reaction broadcast result:', result);

      // Add to local state immediately for the sender
      setReactions(prev => {
        if (prev.some(r => r.id === reaction.id)) {
          return prev;
        }
        return [...prev, reaction];
      });
      
      setShowEmojiPicker(false);

      // Remove reaction after 5 seconds
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 5000);
      
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('Failed to send reaction');
    }
  };

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
            className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-2 border-yellow-400 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            title="Send Emoji Reaction"
          >
            <Smile className="h-4 w-4" />
          </Button>

          {/* Emoji Picker */}
          {showEmojiPicker && (
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
