import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Mail, Calendar, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ReportGenerator } from './ReportGenerator';

interface Report {
  id: string;
  type: string;
  student_name: string;
  generated_at: string;
  generated_by: string;
  status: string;
}

export function ReportDashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    // Mock data - in production, fetch from database
    setReports([
      {
        id: '1',
        type: 'Progress Report',
        student_name: 'Emma Johnson',
        generated_at: new Date().toISOString(),
        generated_by: 'Mrs. Smith',
        status: 'sent'
      },
      {
        id: '2',
        type: 'Transcript',
        student_name: 'Liam Chen',
        generated_at: new Date().toISOString(),
        generated_by: 'Mr. Davis',
        status: 'draft'
      }
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Report Management</h2>
        <Button onClick={() => setSelectedStudent('new')}>
          <FileText className="h-4 w-4 mr-2" />
          Generate New Report
        </Button>
      </div>

      {selectedStudent && (
        <ReportGenerator 
          studentId={selectedStudent} 
          studentName="Selected Student"
        />
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{report.type}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="h-3 w-3" />
                      <span>{report.student_name}</span>
                      <span>•</span>
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(report.generated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'sent' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}