import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Trophy, Medal, Award, Flame, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  totalXP: number;
  level: number;
  streak: number;
}

interface LeaderboardWidgetProps {
  category?: string;
  limit?: number;
  showCurrentUser?: boolean;
}

export default function LeaderboardWidget({ 
  category = 'all_time', 
  limit = 5, 
  showCurrentUser = true 
}: LeaderboardWidgetProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [category, limit]);

  const fetchLeaderboard = async () => {
    try {
      const { data } = await supabase.functions.invoke('gamification-engine', {
        body: { 
          action: 'get_leaderboard', 
          data: { category, limit } 
        }
      });

      if (data?.success) {
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <span className="text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(limit)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Trophy className="h-5 w-5" />
          <span>Leaderboard</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 hover:shadow-md ${
                entry.rank <= 3 ? 'bg-gradient-to-r from-gray-50 to-gray-100' : 'bg-gray-50'
              }`}
            >
              {/* Rank */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getRankBadgeColor(entry.rank)}`}>
                {entry.rank <= 3 ? (
                  getRankIcon(entry.rank)
                ) : (
                  <span className="text-sm font-bold text-white">#{entry.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {entry.displayName.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">
                  {entry.displayName}
                </p>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3" />
                    <span>Lv. {entry.level}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Flame className="h-3 w-3 text-red-500" />
                    <span>{entry.streak}</span>
                  </div>
                </div>
              </div>

              {/* XP Badge */}
              <Badge variant="secondary" className="font-mono">
                {entry.totalXP.toLocaleString()} XP
              </Badge>
            </div>
          ))}

          {leaderboard.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No leaderboard data available</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}