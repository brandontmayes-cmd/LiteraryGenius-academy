import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricsCard } from './MetricsCard';
import { EngagementChart } from './EngagementChart';
import { Users, BookOpen, TrendingUp, AlertTriangle, Download, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export function AdminAnalyticsDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const { toast } = useToast();

  const engagementData = [
    { date: 'Week 1', engagement: 78, completion: 85 },
    { date: 'Week 2', engagement: 82, completion: 88 },
    { date: 'Week 3', engagement: 85, completion: 90 },
    { date: 'Week 4', engagement: 88, completion: 92 },
  ];

  useEffect(() => {
    loadMetrics();
  }, [timeRange, selectedGrade]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('admin-analytics-engine', {
        body: { action: 'calculate_metrics' }
      });

      if (error) throw error;
      setMetrics(data);
    } catch (error: any) {
      toast({
        title: 'Error loading metrics',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    toast({
      title: 'Exporting Report',
      description: 'Your analytics report is being generated...'
    });
    setTimeout(() => window.print(), 500);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Analytics Dashboard</h1>
          <p className="text-muted-foreground">School-wide performance metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={exportReport} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Students"
          value={metrics?.totalStudents || 0}
          icon={Users}
          trend={{ value: 5, isPositive: true }}
        />
        <MetricsCard
          title="Total Teachers"
          value={metrics?.totalTeachers || 0}
          icon={Users}
        />
        <MetricsCard
          title="Avg Completion Rate"
          value={`${metrics?.avgCompletionRate || 0}%`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
        />
        <MetricsCard
          title="At-Risk Students"
          value={metrics?.atRiskStudents || 0}
          icon={AlertTriangle}
          description="Require intervention"
        />
      </div>

      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <EngagementChart data={engagementData} />
        </TabsContent>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Effectiveness Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Teacher performance data will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk">
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Student Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">At-risk predictions will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Curriculum Coverage Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Curriculum coverage data will appear here</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
