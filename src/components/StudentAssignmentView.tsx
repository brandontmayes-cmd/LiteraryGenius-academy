import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';
import { EnhancedAssignmentSubmission } from './EnhancedAssignmentSubmission';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  FileText,
  TrendingUp
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  created_at: string;
  questions?: any[];
  max_score?: number;
  type: string;
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  answers: any;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  synced?: boolean;
}

interface StudentAssignmentViewProps {
  studentId: string;
}

export const StudentAssignmentView: React.FC<StudentAssignmentViewProps> = ({ studentId }) => {
  const { getOfflineAssignments, getOfflineSubmissions, syncStatus } = useOfflineSync();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [assignmentsData, submissionsData] = await Promise.all([
        getOfflineAssignments(),
        getOfflineSubmissions(studentId)
      ]);
      
      setAssignments(assignmentsData);
      setSubmissions(submissionsData);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const submission = submissions.find(s => s.assignment_id === assignment.id);
    const dueDate = new Date(assignment.due_date);
    const now = new Date();

    if (submission) {
      if (submission.grade !== undefined) return 'graded';
      return submission.synced ? 'submitted' : 'pending';
    }
    
    if (dueDate < now) return 'overdue';
    
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDue < 24) return 'due_soon';
    
    return 'available';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Graded</Badge>;
      case 'submitted':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Sync</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Overdue</Badge>;
      case 'due_soon':
        return <Badge className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Due Soon</Badge>;
      default:
        return <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" />Available</Badge>;
    }
  };

  const getProgressStats = () => {
    const total = assignments.length;
    const submitted = submissions.filter(s => s.assignment_id).length;
    const graded = submissions.filter(s => s.grade !== undefined).length;
    const overdue = assignments.filter(a => 
      new Date(a.due_date) < new Date() && 
      !submissions.find(s => s.assignment_id === a.id)
    ).length;

    return { total, submitted, graded, overdue };
  };

  const stats = getProgressStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (selectedAssignment) {
    return (
      <div className="space-y-4">
        <Button 
          variant="outline" 
          onClick={() => setSelectedAssignment(null)}
          className="mb-4"
        >
          ← Back to Assignments
        </Button>
        <EnhancedAssignmentSubmission
          assignment={selectedAssignment}
          questions={selectedAssignment.questions}
          studentId={studentId}
          onSubmissionComplete={() => {
            setSelectedAssignment(null);
            loadData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sync Status */}
      <OfflineSyncIndicator />

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.submitted}</div>
            <div className="text-sm text-gray-600">Submitted</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.graded}</div>
            <div className="text-sm text-gray-600">Graded</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <div className="text-sm text-gray-600">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {assignments.map(assignment => {
            const status = getAssignmentStatus(assignment);
            const submission = submissions.find(s => s.assignment_id === assignment.id);
            
            return (
              <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <BookOpen className="w-4 h-4" />
                          <span>{assignment.subject}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Due {new Date(assignment.due_date).toLocaleDateString()}</span>
                        </div>
                        {assignment.max_score && (
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <TrendingUp className="w-4 h-4" />
                            <span>{assignment.max_score} points</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(status)}
                      {submission?.grade !== undefined && (
                        <div className="text-lg font-semibold text-green-600">
                          {submission.grade}%
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {assignment.questions && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{assignment.questions.length} questions</span>
                        </div>
                      )}
                      {submission && !submission.synced && (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          Waiting to sync
                        </Badge>
                      )}
                    </div>
                    
                    {status === 'available' || status === 'due_soon' || status === 'overdue' ? (
                      <Button 
                        onClick={() => setSelectedAssignment(assignment)}
                        size="sm"
                        variant={status === 'overdue' ? 'destructive' : 'default'}
                      >
                        {status === 'overdue' ? 'Submit Late' : 'Start Assignment'}
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => setSelectedAssignment(assignment)}
                        size="sm"
                        variant="outline"
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                  
                  {submission?.feedback && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Teacher Feedback:</strong> {submission.feedback}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="available">
          {assignments
            .filter(a => ['available', 'due_soon', 'overdue'].includes(getAssignmentStatus(a)))
            .map(assignment => (
              <Card key={assignment.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{assignment.title}</h3>
                      <p className="text-sm text-gray-600">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
                    </div>
                    <Button onClick={() => setSelectedAssignment(assignment)} size="sm">
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="submitted">
          {assignments
            .filter(a => ['submitted', 'pending'].includes(getAssignmentStatus(a)))
            .map(assignment => {
              const submission = submissions.find(s => s.assignment_id === assignment.id);
              return (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">
                          Submitted: {submission ? new Date(submission.submitted_at).toLocaleDateString() : 'Unknown'}
                        </p>
                      </div>
                      {getStatusBadge(getAssignmentStatus(assignment))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        <TabsContent value="graded">
          {assignments
            .filter(a => getAssignmentStatus(a) === 'graded')
            .map(assignment => {
              const submission = submissions.find(s => s.assignment_id === assignment.id);
              return (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{assignment.title}</h3>
                        <p className="text-sm text-gray-600">
                          Grade: {submission?.grade}% 
                          {assignment.max_score && ` (${Math.round((submission?.grade || 0) / 100 * assignment.max_score)} / ${assignment.max_score} points)`}
                        </p>
                      </div>
                      <Button onClick={() => setSelectedAssignment(assignment)} size="sm" variant="outline">
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>
      </Tabs>
    </div>
  );
};