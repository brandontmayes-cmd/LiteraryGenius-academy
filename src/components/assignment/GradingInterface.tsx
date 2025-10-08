import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface Submission {
  id: string;
  student_name: string;
  student_id: string;
  submitted_at: string;
  answers: Record<string, any>;
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'returned';
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'essay' | 'file_upload' | 'short_answer';
  question: string;
  points: number;
  correct_answer?: string | number;
  rubric?: string;
}

interface GradingInterfaceProps {
  assignment: {
    id: string;
    title: string;
    questions: Question[];
    total_points: number;
  };
  submissions: Submission[];
  onGradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  onClose: () => void;
}

export const GradingInterface: React.FC<GradingInterfaceProps> = ({ 
  assignment, 
  submissions, 
  onGradeSubmission, 
  onClose 
}) => {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');

  const autoGradeObjective = (submission: Submission) => {
    let score = 0;
    let totalObjectivePoints = 0;

    assignment.questions.forEach(question => {
      if (question.type === 'multiple_choice' || question.type === 'short_answer') {
        totalObjectivePoints += question.points;
        const answer = submission.answers[question.id];
        if (question.correct_answer !== undefined && answer === question.correct_answer) {
          score += question.points;
        }
      }
    });

    return { score, totalObjectivePoints };
  };

  const calculateTotalGrade = (submission: Submission) => {
    const { score: objectiveScore } = autoGradeObjective(submission);
    const subjectiveScore = Object.keys(grades).reduce((sum, questionId) => {
      const question = assignment.questions.find(q => q.id === questionId);
      if (question && (question.type === 'essay' || question.type === 'file_upload')) {
        return sum + (grades[questionId] || 0);
      }
      return sum;
    }, 0);
    
    return objectiveScore + subjectiveScore;
  };

  const handleGradeSubmission = () => {
    if (!selectedSubmission) return;
    
    const totalGrade = calculateTotalGrade(selectedSubmission);
    onGradeSubmission(selectedSubmission.id, totalGrade, feedback);
    setSelectedSubmission(null);
    setGrades({});
    setFeedback('');
  };

  const gradedCount = submissions.filter(s => s.status === 'graded' || s.status === 'returned').length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Grade Assignment: {assignment.title}</span>
            <div className="flex items-center gap-4">
              <div className="text-sm">
                Progress: {gradedCount}/{submissions.length} graded
              </div>
              <Progress value={(gradedCount / submissions.length) * 100} className="w-32" />
              <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
            {/* Submissions List */}
            <Card className="overflow-y-auto">
              <CardHeader className="pb-3">
                <h3 className="font-medium">Submissions</h3>
              </CardHeader>
              <CardContent className="space-y-2">
                {submissions.map(submission => (
                  <div
                    key={submission.id}
                    className={`p-3 border rounded cursor-pointer transition-colors ${
                      selectedSubmission?.id === submission.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedSubmission(submission)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{submission.student_name}</span>
                      {submission.status === 'graded' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : submission.status === 'returned' ? (
                        <Badge variant="secondary">Returned</Badge>
                      ) : (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                    </div>
                    {submission.grade && (
                      <div className="text-sm font-medium text-blue-600">
                        Grade: {submission.grade}/{assignment.total_points}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Grading Panel */}
            {selectedSubmission && (
              <>
                <Card className="lg:col-span-2 overflow-y-auto">
                  <CardHeader>
                    <h3 className="font-medium">
                      Grading: {selectedSubmission.student_name}
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {assignment.questions.map(question => {
                      const answer = selectedSubmission.answers[question.id];
                      const { score } = autoGradeObjective(selectedSubmission);
                      
                      return (
                        <Card key={question.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{question.question}</h4>
                              <Badge>{question.points} pts</Badge>
                            </div>
                            
                            <div className="mb-3 p-3 bg-gray-50 rounded">
                              <strong>Student Answer:</strong>
                              <div className="mt-1">
                                {question.type === 'file_upload' ? (
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{answer || 'No file uploaded'}</span>
                                  </div>
                                ) : (
                                  answer || 'No answer provided'
                                )}
                              </div>
                            </div>

                            {(question.type === 'essay' || question.type === 'file_upload') && (
                              <div className="space-y-2">
                                {question.rubric && (
                                  <div className="text-sm text-gray-600 p-2 bg-blue-50 rounded">
                                    <strong>Rubric:</strong> {question.rubric}
                                  </div>
                                )}
                                <div className="flex items-center gap-2">
                                  <label className="text-sm font-medium">Grade:</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={question.points}
                                    value={grades[question.id] || ''}
                                    onChange={(e) => setGrades({
                                      ...grades,
                                      [question.id]: Number(e.target.value)
                                    })}
                                    className="w-20"
                                  />
                                  <span className="text-sm text-gray-500">/ {question.points}</span>
                                </div>
                              </div>
                            )}

                            {(question.type === 'multiple_choice' || question.type === 'short_answer') && (
                              <div className="flex items-center gap-2">
                                {answer === question.correct_answer ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <XCircle className="h-5 w-5 text-red-500" />
                                )}
                                <span className="text-sm">
                                  {answer === question.correct_answer ? 'Correct' : 'Incorrect'} 
                                  ({answer === question.correct_answer ? question.points : 0}/{question.points} pts)
                                </span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Overall Feedback</h4>
                        <Textarea
                          placeholder="Provide feedback to the student..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={4}
                        />
                        <div className="flex justify-between items-center mt-4">
                          <div className="text-lg font-medium">
                            Total Grade: {calculateTotalGrade(selectedSubmission)}/{assignment.total_points}
                          </div>
                          <Button onClick={handleGradeSubmission}>
                            Submit Grade
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};