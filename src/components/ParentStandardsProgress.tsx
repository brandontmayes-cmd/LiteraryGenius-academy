import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Target, Award, BookOpen, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ParentStandardsProgressProps {
  studentId: string;
}

export const ParentStandardsProgress: React.FC<ParentStandardsProgressProps> = ({ studentId }) => {
  const [masteryData, setMasteryData] = useState<any[]>([]);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [studentId, selectedSubject]);

  const fetchData = async () => {
    try {
      // Fetch current mastery
      let query = supabase
        .from('student_standards_mastery')
        .select(`
          *,
          standard:common_core_standards(*)
        `)
        .eq('student_id', studentId);

      if (selectedSubject) {
        query = query.eq('standard.subject', selectedSubject);
      }

      const { data: mastery } = await query;
      setMasteryData(mastery || []);

      // Fetch history for trend chart
      const { data: history } = await supabase
        .from('student_standards_mastery_history')
        .select('*')
        .eq('student_id', studentId)
        .order('assessed_at', { ascending: true })
        .limit(50);

      setHistoryData(history || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = masteryData.length;
    if (total === 0) return { total: 0, proficient: 0, advanced: 0, avgScore: 0 };

    const proficient = masteryData.filter(m => 
      m.mastery_level === 'proficient' || m.mastery_level === 'advanced'
    ).length;
    const advanced = masteryData.filter(m => m.mastery_level === 'advanced').length;
    const avgScore = masteryData.reduce((sum, m) => sum + (m.mastery_score || 0), 0) / total;

    return { total, proficient, advanced, avgScore };
  };

  const getTrendData = () => {
    const grouped = historyData.reduce((acc, item) => {
      const date = new Date(item.assessed_at).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, scores: [] };
      }
      acc[date].scores.push(item.mastery_score);
      return acc;
    }, {} as any);

    return Object.values(grouped).map((g: any) => ({
      date: g.date,
      avgScore: g.scores.reduce((sum: number, s: number) => sum + s, 0) / g.scores.length
    }));
  };

  const subjects = [...new Set(masteryData.map(m => m.standard?.subject))];
  const stats = calculateStats();
  const trendData = getTrendData();

  if (loading) {
    return <div className="flex justify-center p-8">Loading progress data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Standards Progress</h2>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Standards Tracked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.proficient}</p>
                <p className="text-sm text-muted-foreground">Proficient+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats.advanced}</p>
                <p className="text-sm text-muted-foreground">Advanced</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(stats.avgScore)}%</p>
                <p className="text-sm text-muted-foreground">Average Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Progress Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="avgScore" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Standards Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {masteryData.slice(0, 10).map((mastery) => (
              <div key={mastery.id} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <Badge variant="outline">{mastery.standard?.standard_code}</Badge>
                      <Badge variant="secondary">Grade {mastery.standard?.grade_level}</Badge>
                      <Badge>{mastery.standard?.subject}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{mastery.standard?.domain}</p>
                  </div>
                  <Badge variant={mastery.mastery_level === 'advanced' ? 'default' : 'secondary'}>
                    {mastery.mastery_level}
                  </Badge>
                </div>
                <Progress value={mastery.mastery_score || 0} className="h-2" />
                <p className="text-xs text-muted-foreground text-right">
                  {Math.round(mastery.mastery_score || 0)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};