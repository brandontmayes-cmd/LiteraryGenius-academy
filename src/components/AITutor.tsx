import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, BookOpen, Target, Camera, X, Image as ImageIcon, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  suggestions?: string[];
  imageUrl?: string; // For displaying uploaded images
  imageData?: string; // For sending to API (base64)
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechSynthesis, setSpeechSynthesis] = useState<SpeechSynthesis | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize speech recognition (voice input)
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        
        // iOS Safari optimization: Use simpler, more reliable settings
        recognitionInstance.continuous = false; // Single utterance mode for iOS
        recognitionInstance.interimResults = false; // Final results only
        recognitionInstance.lang = 'en-US';
        recognitionInstance.maxAlternatives = 1;

        recognitionInstance.onstart = () => {
          console.log('Speech recognition started');
          setIsListening(true);
        };

        recognitionInstance.onresult = (event: any) => {
          console.log('Speech recognition result');
          const transcript = event.results[0][0].transcript;
          setInput(prev => {
            const newText = prev ? prev + ' ' + transcript : transcript;
            return newText.trim();
          });
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            alert('🎤 Microphone Permission Needed\n\nTo use voice input:\n1. Go to iPhone Settings\n2. Scroll to Safari\n3. Enable Microphone\n4. Come back and try again!');
          } else if (event.error === 'no-speech') {
            // User didn't speak - don't show error, just stop
            console.log('No speech detected');
          } else if (event.error === 'aborted') {
            // User cancelled - no error needed
            console.log('Speech recognition aborted');
          } else {
            alert(`Voice input error: ${event.error}. Please try again.`);
          }
        };

        recognitionInstance.onend = () => {
          console.log('Speech recognition ended');
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }

      // Initialize speech synthesis (text-to-speech)
      if (window.speechSynthesis) {
        setSpeechSynthesis(window.speechSynthesis);
        
        // Load voices (needed for iOS)
        window.speechSynthesis.onvoiceschanged = () => {
          window.speechSynthesis.getVoices();
        };
      }
    }
  }, []);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Convert to base64 for API
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data:image/...;base64, prefix
      const base64Data = base64String.split(',')[1];
      setSelectedImage(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleVoiceInput = () => {
    if (!recognition) {
      alert('Voice input is not supported in your browser. Please try Chrome or Safari.');
      return;
    }

    if (isListening) {
      // Stop listening
      try {
        recognition.stop();
      } catch (e) {
        console.error('Error stopping recognition:', e);
      }
      setIsListening(false);
    } else {
      // Start listening
      try {
        recognition.start();
        // Don't set isListening here - let onstart event handle it
      } catch (e) {
        console.error('Error starting recognition:', e);
        alert('Could not start voice input. Please try again.');
      }
    }
  };

  const speakText = (text: string, messageId: string) => {
    if (!speechSynthesis) {
      alert('Text-to-speech is not supported in your browser.');
      return;
    }

    // If already speaking this message, stop it
    if (speakingMessageId === messageId) {
      speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    // Stop any current speech
    speechSynthesis.cancel();

    // Remove emojis from text before speaking
    const textWithoutEmojis = text.replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
      .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Symbols & Pictographs
      .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport & Map
      .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
      .replace(/[\u{2600}-\u{26FF}]/gu, '') // Misc symbols
      .replace(/[\u{2700}-\u{27BF}]/gu, '') // Dingbats
      .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols
      .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Extended symbols
      .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // More symbols
      .replace(/[\u{FE00}-\u{FE0F}]/gu, '') // Variation selectors
      .replace(/[\u{200D}]/gu, '') // Zero-width joiner
      .replace(/\s+/g, ' ') // Clean up extra spaces
      .trim();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(textWithoutEmojis);
    utterance.rate = 0.9; // Slightly slower for kids
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Get a kid-friendly voice if available
    const voices = speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Samantha') ||
      voice.name.includes('Karen')
    );
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setSpeakingMessageId(null);
    };

    setSpeakingMessageId(messageId);
    speechSynthesis.speak(utterance);
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || 'Can you help me understand this?',
      sender: 'user',
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
      imageData: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    const currentImage = selectedImage;
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsLoading(true);

    try {
      // Build conversation history for Claude
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Prepare the new message content
      const messageContent: any = {
        role: 'user',
        content: []
      };

      // Add image if present
      if (currentImage) {
        messageContent.content.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg', // or detect from file
            data: currentImage
          }
        });
      }

      // Add text
      messageContent.content.push({
        type: 'text',
        text: currentInput || 'Can you help me understand this problem? Please explain it step by step.'
      });

      conversationHistory.push(messageContent);

      // Call OUR secure API route with full conversation history
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory,
          subject: subject,
          gradeLevel: studentProfile?.grade_level || '4',
          context: context || 'General learning'
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.response;

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
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
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
                    {message.imageUrl && (
                      <div className="mb-2">
                        <img 
                          src={message.imageUrl} 
                          alt="Uploaded homework" 
                          className="max-w-full rounded border border-gray-300"
                          style={{ maxHeight: '300px' }}
                        />
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {/* Speaker button for AI messages */}
                    {message.sender === 'ai' && (
                      <div className="mt-2 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(message.content, message.id)}
                          className="h-7 text-xs"
                        >
                          {speakingMessageId === message.id ? (
                            <>
                              <VolumeX className="w-3 h-3 mr-1" />
                              Stop
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3 h-3 mr-1" />
                              Listen
                            </>
                          )}
                        </Button>
                      </div>
                    )}
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
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-32 rounded border border-gray-300"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Listening indicator */}
          {isListening && (
            <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
                <span className="font-medium">🎤 Listening... Speak now!</span>
              </div>
              <div className="text-xs text-red-500 mt-1">
                Speak your question clearly. It will stop automatically when you're done.
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            {/* Camera/Upload button */}
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Upload homework photo"
            >
              <Camera className="w-4 h-4" />
            </Button>
            
            {/* Microphone button */}
            <Button
              type="button"
              variant={isListening ? "default" : "outline"}
              size="icon"
              onClick={toggleVoiceInput}
              disabled={isLoading}
              title="Voice input"
              className={isListening ? "bg-red-500 hover:bg-red-600" : ""}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedImage ? "Describe what you need help with..." : isListening ? "Listening..." : "Ask me anything about your studies..."}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={sendMessage} 
              disabled={(!input.trim() && !selectedImage) || isLoading}
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
