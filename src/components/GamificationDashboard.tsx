import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Trophy, Star, Flame, Award, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface GamificationStats {
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  icon_url: string;
  color: string;
  rarity: string;
  earned_at?: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalXP: number;
  level: number;
  streak: number;
}

export default function GamificationDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchGamificationData();
    }
  }, [user]);

  const fetchGamificationData = async () => {
    try {
      // Get user stats
      const { data: statsData } = await supabase.functions.invoke('gamification-engine', {
        body: { action: 'get_user_stats', userId: user?.id }
      });

      if (statsData?.success) {
        setStats(statsData.stats);
        setRewards(statsData.earnedRewards.map((er: any) => ({
          ...er.rewards,
          earned_at: er.earned_at
        })));
      }

      // Get leaderboard
      const { data: leaderboardData } = await supabase.functions.invoke('gamification-engine', {
        body: { action: 'get_leaderboard', data: { category: 'all_time', limit: 10 } }
      });

      if (leaderboardData?.success) {
        setLeaderboard(leaderboardData.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'epic': return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-600';
    }
  };

  const getXPToNextLevel = () => {
    if (!stats) return 0;
    const currentLevelXP = (stats.current_level - 1) * 1000;
    const nextLevelXP = stats.current_level * 1000;
    return nextLevelXP - stats.total_xp;
  };

  const getLevelProgress = () => {
    if (!stats) return 0;
    const currentLevelXP = (stats.current_level - 1) * 1000;
    const xpInCurrentLevel = stats.total_xp - currentLevelXP;
    return (xpInCurrentLevel / 1000) * 100;
  };

  if (loading) {
    return <div className="animate-pulse">Loading gamification data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500 rounded-full">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.current_level || 1}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-500 rounded-full">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total XP</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.total_xp || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-pink-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500 rounded-full">
                <Flame className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-red-600">{stats?.current_streak || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500 rounded-full">
                <Award className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-green-600">{rewards.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5" />
            <span>Level Progress</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Level {stats?.current_level || 1}</span>
              <span>{getXPToNextLevel()} XP to next level</span>
            </div>
            <Progress value={getLevelProgress()} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className={`${getRarityColor(reward.rarity)} text-white`}>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{reward.icon_url}</div>
                    <div>
                      <h3 className="font-semibold">{reward.name}</h3>
                      <p className="text-sm opacity-90">{reward.description}</p>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {reward.rarity}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="h-5 w-5" />
                <span>Top Performers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry, index) => (
                  <div key={entry.userId} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-500 text-white' :
                      index === 1 ? 'bg-gray-400 text-white' :
                      index === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {entry.rank}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.displayName}</p>
                      <p className="text-sm text-gray-600">Level {entry.level} • {entry.totalXP} XP</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-red-500">
                        <Flame className="h-4 w-4" />
                        <span className="text-sm font-medium">{entry.streak}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Keep learning to unlock more achievements and rewards!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}