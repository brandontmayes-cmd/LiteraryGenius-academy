import React, { useState, useEffect } from 'react';
import { Users, BookOpen, CheckCircle, Clock, Plus, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  submissionCount: number;
  totalStudents: number;
  avgGrade?: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  recentActivity: string;
  grade: string;
}

interface MobileTeacherDashboardProps {
  userId: string;
}

export const MobileTeacherDashboard: React.FC<MobileTeacherDashboardProps> = ({
  userId
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeAssignments: 0,
    pendingGrading: 0,
    avgClassGrade: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'students'>('overview');

  useEffect(() => {
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      // Load assignments
      const { data: assignmentsData } = await supabase
        .from('assignments')
        .select('*')
        .order('dueDate', { ascending: false })
        .limit(10);

      // Load students
      const { data: studentsData } = await supabase
        .from('students')
        .select('*')
        .limit(20);

      if (assignmentsData) {
        const assignmentsWithStats = assignmentsData.map(assignment => ({
          ...assignment,
          submissionCount: Math.floor(Math.random() * 25) + 5, // Mock data
          totalStudents: 30, // Mock data
          avgGrade: Math.floor(Math.random() * 30) + 70 // Mock data
        }));
        setAssignments(assignmentsWithStats);
      }

      if (studentsData) {
        const studentsWithActivity = studentsData.map(student => ({
          ...student,
          recentActivity: 'Submitted Math Assignment',
          grade: 'A-'
        }));
        setStudents(studentsWithActivity);
      }

      // Calculate stats
      setStats({
        totalStudents: studentsData?.length || 0,
        activeAssignments: assignmentsData?.length || 0,
        pendingGrading: Math.floor(Math.random() * 15) + 5,
        avgClassGrade: 85.2
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssignments = assignments.filter(assignment =>
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-sm text-gray-600">Manage your classes</p>
          </div>
          <Button size="sm" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            New
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'assignments', label: 'Assignments' },
            { id: 'students', label: 'Students' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
                      <p className="text-xs text-gray-600">Students</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-600">{stats.activeAssignments}</p>
                      <p className="text-xs text-gray-600">Assignments</p>
                    </div>
                    <BookOpen className="w-8 h-8 text-green-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-orange-600">{stats.pendingGrading}</p>
                      <p className="text-xs text-gray-600">To Grade</p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">{stats.avgClassGrade}%</p>
                      <p className="text-xs text-gray-600">Class Avg</p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-purple-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Assignments */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Assignments</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {assignments.slice(0, 3).map((assignment) => (
                  <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{assignment.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span>{assignment.submissionCount}/{assignment.totalStudents} submitted</span>
                        {assignment.avgGrade && (
                          <span className="text-green-600">Avg: {assignment.avgGrade}%</span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {Math.round((assignment.submissionCount / assignment.totalStudents) * 100)}%
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </>
        )}

        {/* Assignments Tab */}
        {activeTab === 'assignments' && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search assignments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {filteredAssignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <Badge 
                        variant={assignment.submissionCount === assignment.totalStudents ? 'default' : 'secondary'}
                      >
                        {assignment.submissionCount}/{assignment.totalStudents}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      {assignment.avgGrade && (
                        <span className="text-green-600 font-medium">
                          Avg: {assignment.avgGrade}%
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <>
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {filteredStudents.map((student) => (
                <Card key={student.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                      </div>
                      <Badge variant="outline">{student.grade}</Badge>
                    </div>
                    <p className="text-xs text-gray-500">{student.recentActivity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};