import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, MessageSquare, AlertTriangle, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TeacherFeedbackInterfaceProps {
  submission: {
    id: string;
    assignment_id: string;
    student_id: string;
    content?: string;
    file_url?: string;
    file_name?: string;
    grade: number | null;
    plagiarism_score: number | null;
    plagiarism_status: string;
    is_late: boolean;
    late_penalty_applied: number;
    created_at: string;
    student: { name: string };
    assignment: { title: string; total_points: number };
  };
  teacherId: string;
  onGradeSubmitted?: () => void;
}

export function TeacherFeedbackInterface({
  submission,
  teacherId,
  onGradeSubmitted
}: TeacherFeedbackInterfaceProps) {
  const [grade, setGrade] = useState(submission.grade?.toString() || '');
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [plagiarismReport, setPlagiarismReport] = useState<any>(null);
  const [existingFeedback, setExistingFeedback] = useState<any[]>([]);

  useEffect(() => {
    fetchExistingFeedback();
    if (submission.plagiarism_score !== null) {
      fetchPlagiarismReport();
    }
  }, [submission.id]);

  const fetchExistingFeedback = async () => {
    try {
      const { data, error } = await supabase
        .from('submission_feedback')
        .select(`
          *,
          teacher:user_profiles(name)
        `)
        .eq('submission_id', submission.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExistingFeedback(data || []);
    } catch (error) {
      console.error('Error fetching feedback:', error);
    }
  };

  const fetchPlagiarismReport = async () => {
    try {
      const { data, error } = await supabase
        .from('plagiarism_reports')
        .select('*')
        .eq('submission_id', submission.id)
        .single();

      if (error) throw error;
      setPlagiarismReport(data);
    } catch (error) {
      console.error('Error fetching plagiarism report:', error);
    }
  };

  const handleGradeSubmission = async () => {
    setIsSubmitting(true);
    try {
      // Update grade
      const { error: gradeError } = await supabase
        .from('assignment_submissions')
        .update({
          grade: parseFloat(grade),
          status: 'graded'
        })
        .eq('id', submission.id);

      if (gradeError) throw gradeError;

      // Add feedback if provided
      if (feedback.trim()) {
        const { error: feedbackError } = await supabase
          .from('submission_feedback')
          .insert({
            submission_id: submission.id,
            teacher_id: teacherId,
            feedback_text: feedback,
            feedback_type: 'general'
          });

        if (feedbackError) throw feedbackError;
      }

      // Send notification to student
      await supabase.from('notifications').insert({
        user_id: submission.student_id,
        title: 'Assignment Graded',
        message: `Your assignment "${submission.assignment.title}" has been graded: ${grade}%`,
        type: 'grade_posted',
        related_id: submission.id
      });

      setFeedback('');
      fetchExistingFeedback();
      onGradeSubmitted?.();
    } catch (error) {
      console.error('Error submitting grade:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadFile = async () => {
    if (submission.file_url) {
      window.open(submission.file_url, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Submission Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{submission.assignment.title}</CardTitle>
              <p className="text-gray-600">Student: {submission.student.name}</p>
              <p className="text-sm text-gray-500">
                Submitted: {new Date(submission.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              {submission.is_late && (
                <Badge variant="destructive">
                  Late (-{submission.late_penalty_applied}%)
                </Badge>
              )}
              {submission.plagiarism_score !== null && (
                <Badge 
                  variant={submission.plagiarism_score > 30 ? "destructive" : "secondary"}
                >
                  Plagiarism: {submission.plagiarism_score}%
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="plagiarism">Plagiarism</TabsTrigger>
          <TabsTrigger value="grading">Grading</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Submission Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {submission.file_name && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    <span>{submission.file_name}</span>
                  </div>
                  <Button size="sm" onClick={downloadFile}>
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              )}
              
              {submission.content && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Text Response:</h4>
                  <div className="whitespace-pre-wrap text-sm">
                    {submission.content}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plagiarism" className="space-y-4">
          {submission.plagiarism_score !== null ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Plagiarism Report
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-red-600">
                    {submission.plagiarism_score}%
                  </div>
                  <div>
                    <p className="font-medium">Similarity Score</p>
                    <p className="text-sm text-gray-600">
                      Status: {submission.plagiarism_status}
                    </p>
                  </div>
                </div>

                {plagiarismReport && (
                  <div className="space-y-3">
                    {plagiarismReport.flagged_content && (
                      <div>
                        <h4 className="font-medium mb-2">Flagged Content:</h4>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(plagiarismReport.flagged_content), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {plagiarismReport.sources_found && (
                      <div>
                        <h4 className="font-medium mb-2">Sources Found:</h4>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <pre className="text-sm whitespace-pre-wrap">
                            {JSON.stringify(JSON.parse(plagiarismReport.sources_found), null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Plagiarism check in progress...</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="grading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Grade Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Grade (out of {submission.assignment.total_points || 100} points):
                </label>
                <Input
                  type="number"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="Enter grade..."
                  min="0"
                  max={submission.assignment.total_points || 100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Feedback (optional):
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the student..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleGradeSubmission}
                disabled={!grade || isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Grade & Feedback'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Feedback History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {existingFeedback.length > 0 ? (
                <div className="space-y-3">
                  {existingFeedback.map((fb) => (
                    <div key={fb.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{fb.feedback_text}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {fb.teacher.name} - {new Date(fb.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-center py-4">No feedback provided yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}