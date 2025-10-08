import React, { useState, useEffect } from 'react';
import { TrendingUp, Target, CheckCircle, Clock, Brain, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface LearningGoal {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  estimatedTime: string;
  prerequisites: string[];
  skills: string[];
  status: 'locked' | 'available' | 'in-progress' | 'completed';
}

interface AdaptiveLearningPathProps {
  studentId: string;
  subject: string;
  currentLevel: string;
  performanceData?: any;
}

export const AdaptiveLearningPath: React.FC<AdaptiveLearningPathProps> = ({
  studentId,
  subject,
  currentLevel,
  performanceData
}) => {
  const [learningPath, setLearningPath] = useState<LearningGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock adaptive learning path based on performance
  useEffect(() => {
    const generateAdaptivePath = () => {
      const basePath: LearningGoal[] = [
        {
          id: '1',
          title: 'Foundation Concepts',
          description: 'Master the basic principles and terminology',
          difficulty: 'beginner',
          progress: 85,
          estimatedTime: '2 hours',
          prerequisites: [],
          skills: ['Basic Understanding', 'Terminology'],
          status: 'completed'
        },
        {
          id: '2',
          title: 'Core Principles',
          description: 'Apply fundamental concepts to solve problems',
          difficulty: 'intermediate',
          progress: 60,
          estimatedTime: '3 hours',
          prerequisites: ['Foundation Concepts'],
          skills: ['Problem Solving', 'Application'],
          status: 'in-progress'
        },
        {
          id: '3',
          title: 'Advanced Applications',
          description: 'Tackle complex scenarios and edge cases',
          difficulty: 'advanced',
          progress: 0,
          estimatedTime: '4 hours',
          prerequisites: ['Core Principles'],
          skills: ['Critical Thinking', 'Analysis'],
          status: 'available'
        },
        {
          id: '4',
          title: 'Mastery Assessment',
          description: 'Demonstrate comprehensive understanding',
          difficulty: 'advanced',
          progress: 0,
          estimatedTime: '2 hours',
          prerequisites: ['Advanced Applications'],
          skills: ['Synthesis', 'Evaluation'],
          status: 'locked'
        }
      ];

      // Adapt based on performance
      if (performanceData?.weakAreas?.length > 0) {
        basePath.splice(2, 0, {
          id: 'remedial',
          title: 'Skill Reinforcement',
          description: 'Strengthen areas needing improvement',
          difficulty: 'intermediate',
          progress: 0,
          estimatedTime: '2 hours',
          prerequisites: ['Foundation Concepts'],
          skills: ['Reinforcement', 'Practice'],
          status: 'available'
        });
      }

      setLearningPath(basePath);
      setIsLoading(false);
    };

    generateAdaptivePath();
  }, [performanceData]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'available': return <Target className="w-5 h-5 text-orange-500" />;
      case 'locked': return <div className="w-5 h-5 bg-gray-300 rounded-full" />;
      default: return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Adaptive Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallProgress = Math.round(
    learningPath.reduce((sum, goal) => sum + goal.progress, 0) / learningPath.length
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-500" />
          Adaptive Learning Path - {subject}
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {learningPath.map((goal, index) => (
          <div
            key={goal.id}
            className={`relative p-4 rounded-lg border transition-all duration-200 ${
              goal.status === 'locked' 
                ? 'bg-gray-50 border-gray-200 opacity-60' 
                : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            {index > 0 && (
              <div className="absolute -top-4 left-8 w-0.5 h-4 bg-gray-300" />
            )}
            
            <div className="flex items-start gap-3">
              {getStatusIcon(goal.status)}
              
              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{goal.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(goal.difficulty)}>
                      {goal.difficulty}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {goal.estimatedTime}
                    </Badge>
                  </div>
                </div>
                
                {goal.progress > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <Progress value={goal.progress} className="h-1.5" />
                  </div>
                )}
                
                <div className="flex flex-wrap gap-1">
                  {goal.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      {skill}
                    </Badge>
                  ))}
                </div>
                
                {goal.status === 'available' && (
                  <Button size="sm" className="mt-2">
                    Start Learning
                  </Button>
                )}
                
                {goal.status === 'in-progress' && (
                  <Button size="sm" variant="outline" className="mt-2">
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};