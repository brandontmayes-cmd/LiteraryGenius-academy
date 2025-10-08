import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Flame, Calendar, Target, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
}

export default function StreakTracker() {
  const { user } = useAuth();
  const [streakData, setStreakData] = useState<StreakData>({
    current_streak: 0,
    longest_streak: 0,
    last_activity_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStreakData();
    }
  }, [user]);

  const fetchStreakData = async () => {
    try {
      const { data } = await supabase.functions.invoke('gamification-engine', {
        body: { action: 'get_user_stats', userId: user?.id }
      });

      if (data?.success && data.stats) {
        setStreakData({
          current_streak: data.stats.current_streak || 0,
          longest_streak: data.stats.longest_streak || 0,
          last_activity_date: data.stats.last_activity_date || new Date().toISOString().split('T')[0]
        });
      }
    } catch (error) {
      console.error('Error fetching streak data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    try {
      const { data } = await supabase.functions.invoke('gamification-engine', {
        body: { action: 'update_streak', userId: user?.id }
      });

      if (data?.success) {
        setStreakData(prev => ({
          ...prev,
          current_streak: data.currentStreak,
          longest_streak: data.longestStreak,
          last_activity_date: new Date().toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 100) return '🔥🔥🔥';
    if (streak >= 50) return '🔥🔥';
    if (streak >= 10) return '🔥';
    if (streak >= 3) return '⚡';
    return '💫';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 50) return 'from-red-500 to-orange-500';
    if (streak >= 20) return 'from-orange-500 to-yellow-500';
    if (streak >= 7) return 'from-yellow-500 to-green-500';
    if (streak >= 3) return 'from-green-500 to-blue-500';
    return 'from-blue-500 to-purple-500';
  };

  const getStreakTitle = (streak: number) => {
    if (streak >= 100) return 'Legendary Streak!';
    if (streak >= 50) return 'Epic Streak!';
    if (streak >= 20) return 'Amazing Streak!';
    if (streak >= 7) return 'Great Streak!';
    if (streak >= 3) return 'Good Streak!';
    return 'Building Momentum';
  };

  const isStreakActive = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    return streakData.last_activity_date === today || streakData.last_activity_date === yesterday;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-gradient-to-r ${getStreakColor(streakData.current_streak)} text-white`}>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="h-6 w-6" />
            <span>Learning Streak</span>
          </div>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {getStreakTitle(streakData.current_streak)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Current Streak */}
          <div className="text-center">
            <div className="text-4xl mb-2">{getStreakEmoji(streakData.current_streak)}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {streakData.current_streak}
            </div>
            <p className="text-sm text-gray-600">Current Streak</p>
            <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs ${
              isStreakActive() 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full mr-1 ${
                isStreakActive() ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              {isStreakActive() ? 'Active' : 'Broken'}
            </div>
          </div>

          {/* Best Streak */}
          <div className="text-center">
            <div className="text-4xl mb-2">
              <Trophy className="h-10 w-10 text-yellow-500 mx-auto" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {streakData.longest_streak}
            </div>
            <p className="text-sm text-gray-600">Best Streak</p>
            {streakData.current_streak === streakData.longest_streak && streakData.current_streak > 0 && (
              <Badge variant="outline" className="mt-2 text-xs">
                Personal Record!
              </Badge>
            )}
          </div>
        </div>

        {/* Streak Milestones */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-1" />
            Next Milestones
          </h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[7, 30, 100].map((milestone) => (
              <div
                key={milestone}
                className={`p-2 rounded text-center ${
                  streakData.current_streak >= milestone
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <div className="font-bold">{milestone}</div>
                <div>{milestone === 7 ? 'Week' : milestone === 30 ? 'Month' : 'Century'}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4 text-center">
          <button
            onClick={updateStreak}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 text-sm font-medium"
          >
            <Calendar className="h-4 w-4 inline mr-1" />
            Log Today's Activity
          </button>
        </div>
      </CardContent>
    </Card>
  );
}