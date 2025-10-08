import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Target, Award, BookOpen } from 'lucide-react';

interface MasteryData {
  id: string;
  standard_id: string;
  mastery_level: string;
  mastery_score: number;
  last_assessed_at: string;
  standard: {
    standard_code: string;
    grade_level: string;
    subject: string;
    domain: string;
    standard_text: string;
  };
}

interface StandardsMasteryProps {
  studentId: string;
}

export const StandardsMastery: React.FC<StandardsMasteryProps> = ({ studentId }) => {
  const [masteryData, setMasteryData] = useState<MasteryData[]>([]);
  const [filteredData, setFilteredData] = useState<MasteryData[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMasteryData();
  }, [studentId]);

  useEffect(() => {
    filterData();
  }, [masteryData, selectedSubject, selectedGrade]);

  const fetchMasteryData = async () => {
    try {
      const { data, error } = await supabase
        .from('student_standards_mastery')
        .select(`
          *,
          standard:common_core_standards(*)
        `)
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setMasteryData(data || []);
    } catch (error) {
      console.error('Error fetching mastery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterData = () => {
    let filtered = masteryData;

    if (selectedSubject) {
      filtered = filtered.filter(m => m.standard.subject === selectedSubject);
    }

    if (selectedGrade) {
      filtered = filtered.filter(m => m.standard.grade_level === selectedGrade);
    }

    setFilteredData(filtered);
  };

  const getMasteryColor = (level: string) => {
    switch (level) {
      case 'advanced': return 'bg-green-500';
      case 'proficient': return 'bg-blue-500';
      case 'developing': return 'bg-yellow-500';
      default: return 'bg-gray-300';
    }
  };

  const getMasteryBadgeVariant = (level: string) => {
    switch (level) {
      case 'advanced': return 'default';
      case 'proficient': return 'secondary';
      case 'developing': return 'outline';
      default: return 'outline';
    }
  };

  const calculateOverallStats = () => {
    const total = filteredData.length;
    if (total === 0) return { total: 0, proficient: 0, advanced: 0, avgScore: 0 };

    const proficient = filteredData.filter(m => 
      m.mastery_level === 'proficient' || m.mastery_level === 'advanced'
    ).length;
    const advanced = filteredData.filter(m => m.mastery_level === 'advanced').length;
    const avgScore = filteredData.reduce((sum, m) => sum + (m.mastery_score || 0), 0) / total;

    return { total, proficient, advanced, avgScore };
  };

  const subjects = [...new Set(masteryData.map(m => m.standard.subject))];
  const grades = [...new Set(masteryData.map(m => m.standard.grade_level))].sort();
  const stats = calculateOverallStats();

  if (loading) {
    return <div className="flex justify-center p-8">Loading mastery data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
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
                <p className="text-sm text-muted-foreground">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mastery List */}
      <div className="grid gap-4">
        {filteredData.map((mastery) => (
          <Card key={mastery.id}>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <Badge variant="outline">{mastery.standard.standard_code}</Badge>
                      <Badge variant="secondary">Grade {mastery.standard.grade_level}</Badge>
                      <Badge>{mastery.standard.subject}</Badge>
                      <Badge variant={getMasteryBadgeVariant(mastery.mastery_level)}>
                        {mastery.mastery_level.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      <strong>{mastery.standard.domain}</strong>
                    </p>
                    
                    <p className="text-sm">{mastery.standard.standard_text}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mastery Score</span>
                    <span>{Math.round(mastery.mastery_score || 0)}%</span>
                  </div>
                  <Progress 
                    value={mastery.mastery_score || 0} 
                    className="h-2"
                  />
                </div>

                {mastery.last_assessed_at && (
                  <p className="text-xs text-muted-foreground">
                    Last assessed: {new Date(mastery.last_assessed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredData.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No mastery data available for the selected filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};