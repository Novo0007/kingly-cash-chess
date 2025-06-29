
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

  useEffect(() => {
    getCurrentUser();
    
    // Subscribe to real-time reactions
    const channel = supabase
      .channel(`game_reactions_${gameId}`)
      .on('broadcast', { event: 'new_reaction' }, (payload) => {
        const newReaction = payload.payload as GameReaction;
        setReactions(prev => [...prev, newReaction]);
        
        // Remove reaction after 5 seconds
        setTimeout(() => {
          setReactions(prev => prev.filter(r => r.id !== newReaction.id));
        }, 5000);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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

  const sendReaction = async (emoji: string) => {
    if (!currentUser) return;

    const reaction: GameReaction = {
      id: Date.now().toString(),
      emoji,
      user_id: currentUser,
      username: currentUsername,
      timestamp: Date.now()
    };

    // Broadcast reaction to other users
    const channel = supabase.channel(`game_reactions_${gameId}`);
    await channel.send({
      type: 'broadcast',
      event: 'new_reaction',
      payload: reaction
    });

    // Add to local state
    setReactions(prev => [...prev, reaction]);
    setShowEmojiPicker(false);

    // Remove reaction after 5 seconds
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== reaction.id));
    }, 5000);
  };

  return (
    <div className="relative">
      {/* Floating Reactions */}
      <div className="fixed inset-0 pointer-events-none z-40">
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute animate-bounce"
            style={{
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 60 + 20}%`,
              animation: 'fadeInOut 5s ease-in-out forwards',
            }}
          >
            <div className="bg-black/80 text-white px-2 py-1 rounded-lg text-sm flex items-center gap-1 shadow-lg">
              <span className="text-lg">{reaction.emoji}</span>
              <span className="text-xs">{reaction.username}</span>
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
          className="bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 border-2 border-yellow-400 text-white"
        >
          <Smile className="h-4 w-4" />
        </Button>

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <Card className="absolute bottom-full mb-2 right-0 bg-gradient-to-br from-black to-purple-900 border-2 border-yellow-400 shadow-2xl z-50">
            <CardContent className="p-2">
              <div className="grid grid-cols-5 gap-1">
                {AVAILABLE_EMOJIS.map((emoji) => (
                  <Button
                    key={emoji}
                    onClick={() => sendReaction(emoji)}
                    variant="ghost"
                    size="sm"
                    className="text-lg hover:bg-purple-800/50 w-8 h-8 p-0"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          20% { opacity: 1; transform: translateY(-10px) scale(1.1); }
          80% { opacity: 1; transform: translateY(-20px) scale(1); }
          100% { opacity: 0; transform: translateY(-40px) scale(0.8); }
        }
      `}</style>
    </div>
  );
};
