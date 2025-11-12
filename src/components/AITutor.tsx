import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, BookOpen, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/lib/supabase';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
}

interface AITutorProps {
  studentProfile?: any;
  subject?: string;
  context?: string;
}

export const AITutor: React.FC<AITutorProps> = ({ 
  studentProfile, 
  subject = 'General', 
  context 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your AI tutor. I'm here to help you learn ${subject}. What would you like to study today?`,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: ['Ask a question', 'Get practice problems', 'Review concepts']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

 const sendMessage = async () => {
  if (!input.trim() || isLoading) return;

  const userMessage: Message = {
    id: Date.now().toString(),
    content: input,
    sender: 'user',
    timestamp: new Date()
  };

  setMessages(prev => [...prev, userMessage]);
  const currentInput = input;
  setInput('');
  setIsLoading(true);

  try {
    // Call Anthropic API directly
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a helpful ${subject} tutor for a ${studentProfile?.grade_level || '4th'} grade student at Literary Genius Academy.

Your teaching approach:
- Be encouraging and patient
- Use age-appropriate language (4th grade level)
- Give concrete examples from daily life
- Ask questions to check understanding
- Guide thinking rather than giving direct answers
- Make learning fun and engaging
- Never just give the answer - help them figure it out

Student question: ${currentInput}

Context: ${context || 'General learning'}

Provide a clear, helpful response that helps the student learn and think critically.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: 'ai',
      timestamp: new Date(),
      suggestions: [
        'Can you explain that differently?',
        'Give me an example',
        'What should I practice next?'
      ]
    };

    setMessages(prev => [...prev, aiMessage]);
  } catch (error: any) {
    console.error('AI Tutor error:', error);
    const errorMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: `Sorry, I encountered an error: ${error.message}. Please make sure the AI API key is configured in Vercel environment variables.`,
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, errorMessage]);
  } finally {
    setIsLoading(false);
  }
};
  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-500" />
          AI Tutor - {subject}
          <Badge variant="secondary" className="ml-auto">
            <Target className="w-3 h-3 mr-1" />
            Personalized
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.sender === 'ai' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {message.sender === 'ai' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className={`p-3 rounded-lg max-w-[80%] ${
                    message.sender === 'ai' 
                      ? 'bg-blue-50 text-blue-900 border border-blue-200' 
                      : 'bg-gray-50 text-gray-900 border border-gray-200 ml-auto'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {message.suggestions && (
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuggestion(suggestion)}
                          className="text-xs h-7"
                        >
                          <Lightbulb className="w-3 h-3 mr-1" />
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-blue-600">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your studies..."
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!input.trim() || isLoading}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};