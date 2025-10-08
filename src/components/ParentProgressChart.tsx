import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProgressData {
  subject: string;
  currentGrade: number;
  previousGrade: number;
  trend: 'up' | 'down' | 'stable';
  assignments: number;
  completed: number;
}

interface ParentProgressChartProps {
  data: ProgressData[];
}

export const ParentProgressChart: React.FC<ParentProgressChartProps> = ({ data }) => {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subject Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((subject) => (
          <div key={subject.subject} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{subject.subject}</h4>
                {getTrendIcon(subject.trend)}
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getTrendColor(subject.trend)}`}>
                  {subject.currentGrade.toFixed(1)}%
                </span>
                <Badge variant="outline" className="text-xs">
                  {subject.completed}/{subject.assignments}
                </Badge>
              </div>
            </div>
            
            <Progress value={subject.currentGrade} className="h-2" />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>Previous: {subject.previousGrade.toFixed(1)}%</span>
              <span>
                {subject.trend === 'up' && '+'}
                {(subject.currentGrade - subject.previousGrade).toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};