import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, AlertTriangle, Download, FileText, Shield, Clock, Target } from 'lucide-react';

interface AnalyticsData {
  totalAssignments: number;
  completionRate: number;
  averageGrade: number;
  plagiarismRate: number;
  gradeDistribution: Array<{ grade: string; count: number; percentage: number }>;
  assignmentCompletion: Array<{ assignment: string; completed: number; total: number; rate: number }>;
  plagiarismTrends: Array<{ month: string; incidents: number; rate: number }>;
  studentProgress: Array<{
    id: string;
    name: string;
    grade: number;
    completion: number;
    plagiarismFlags: number;
    riskLevel: 'low' | 'medium' | 'high';
  }>;
  subjectPerformance: Array<{ subject: string; average: number; completion: number }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function TeacherAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const mockData: AnalyticsData = {
        totalAssignments: 45,
        completionRate: 87,
        averageGrade: 82.3,
        plagiarismRate: 3.2,
        gradeDistribution: [
          { grade: 'A', count: 12, percentage: 35 },
          { grade: 'B', count: 15, percentage: 44 },
          { grade: 'C', count: 5, percentage: 15 },
          { grade: 'D', count: 2, percentage: 6 }
        ],
        assignmentCompletion: [
          { assignment: 'Essay 1', completed: 28, total: 30, rate: 93 },
          { assignment: 'Research Paper', completed: 25, total: 30, rate: 83 },
          { assignment: 'Book Report', completed: 30, total: 30, rate: 100 }
        ],
        plagiarismTrends: [
          { month: 'Sep', incidents: 2, rate: 2.1 },
          { month: 'Oct', incidents: 4, rate: 3.8 },
          { month: 'Nov', incidents: 1, rate: 1.2 }
        ],
        studentProgress: [
          { id: '1', name: 'Alice Johnson', grade: 94, completion: 100, plagiarismFlags: 0, riskLevel: 'low' },
          { id: '2', name: 'Bob Smith', grade: 78, completion: 85, plagiarismFlags: 1, riskLevel: 'medium' },
          { id: '3', name: 'Carol Davis', grade: 65, completion: 70, plagiarismFlags: 2, riskLevel: 'high' }
        ],
        subjectPerformance: [
          { subject: 'Literature', average: 85, completion: 92 },
          { subject: 'Writing', average: 79, completion: 88 },
          { subject: 'Grammar', average: 83, completion: 95 }
        ]
      };
      setAnalytics(mockData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!analytics) return <div className="p-6">Failed to load analytics</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teacher Analytics Dashboard</h1>
        <div className="flex gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold">{analytics.totalAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Grade</p>
                <p className="text-2xl font-bold">{analytics.averageGrade}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Plagiarism Rate</p>
                <p className="text-2xl font-bold">{analytics.plagiarismRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completion">Completion</TabsTrigger>
          <TabsTrigger value="grades">Grades</TabsTrigger>
          <TabsTrigger value="plagiarism">Plagiarism</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={analytics.gradeDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                    >
                      {analytics.gradeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subject Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.subjectPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="subject" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Completion Rates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.assignmentCompletion.map((assignment, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{assignment.assignment}</span>
                      <span className="text-sm text-gray-600">
                        {assignment.completed}/{assignment.total} ({assignment.rate}%)
                      </span>
                    </div>
                    <Progress value={assignment.rate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plagiarism" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plagiarism Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.plagiarismTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="incidents" stroke="#ff6b6b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Student Risk Assessment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.studentProgress.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">Grade: {student.grade}% | Completion: {student.completion}%</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={student.riskLevel === 'high' ? 'destructive' : student.riskLevel === 'medium' ? 'default' : 'secondary'}>
                        {student.riskLevel.toUpperCase()} RISK
                      </Badge>
                      {student.plagiarismFlags > 0 && (
                        <Badge variant="outline" className="text-red-600">
                          {student.plagiarismFlags} Flags
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}