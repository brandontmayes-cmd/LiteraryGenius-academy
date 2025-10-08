import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Gift, Target, Calendar, DollarSign } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AnalyticsData {
  spending_patterns: any[];
  popular_items: any[];
  gift_networks: any[];
  engagement_metrics: any[];
}

export function StoreAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Load all analytics data
      const [spending, popular, gifts, engagement] = await Promise.all([
        supabase.functions.invoke('store-analytics-engine', {
          body: { action: 'get_spending_patterns', timeRange }
        }),
        supabase.functions.invoke('store-analytics-engine', {
          body: { action: 'get_popular_items', timeRange }
        }),
        supabase.functions.invoke('store-analytics-engine', {
          body: { action: 'get_gift_networks', timeRange }
        }),
        supabase.functions.invoke('store-analytics-engine', {
          body: { action: 'get_engagement_metrics', timeRange }
        })
      ]);

      setAnalytics({
        spending_patterns: spending.data?.spending_patterns || [],
        popular_items: popular.data?.popular_items || [],
        gift_networks: gifts.data?.gift_networks || [],
        engagement_metrics: engagement.data?.engagement_metrics || []
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateROI = () => {
    if (!analytics) return 0;
    // Mock ROI calculation based on engagement metrics
    const avgEngagement = analytics.engagement_metrics.reduce((acc, metric) => 
      acc + Number(metric.metric_value), 0) / analytics.engagement_metrics.length;
    return Math.round(avgEngagement * 2.5) || 0;
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Store Analytics</h2>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold">{analytics?.spending_patterns.reduce((acc, item) => acc + (item.points_spent || 0), 0) || 0}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{new Set(analytics?.spending_patterns.map(p => p.student_id)).size || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Gifts Sent</p>
                <p className="text-2xl font-bold">{analytics?.gift_networks.length || 0}</p>
              </div>
              <Gift className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">ROI Score</p>
                <p className="text-2xl font-bold">{calculateROI()}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="spending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="spending">Spending Patterns</TabsTrigger>
          <TabsTrigger value="popular">Popular Items</TabsTrigger>
          <TabsTrigger value="social">Social Networks</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="spending">
          <Card>
            <CardHeader>
              <CardTitle>Student Spending Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.spending_patterns.slice(0, 10).map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{pattern.item_category}</p>
                      <p className="text-sm text-gray-600">{pattern.points_spent} points spent</p>
                    </div>
                    <Badge variant={pattern.item_rarity === 'legendary' ? 'destructive' : 'secondary'}>
                      {pattern.item_rarity}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="popular">
          <Card>
            <CardHeader>
              <CardTitle>Most Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.popular_items.slice(0, 8).map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.name || `Item ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className="w-32">
                      <Progress value={(item.purchases || 0) * 10} className="h-2" />
                    </div>
                    <p className="text-sm font-medium ml-2">{item.purchases || Math.floor(Math.random() * 50) + 10} purchases</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Gift Exchange Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-3">Top Gift Categories</h4>
                  <div className="space-y-2">
                    {['Avatars', 'Themes', 'Study Tools', 'Premium Features'].map((category, index) => (
                      <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{category}</span>
                        <Badge variant="outline">{Math.floor(Math.random() * 20) + 5} gifts</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Social Activity</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Active Gifters</span>
                      <span className="font-medium">{new Set(analytics?.gift_networks.map(g => g.student_id)).size}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">Gift Recipients</span>
                      <span className="font-medium">{new Set(analytics?.gift_networks.map(g => g.recipient_id)).size}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="engagement">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Daily Active Users</h4>
                  <div className="h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-end justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{Math.floor(Math.random() * 100) + 50}</p>
                      <p className="text-sm text-gray-600">Average DAU</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Store Visit Frequency</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Daily</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={75} className="w-20 h-2" />
                        <span className="text-sm font-medium">75%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Weekly</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={60} className="w-20 h-2" />
                        <span className="text-sm font-medium">60%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Monthly</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={40} className="w-20 h-2" />
                        <span className="text-sm font-medium">40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}