
import React, { useState, useEffect, useCallback } from 'react';
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

  useEffect(() => {
    getCurrentUser();
    
    const channel = supabase
      .channel(`mobile-reactions-${gameId}`)
      .on('broadcast', { event: 'reaction' }, (payload) => {
        const newReaction = payload.payload as GameReaction;
        
        setReactions(prev => {
          if (prev.some(r => r.id === newReaction.id)) return prev;
          const updated = [...prev, newReaction];
          return updated.slice(-3); // Keep only last 3 reactions for performance
        });
        
        // Auto-remove after 3 seconds for mobile performance
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 3000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

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

  const sendReaction = useCallback(async (emoji: string) => {
    if (!currentUser) {
      toast.error('Please log in to send reactions');
      return;
    }

    const reaction: GameReaction = {
      id: `${currentUser}_${Date.now()}`,
      emoji,
      user_id: currentUser,
      username: currentUsername,
      timestamp: Date.now()
    };

    try {
      const channel = supabase.channel(`mobile-reactions-${gameId}`);
      await channel.send({
        type: 'broadcast',
        event: 'reaction',
        payload: reaction
      });

      // Add locally for immediate feedback
      setReactions(prev => [...prev.slice(-2), reaction]);
      setShowEmojiPicker(false);
      
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 3000);
      
    } catch (error) {
      console.error('Error sending reaction:', error);
      toast.error('Failed to send reaction');
    }
  }, [currentUser, currentUsername, gameId]);

  return (
    <>
      {/* Floating Reactions - Optimized for mobile */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 60 + 20}%`,
              top: `${Math.random() * 40 + 30}%`,
              animationDuration: '3s',
              animationFillMode: 'forwards'
            }}
          >
            <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-xs flex items-center gap-1 shadow-lg">
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
          className="bg-purple-600 hover:bg-purple-700 border-yellow-400 text-white shadow-lg w-10 h-10 p-0"
          title="React"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {showEmojiPicker && (
          <Card className="absolute bottom-full mb-2 right-0 bg-black border-yellow-400 shadow-xl z-50">
            <CardContent className="p-1">
              <div className="grid grid-cols-4 gap-1">
                {AVAILABLE_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    variant="ghost"
                    size="sm"
                    className="text-base hover:bg-purple-800/50 w-8 h-8 p-0"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};
