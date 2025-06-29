
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageSquare, Send, Users } from "lucide-react";
import { useDeviceType } from "@/hooks/use-mobile";
import type { Tables } from "@/integrations/supabase/types";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_username: string;
  created_at: string;
  game_id?: string;
}

interface ChatSystemProps {
  gameId?: string;
  isGlobalChat?: boolean;
}

export const ChatSystem = ({
  gameId,
  isGlobalChat = false,
}: ChatSystemProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const { isMobile, isTablet } = useDeviceType();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getCurrentUser();
    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${gameId || "global"}`)
      .on("broadcast", { event: "new_message" }, (payload) => {
        setMessages((prev) => [...prev, payload.payload as Message]);
        scrollToBottom();
      })
      .on("broadcast", { event: "typing" }, (payload) => {
        const { user_id, username, isTyping: typing } = payload.payload;
        if (user_id !== currentUser) {
          setIsTyping(typing ? username : null);
          if (typing) {
            // Clear typing indicator after 3 seconds
            setTimeout(() => setIsTyping(null), 3000);
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setCurrentUser(user.id);

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    setCurrentUsername(profile?.username || "Anonymous");
  };

  const fetchMessages = async () => {
    // For now, we'll simulate messages since we don't have a messages table
    // In a real implementation, you'd fetch from a messages table
    const simulatedMessages: Message[] = [
      {
        id: "1",
        content: isGlobalChat ? "Welcome to ChessCash! Good luck in your games!" : "Game started! Good luck!",
        sender_id: "system",
        sender_username: "System",
        created_at: new Date().toISOString(),
        game_id: gameId,
      },
    ];

    if (!isGlobalChat && gameId) {
      simulatedMessages.push({
        id: "2",
        content: "May the best player win! 🏆",
        sender_id: "system",
        sender_username: "Game System",
        created_at: new Date().toISOString(),
        game_id: gameId,
      });
    }

    setMessages(simulatedMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      sender_id: currentUser,
      sender_username: currentUsername,
      created_at: new Date().toISOString(),
      game_id: gameId,
    };

    // Stop typing indicator
    await sendTypingIndicator(false);

    // Broadcast message to other users
    const channel = supabase.channel(`chat_${gameId || "global"}`);
    await channel.send({
      type: "broadcast",
      event: "new_message",
      payload: message,
    });

    // Add to local state
    setMessages((prev) => [...prev, message]);
    setNewMessage("");
    scrollToBottom();
  };

  const sendTypingIndicator = async (typing: boolean) => {
    if (!currentUser) return;

    const channel = supabase.channel(`chat_${gameId || "global"}`);
    await channel.send({
      type: "broadcast",
      event: "typing",
      payload: {
        user_id: currentUser,
        username: currentUsername,
        isTyping: typing,
      },
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    // Send typing indicator
    sendTypingIndicator(true);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingIndicator(false);
    }, 1000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Hide chat system on mobile devices when it's game chat
  if (isMobile && !isGlobalChat) {
    return null;
  }

  return (
    <Card className="bg-black/50 border-blue-500/20 h-96">
      <CardHeader className="pb-3">
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          {isGlobalChat ? "Global Chat" : "Game Chat"}
          <Badge
            variant="outline"
            className="ml-auto text-green-400 border-green-400"
          >
            <Users className="h-3 w-3 mr-1" />
            Online
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-80">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      message.sender_id === "system"
                        ? "text-yellow-400"
                        : message.sender_id === currentUser
                          ? "text-blue-400"
                          : "text-gray-300"
                    }`}
                  >
                    {message.sender_username}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(message.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={`text-sm p-2 rounded-lg ${
                    message.sender_id === "system"
                      ? "bg-yellow-500/10 text-yellow-300"
                      : message.sender_id === currentUser
                        ? "bg-blue-500/20 text-white ml-4"
                        : "bg-gray-700/50 text-gray-300"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="text-xs text-gray-400 italic">
                {isTyping} is typing...
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-gray-700 p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              className="bg-gray-800/50 border-gray-600 text-white flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
