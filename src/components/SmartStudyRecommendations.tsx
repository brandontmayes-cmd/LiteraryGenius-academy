import React, { useState, useEffect } from 'react';
import { Lightbulb, Clock, TrendingUp, BookOpen, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StudyRecommendation {
  id: string;
  type: 'review' | 'practice' | 'advance' | 'remedial';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
  subject: string;
  reason: string;
  confidence: number;
}

interface SmartStudyRecommendationsProps {
  studentId: string;
  performanceData?: any;
  recentActivity?: any[];
  upcomingAssignments?: any[];
}

export const SmartStudyRecommendations: React.FC<SmartStudyRecommendationsProps> = ({
  studentId,
  performanceData,
  recentActivity,
  upcomingAssignments
}) => {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generateRecommendations = () => {
      const recs: StudyRecommendation[] = [
        {
          id: '1',
          type: 'review',
          title: 'Review Algebra Fundamentals',
          description: 'Strengthen your foundation in algebraic expressions and equations',
          priority: 'high',
          estimatedTime: '30 min',
          subject: 'Mathematics',
          reason: 'Recent quiz showed 65% accuracy in algebra problems',
          confidence: 85
        },
        {
          id: '2',
          type: 'practice',
          title: 'Practice Essay Writing',
          description: 'Work on paragraph structure and thesis development',
          priority: 'medium',
          estimatedTime: '45 min',
          subject: 'English',
          reason: 'Upcoming essay assignment in 3 days',
          confidence: 78
        },
        {
          id: '3',
          type: 'advance',
          title: 'Explore Advanced Physics Concepts',
          description: 'Ready to tackle momentum and energy conservation',
          priority: 'low',
          estimatedTime: '60 min',
          subject: 'Physics',
          reason: 'Strong performance in basic mechanics (92% average)',
          confidence: 72
        },
        {
          id: '4',
          type: 'remedial',
          title: 'Chemical Bonding Review',
          description: 'Revisit ionic and covalent bonding concepts',
          priority: 'high',
          estimatedTime: '25 min',
          subject: 'Chemistry',
          reason: 'Struggled with bonding questions (45% accuracy)',
          confidence: 90
        }
      ];

      // Sort by priority and confidence
      recs.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      });

      setRecommendations(recs);
      setIsLoading(false);
    };

    generateRecommendations();
  }, [performanceData, recentActivity, upcomingAssignments]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'review': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <Target className="w-4 h-4" />;
      case 'advance': return <TrendingUp className="w-4 h-4" />;
      case 'remedial': return <Zap className="w-4 h-4" />;
      default: return <Lightbulb className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'review': return 'bg-blue-100 text-blue-800';
      case 'practice': return 'bg-green-100 text-green-800';
      case 'advance': return 'bg-purple-100 text-purple-800';
      case 'remedial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Smart Study Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Smart Study Recommendations
          <Badge variant="secondary" className="ml-auto">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getTypeColor(rec.type)}`}>
                {getTypeIcon(rec.type)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{rec.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority} priority
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {rec.estimatedTime}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="font-medium">{rec.subject}</span>
                  <span>•</span>
                  <span>{rec.reason}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">AI Confidence:</span>
                    <Progress value={rec.confidence} className="w-16 h-1.5" />
                    <span className="text-xs text-gray-500">{rec.confidence}%</span>
                  </div>
                  
                  <Button size="sm" variant="outline">
                    Start Study Session
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button variant="ghost" className="w-full">
            <TrendingUp className="w-4 h-4 mr-2" />
            View Detailed Analytics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};