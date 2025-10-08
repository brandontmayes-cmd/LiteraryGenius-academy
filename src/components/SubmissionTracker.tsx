import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Clock, CheckCircle, AlertTriangle, MessageSquare, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  grade: number | null;
  status: string;
  is_late: boolean;
  late_penalty_applied: number;
  plagiarism_score: number | null;
  plagiarism_status: string;
  resubmission_count: number;
  created_at: string;
  file_name?: string;
  content?: string;
  assignment: {
    title: string;
    due_date: string;
    max_resubmissions: number;
  };
  feedback?: Array<{
    id: string;
    feedback_text: string;
    feedback_type: string;
    created_at: string;
    teacher: { name: string };
  }>;
}

interface SubmissionTrackerProps {
  studentId: string;
}

export function SubmissionTracker({ studentId }: SubmissionTrackerProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [studentId]);

  const fetchSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment:assignments(title, due_date, max_resubmissions),
          feedback:submission_feedback(
            id, feedback_text, feedback_type, created_at,
            teacher:user_profiles(name)
          )
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlagiarismColor = (score: number | null) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score > 50) return 'bg-red-100 text-red-800';
    if (score > 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  if (loading) {
    return <div className="text-center py-8">Loading submissions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {submissions.map((submission) => (
          <Card key={submission.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{submission.assignment.title}</CardTitle>
                  <p className="text-sm text-gray-600">
                    Submitted: {new Date(submission.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(submission.status)}>
                    {submission.status}
                  </Badge>
                  {submission.is_late && (
                    <Badge variant="destructive">Late</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">Grade:</span>
                  <div className="mt-1">
                    {submission.grade !== null ? (
                      <Badge variant="outline">{submission.grade}%</Badge>
                    ) : (
                      <span className="text-gray-500">Pending</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Plagiarism:</span>
                  <div className="mt-1">
                    {submission.plagiarism_score !== null ? (
                      <Badge className={getPlagiarismColor(submission.plagiarism_score)}>
                        {submission.plagiarism_score}%
                      </Badge>
                    ) : (
                      <span className="text-gray-500">Checking...</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Resubmissions:</span>
                  <div className="mt-1">
                    <span className="text-gray-700">
                      {submission.resubmission_count}/{submission.assignment.max_resubmissions}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">File:</span>
                  <div className="mt-1">
                    {submission.file_name ? (
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        <span className="text-xs truncate">{submission.file_name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Text only</span>
                    )}
                  </div>
                </div>
              </div>

              {submission.late_penalty_applied > 0 && (
                <div className="bg-red-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Late Penalty Applied</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    {submission.late_penalty_applied}% deducted for late submission
                  </p>
                </div>
              )}

              {submission.feedback && submission.feedback.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    <span className="font-medium">Teacher Feedback</span>
                  </div>
                  <div className="space-y-2">
                    {submission.feedback.map((feedback) => (
                      <div key={feedback.id} className="text-sm">
                        <p className="text-blue-800">{feedback.feedback_text}</p>
                        <p className="text-blue-600 text-xs mt-1">
                          - {feedback.teacher.name}, {new Date(feedback.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedSubmission(submission)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {submissions.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No submissions yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}