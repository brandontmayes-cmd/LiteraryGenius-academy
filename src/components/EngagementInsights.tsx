import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Activity, Clock, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface InsightData {
  metric: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  recommendation: string;
}

export default function EngagementInsights() {
  const [insights, setInsights] = useState<InsightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateInsights();
  }, []);

  const generateInsights = async () => {
    try {
      setLoading(true);
      
      // Mock insights based on analytics patterns
      const mockInsights: InsightData[] = [
        {
          metric: 'Store Conversion Rate',
          value: 68,
          change: 12,
          trend: 'up',
          recommendation: 'Avatar items are driving high engagement. Consider expanding this category.'
        },
        {
          metric: 'Gift Exchange Activity',
          value: 45,
          change: -5,
          trend: 'down',
          recommendation: 'Introduce seasonal gift campaigns to boost social interaction.'
        },
        {
          metric: 'Milestone Completion',
          value: 78,
          change: 8,
          trend: 'up',
          recommendation: 'Students respond well to achievement combinations. Add more complex milestones.'
        },
        {
          metric: 'Premium Feature Adoption',
          value: 34,
          change: 15,
          trend: 'up',
          recommendation: 'Study tools are popular. Consider tiered pricing for advanced features.'
        },
        {
          metric: 'Seasonal Item Engagement',
          value: 89,
          change: 23,
          trend: 'up',
          recommendation: 'Limited-time items create urgency. Plan quarterly themed releases.'
        },
        {
          metric: 'Wishlist Conversion',
          value: 42,
          change: -2,
          trend: 'stable',
          recommendation: 'Add wishlist notifications when items go on sale or become available.'
        }
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error('Error generating insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Engagement Insights</h2>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Clock className="h-3 w-3" />
          <span>Updated 5 min ago</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{insight.metric}</CardTitle>
                {getTrendIcon(insight.trend)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-end space-x-2">
                  <span className="text-3xl font-bold">{insight.value}%</span>
                  <span className={`text-sm font-medium ${getTrendColor(insight.trend)}`}>
                    {insight.change > 0 ? '+' : ''}{insight.change}%
                  </span>
                </div>
                
                <Progress value={insight.value} className="h-2" />
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-800">{insight.recommendation}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">2.3x</p>
              <p className="text-sm text-gray-600">Engagement Multiplier</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">156%</p>
              <p className="text-sm text-gray-600">ROI on Gamification</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">4.7</p>
              <p className="text-sm text-gray-600">Avg. Items per Student</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">89%</p>
              <p className="text-sm text-gray-600">Student Satisfaction</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}