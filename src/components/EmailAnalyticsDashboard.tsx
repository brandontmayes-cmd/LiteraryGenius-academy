import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Mail, TrendingUp, AlertTriangle, Users } from 'lucide-react';
import { EmailEngagementChart } from './analytics/EmailEngagementChart';

export function EmailAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSent: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0,
    bounceRate: 0
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    const { data } = await supabase
      .from('email_analytics')
      .select('*')
      .order('sent_at', { ascending: false });

    if (data) {
      setAnalytics(data);
      calculateStats(data);
    }
  };

  const calculateStats = (data: any[]) => {
    const total = data.length;
    const delivered = data.filter(d => d.delivered_at).length;
    const opened = data.filter(d => d.opened_at).length;
    const clicked = data.filter(d => d.clicked_at).length;
    const bounced = data.filter(d => d.bounced_at).length;

    setStats({
      totalSent: total,
      deliveryRate: total ? (delivered / total) * 100 : 0,
      openRate: delivered ? (opened / delivered) * 100 : 0,
      clickRate: opened ? (clicked / opened) * 100 : 0,
      bounceRate: total ? (bounced / total) * 100 : 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#d4af37]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.clickRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bounceRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Email Engagement Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <EmailEngagementChart data={[]} />
        </CardContent>
      </Card>
    </div>
  );
}
