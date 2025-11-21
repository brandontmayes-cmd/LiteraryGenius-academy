// File: src/components/ParentDashboard.tsx
// SIMPLIFIED VERSION - Actually works!

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Clock, BookOpen, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const ParentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error: any) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1e3a5f] px-6 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68caf8605a414d406590b724_1760015224395_1fa7a05d.jpeg" 
            alt="Literary Genius Academy" 
            className="w-12 h-12 rounded-full border-2 border-[#d4af37] cursor-pointer hover:opacity-90 transition"
            onClick={() => window.location.href = '/'}
          />
          <h1 className="text-2xl font-bold text-[#f5e6d3]">
            Welcome, {profile?.full_name || 'Parent'}!
          </h1>
        </div>
        <UserMenu />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89.7%</div>
              <Progress value={89.7} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12h 30m</div>
              <p className="text-xs text-muted-foreground">Total this month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assignments</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8/10</div>
              <p className="text-xs text-muted-foreground">2 upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Badges earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>🎉 Your Parent Dashboard is Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                We're building a comprehensive parent portal with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>✅ Real-time student progress tracking</li>
                <li>✅ Assignment and grade monitoring</li>
                <li>✅ Direct teacher communication</li>
                <li>✅ Achievement and badge system</li>
                <li>✅ Study time analytics</li>
                <li>✅ Standards-based progress reports</li>
              </ul>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Coming in January 2026!</h3>
                <p className="text-sm text-blue-700">
                  Your child's dashboard is fully functional and ready to use. 
                  We're working hard to deliver the same amazing experience for parents!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ParentDashboard;
