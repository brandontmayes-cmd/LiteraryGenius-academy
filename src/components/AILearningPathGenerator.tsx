import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Target, BookOpen, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LearningPath {
  id: string;
  nextStandards: string[];
  remediationNeeded: string[];
  enrichmentOpportunities: string[];
  recommendedSequence: Array<{
    standardId: string;
    title: string;
    type: 'lesson' | 'practice' | 'assessment' | 'remediation' | 'enrichment';
    estimatedTime: number;
  }>;
  reasoning: string;
}

interface AILearningPathGeneratorProps {
  studentId: string;
  subject: string;
}

export default function AILearningPathGenerator({ studentId, subject }: AILearningPathGeneratorProps) {
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateLearningPath = async () => {
    setLoading(true);
    setProgress(0);
    
    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const { data, error } = await supabase.functions.invoke('ai-learning-path-generator', {
        body: { 
          studentId,
          subject,
          action: 'generate_path'
        }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;
      
      setLearningPath(data.learningPath);
    } catch (error) {
      console.error('Error generating learning path:', error);
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'assessment': return <TrendingUp className="w-4 h-4" />;
      case 'remediation': return <AlertTriangle className="w-4 h-4" />;
      case 'enrichment': return <Star className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800';
      case 'practice': return 'bg-green-100 text-green-800';
      case 'assessment': return 'bg-purple-100 text-purple-800';
      case 'remediation': return 'bg-orange-100 text-orange-800';
      case 'enrichment': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            AI Learning Path Generator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Generate a personalized learning path for {subject}
              </p>
              <Button onClick={generateLearningPath} disabled={loading}>
                {loading ? 'Generating...' : 'Generate Path'}
              </Button>
            </div>
            
            {loading && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-xs text-gray-500 text-center">
                  AI analyzing student data and creating personalized path...
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {learningPath && (
        <div className="space-y-6">
          {/* AI Reasoning */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Analysis & Reasoning</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{learningPath.reasoning}</p>
            </CardContent>
          </Card>

          {/* Recommended Learning Sequence */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recommended Learning Sequence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningPath.recommendedSequence.map((step, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{step.title}</h4>
                        <Badge className={getTypeColor(step.type)}>
                          <div className="flex items-center gap-1">
                            {getTypeIcon(step.type)}
                            {step.type}
                          </div>
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Estimated time: {step.estimatedTime} minutes
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Action Items */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Next Standards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Next Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {learningPath.nextStandards.map((standard, index) => (
                    <Badge key={index} variant="outline" className="block w-full text-center">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Remediation Needed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                  Needs Review
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {learningPath.remediationNeeded.map((standard, index) => (
                    <Badge key={index} variant="outline" className="block w-full text-center bg-orange-50">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Enrichment Opportunities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  Enrichment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {learningPath.enrichmentOpportunities.map((standard, index) => (
                    <Badge key={index} variant="outline" className="block w-full text-center bg-yellow-50">
                      {standard}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}