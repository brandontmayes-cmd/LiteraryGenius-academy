import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, BookOpen, Target, Lightbulb } from 'lucide-react';

interface EssayScore {
  overall: number;
  content: number;
  organization: number;
  languageUse: number;
  conventions: number;
}

interface FeedbackItem {
  category: string;
  score: number;
  feedback: string;
  suggestions: string[];
  strengths: string[];
  improvements: string[];
}

export function AutomatedEssayScoring() {
  const [essay, setEssay] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState<EssayScore | null>(null);
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    setWordCount(essay.trim().split(/\s+/).filter(word => word.length > 0).length);
  }, [essay]);

  const analyzeEssay = async () => {
    if (!essay.trim()) return;
    
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    setTimeout(() => {
      const mockScores: EssayScore = {
        overall: Math.floor(Math.random() * 20) + 80,
        content: Math.floor(Math.random() * 20) + 75,
        organization: Math.floor(Math.random() * 20) + 80,
        languageUse: Math.floor(Math.random() * 20) + 85,
        conventions: Math.floor(Math.random() * 20) + 90
      };

      const mockFeedback: FeedbackItem[] = [
        {
          category: 'Content & Ideas',
          score: mockScores.content,
          feedback: 'Your essay demonstrates good understanding of the topic with relevant examples.',
          suggestions: [
            'Add more specific evidence to support your main arguments',
            'Consider including counterarguments to strengthen your position',
            'Expand on the implications of your main points'
          ],
          strengths: [
            'Clear thesis statement',
            'Relevant examples provided',
            'Good topic knowledge'
          ],
          improvements: [
            'Depth of analysis',
            'Supporting evidence',
            'Critical thinking'
          ]
        },
        {
          category: 'Organization & Structure',
          score: mockScores.organization,
          feedback: 'Well-organized essay with clear introduction, body, and conclusion.',
          suggestions: [
            'Use more transitional phrases between paragraphs',
            'Ensure each paragraph has a clear topic sentence',
            'Strengthen the conclusion with a call to action'
          ],
          strengths: [
            'Logical flow of ideas',
            'Clear paragraph structure',
            'Strong introduction'
          ],
          improvements: [
            'Paragraph transitions',
            'Conclusion impact',
            'Topic sentences'
          ]
        }
      ];

      setScores(mockScores);
      setFeedback(mockFeedback);
      setIsAnalyzing(false);
    }, 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Satisfactory';
    return 'Needs Improvement';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Essay Scoring System</h1>
        <p className="text-gray-600">Get instant feedback on your essays with detailed rubrics and improvement suggestions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Essay Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Submit Your Essay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Textarea
                placeholder="Paste your essay here for analysis..."
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                className="min-h-[300px] resize-none"
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Word count: {wordCount}
                </span>
                <Button 
                  onClick={analyzeEssay}
                  disabled={!essay.trim() || isAnalyzing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isAnalyzing ? 'Analyzing...' : 'Analyze Essay'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Overview */}
        {scores && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Overall Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold ${getScoreColor(scores.overall)}`}>
                  {scores.overall}/100
                </div>
                <Badge variant="outline" className="mt-2">
                  {getScoreLabel(scores.overall)}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {[
                  { name: 'Content & Ideas', score: scores.content },
                  { name: 'Organization', score: scores.organization },
                  { name: 'Language Use', score: scores.languageUse },
                  { name: 'Conventions', score: scores.conventions }
                ].map((item) => (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className={`text-sm font-bold ${getScoreColor(item.score)}`}>
                        {item.score}/100
                      </span>
                    </div>
                    <Progress value={item.score} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detailed Feedback */}
      {feedback.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Detailed Feedback & Rubrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="feedback" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="feedback">Feedback</TabsTrigger>
                <TabsTrigger value="rubric">Rubric</TabsTrigger>
                <TabsTrigger value="standards">Standards</TabsTrigger>
              </TabsList>
              
              <TabsContent value="feedback" className="space-y-6">
                {feedback.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold">{item.category}</h3>
                      <Badge className={getScoreColor(item.score)}>
                        {item.score}/100
                      </Badge>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{item.feedback}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-green-700 mb-2 flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Strengths
                        </h4>
                        <ul className="text-sm space-y-1">
                          {item.strengths.map((strength, i) => (
                            <li key={i} className="text-green-600">• {strength}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-orange-700 mb-2 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          Areas for Improvement
                        </h4>
                        <ul className="text-sm space-y-1">
                          {item.improvements.map((improvement, i) => (
                            <li key={i} className="text-orange-600">• {improvement}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-blue-700 mb-2 flex items-center gap-1">
                          <Lightbulb className="w-4 h-4" />
                          Suggestions
                        </h4>
                        <ul className="text-sm space-y-1">
                          {item.suggestions.map((suggestion, i) => (
                            <li key={i} className="text-blue-600">• {suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="rubric" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    {
                      category: 'Content & Ideas (25%)',
                      levels: [
                        { score: '90-100', desc: 'Exceptional: Clear, focused, and engaging content with strong evidence' },
                        { score: '80-89', desc: 'Proficient: Well-developed ideas with adequate support' },
                        { score: '70-79', desc: 'Developing: Basic ideas present but need more development' },
                        { score: '60-69', desc: 'Beginning: Limited ideas with minimal support' }
                      ]
                    },
                    {
                      category: 'Organization (25%)',
                      levels: [
                        { score: '90-100', desc: 'Exceptional: Clear structure with smooth transitions' },
                        { score: '80-89', desc: 'Proficient: Well-organized with logical flow' },
                        { score: '70-79', desc: 'Developing: Some organizational structure present' },
                        { score: '60-69', desc: 'Beginning: Limited organizational structure' }
                      ]
                    }
                  ].map((rubric, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{rubric.category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {rubric.levels.map((level, i) => (
                            <div key={i} className="border-l-4 border-blue-500 pl-3">
                              <div className="font-medium">{level.score}</div>
                              <div className="text-sm text-gray-600">{level.desc}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="standards" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Common Core Standards Alignment</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• CCSS.ELA-LITERACY.W.9-10.1: Write arguments to support claims</li>
                        <li>• CCSS.ELA-LITERACY.W.9-10.4: Clear and coherent writing</li>
                        <li>• CCSS.ELA-LITERACY.W.9-10.5: Develop writing through planning and revision</li>
                        <li>• CCSS.ELA-LITERACY.L.9-10.1: Demonstrate command of conventions</li>
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Assessment Criteria</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Thesis clarity and argumentation</li>
                        <li>• Evidence quality and relevance</li>
                        <li>• Paragraph structure and transitions</li>
                        <li>• Grammar and mechanics</li>
                        <li>• Vocabulary and style</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}