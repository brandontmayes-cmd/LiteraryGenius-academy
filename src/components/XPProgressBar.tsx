import React, { useState, useEffect } from 'react';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface XPProgressBarProps {
  showDetails?: boolean;
  compact?: boolean;
}

export default function XPProgressBar({ showDetails = true, compact = false }: XPProgressBarProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total_xp: 0,
    current_level: 1,
    current_streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const { data } = await supabase.functions.invoke('gamification-engine', {
        body: { action: 'get_user_stats', userId: user?.id }
      });

      if (data?.success && data.stats) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getXPToNextLevel = () => {
    const nextLevelXP = stats.current_level * 1000;
    return nextLevelXP - stats.total_xp;
  };

  const getLevelProgress = () => {
    const currentLevelXP = (stats.current_level - 1) * 1000;
    const xpInCurrentLevel = stats.total_xp - currentLevelXP;
    return Math.min((xpInCurrentLevel / 1000) * 100, 100);
  };

  const getCurrentLevelXP = () => {
    const currentLevelXP = (stats.current_level - 1) * 1000;
    return stats.total_xp - currentLevelXP;
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${compact ? 'h-4' : 'h-16'} bg-gray-200 rounded`}></div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Star className="h-4 w-4 text-blue-500" />
          <span className="text-sm font-medium">{stats.current_level}</span>
        </div>
        <div className="flex-1">
          <Progress value={getLevelProgress()} className="h-2" />
        </div>
        <span className="text-xs text-gray-500">
          {getCurrentLevelXP()}/1000 XP
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Level and XP Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
            <Star className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-bold text-blue-600">
              Level {stats.current_level}
            </span>
          </div>
          {showDetails && (
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              {stats.total_xp.toLocaleString()} Total XP
            </Badge>
          )}
        </div>
        
        {showDetails && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">
              {getCurrentLevelXP()}/1000 XP
            </p>
            <p className="text-xs text-gray-500">
              {getXPToNextLevel()} XP to next level
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <Progress 
          value={getLevelProgress()} 
          className="h-3 bg-gray-200" 
        />
        {!showDetails && (
          <div className="flex justify-between text-xs text-gray-500">
            <span>{getCurrentLevelXP()} XP</span>
            <span>{getXPToNextLevel()} to next level</span>
          </div>
        )}
      </div>

      {/* Level Milestones */}
      {showDetails && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>Level {stats.current_level}</span>
          <span>Level {stats.current_level + 1}</span>
        </div>
      )}
    </div>
  );
}