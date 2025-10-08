import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Clock, Users, Target, AlertCircle, Download, Filter } from 'lucide-react';

interface AssignmentAnalyticsDashboardProps {
  assignmentId?: string;
}

const AssignmentAnalyticsDashboard: React.FC<AssignmentAnalyticsDashboardProps> = ({ assignmentId }) => {
  const [selectedAssignment, setSelectedAssignment] = useState(assignmentId || 'all');
  const [timeRange, setTimeRange] = useState('30days');

  // Mock data - in real app, this would come from API
  const assignments = [
    { id: '1', title: 'Shakespeare Analysis Essay', dueDate: '2024-01-15', totalStudents: 28, completed: 25 },
    { id: '2', title: 'Poetry Interpretation Quiz', dueDate: '2024-01-10', totalStudents: 28, completed: 28 },
    { id: '3', title: 'Creative Writing Assignment', dueDate: '2024-01-20', totalStudents: 28, completed: 18 }
  ];

  const gradeDistribution = [
    { grade: 'A (90-100)', count: 8, percentage: 32 },
    { grade: 'B (80-89)', count: 12, percentage: 48 },
    { grade: 'C (70-79)', count: 4, percentage: 16 },
    { grade: 'D (60-69)', count: 1, percentage: 4 },
    { grade: 'F (0-59)', count: 0, percentage: 0 }
  ];

  const completionTrends = [
    { date: '2024-01-01', completed: 85, submitted: 92 },
    { date: '2024-01-08', completed: 78, submitted: 88 },
    { date: '2024-01-15', completed: 89, submitted: 95 },
    { date: '2024-01-22', completed: 82, submitted: 90 }
  ];

  const questionAnalytics = [
    { question: 'Q1: Main Theme', correct: 24, incorrect: 4, avgTime: '3.2 min', difficulty: 'Easy' },
    { question: 'Q2: Character Analysis', correct: 18, incorrect: 10, avgTime: '8.5 min', difficulty: 'Hard' },
    { question: 'Q3: Literary Devices', correct: 22, incorrect: 6, avgTime: '5.1 min', difficulty: 'Medium' },
    { question: 'Q4: Historical Context', correct: 15, incorrect: 13, avgTime: '6.8 min', difficulty: 'Hard' }
  ];

  const timeSpentData = [
    { student: 'Alice Johnson', timeSpent: 45, grade: 95 },
    { student: 'Bob Smith', timeSpent: 32, grade: 78 },
    { student: 'Carol Davis', timeSpent: 52, grade: 88 },
    { student: 'David Wilson', timeSpent: 28, grade: 72 }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Assignment Analytics</h1>
          <p className="text-gray-600">Detailed insights into student performance and assignment effectiveness</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedAssignment} onValueChange={setSelectedAssignment}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select assignment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignments</SelectItem>
              {assignments.map(assignment => (
                <SelectItem key={assignment.id} value={assignment.id}>
                  {assignment.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="90days">90 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84.2%</div>
            <p className="text-xs text-green-600">+2.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89.3%</div>
            <p className="text-xs text-blue-600">25 of 28 students</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Time Spent</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42 min</div>
            <p className="text-xs text-orange-600">Within expected range</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Difficulty Level</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Medium</div>
            <p className="text-xs text-purple-600">Appropriate challenge</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
          <TabsTrigger value="students">Student Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Distribution of student grades</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Status</CardTitle>
                <CardDescription>Assignment completion breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: 25, color: '#10b981' },
                        { name: 'In Progress', value: 2, color: '#f59e0b' },
                        { name: 'Not Started', value: 1, color: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {[
                        { name: 'Completed', value: 25, color: '#10b981' },
                        { name: 'In Progress', value: 2, color: '#f59e0b' },
                        { name: 'Not Started', value: 1, color: '#ef4444' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Question-Level Analytics</CardTitle>
              <CardDescription>Performance breakdown by individual questions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questionAnalytics.map((q, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{q.question}</h4>
                        <div className="flex items-center gap-4 mt-2">
                          <Badge variant={q.difficulty === 'Easy' ? 'default' : q.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                            {q.difficulty}
                          </Badge>
                          <span className="text-sm text-gray-600 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {q.avgTime}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-600">{q.correct}/{q.correct + q.incorrect}</div>
                        <div className="text-sm text-gray-600">{Math.round((q.correct / (q.correct + q.incorrect)) * 100)}% correct</div>
                      </div>
                    </div>
                    <Progress value={(q.correct / (q.correct + q.incorrect)) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Time vs Performance Analysis</CardTitle>
              <CardDescription>Correlation between time spent and grades achieved</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={timeSpentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="student" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Area yAxisId="left" type="monotone" dataKey="timeSpent" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Line yAxisId="right" type="monotone" dataKey="grade" stroke="#10b981" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Completion Trends</CardTitle>
              <CardDescription>Assignment completion and submission rates over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={completionTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={2} name="Completed" />
                  <Line type="monotone" dataKey="submitted" stroke="#10b981" strokeWidth={2} name="Submitted" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentAnalyticsDashboard;