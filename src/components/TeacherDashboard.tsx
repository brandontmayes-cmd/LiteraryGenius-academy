// File: src/components/TeacherDashboard.tsx
// SIMPLIFIED VERSION - Actually works!

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, BookOpen, MessageSquare, TrendingUp, Plus } from 'lucide-react';
import { UserMenu } from './UserMenu';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const TeacherDashboard: React.FC = () => {
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1e3a5f] px-6 py-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/images/lga-logo.png" 
            alt="Literary Genius Academy" 
            className="w-12 h-12 rounded-full border-2 border-[#d4af37] cursor-pointer hover:opacity-90 transition"
            onClick={() => window.location.href = '/'}
          />
          <div>
            <h1 className="text-2xl font-bold text-[#f5e6d3]">
              Welcome back, {profile?.full_name || 'Teacher'}
            </h1>
            <p className="text-[#d4af37]">Teacher Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2f]">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
          <UserMenu />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <MessageSquare className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Class Average</p>
                  <p className="text-2xl font-bold">87%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>🎉 Your Teacher Dashboard is Coming Soon!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                We're building an amazing teacher experience with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>✅ AI-powered content generation</li>
                <li>✅ Automated grading and feedback</li>
                <li>✅ Student progress tracking</li>
                <li>✅ Standards-aligned curriculum</li>
                <li>✅ Parent communication tools</li>
              </ul>
              <div className="mt-6">
                <Button onClick={() => window.location.href = '/admin'}>
                  Go to Admin Dashboard →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
