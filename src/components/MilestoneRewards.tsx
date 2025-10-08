import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown, Gift, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface MilestoneReward {
  id: string;
  name: string;
  description: string;
  requirements: any[];
  rewards: any[];
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
}

export const MilestoneRewards: React.FC = () => {
  const { user } = useAuth();
  const [milestones, setMilestones] = useState<MilestoneReward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMilestones();
    }
  }, [user]);

  const loadMilestones = async () => {
    try {
      // Mock milestone data - in real implementation would fetch from Supabase
      setMilestones([
        {
          id: '1',
          name: 'Academic Excellence',
          description: 'Complete 10 assignments with A+ grades',
          requirements: [{ type: 'grade', grade: 'A+', count: 10, current: 7 }],
          rewards: [
            { type: 'avatar', name: 'Wizard Avatar' },
            { type: 'feature', name: 'Premium Analytics' }
          ],
          progress: 70,
          isCompleted: false
        },
        {
          id: '2',
          name: 'Streak Master',
          description: 'Maintain a 30-day learning streak',
          requirements: [{ type: 'streak', days: 30, current: 30 }],
          rewards: [
            { type: 'theme', name: 'Galaxy Theme' },
            { type: 'tool', name: 'Study Buddy AI' }
          ],
          progress: 100,
          isCompleted: true,
          completedAt: '2024-01-15'
        },
        {
          id: '3',
          name: 'Social Leader',
          description: 'Help 5 classmates and receive 50 likes',
          requirements: [
            { type: 'help_given', count: 5, current: 3 },
            { type: 'likes_received', count: 50, current: 32 }
          ],
          rewards: [
            { type: 'avatar', name: 'Astronaut Avatar' },
            { type: 'real_world', name: 'Book Store Gift Card' }
          ],
          progress: 65,
          isCompleted: false
        },
        {
          id: '4',
          name: 'Knowledge Seeker',
          description: 'Complete 100 practice problems across all subjects',
          requirements: [{ type: 'problems_solved', count: 100, current: 45 }],
          rewards: [
            { type: 'xp_boost', name: '2x XP Multiplier (7 days)' },
            { type: 'certificate', name: 'Digital Achievement Certificate' }
          ],
          progress: 45,
          isCompleted: false
        },
        {
          id: '5',
          name: 'Perfect Week',
          description: 'Complete all assignments on time for 7 consecutive days',
          requirements: [{ type: 'perfect_days', count: 7, current: 4 }],
          rewards: [
            { type: 'theme', name: 'Rainbow Theme' },
            { type: 'points', amount: 500 }
          ],
          progress: 57,
          isCompleted: false
        }
      ]);
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const claimReward = async (milestoneId: string) => {
    try {
      const { data } = await supabase.functions.invoke('virtual-store-engine', {
        body: {
          action: 'check_milestone_rewards',
          data: { studentId: user?.id, milestoneId }
        }
      });

      if (data?.success) {
        loadMilestones();
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getRequirementIcon = (type: string) => {
    switch (type) {
      case 'grade': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'streak': return <Trophy className="w-4 h-4 text-orange-500" />;
      case 'help_given': return <Gift className="w-4 h-4 text-purple-500" />;
      case 'problems_solved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Star className="w-4 h-4 text-blue-500" />;
    }
  };

  const getRewardTypeColor = (type: string) => {
    switch (type) {
      case 'avatar': return 'bg-blue-100 text-blue-800';
      case 'theme': return 'bg-purple-100 text-purple-800';
      case 'tool': return 'bg-green-100 text-green-800';
      case 'real_world': return 'bg-orange-100 text-orange-800';
      case 'xp_boost': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading milestones...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          Milestone Rewards
        </h1>
        <p className="text-gray-600">
          Complete special achievement combinations to unlock exclusive rewards!
        </p>
      </div>

      <div className="space-y-6">
        {milestones.map((milestone) => (
          <Card key={milestone.id} className={`relative ${milestone.isCompleted ? 'border-green-200 bg-green-50' : ''}`}>
            {milestone.isCompleted && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed
                </Badge>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-500" />
                {milestone.name}
              </CardTitle>
              <p className="text-gray-600">{milestone.description}</p>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} className="h-2" />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Requirements:</h4>
                <div className="space-y-2">
                  {milestone.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      {getRequirementIcon(req.type)}
                      <span>
                        {req.type === 'grade' && `${req.current}/${req.count} assignments with ${req.grade} grade`}
                        {req.type === 'streak' && `${req.current}/${req.days} day learning streak`}
                        {req.type === 'help_given' && `${req.current}/${req.count} classmates helped`}
                        {req.type === 'likes_received' && `${req.current}/${req.count} likes received`}
                        {req.type === 'problems_solved' && `${req.current}/${req.count} practice problems solved`}
                        {req.type === 'perfect_days' && `${req.current}/${req.count} perfect days`}
                      </span>
                      {req.current >= (req.count || req.days) && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Rewards:</h4>
                <div className="flex flex-wrap gap-2">
                  {milestone.rewards.map((reward, index) => (
                    <Badge
                      key={index}
                      className={getRewardTypeColor(reward.type)}
                      variant="secondary"
                    >
                      {reward.name || `${reward.amount} ${reward.type}`}
                    </Badge>
                  ))}
                </div>
              </div>

              {milestone.isCompleted ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">
                    Completed on {milestone.completedAt}
                  </span>
                </div>
              ) : milestone.progress === 100 ? (
                <Button
                  onClick={() => claimReward(milestone.id)}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Claim Milestone Reward!
                </Button>
              ) : (
                <div className="text-center text-gray-500 text-sm">
                  Complete all requirements to unlock this milestone
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};