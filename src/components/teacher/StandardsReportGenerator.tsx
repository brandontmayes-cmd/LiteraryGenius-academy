import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { FileText, Download, TrendingUp, AlertCircle, Target } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface StandardsReportGeneratorProps {
  teacherId: string;
}

export const StandardsReportGenerator: React.FC<StandardsReportGeneratorProps> = ({ teacherId }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [heatMapData, setHeatMapData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('students')
      .select('*')
      .eq('teacher_id', teacherId);
    setStudents(data || []);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      // Fetch mastery data
      const query = supabase
        .from('student_standards_mastery')
        .select(`
          *,
          standard:common_core_standards(*)
        `);

      if (selectedStudent) query.eq('student_id', selectedStudent);
      if (selectedSubject) query.eq('common_core_standards.subject', selectedSubject);
      if (selectedGrade) query.eq('common_core_standards.grade_level', selectedGrade);

      const { data: masteryData } = await query;

      // Calculate statistics
      const total = masteryData?.length || 0;
      const advanced = masteryData?.filter(m => m.mastery_level === 'advanced').length || 0;
      const proficient = masteryData?.filter(m => m.mastery_level === 'proficient').length || 0;
      const developing = masteryData?.filter(m => m.mastery_level === 'developing').length || 0;
      const avgScore = total > 0 
        ? masteryData!.reduce((sum, m) => sum + (m.mastery_score || 0), 0) / total 
        : 0;

      // Generate heat map
      const heatMap = generateHeatMap(masteryData || []);
      setHeatMapData(heatMap);

      // Get recommendations
      const { data: recommendations } = await supabase.functions.invoke('standards-report-generator', {
        body: {
          reportType: selectedStudent ? 'student' : 'class',
          studentId: selectedStudent,
          subject: selectedSubject,
          gradeLevel: selectedGrade
        }
      });

      setReportData({
        total,
        advanced,
        proficient,
        developing,
        avgScore,
        masteryData,
        recommendations: recommendations?.recommendations || []
      });
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateHeatMap = (data: any[]) => {
    const domains = [...new Set(data.map(m => m.standard?.domain))];
    return domains.map(domain => {
      const domainData = data.filter(m => m.standard?.domain === domain);
      const avgScore = domainData.reduce((sum, m) => sum + (m.mastery_score || 0), 0) / domainData.length;
      return { domain, avgScore, count: domainData.length };
    });
  };

  const exportToPDF = () => {
    window.print();
  };

  const getHeatColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-green-400';
    if (score >= 70) return 'bg-yellow-400';
    if (score >= 60) return 'bg-orange-400';
    return 'bg-red-400';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Standards Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="All Students" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Students</SelectItem>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                <SelectItem value="Mathematics">Mathematics</SelectItem>
                <SelectItem value="English Language Arts">English Language Arts</SelectItem>
                <SelectItem value="Science">Science</SelectItem>
                <SelectItem value="Social Studies">Social Studies</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger>
                <SelectValue placeholder="All Grades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
                  <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={generateReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{reportData.total}</p>
                    <p className="text-sm text-muted-foreground">Total Standards</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{reportData.advanced}</p>
                    <p className="text-sm text-muted-foreground">Advanced</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div>
                  <p className="text-2xl font-bold">{reportData.proficient}</p>
                  <p className="text-sm text-muted-foreground">Proficient</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div>
                  <p className="text-2xl font-bold">{Math.round(reportData.avgScore)}%</p>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Standards Coverage Heat Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {heatMapData.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.domain}</span>
                      <span>{Math.round(item.avgScore)}% ({item.count} standards)</span>
                    </div>
                    <div className="h-8 rounded overflow-hidden">
                      <div 
                        className={`h-full ${getHeatColor(item.avgScore)} transition-all`}
                        style={{ width: `${item.avgScore}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.recommendations.map((rec: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg">
                    <div className="flex items-start gap-3">
                      <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                        {rec.priority}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{rec.message}</p>
                        {rec.actionItems && (
                          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                            {rec.actionItems.map((item: string, i: number) => (
                              <li key={i}>• {item}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={exportToPDF} className="gap-2">
              <Download className="h-4 w-4" />
              Export to PDF
            </Button>
          </div>
        </>
      )}
    </div>
  );
};