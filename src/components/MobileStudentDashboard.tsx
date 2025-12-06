import React, { useState, useEffect } from 'react';
import { Bell, BookOpen, Calendar, Trophy, Target, Clock, ChevronRight, Brain, GraduationCap, ClipboardCheck, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { MobileAssignmentSubmission } from './MobileAssignmentSubmission';
import { QuickAccessWidget } from './QuickAccessWidget';
import { BiometricAuthSetup } from './BiometricAuthSetup';
import { AITutor } from './AITutor';
import CurriculumBrowser from './CurriculumBrowser';
import DiagnosticTest from './DiagnosticTest';
import StandardsPracticeDashboard from './StandardsPracticeDashboard';
import { supabase } from '@/lib/supabase';


interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  submissionType: 'text' | 'file' | 'both';
  status: 'pending' | 'submitted' | 'graded';
  grade?: number;
}

interface MobileStudentDashboardProps {
  userId: string;
}

export const MobileStudentDashboard: React.FC<MobileStudentDashboardProps> = ({
  userId
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showAITutor, setShowAITutor] = useState(false);
  const [showCurriculum, setShowCurriculum] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0,
    streakDays: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      // Load assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .order('dueDate', { ascending: true })
        .limit(10);

      if (assignmentsData) {
        setAssignments(assignmentsData);
        
        // Calculate stats
        const total = assignmentsData.length;
        const completed = assignmentsData.filter(a => a.status === 'submitted' || a.status === 'graded').length;
        const graded = assignmentsData.filter(a => a.status === 'graded' && a.grade);
        const avgGrade = graded.length > 0 
          ? graded.reduce((sum, a) => sum + (a.grade || 0), 0) / graded.length 
          : 0;

        setStats({
          totalAssignments: total,
          completedAssignments: completed,
          averageGrade: avgGrade,
          streakDays: 7 // Mock streak data
        });
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const handleAssignmentSubmit = (submission: any) => {
    setSelectedAssignment(null);
    loadDashboardData(); // Refresh data
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (assignment.status === 'graded') {
      return { label: 'Graded', variant: 'default' as const, color: 'text-green-600' };
    }
    if (assignment.status === 'submitted') {
      return { label: 'Submitted', variant: 'secondary' as const, color: 'text-blue-600' };
    }
    if (diffDays < 0) {
      return { label: 'Overdue', variant: 'destructive' as const, color: 'text-red-600' };
    }
    if (diffDays <= 2) {
      return { label: 'Due Soon', variant: 'secondary' as const, color: 'text-orange-600' };
    }
    return { label: `${diffDays} days`, variant: 'outline' as const, color: 'text-gray-600' };
  };

  if (selectedAssignment) {
    return (
      <MobileAssignmentSubmission
        assignment={selectedAssignment}
        onSubmit={handleAssignmentSubmit}
        onClose={() => setSelectedAssignment(null)}
      />
    );
  }

  // Show AI Tutor
  if (showAITutor) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1e3a5f] p-4 sticky top-0 z-10 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAITutor(false)}
            className="text-[#f5e6d3] hover:text-[#d4af37]"
          >
            ← Back
          </Button>
          <h1 className="text-lg font-bold text-[#f5e6d3]">AI Tutor</h1>
        </div>
        <div className="p-4">
          <AITutor />
        </div>
      </div>
    );
  }

  // Show Curriculum Browser
  if (showCurriculum) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1e3a5f] p-4 sticky top-0 z-10 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowCurriculum(false)}
            className="text-[#f5e6d3] hover:text-[#d4af37]"
          >
            ← Back
          </Button>
          <h1 className="text-lg font-bold text-[#f5e6d3]">Curriculum</h1>
        </div>
        <div className="p-4">
          <CurriculumBrowser />
        </div>
      </div>
    );
  }

  // Show Diagnostic Test
  if (showDiagnostic) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1e3a5f] p-4 sticky top-0 z-10 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDiagnostic(false)}
            className="text-[#f5e6d3] hover:text-[#d4af37]"
          >
            ← Back
          </Button>
          <h1 className="text-lg font-bold text-[#f5e6d3]">Diagnostic Test</h1>
        </div>
        <div className="p-4">
          <DiagnosticTest 
            studentId={userId}
            onComplete={() => setShowDiagnostic(false)}
          />
        </div>
      </div>
    );
  }

  // Show Standards Practice
  if (showPractice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1e3a5f] p-4 sticky top-0 z-10 flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowPractice(false)}
            className="text-[#f5e6d3] hover:text-[#d4af37]"
          >
            ← Back
          </Button>
          <h1 className="text-lg font-bold text-[#f5e6d3]">Practice Standards</h1>
        </div>
        <div className="p-4">
          <StandardsPracticeDashboard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-[#1e3a5f] border-b border-[#d4af37] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/68caf8605a414d406590b724_1760015224395_1fa7a05d.jpeg" 
              alt="Literary Genius Academy" 
              className="w-10 h-10 rounded-full border-2 border-[#d4af37] cursor-pointer"
              onClick={() => window.location.href = '/'}
            />
            <div>
              <h1 className="text-lg font-bold text-[#f5e6d3]">Dashboard</h1>
              <p className="text-xs text-[#d4af37]">Welcome back, Student!</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="p-2 text-[#d4af37] hover:text-[#f5e6d3]">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>


      <div className="p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{stats.completedAssignments}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats.averageGrade.toFixed(0)}%</p>
                  <p className="text-xs text-gray-600">Avg Grade</p>
                </div>
                <Trophy className="w-8 h-8 text-green-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">{stats.streakDays}</p>
                  <p className="text-xs text-gray-600">Day Streak</p>
                </div>
                <Target className="w-8 h-8 text-purple-600 opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalAssignments}</p>
                  <p className="text-xs text-gray-600">Total</p>
                </div>
                <Calendar className="w-8 h-8 text-orange-600 opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Assignments Completed</span>
                <span>{stats.completedAssignments}/{stats.totalAssignments}</span>
              </div>
              <Progress 
                value={(stats.completedAssignments / Math.max(stats.totalAssignments, 1)) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Learning Tools - Quick Access */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Learning Tools</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-300"
                onClick={() => setShowAITutor(true)}
              >
                <Brain className="w-6 h-6 text-blue-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">AI Tutor</div>
                  <div className="text-xs text-gray-500">Get help 24/7</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-300"
                onClick={() => setShowCurriculum(true)}
              >
                <BookOpen className="w-6 h-6 text-green-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">Curriculum</div>
                  <div className="text-xs text-gray-500">Browse lessons</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-purple-50 hover:border-purple-300"
                onClick={() => setShowDiagnostic(true)}
              >
                <ClipboardCheck className="w-6 h-6 text-purple-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">Diagnostic</div>
                  <div className="text-xs text-gray-500">Test your level</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-orange-50 hover:border-orange-300"
                onClick={() => setShowPractice(true)}
              >
                <Zap className="w-6 h-6 text-orange-600" />
                <div className="text-center">
                  <div className="font-medium text-sm">Practice</div>
                  <div className="text-xs text-gray-500">Master standards</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Access Widget */}
        <QuickAccessWidget />

        {/* Biometric Auth Setup */}
        <BiometricAuthSetup />

        {/* Upcoming Assignments */}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Upcoming Assignments</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {assignments.slice(0, 5).map((assignment) => {
              const status = getAssignmentStatus(assignment);
              
              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => assignment.status === 'pending' && setSelectedAssignment(assignment)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{assignment.title}</h4>
                      <Badge variant={status.variant} className="text-xs">
                        {status.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span>{assignment.maxPoints} pts</span>
                      {assignment.grade && (
                        <span className="text-green-600 font-medium">
                          {assignment.grade}%
                        </span>
                      )}
                    </div>
                  </div>
                  {assignment.status === 'pending' && (
                    <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  )}
                </div>
              );
            })}

            {assignments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No assignments available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};