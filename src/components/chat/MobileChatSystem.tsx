
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Send, Users, X } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  created_at: string;
  game_id?: string;
}

interface MobileChatSystemProps {
  gameId?: string;
  isGlobalChat?: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const MobileChatSystem = ({ gameId, isGlobalChat = false, isOpen, onClose }: MobileChatSystemProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    getCurrentUser();
    fetchMessages();
    
    // Subscribe to new messages
    const channelName = isGlobalChat ? 'global_chat' : `game_chat_${gameId || 'unknown'}`;
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'new_message' }, (payload) => {
        setMessages(prev => [...prev, payload.payload as Message]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, isGlobalChat, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const fetchMessages = async () => {
    const welcomeMessage: Message = {
      id: '1',
      content: isGlobalChat 
        ? 'Welcome to global chat! Chat with players worldwide.' 
        : 'Game started! Good luck!',
      sender_id: 'system',
      sender_username: 'System',
      created_at: new Date().toISOString(),
      game_id: gameId
    };

    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: currentUser,
      sender_username: currentUsername,
      created_at: new Date().toISOString(),
      game_id: gameId
    };

    // Broadcast message to other users
    const channelName = isGlobalChat ? 'global_chat' : `game_chat_${gameId || 'unknown'}`;
    const channel = supabase.channel(channelName);
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message
    });

    // Add to local state
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    scrollToBottom();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="bg-white w-full h-2/3 rounded-t-xl shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{isGlobalChat ? "Global Chat" : "Game Chat"}</h3>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <Users className="h-3 w-3 mr-1" />
              Online
            </Badge>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${
                    message.sender_id === 'system' ? 'text-yellow-600' :
                    message.sender_id === currentUser ? 'text-blue-600' : 'text-gray-700'
                  }`}>
                    {message.sender_username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className={`text-sm p-2 rounded-lg ${
                  message.sender_id === 'system' ? 'bg-yellow-50 text-yellow-800' :
                  message.sender_id === currentUser ? 'bg-blue-50 text-blue-800 ml-4' : 
                  'bg-gray-50 text-gray-800'
                }`}>
                  {message.content}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-3">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-5 h-12"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 h-12"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
