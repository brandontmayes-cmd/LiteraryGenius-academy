import React, { useState } from 'react';
import { X, Sparkles, Lightbulb, ThumbsUp, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';

interface WritingAssistantProps {
  pageText: string;
  gradeLevel: number;
  onClose: () => void;
}

export const WritingAssistant: React.FC<WritingAssistantProps> = ({
  pageText,
  gradeLevel,
  onClose
}) => {
  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);

  // Get AI feedback
  const getFeedback = async (customPrompt?: string) => {
    setLoading(true);
    
    try {
      // Determine age range based on grade
      const ageRange = gradeLevel === 3 ? '8-9' : gradeLevel === 4 ? '9-10' : '10-11';
      
      const systemPrompt = `You are a friendly writing coach for a ${gradeLevel}th grade student (ages ${ageRange}). 

Your job is to help them improve their creative writing in an encouraging, age-appropriate way.

RULES:
1. Always start with specific praise about what they did well
2. Give no more than 3 suggestions at a time
3. Use simple language and examples
4. Focus on ONE skill at a time (show don't tell, dialogue, sensory details, etc.)
5. Ask questions to help them think, don't rewrite for them
6. Use emojis sparingly (1-2 per response) to keep it friendly
7. Be enthusiastic but not patronizing
8. Encourage their creativity - never say their ideas are wrong
9. If they ask for help with plot, ask guiding questions rather than giving answers

GRADE-SPECIFIC FOCUS:
${gradeLevel === 3 ? '- Focus on: Sensory details, simple sentence variety, spelling help, describing feelings' :
  gradeLevel === 4 ? '- Focus on: Dialogue punctuation, paragraph breaks, character feelings, stronger verbs' :
  '- Focus on: Plot development, character motivation, showing vs telling, pacing'}

Current page they're working on:
"""
${pageText || '(Empty page - they haven\'t written anything yet)'}
"""

${customPrompt ? `Student's question: "${customPrompt}"` : 'Give them 2-3 helpful, encouraging suggestions to improve this page.'}`;

      // Call Anthropic API directly (same as AITutor does)
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: systemPrompt
            }
          ],
        })
      });

      const data = await response.json();
      
      // Extract text from response
      const feedbackText = data.content
        .map((item: any) => (item.type === "text" ? item.text : ""))
        .filter(Boolean)
        .join("\n");
      
      setFeedback(feedbackText);
      
    } catch (error) {
      console.error('Error getting feedback:', error);
      setFeedback('Oops! I had trouble connecting. Please try again!');
    } finally {
      setLoading(false);
    }
  };

  // Handle custom question
  const askQuestion = () => {
    if (customQuestion.trim()) {
      getFeedback(customQuestion);
      setCustomQuestion('');
      setShowQuestionInput(false);
    }
  };

  // Auto-get feedback on mount if there's text
  React.useEffect(() => {
    if (pageText && pageText.trim().length > 0) {
      getFeedback();
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] flex flex-col">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Writing Coach
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden flex flex-col pt-4">
          {/* Loading State */}
          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin mb-4" />
              <p className="text-sm text-gray-600">Reading your story...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && !feedback && pageText.trim().length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="bg-purple-100 p-4 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Write something first!</h3>
              <p className="text-sm text-gray-600 mb-6 max-w-md">
                Once you've written some text on your page, click "Get Writing Help" 
                and I'll give you suggestions to make it even better!
              </p>
              <Button onClick={onClose} variant="outline">
                Got it!
              </Button>
            </div>
          )}

          {/* Feedback Display */}
          {!loading && feedback && (
            <>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {/* Feedback content */}
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap">{feedback}</div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => getFeedback()}
                      className="text-xs"
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      Get More Ideas
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowQuestionInput(!showQuestionInput)}
                      className="text-xs"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Ask a Question
                    </Button>
                  </div>

                  {/* Custom Question Input */}
                  {showQuestionInput && (
                    <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                      <label className="text-sm font-medium">Ask me anything about your story:</label>
                      <Textarea
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Example: How can I make my character more interesting? What should happen next?"
                        className="resize-none"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={askQuestion}
                          disabled={!customQuestion.trim()}
                        >
                          Ask
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setShowQuestionInput(false);
                            setCustomQuestion('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Example Questions */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Need help? Try asking:
                    </h4>
                    <div className="space-y-2">
                      {[
                        "How can I describe this better?",
                        "What should happen next in my story?",
                        "How can I show my character's feelings?",
                        "Is my dialogue written correctly?"
                      ].map((question, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCustomQuestion(question);
                            setShowQuestionInput(true);
                          }}
                          className="block w-full text-left text-xs text-gray-600 hover:text-purple-600 hover:bg-white p-2 rounded transition-colors"
                        >
                          → {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              {/* Bottom Actions */}
              <div className="border-t pt-4 mt-4">
                <Button onClick={onClose} className="w-full">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Got it! Back to Writing
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
