import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { EnhancedAssignmentSubmission } from './EnhancedAssignmentSubmission';
import { SubmissionTracker } from './SubmissionTracker';
import { AssignmentCalendarView } from './AssignmentCalendarView';
import { GoalTemplates } from './GoalTemplates';
import { GoalCreator } from './GoalCreator';
import { GoalTracker } from './GoalTracker';
import AILearningPathGenerator from './AILearningPathGenerator';
import MultiSubjectLearningPath from './MultiSubjectLearningPath';
import LearningPathDashboard from './LearningPathDashboard';
import StudyGroupManager from './StudyGroupManager';
import CollaborativeDocument from './CollaborativeDocument';
import GroupChat from './GroupChat';
import PeerReviewSystem from './PeerReviewSystem';
import ParentAccessRequestManager from './ParentAccessRequestManager';
import CurriculumBrowser from './CurriculumBrowser';
import EnhancedLessonPlayer from './EnhancedLessonPlayer';
import StandardsPracticeDashboard from './StandardsPracticeDashboard';
import ComprehensiveDiagnosticTest from './ComprehensiveDiagnosticTest';
import { AITutor } from './AITutor';
import StandardsBrowser from './StandardsBrowser';

const LessonViewer = EnhancedLessonPlayer;



import { BookOpen, Calendar, Clock, TrendingUp, Award, CheckCircle, AlertTriangle, Target, PenTool, Users } from 'lucide-react';
import { AIWritingAssistant } from './AIWritingAssistant';
import { WritingTemplatesLibrary } from './WritingTemplatesLibrary';
import { AutomatedEssayScoring } from './AutomatedEssayScoring';
import { PlagiarismDetectionSystem } from './PlagiarismDetectionSystem';
import { UserMenu } from './UserMenu';
import { MobileStudentDashboard } from './MobileStudentDashboard';
import { useIsMobile } from '../hooks/use-mobile';
import { PushNotificationPrompt } from './PushNotificationPrompt';


import { useStudentData } from '../hooks/useStudentData';
import { useAuth } from '../contexts/AuthContext';
import { FileText, AlertCircle } from 'lucide-react';
import StudyAnalytics from './StudyAnalytics';
import { CardDescription } from './ui/card';


export function StudentDashboard() {
  const isMobile = useIsMobile();
  const { 
    assignments, 
    submissions, 
    loading, 
    error,
    getUpcomingAssignments,
    getRecentSubmissions,
    getProgressStats
  } = useStudentData();
  
  const { user } = useAuth();
  
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showGoalCreator, setShowGoalCreator] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);

  // Render mobile version on mobile devices
  if (isMobile && user?.id) {
    return <MobileStudentDashboard userId={user.id} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading dashboard: {error}</p>
      </div>
    );
  }

  const upcomingAssignments = getUpcomingAssignments();
  const recentSubmissions = getRecentSubmissions();
  const progressStats = getProgressStats();


  if (selectedAssignment) {
    const assignment = assignments.find(a => a.id === selectedAssignment);
    if (assignment) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={() => setSelectedAssignment(null)}
            >
              ← Back to Dashboard
            </Button>
          </div>
          <EnhancedAssignmentSubmission 
            assignment={assignment}
            studentId={user?.id || ''}
            existingSubmission={submissions.find(s => s.assignment_id === assignment.id)}
            onSubmissionComplete={() => {
              setSelectedAssignment(null);
            }}
          />
        </div>
      );
    }
  }
  return (
    <div className="space-y-6">
      <div className="bg-[#1e3a5f] -mx-6 -mt-6 px-6 py-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/68caf8605a414d406590b724_1760015224395_1fa7a05d.jpeg" 
            alt="Literary Genius Academy" 
            className="w-12 h-12 rounded-full border-2 border-[#d4af37] cursor-pointer hover:opacity-90 transition"
            onClick={() => window.location.href = '/'}
          />
          <h1 className="text-2xl font-bold text-[#f5e6d3]">Student Dashboard</h1>
        </div>
        <UserMenu />

      </div>

      {/* Push Notification Prompt */}
      <PushNotificationPrompt userRole="student" />


      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.totalAssignments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressStats.completedAssignments}</div>
            <p className="text-xs text-muted-foreground">
              {progressStats.completionRate.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {progressStats.averageGrade ? `${progressStats.averageGrade}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">assignments due soon</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="practice">Practice Standards</TabsTrigger>
          <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnostic Test</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="ai-tutor">🤖 AI Tutor</TabsTrigger>   
	  <TabsTrigger value="submissions">My Submissions</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="parent-access">Parent Access</TabsTrigger>
          <TabsTrigger value="learning-path">AI Learning Path</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="writing-assistant">Writing Assistant</TabsTrigger>
          <TabsTrigger value="essay-scoring">Essay Scoring</TabsTrigger>
          <TabsTrigger value="plagiarism-check">Plagiarism Check</TabsTrigger>
        </TabsList>

        <TabsContent value="practice" className="space-y-4">
          <StandardsPracticeDashboard
            studentId={user?.id || ''}
            gradeLevel="5"
            subject="Mathematics"
          />
        </TabsContent>


        <TabsContent value="curriculum" className="space-y-4">
          {selectedLesson ? (
            <div className="space-y-4">
              <Button variant="outline" onClick={() => setSelectedLesson(null)}>
                ← Back to Curriculum
              </Button>
              <LessonViewer 
                lessonId={selectedLesson}
                studentId={user?.id || ''}
                onComplete={() => setSelectedLesson(null)}
              />
            </div>
          ) : (
            <CurriculumBrowser
              studentId={user?.id || ''}
              onLessonSelect={setSelectedLesson}
            />
          )}
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-4">
          <ComprehensiveDiagnosticTest
            studentId={user?.id || ''}
            onComplete={(results) => {
              console.log('Diagnostic results:', results);
              setActiveTab('curriculum');
            }}
          />
        </TabsContent>


        <TabsContent value="parent-access" className="space-y-4">
          <ParentAccessRequestManager />
        </TabsContent>
	<TabsContent value="ai-tutor" className="space-y-4">
  	  <AITutor 
    	  studentProfile={profile}
    	  subject="General"
    	  context="4th Grade Student Learning"
  />
</TabsContent>

        <TabsContent value="writing-assistant" className="space-y-4">
          <AIWritingAssistant />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-4">
          <Tabs defaultValue="study-groups" className="space-y-4">
            <TabsList>
              <TabsTrigger value="study-groups">Study Groups</TabsTrigger>
              <TabsTrigger value="documents">Shared Documents</TabsTrigger>
              <TabsTrigger value="peer-review">Peer Review</TabsTrigger>
            </TabsList>
            
            <TabsContent value="study-groups">
              <StudyGroupManager />
            </TabsContent>
            
            <TabsContent value="documents">
              <CollaborativeDocument />
            </TabsContent>
            
            <TabsContent value="peer-review">
              <PeerReviewSystem assignmentId={assignments[0]?.id || ''} />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Assignments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAssignments.length === 0 ? (
                  <p className="text-muted-foreground">No upcoming assignments</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingAssignments.map((assignment) => (
                      <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{assignment.title}</h4>
                          <p className="text-sm text-muted-foreground">{assignment.subject}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedAssignment(assignment.id)}
                        >
                          Start
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentSubmissions.length === 0 ? (
                  <p className="text-muted-foreground">No submissions yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{submission.assignment?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          {submission.grade !== null ? (
                            <Badge variant={submission.grade >= 80 ? "default" : "secondary"}>
                              {submission.grade}%
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Assignments</CardTitle>
              <CardDescription>View and complete your assignments</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-muted-foreground">No assignments available</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => {
                    const isSubmitted = submissions.some(s => s.assignment_id === assignment.id);
                    const isPastDue = new Date(assignment.due_date) < new Date();
                    
                    return (
                      <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{assignment.title}</h4>
                            {isSubmitted && <Badge variant="default">Submitted</Badge>}
                            {isPastDue && !isSubmitted && <Badge variant="destructive">Past Due</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{assignment.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Subject: {assignment.subject}</span>
                            <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isSubmitted && (
                            <Button 
                              size="sm"
                              onClick={() => setSelectedAssignment(assignment.id)}
                              disabled={isPastDue}
                            >
                              {isPastDue ? 'Past Due' : 'Start'}
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="submissions" className="space-y-4">
          <SubmissionTracker studentId={user?.id || ''} />
        </TabsContent>
        <TabsContent value="progress" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Academic Progress</CardTitle>
              <CardDescription>Track your learning progress and achievements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Overall Completion</span>
                  <span className="text-sm text-muted-foreground">
                    {progressStats.completedAssignments} of {progressStats.totalAssignments}
                  </span>
                </div>
                <Progress value={progressStats.completionRate} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Performance</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {progressStats.averageGrade ? `${progressStats.averageGrade}%` : 'N/A'}
                  </p>
                  <p className="text-sm text-blue-700">Average Grade</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Completion Rate</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {progressStats.completionRate.toFixed(1)}%
                  </p>
                  <p className="text-sm text-green-700">Assignments Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="learning-path" className="space-y-4">
          <Tabs defaultValue="multi-subject" className="space-y-4">
            <TabsList>
              <TabsTrigger value="multi-subject">Multi-Subject Path</TabsTrigger>
              <TabsTrigger value="single-subject">Single Subject</TabsTrigger>
              <TabsTrigger value="dashboard">My Learning Path</TabsTrigger>
            </TabsList>
            
            <TabsContent value="multi-subject">
              <MultiSubjectLearningPath 
                studentId={user?.id || ''} 
              />
            </TabsContent>
            
            <TabsContent value="single-subject">
              <AILearningPathGenerator 
                studentId={user?.id || ''} 
                subject="ELA" 
              />
            </TabsContent>
            
            <TabsContent value="dashboard">
              <LearningPathDashboard 
                studentId={user?.id || ''} 
                learningPath={null} 
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <AssignmentCalendarView
            assignments={assignments}
            submissions={submissions}
            onRefresh={() => {
              // Trigger data refresh
              window.location.reload();
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <StudyAnalytics studentId={user?.id || ''} />
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Tabs defaultValue="tracker" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="tracker">My Goals</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="create">Create Goal</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="tracker">
              <GoalTracker />
            </TabsContent>

            <TabsContent value="templates">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goal Templates
                  </CardTitle>
                  <CardDescription>Choose from pre-made goal templates to get started quickly</CardDescription>
                </CardHeader>
                <CardContent>
                  <GoalTemplates 
                    onSelectTemplate={(template) => {
                      setSelectedTemplate(template);
                      setShowGoalCreator(true);
                    }}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="create">
              <GoalCreator 
                selectedTemplate={selectedTemplate}
                onGoalCreated={() => {
                  setSelectedTemplate(null);
                  setShowGoalCreator(false);
                }}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <WritingTemplatesLibrary />
        </TabsContent>

        <TabsContent value="essay-scoring" className="space-y-4">
          <AutomatedEssayScoring />
        </TabsContent>

        <TabsContent value="plagiarism-check" className="space-y-4">
          <PlagiarismDetectionSystem />
        </TabsContent>
      </Tabs>

      <Dialog open={showGoalCreator} onOpenChange={setShowGoalCreator}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
          </DialogHeader>
          <GoalCreator 
            selectedTemplate={selectedTemplate}
            onGoalCreated={() => {
              setSelectedTemplate(null);
              setShowGoalCreator(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}