import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Target, Calendar, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Goal {
  id: string;
  title: string;
  description: string;
  subject: string;
  target_value: number;
  current_value: number;
  unit: string;
  end_date: string;
  status: string;
  goal_type: string;
}

export const GoalTracker: React.FC = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('student_id', user?.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (goalId: string, newValue: number) => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ current_value: newValue })
        .eq('id', goalId);

      if (error) throw error;
      fetchGoals();
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return <div className="text-center py-8">Loading goals...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = getProgressPercentage(goal.current_value, goal.target_value);
          const daysRemaining = getDaysRemaining(goal.end_date);
          const isAtRisk = daysRemaining <= 3 && progress < 70;
          const isCompleted = progress >= 100;

          return (
            <Card key={goal.id} className={`${isCompleted ? 'border-green-500' : isAtRisk ? 'border-red-500' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{goal.title}</CardTitle>
                  {isCompleted && <Trophy className="h-5 w-5 text-yellow-500" />}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{goal.subject}</Badge>
                  <Badge variant={goal.goal_type === 'weekly' ? 'default' : 'secondary'}>
                    {goal.goal_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{goal.current_value}/{goal.target_value} {goal.unit}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="text-right text-sm text-gray-500 mt-1">
                      {progress.toFixed(0)}%
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                    </span>
                  </div>

                  {isAtRisk && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-700 text-sm">
                        <Target className="h-4 w-4" />
                        <span>Goal at risk! Increase effort to stay on track.</span>
                      </div>
                    </div>
                  )}

                  {isCompleted && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700 text-sm">
                        <Trophy className="h-4 w-4" />
                        <span>Congratulations! Goal achieved!</span>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateProgress(goal.id, goal.current_value + 1)}
                      disabled={isCompleted}
                    >
                      +1 {goal.unit}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateProgress(goal.id, Math.max(0, goal.current_value - 1))}
                      disabled={goal.current_value === 0}
                    >
                      -1 {goal.unit}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No active goals</h3>
          <p className="text-gray-600">Create your first goal to start tracking progress!</p>
        </div>
      )}
    </div>
  );
};