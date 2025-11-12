import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ParentProgressChart } from './ParentProgressChart';
import { ParentCommunication } from './ParentCommunication';
import { NotificationSettings } from './NotificationSettings';
import { useParentData } from '../hooks/useParentData';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CardDescription } from '@/components/ui/card';
import { Clock, BookOpen, Trophy, MessageCircle, AlertTriangle, Calendar, TrendingUp, BarChart3, Bell, Settings } from 'lucide-react';
import { ParentStandardsProgress } from './ParentStandardsProgress';
import { UserMenu } from './UserMenu';
import { PushNotificationPrompt } from './PushNotificationPrompt';
import StandardsBasedQuestionGenerator from './StandardsBasedQuestionGenerator';
import QuestionBankManager from './QuestionBankManager';





export const ParentDashboard = () => {
  const {
    students,
    selectedStudent,
    setSelectedStudent,
    assignments,
    grades,
    achievements,
    studySessions,
    messages,
    loading
  } = useParentData();

  const [newMessage, setNewMessage] = useState({ subject: '', content: '' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Students Found</CardTitle>
            <CardDescription>
              No students are associated with your account. Please contact your school administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  // Calculate statistics from real data
  const totalStudyTime = studySessions.reduce((sum, session) => sum + session.duration_minutes, 0);
  const completedAssignments = grades.filter(g => g.status === 'completed').length;
  const averageGrade = grades.length > 0 ? grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length : 0;
  const upcomingAssignments = assignments.filter(a => new Date(a.due_date) > new Date()).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-[#1e3a5f] -mx-4 -mt-8 px-6 py-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68caf8605a414d406590b724_1760015224395_1fa7a05d.jpeg" 
            alt="Literary Genius Academy" 
            className="w-12 h-12 rounded-full border-2 border-[#d4af37] cursor-pointer hover:opacity-90 transition"
            onClick={() => window.location.href = '/'}
          />
          <h1 className="text-2xl font-bold text-[#f5e6d3]">Parent Dashboard</h1>
        </div>
        <UserMenu />
      </div>

      <div className="mb-8">

        {students.length > 1 && (
          <Select value={selectedStudent.id} onValueChange={(value) => {
            const student = students.find(s => s.id === value);
            if (student) setSelectedStudent(student);
          }}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id}>
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={student.avatar_url} />
                      <AvatarFallback>{student.name[0]}</AvatarFallback>
                    </Avatar>
                    <span>{student.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade.toFixed(1)}%</div>
            <Progress value={averageGrade} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</div>
            <p className="text-xs text-muted-foreground">Total this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedAssignments}/{assignments.length}</div>
            <p className="text-xs text-muted-foreground">{upcomingAssignments} upcoming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{achievements.length}</div>
            <p className="text-xs text-muted-foreground">Badges earned</p>
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="content">
            <Settings className="h-4 w-4 mr-2" />
            Content
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <StandardsBasedQuestionGenerator />
            <QuestionBankManager />
          </div>
        </TabsContent>


        <TabsContent value="standards" className="space-y-6">
          <ParentStandardsProgress studentId={selectedStudent.id} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Progress Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1758134778698_9231535e.webp" 
                  alt="Progress Analytics Dashboard" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {['Math', 'English', 'Science'].map(subject => {
                  const subjectGrades = grades.filter(g => g.assignment.subject === subject);
                  const avg = subjectGrades.length > 0 ? 
                    subjectGrades.reduce((sum, g) => sum + g.percentage, 0) / subjectGrades.length : 0;
                  
                  return (
                    <div key={subject} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{subject}</span>
                        <span className="text-sm text-gray-600">{avg.toFixed(1)}%</span>
                      </div>
                      <Progress value={avg} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ParentProgressChart data={[
              { subject: 'Math', currentGrade: 88.5, previousGrade: 85.2, trend: 'up', assignments: 12, completed: 10 },
              { subject: 'English', currentGrade: 92.3, previousGrade: 94.1, trend: 'down', assignments: 8, completed: 8 },
              { subject: 'Science', currentGrade: 87.8, previousGrade: 87.8, trend: 'stable', assignments: 10, completed: 9 },
              { subject: 'History', currentGrade: 91.2, previousGrade: 89.5, trend: 'up', assignments: 6, completed: 6 }
            ]} />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Performance Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src="https://d64gsuwffb70l.cloudfront.net/68cafa1d5a414d406590e7bd_1758137393115_e178bac5.webp" 
                  alt="Student Progress Analytics" 
                  className="w-full h-64 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">89.7%</div>
                  <p className="text-sm text-gray-600">Overall Grade Average</p>
                  <Badge variant="secondary" className="mt-2">+2.3% from last month</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                  <p className="text-sm text-gray-600">Assignment Completion</p>
                  <Badge variant="secondary" className="mt-2">35 of 37 completed</Badge>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
                  <p className="text-sm text-gray-600">Goals Achieved</p>
                  <Badge variant="secondary" className="mt-2">3 new this month</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          {grades.map((grade) => (
            <Card key={grade.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold">{grade.assignment.title}</h3>
                  <p className="text-sm text-gray-600">
                    {grade.assignment.subject} • Due: {new Date(grade.assignment.due_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-green-600">{grade.percentage.toFixed(1)}%</span>
                  <Badge variant={
                    grade.status === 'completed' ? 'default' :
                    grade.status === 'late' ? 'destructive' : 'secondary'
                  }>
                    {grade.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {assignments.filter(a => new Date(a.due_date) > new Date()).map((assignment) => (
            <Card key={assignment.id} className="border-dashed">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold">{assignment.title}</h3>
                  <p className="text-sm text-gray-600">
                    {assignment.subject} • Due: {new Date(assignment.due_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant="outline">Upcoming</Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id}>
                <CardContent className="flex items-center space-x-4 p-6">
                  <div className={`text-3xl p-3 rounded-full bg-${achievement.badge_color}-100`}>
                    {achievement.badge_icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{achievement.name}</h3>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                    <p className="text-xs text-gray-500">
                      Earned: {new Date(achievement.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="communication" className="space-y-4">
          <ParentCommunication 
            messages={messages.map(msg => ({
              ...msg,
              sender_role: 'teacher' as const,
              priority: 'normal' as const,
              message_type: 'general' as const
            }))}
            teachers={[
              { id: '1', name: 'Ms. Sarah Johnson', subject: 'Mathematics' },
              { id: '2', name: 'Mr. David Chen', subject: 'English' },
              { id: '3', name: 'Mrs. Emily Rodriguez', subject: 'Science' }
            ]}
            onSendMessage={(message) => {
              console.log('Sending message:', message);
              // Here you would implement the actual message sending logic
            }}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Assignment Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div>
                    <p className="font-medium text-sm">Math Homework Due Tomorrow</p>
                    <p className="text-xs text-gray-600">Chapter 5 Practice Problems</p>
                  </div>
                  <Badge variant="outline" className="text-yellow-700">Due Soon</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div>
                    <p className="font-medium text-sm">Science Project Overdue</p>
                    <p className="text-xs text-gray-600">Solar System Model</p>
                  </div>
                  <Badge variant="destructive">Overdue</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div>
                    <p className="font-medium text-sm">English Essay Submitted</p>
                    <p className="text-xs text-gray-600">Awaiting teacher feedback</p>
                  </div>
                  <Badge variant="secondary">Submitted</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ParentDashboard;