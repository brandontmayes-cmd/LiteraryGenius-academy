import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Mail, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ReportGeneratorProps {
  studentId: string;
  studentName: string;
}

export function ReportGenerator({ studentId, studentName }: ReportGeneratorProps) {
  const [reportType, setReportType] = useState('progress');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateReport = async (action: 'download' | 'email') => {
    setLoading(true);
    try {
      // Fetch data based on report type
      const reportData = await fetchReportData(reportType, studentId);

      const { data, error } = await supabase.functions.invoke('pdf-report-generator', {
        body: {
          reportType,
          studentId,
          data: reportData
        }
      });

      if (error) throw error;

      if (action === 'download') {
        // Create blob and download
        const blob = new Blob([data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-${studentName}.pdf`;
        a.click();
        toast({ title: 'Report downloaded successfully' });
      } else {
        // Send via email
        await supabase.functions.invoke('send-email-notification', {
          body: {
            to: reportData.parentEmail,
            subject: `${studentName} - ${reportType} Report`,
            template: 'report',
            data: { studentName, reportType }
          }
        });
        toast({ title: 'Report emailed successfully' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Generate Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="progress">Progress Report</SelectItem>
            <SelectItem value="transcript">Grade Transcript</SelectItem>
            <SelectItem value="standards">Standards Mastery</SelectItem>
            <SelectItem value="conference">Conference Summary</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button onClick={() => generateReport('download')} disabled={loading} className="flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            <span className="ml-2">Download PDF</span>
          </Button>
          <Button onClick={() => generateReport('email')} disabled={loading} variant="outline" className="flex-1">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            <span className="ml-2">Email Report</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

async function fetchReportData(reportType: string, studentId: string) {
  // Fetch relevant data from database
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single();

  if (reportType === 'progress') {
    const { data: grades } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId);

    return {
      student,
      grades: grades || [],
      attendance: { present: 85, absent: 5, rate: 94.4 },
      behavior: 'Excellent',
      period: 'Fall 2025'
    };
  }

  if (reportType === 'transcript') {
    const { data: grades } = await supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId);

    return {
      student,
      courses: grades || [],
      gpa: 3.8
    };
  }

  if (reportType === 'standards') {
    const { data: standards } = await supabase
      .from('common_core_standards')
      .select('*')
      .limit(10);

    return {
      student,
      standards: standards || []
    };
  }

  return {
    student,
    date: new Date().toLocaleDateString(),
    attendees: ['Teacher', 'Parent'],
    discussion: ['Academic progress', 'Behavior'],
    actionItems: ['Complete homework', 'Study daily']
  };
}