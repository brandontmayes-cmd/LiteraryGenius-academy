import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Reply, Smile } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface GroupChatProps {
  groupId: string;
}

interface ChatMessage {
  id: string;
  message: string;
  message_type: string;
  created_at: string;
  reply_to: string | null;
  user_profiles: {
    display_name: string;
    avatar_url: string;
  };
}

export default function GroupChat({ groupId }: GroupChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (groupId) {
      fetchMessages();
      subscribeToMessages();
    }
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('group_chat_messages')
        .select(`
          *,
          user_profiles(display_name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: true })
        .limit(100);

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`group_chat:${groupId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_chat_messages',
        filter: `group_id=eq.${groupId}`
      }, async (payload) => {
        // Fetch the full message with user profile
        const { data, error } = await supabase
          .from('group_chat_messages')
          .select(`
            *,
            user_profiles(display_name, avatar_url)
          `)
          .eq('id', payload.new.id)
          .single();

        if (!error && data) {
          setMessages(prev => [...prev, data]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'send_chat_message',
          data: {
            groupId,
            userId: user?.id,
            message: newMessage,
            type: 'text',
            replyTo: replyingTo
          }
        }
      });

      if (error) throw error;

      setNewMessage('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading chat...</div>;
  }

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Group Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message) => {
            const isOwnMessage = message.user_profiles && user?.id === message.user_profiles.id;
            const replyMessage = message.reply_to ? 
              messages.find(m => m.id === message.reply_to) : null;

            return (
              <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                  {replyMessage && (
                    <div className="text-xs text-gray-500 mb-1 p-2 bg-gray-100 rounded">
                      Replying to: {replyMessage.message.substring(0, 50)}...
                    </div>
                  )}
                  <div className={`rounded-lg p-3 ${
                    isOwnMessage 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium">
                        {message.user_profiles?.display_name || 'Unknown User'}
                      </span>
                      <span className="text-xs opacity-75">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="mt-1 h-6 text-xs"
                    onClick={() => setReplyingTo(message.id)}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    Reply
                  </Button>
                </div>
                {!isOwnMessage && (
                  <Avatar className="w-8 h-8 order-1 mr-2">
                    <AvatarImage src={message.user_profiles?.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {message.user_profiles?.display_name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        
        {replyingTo && (
          <div className="px-4 py-2 bg-gray-50 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Replying to message...
              </span>
              <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}