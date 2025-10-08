import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  content: string;
  sender_name: string;
  sender_role: 'teacher' | 'parent';
  created_at: string;
  is_read: boolean;
  priority: 'low' | 'normal' | 'high';
  message_type: 'general' | 'assignment' | 'behavior' | 'attendance';
}

interface ParentCommunicationProps {
  messages: Message[];
  teachers: Array<{ id: string; name: string; subject: string }>;
  onSendMessage: (message: { recipient_id: string; subject: string; content: string; priority: string; message_type: string }) => void;
}

export const ParentCommunication: React.FC<ParentCommunicationProps> = ({
  messages,
  teachers,
  onSendMessage
}) => {
  const [newMessage, setNewMessage] = useState({
    recipient_id: '',
    subject: '',
    content: '',
    priority: 'normal',
    message_type: 'general'
  });

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'low':
        return <Clock className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-100 text-blue-800';
      case 'behavior':
        return 'bg-yellow-100 text-yellow-800';
      case 'attendance':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSendMessage = () => {
    if (newMessage.recipient_id && newMessage.subject && newMessage.content) {
      onSendMessage(newMessage);
      setNewMessage({
        recipient_id: '',
        subject: '',
        content: '',
        priority: 'normal',
        message_type: 'general'
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
            <span>Recent Messages</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 max-h-96 overflow-y-auto">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div key={message.id} className={`border-l-4 pl-4 py-3 rounded-r-lg ${
                message.is_read ? 'border-gray-300 bg-gray-50' : 'border-blue-500 bg-blue-50'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{message.sender_name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{message.sender_name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {getPriorityIcon(message.priority)}
                    <Badge className={`text-xs ${getMessageTypeColor(message.message_type)}`}>
                      {message.message_type}
                    </Badge>
                  </div>
                </div>
                <h4 className="font-semibold text-sm mb-1">{message.subject}</h4>
                <p className="text-sm text-gray-700">{message.content}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-8">No messages yet</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Send Message to Teacher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="teacher">Select Teacher</Label>
              <Select value={newMessage.recipient_id} onValueChange={(value) => 
                setNewMessage({...newMessage, recipient_id: value})
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Choose teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name} - {teacher.subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="messageType">Message Type</Label>
              <Select value={newMessage.message_type} onValueChange={(value) => 
                setNewMessage({...newMessage, message_type: value})
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="behavior">Behavior</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
              placeholder="Message subject"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message</Label>
            <Textarea
              id="content"
              value={newMessage.content}
              onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
              placeholder="Type your message here..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={newMessage.priority} onValueChange={(value) => 
              setNewMessage({...newMessage, priority: value})
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSendMessage} 
            className="w-full"
            disabled={!newMessage.recipient_id || !newMessage.subject || !newMessage.content}
          >
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};