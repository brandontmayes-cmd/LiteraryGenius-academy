import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, Search, Filter, Edit, Trash2, Copy, Eye, Users, 
  Calendar, Clock, CheckCircle, AlertTriangle, BarChart3
} from 'lucide-react';
import { EnhancedAssignmentCreator } from './EnhancedAssignmentCreator';
import { GradingInterface } from './assignment/GradingInterface';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  type: string;
  due_date: string;
  total_points: number;
  status: 'draft' | 'published' | 'closed';
  submissions_count: number;
  graded_count: number;
  questions: any[];
  created_at: string;
}

interface AssignmentManagementDashboardProps {
  teacherId: string;
}

export const AssignmentManagementDashboard: React.FC<AssignmentManagementDashboardProps> = ({ teacherId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Chapter 5 Reading Comprehension',
      subject: 'English',
      type: 'homework',
      due_date: '2024-01-15',
      total_points: 25,
      status: 'published',
      submissions_count: 18,
      graded_count: 12,
      questions: [],
      created_at: '2024-01-10'
    },
    {
      id: '2',
      title: 'Algebra Quiz - Linear Equations',
      subject: 'Mathematics',
      type: 'quiz',
      due_date: '2024-01-20',
      total_points: 50,
      status: 'published',
      submissions_count: 22,
      graded_count: 22,
      questions: [],
      created_at: '2024-01-12'
    }
  ]);

  const [showCreator, setShowCreator] = useState(false);
  const [showGrading, setShowGrading] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleCreateAssignment = (assignmentData: any) => {
    if (editingAssignment) {
      setAssignments(assignments.map(a => a.id === editingAssignment.id ? { ...a, ...assignmentData } : a));
    } else {
      setAssignments([...assignments, { ...assignmentData, submissions_count: 0, graded_count: 0 }]);
    }
    setShowCreator(false);
    setEditingAssignment(null);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setShowCreator(true);
  };

  const handleDeleteAssignment = (id: string) => {
    if (confirm('Are you sure you want to delete this assignment?')) {
      setAssignments(assignments.filter(a => a.id !== id));
    }
  };

  const handleDuplicateAssignment = (assignment: Assignment) => {
    const duplicate = {
      ...assignment,
      id: Date.now().toString(),
      title: `${assignment.title} (Copy)`,
      status: 'draft' as const,
      submissions_count: 0,
      graded_count: 0,
      created_at: new Date().toISOString()
    };
    setAssignments([...assignments, duplicate]);
  };

  const handleGradeSubmission = (submissionId: string, grade: number, feedback: string) => {
    console.log('Grading submission:', { submissionId, grade, feedback });
    // Update graded count
    if (selectedAssignment) {
      setAssignments(assignments.map(a => 
        a.id === selectedAssignment.id 
          ? { ...a, graded_count: a.graded_count + 1 }
          : a
      ));
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || assignment.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'published': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'quiz': return <Clock className="h-4 w-4" />;
      case 'test': return <BarChart3 className="h-4 w-4" />;
      case 'project': return <Users className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  // Mock submissions data
  const mockSubmissions = [
    {
      id: '1',
      student_name: 'Alice Johnson',
      student_id: 'student1',
      submitted_at: '2024-01-14T10:30:00Z',
      answers: { '1': 0, '2': 'The main character shows growth...' },
      status: 'submitted' as const
    },
    {
      id: '2',
      student_name: 'Bob Smith',
      student_id: 'student2',
      submitted_at: '2024-01-14T14:20:00Z',
      answers: { '1': 1, '2': 'Character development is evident...' },
      grade: 20,
      feedback: 'Good analysis, but could use more examples.',
      status: 'graded' as const
    }
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Assignment Management</h2>
          <Button onClick={() => setShowCreator(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Assignment
          </Button>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Assignment Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold">{assignments.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Published</p>
                  <p className="text-2xl font-bold">{assignments.filter(a => a.status === 'published').length}</p>
                </div>
                <Eye className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Grading</p>
                  <p className="text-2xl font-bold">
                    {assignments.reduce((sum, a) => sum + (a.submissions_count - a.graded_count), 0)}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Due This Week</p>
                  <p className="text-2xl font-bold">
                    {assignments.filter(a => {
                      const dueDate = new Date(a.due_date);
                      const weekFromNow = new Date();
                      weekFromNow.setDate(weekFromNow.getDate() + 7);
                      return dueDate <= weekFromNow && dueDate >= new Date();
                    }).length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredAssignments.map(assignment => (
                <div key={assignment.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getTypeIcon(assignment.type)}
                        <h3 className="font-medium">{assignment.title}</h3>
                        <Badge className={getStatusColor(assignment.status)}>
                          {assignment.status}
                        </Badge>
                        <Badge variant="outline">{assignment.subject}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                        <span>{assignment.total_points} points</span>
                        <span>{assignment.submissions_count} submissions</span>
                        <span className="text-green-600">
                          {assignment.graded_count}/{assignment.submissions_count} graded
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowGrading(true);
                        }}
                        disabled={assignment.submissions_count === 0}
                      >
                        Grade ({assignment.submissions_count - assignment.graded_count})
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditAssignment(assignment)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDuplicateAssignment(assignment)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredAssignments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No assignments found. {searchTerm || filterStatus !== 'all' ? 'Try adjusting your search or filter.' : 'Create your first assignment to get started.'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showCreator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <EnhancedAssignmentCreator
            onSave={handleCreateAssignment}
            onCancel={() => {
              setShowCreator(false);
              setEditingAssignment(null);
            }}
            editingAssignment={editingAssignment}
          />
        </div>
      )}

      {showGrading && selectedAssignment && (
        <GradingInterface
          assignment={selectedAssignment}
          submissions={mockSubmissions}
          onGradeSubmission={handleGradeSubmission}
          onClose={() => {
            setShowGrading(false);
            setSelectedAssignment(null);
          }}
        />
      )}
    </>
  );
};