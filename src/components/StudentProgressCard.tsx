import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, CheckCircle, Clock, TrendingUp, Award, MessageSquare } from 'lucide-react';

interface StudentProgressCardProps {
  student: {
    id: string;
    name: string;
    email: string;
    grade_level?: string;
  };
  grades: any[];
  assignments: any[];
  messages: any[];
  achievements: any[];
}

export default function StudentProgressCard({ 
  student, 
  grades, 
  assignments, 
  messages,
  achievements 
}: StudentProgressCardProps) {
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;
  const avgGrade = grades.length > 0 
    ? grades.reduce((sum, g) => sum + (g.score || 0), 0) / grades.length 
    : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{student.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{student.email}</p>
          </div>
          {student.grade_level && (
            <Badge variant="outline">{student.grade_level}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="grades">Grades</TabsTrigger>
            <TabsTrigger value="assignments">Assignments</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Average Grade
                </div>
                <div className="text-2xl font-bold">{avgGrade.toFixed(1)}%</div>
                <Progress value={avgGrade} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-4 w-4" />
                  Completed
                </div>
                <div className="text-2xl font-bold">
                  {completedAssignments}/{assignments.length}
                </div>
                <Progress 
                  value={(completedAssignments / assignments.length) * 100} 
                  className="h-2" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Award className="h-4 w-4" />
                Recent Achievements
              </div>
              <div className="flex flex-wrap gap-2">
                {achievements.slice(0, 3).map((achievement, idx) => (
                  <Badge key={idx} variant="secondary">
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="grades" className="space-y-3">
            {grades.slice(0, 5).map((grade, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <p className="font-medium">{grade.assignment_title}</p>
                  <p className="text-xs text-muted-foreground">{grade.subject}</p>
                </div>
                <Badge variant={grade.score >= 90 ? 'success' : grade.score >= 70 ? 'default' : 'destructive'}>
                  {grade.score}%
                </Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="assignments" className="space-y-3">
            {assignments.slice(0, 5).map((assignment, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="font-medium">{assignment.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(assignment.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge variant={
                  assignment.status === 'completed' ? 'success' :
                  assignment.status === 'pending' ? 'default' : 'destructive'
                }>
                  {assignment.status}
                </Badge>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="messages" className="space-y-3">
            {messages.slice(0, 5).map((message, idx) => (
              <div key={idx} className="p-3 border rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-sm">{message.sender_name}</p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(message.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{message.content}</p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
