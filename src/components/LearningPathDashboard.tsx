import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, CheckCircle, PlayCircle, BookOpen, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LearningActivity {
  id: string;
  title: string;
  description: string;
  activity_type: string;
  difficulty_level: string;
  estimated_duration: number;
  content_data: any;
  completed: boolean;
}

interface LearningPathDashboardProps {
  studentId: string;
  learningPath: any;
}

export default function LearningPathDashboard({ studentId, learningPath }: LearningPathDashboardProps) {
  const [activities, setActivities] = useState<LearningActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadActivities();
  }, [learningPath]);

  const loadActivities = async () => {
    if (!learningPath?.recommendedSequence) return;
    
    try {
      const { data, error } = await supabase
        .from('learning_activities')
        .select('*')
        .in('standard_id', learningPath.nextStandards || []);

      if (error) throw error;
      
      const activitiesWithCompletion = data?.map(activity => ({
        ...activity,
        completed: Math.random() > 0.7 // Simulate some completed activities
      })) || [];

      setActivities(activitiesWithCompletion);
      setCompletedCount(activitiesWithCompletion.filter(a => a.completed).length);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const startActivity = async (activityId: string) => {
    // Simulate starting an activity
    console.log('Starting activity:', activityId);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <BookOpen className="w-4 h-4" />;
      case 'practice': return <PlayCircle className="w-4 h-4" />;
      case 'assessment': return <TrendingUp className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const progressPercentage = activities.length > 0 ? (completedCount / activities.length) * 100 : 0;

  if (loading) {
    return <div className="text-center py-8">Loading learning path...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Learning Path Progress</span>
            <Badge variant="outline">
              {completedCount}/{activities.length} Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="w-full" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{completedCount} activities completed</span>
              <span>{Math.round(progressPercentage)}% progress</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities Tabs */}
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="current">Current</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <h3 className="text-lg font-semibold">Current Activities</h3>
          {activities.filter(a => !a.completed && a.activity_type === 'lesson').map(activity => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getActivityIcon(activity.activity_type)}
                      <h4 className="font-medium">{activity.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {activity.difficulty_level}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.estimated_duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Due today
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => startActivity(activity.id)} size="sm">
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <h3 className="text-lg font-semibold">Practice Activities</h3>
          {activities.filter(a => a.activity_type === 'practice').map(activity => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getActivityIcon(activity.activity_type)}
                      <h4 className="font-medium">{activity.title}</h4>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {activity.estimated_duration} min
                    </div>
                  </div>
                  <Button 
                    onClick={() => startActivity(activity.id)} 
                    size="sm"
                    variant={activity.completed ? "outline" : "default"}
                  >
                    {activity.completed ? 'Retry' : 'Practice'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="assessment" className="space-y-4">
          <h3 className="text-lg font-semibold">Assessments</h3>
          {activities.filter(a => a.activity_type === 'assessment').map(activity => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getActivityIcon(activity.activity_type)}
                      <h4 className="font-medium">{activity.title}</h4>
                      {activity.completed && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{activity.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {activity.estimated_duration} min
                    </div>
                  </div>
                  <Button 
                    onClick={() => startActivity(activity.id)} 
                    size="sm"
                    disabled={activity.completed}
                  >
                    {activity.completed ? 'Completed' : 'Take Assessment'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <h3 className="text-lg font-semibold">Completed Activities</h3>
          {activities.filter(a => a.completed).map(activity => (
            <Card key={activity.id} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <h4 className="font-medium">{activity.title}</h4>
                      <Badge className="bg-green-100 text-green-800">Complete</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}