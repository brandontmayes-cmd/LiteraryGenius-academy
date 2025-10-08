import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { FileText, Download, TrendingUp, Target, Award, AlertCircle } from 'lucide-react';

interface StandardsReport {
  student_id: string;
  grade_level: string;
  subject: string;
  generated_at: string;
  summary: {
    total_standards: number;
    proficient_standards: number;
    advanced_standards: number;
    developing_standards: number;
    not_started_standards: number;
    overall_mastery_percentage: number;
  };
  recommendations: string[];
  next_steps: string[];
}

interface StandardsReportGeneratorProps {
  studentId: string;
  studentName?: string;
}

export const StandardsReportGenerator: React.FC<StandardsReportGeneratorProps> = ({
  studentId,
  studentName = 'Student'
}) => {
  const [report, setReport] = useState<StandardsReport | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const generateReport = async () => {
    if (!selectedGrade || !selectedSubject) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('standards-alignment-engine', {
        body: {
          action: 'generate_standards_report',
          data: {
            studentId,
            gradeLevel: selectedGrade,
            subject: selectedSubject
          }
        }
      });

      if (error) throw error;
      setReport(data);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;

    const reportText = `
STANDARDS MASTERY REPORT
Student: ${studentName}
Grade Level: ${report.grade_level}
Subject: ${report.subject}
Generated: ${new Date(report.generated_at).toLocaleDateString()}

SUMMARY:
- Total Standards: ${report.summary.total_standards}
- Proficient or Above: ${report.summary.proficient_standards}
- Advanced: ${report.summary.advanced_standards}
- Developing: ${report.summary.developing_standards}
- Not Started: ${report.summary.not_started_standards}
- Overall Mastery: ${report.summary.overall_mastery_percentage}%

RECOMMENDATIONS:
${report.recommendations.map(rec => `• ${rec}`).join('\n')}

NEXT STEPS:
${report.next_steps.map(step => `• ${step}`).join('\n')}
    `;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${studentName}_Standards_Report_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Standards Mastery Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="K">Kindergarten</SelectItem>
                <SelectItem value="1">Grade 1</SelectItem>
                <SelectItem value="2">Grade 2</SelectItem>
                <SelectItem value="3">Grade 3</SelectItem>
                <SelectItem value="4">Grade 4</SelectItem>
                <SelectItem value="5">Grade 5</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ELA">English Language Arts</SelectItem>
                <SelectItem value="Math">Mathematics</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={generateReport}
              disabled={!selectedGrade || !selectedSubject || generating}
            >
              {generating ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-6">
          {/* Report Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Standards Mastery Report</CardTitle>
                <Button onClick={downloadReport} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Student: {studentName} | Grade {report.grade_level} | {report.subject} | 
                Generated: {new Date(report.generated_at).toLocaleDateString()}
              </div>
            </CardHeader>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{report.summary.total_standards}</p>
                <p className="text-sm text-muted-foreground">Total Standards</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{report.summary.advanced_standards}</p>
                <p className="text-sm text-muted-foreground">Advanced</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">{report.summary.proficient_standards}</p>
                <p className="text-sm text-muted-foreground">Proficient</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">{report.summary.developing_standards}</p>
                <p className="text-sm text-muted-foreground">Developing</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {report.summary.overall_mastery_percentage}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Mastery</p>
                <Progress 
                  value={report.summary.overall_mastery_percentage} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.next_steps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Badge className="mt-0.5">
                      {index + 1}
                    </Badge>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};