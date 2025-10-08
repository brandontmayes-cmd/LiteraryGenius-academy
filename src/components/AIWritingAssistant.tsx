import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WritingProgressTracker } from './WritingProgressTracker';
import { 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb, 
  Target, 
  Clock, 
  BookOpen,
  Zap,
  TrendingUp,
  BarChart3
} from 'lucide-react';

interface WritingFeedback {
  grammar: {
    errors: Array<{
      text: string;
      suggestion: string;
      position: number;
      type: string;
    }>;
    score: number;
  };
  style: {
    suggestions: Array<{
      text: string;
      suggestion: string;
      category: string;
    }>;
    readabilityScore: number;
  };
  plagiarism: {
    score: number;
    matches: Array<{
      text: string;
      source: string;
      similarity: number;
    }>;
  };
  requirements: {
    wordCount: number;
    targetWordCount: number;
    structure: string[];
    completedRequirements: string[];
  };
}

export const AIWritingAssistant: React.FC = () => {
  const [text, setText] = useState('');
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [writingLevel, setWritingLevel] = useState('intermediate');

  const analyzeText = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockFeedback: WritingFeedback = {
        grammar: {
          errors: [
            {
              text: "it's",
              suggestion: "its",
              position: 45,
              type: "possessive"
            },
            {
              text: "there",
              suggestion: "their",
              position: 120,
              type: "pronoun"
            }
          ],
          score: 85
        },
        style: {
          suggestions: [
            {
              text: "very good",
              suggestion: "excellent",
              category: "word choice"
            },
            {
              text: "The sentence is too long",
              suggestion: "Consider breaking into shorter sentences",
              category: "sentence structure"
            }
          ],
          readabilityScore: 78
        },
        plagiarism: {
          score: 95,
          matches: [
            {
              text: "Education is the key to success",
              source: "Common phrase",
              similarity: 15
            }
          ]
        },
        requirements: {
          wordCount: text.split(' ').length,
          targetWordCount: 500,
          structure: ['Introduction', 'Body Paragraphs', 'Conclusion'],
          completedRequirements: ['Introduction', 'Body Paragraphs']
        }
      };
      
      setFeedback(mockFeedback);
      setIsAnalyzing(false);
    }, 2000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (text.length > 50) {
        analyzeText();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [text]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Tabs defaultValue="assistant" className="space-y-6">
      <TabsList>
        <TabsTrigger value="assistant">Writing Assistant</TabsTrigger>
        <TabsTrigger value="progress">Progress Tracker</TabsTrigger>
      </TabsList>

      <TabsContent value="assistant">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Writing Assistant</h1>
              <p className="text-gray-600">Improve your writing with AI-powered feedback</p>
            </div>
            <div className="flex items-center space-x-4">
              <select 
                value={writingLevel}
                onChange={(e) => setWritingLevel(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <Badge variant="outline">Level: {writingLevel}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Writing Area */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Your Writing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Start writing your essay or creative piece here..."
                  className="min-h-96 resize-none"
                />
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-500">
                    Words: {text.split(' ').filter(word => word.length > 0).length}
                  </span>
                  <Button 
                    onClick={analyzeText} 
                    disabled={isAnalyzing || !text.trim()}
                    className="flex items-center space-x-2"
                  >
                    <Zap className="h-4 w-4" />
                    <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feedback Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Writing Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!feedback ? (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">Start writing to get AI-powered feedback</p>
                  </div>
                ) : (
                  <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">Overview</TabsTrigger>
                      <TabsTrigger value="grammar">Grammar</TabsTrigger>
                      <TabsTrigger value="style">Style</TabsTrigger>
                      <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className={`text-2xl font-bold ${getScoreColor(feedback.grammar.score)}`}>
                            {feedback.grammar.score}%
                          </div>
                          <div className="text-sm text-gray-600">Grammar</div>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <div className={`text-2xl font-bold ${getScoreColor(feedback.style.readabilityScore)}`}>
                            {feedback.style.readabilityScore}%
                          </div>
                          <div className="text-sm text-gray-600">Readability</div>
                        </div>
                      </div>
                      
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Plagiarism Score: {feedback.plagiarism.score}% Original
                        </AlertDescription>
                      </Alert>

                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Word Count Progress</span>
                          <span>{feedback.requirements.wordCount}/{feedback.requirements.targetWordCount}</span>
                        </div>
                        <Progress 
                          value={(feedback.requirements.wordCount / feedback.requirements.targetWordCount) * 100} 
                          className="w-full"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="grammar" className="space-y-3">
                      {feedback.grammar.errors.length === 0 ? (
                        <div className="text-center py-8">
                          <CheckCircle className="h-8 w-8 mx-auto text-green-600 mb-2" />
                          <p className="text-green-600">No grammar errors found!</p>
                        </div>
                      ) : (
                        feedback.grammar.errors.map((error, index) => (
                          <Alert key={index}>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium text-red-600">"{error.text}"</span>
                                  <span className="mx-2">→</span>
                                  <span className="font-medium text-green-600">"{error.suggestion}"</span>
                                  <div className="text-sm text-gray-500 mt-1">
                                    Type: {error.type}
                                  </div>
                                </div>
                                <Button size="sm" variant="outline">Fix</Button>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))
                      )}
                    </TabsContent>

                    <TabsContent value="style" className="space-y-3">
                      {feedback.style.suggestions.map((suggestion, index) => (
                        <Alert key={index}>
                          <Lightbulb className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-2">
                              <div className="font-medium">{suggestion.category}</div>
                              <div className="text-sm">{suggestion.suggestion}</div>
                              <Badge variant="secondary" className="text-xs">
                                {suggestion.category}
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))}
                    </TabsContent>

                    <TabsContent value="requirements" className="space-y-3">
                      <div className="space-y-2">
                        {feedback.requirements.structure.map((req, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            {feedback.requirements.completedRequirements.includes(req) ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-gray-400" />
                            )}
                            <span className={
                              feedback.requirements.completedRequirements.includes(req) 
                                ? 'text-green-600' 
                                : 'text-gray-600'
                            }>
                              {req}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="progress">
        <WritingProgressTracker />
      </TabsContent>
    </Tabs>
  );
};