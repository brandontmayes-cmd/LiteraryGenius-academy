import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Target, Clock, BookOpen, Trophy, Zap } from 'lucide-react';

interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  subject?: string;
  goalType: 'weekly' | 'monthly';
  targetValue: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

const goalTemplates: GoalTemplate[] = [
  {
    id: 'study-hours-weekly',
    title: 'Weekly Study Hours',
    description: 'Complete 15 hours of focused study time',
    goalType: 'weekly',
    targetValue: 15,
    unit: 'hours',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'assignments-monthly',
    title: 'Monthly Assignments',
    description: 'Complete all assignments on time',
    goalType: 'monthly',
    targetValue: 8,
    unit: 'assignments',
    icon: <BookOpen className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'study-sessions-weekly',
    title: 'Study Sessions',
    description: 'Complete 10 study sessions this week',
    goalType: 'weekly',
    targetValue: 10,
    unit: 'sessions',
    icon: <Target className="h-5 w-5" />,
    color: 'bg-purple-500'
  },
  {
    id: 'subject-mastery',
    title: 'Subject Mastery',
    description: 'Achieve 90% completion in chosen subject',
    subject: 'Mathematics',
    goalType: 'monthly',
    targetValue: 90,
    unit: 'percentage',
    icon: <Trophy className="h-5 w-5" />,
    color: 'bg-yellow-500'
  },
  {
    id: 'productivity-streak',
    title: 'Productivity Streak',
    description: 'Study for 7 consecutive days',
    goalType: 'weekly',
    targetValue: 7,
    unit: 'days',
    icon: <Zap className="h-5 w-5" />,
    color: 'bg-red-500'
  }
];

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
}

export const GoalTemplates: React.FC<GoalTemplatesProps> = ({ onSelectTemplate }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {goalTemplates.map((template) => (
        <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${template.color} text-white`}>
                {template.icon}
              </div>
              <div>
                <CardTitle className="text-lg">{template.title}</CardTitle>
                <CardDescription className="text-sm">
                  {template.goalType === 'weekly' ? 'Weekly Goal' : 'Monthly Goal'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Target: {template.targetValue} {template.unit}
              </span>
              <Button 
                size="sm" 
                onClick={() => onSelectTemplate(template)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};