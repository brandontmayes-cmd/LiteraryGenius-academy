import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { useTeacherData } from '../hooks/useTeacherData';
import { useNotifications } from '../hooks/useNotifications';
import { EnhancedAssignmentCreator } from './EnhancedAssignmentCreator';
import { ReportDashboard } from './reports/ReportDashboard';
import { TeacherGradebook } from './TeacherGradebook';

import { ContentManagement } from './ContentManagement';
import AssignmentAnalyticsDashboard from './AssignmentAnalyticsDashboard';
import { AssignmentManagementDashboard } from './AssignmentManagementDashboard';
import { AutomatedEssayScoring } from './AutomatedEssayScoring';
import TeacherCurriculumHub from './teacher/TeacherCurriculumHub';
import { StandardsReportGenerator } from './teacher/StandardsReportGenerator';
import { UserMenu } from './UserMenu';
import { MobileTeacherDashboard } from './MobileTeacherDashboard';
import { useIsMobile } from '../hooks/use-mobile';
import { useAuth } from '../contexts/AuthContext';
import { PushNotificationPrompt } from './PushNotificationPrompt';


import { 
  Users, 
  BookOpen, 
  MessageSquare, 
  TrendingUp, 
  Calendar, 
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

export const TeacherDashboard: React.FC = () => {
  const { data, loading, error } = useTeacherData();
  const { sendNotification } = useNotifications();
  const [showAssignmentCreator, setShowAssignmentCreator] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const handleCreateAssignment = (assignment: any) => {
    console.log('Creating assignment:', assignment);
    setShowAssignmentCreator(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1e3a5f] -mx-6 -mt-6 px-6 py-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68caf8605a414d406590b724_1760015224395_1fa7a05d.jpeg" 
            alt="Literary Genius Academy" 
            className="w-12 h-12 rounded-full border-2 border-[#d4af37] cursor-pointer hover:opacity-90 transition"
            onClick={() => window.location.href = '/'}
          />
          <div>
            <h1 className="text-2xl font-bold text-[#f5e6d3]">Welcome back, {data.teacher?.name}</h1>
            <p className="text-[#d4af37]">{data.teacher?.class_name} • {data.teacher?.subject}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setShowAssignmentCreator(true)} className="bg-[#d4af37] text-[#1e3a5f] hover:bg-[#c19b2f]">
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
          <UserMenu />
        </div>
      </div>

      {/* Push Notification Prompt */}
      <PushNotificationPrompt userRole="teacher" />


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{data.students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Assignments</p>
                <p className="text-2xl font-bold">{data.assignments.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold">{data.messages.filter(m => !m.is_read).length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Class Average</p>
                <p className="text-2xl font-bold">
                  {data.students.length > 0 
                    ? Math.round(data.students.reduce((acc, s) => acc + s.average_score, 0) / data.students.length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Creator Modal */}
      {showAssignmentCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <EnhancedAssignmentCreator
            onSave={handleCreateAssignment}
            onCancel={() => setShowAssignmentCreator(false)}
          />
        </div>
      )}

      {/* Main Content Tabs */}
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-12">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="essay-scoring">Essay Scoring</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>





        <TabsContent value="essay-scoring" className="space-y-4">
          <AutomatedEssayScoring />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Class Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Class Performance Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1758135264866_f4ecba2d.webp"
                  alt="Class Performance Chart"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.submissions.slice(0, 5).map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{submission.student_name}</p>
                      <p className="text-sm text-gray-600">{submission.assignment_title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {submission.is_auto_graded && submission.auto_grade && (
                        <Badge variant="secondary">
                          Auto: {submission.auto_grade}%
                        </Badge>
                      )}
                      {submission.file_name && (
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          File
                        </Badge>
                      )}
                      <Badge variant={submission.status === 'submitted' ? 'default' : 'secondary'}>
                        {submission.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {data.submissions.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No recent submissions</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Assignment Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.submissions.map((submission) => (
                  <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{submission.student_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{submission.student_name}</h4>
                        <p className="text-sm text-gray-600">{submission.assignment_title}</p>
                        <p className="text-xs text-gray-500">
                          Submitted: {new Date(submission.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {submission.is_auto_graded && submission.auto_grade !== null && (
                        <div className="text-center">
                          <Badge variant="secondary" className="mb-1">
                            Auto-Graded
                          </Badge>
                          <p className="text-lg font-bold text-green-600">{submission.auto_grade}%</p>
                        </div>
                      )}
                      
                      {submission.file_name && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {submission.file_name}
                        </Badge>
                      )}
                      
                      <Badge variant={
                        submission.status === 'graded' ? 'default' : 
                        submission.status === 'submitted' ? 'secondary' : 'outline'
                      }>
                        {submission.status}
                      </Badge>
                      
                      <Button size="sm" variant="outline">
                        Review
                      </Button>
                    </div>
                  </div>
                ))}
                
                {data.submissions.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No submissions yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="students" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.students.map((student) => (
              <Card key={student.id}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar>
                      <AvatarFallback>{student.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-gray-600">{student.grade} Grade</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Average Score</span>
                        <span>{student.average_score}%</span>
                      </div>
                      <Progress value={student.average_score} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Assignments Completed</span>
                      <span>{student.assignments_completed}/{student.total_assignments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-6">
          <AssignmentManagementDashboard teacherId={data.teacher?.id || 'teacher1'} />
        </TabsContent>

        <TabsContent value="gradebook">
          <TeacherGradebook />
        </TabsContent>

        <TabsContent value="messages" className="space-y-6">
          <div className="space-y-4">
            {data.messages.map((message) => (
              <Card key={message.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>{message.parent_name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{message.parent_name}</h4>
                          <span className="text-sm text-gray-500">• {message.student_name}</span>
                          {!message.is_read && <Badge variant="destructive" className="text-xs">New</Badge>}
                        </div>
                        <h5 className="font-medium text-sm mb-2">{message.subject}</h5>
                        <p className="text-sm text-gray-700">{message.content}</p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(message.sent_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Button size="sm">Reply</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="content">
          <ContentManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AssignmentAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="curriculum">
          <TeacherCurriculumHub />
        </TabsContent>

        <TabsContent value="standards">
          <StandardsReportGenerator teacherId={data.teacher?.id || 'teacher1'} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportDashboard />
        </TabsContent>

      </Tabs>
    </div>
  );
};