import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Bell, Settings, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ParentInvitationSystem from './ParentInvitationSystem';
import StudentProgressCard from './StudentProgressCard';

interface LinkedStudent {
  id: string;
  student_id: string;
  access_level: string;
  can_view_grades: boolean;
  can_view_assignments: boolean;
  can_view_messages: boolean;
}

export default function ParentPortalDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [linkedStudents, setLinkedStudents] = useState<LinkedStudent[]>([]);
  const [studentData, setStudentData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadParentData();
    }
  }, [user]);

  const loadParentData = async () => {
    try {
      // Load linked students
      const { data: links, error: linksError } = await supabase
        .from('parent_student_links')
        .select('*')
        .eq('parent_id', user?.id);

      if (linksError) throw linksError;
      setLinkedStudents(links || []);

      // Load data for each student
      if (links && links.length > 0) {
        const data: any = {};
        
        for (const link of links) {
          // Load student profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', link.student_id)
            .single();

          // Load grades if allowed
          let grades = [];
          if (link.can_view_grades) {
            const { data: gradesData } = await supabase
              .from('grades')
              .select('*')
              .eq('student_id', link.student_id)
              .order('created_at', { ascending: false })
              .limit(10);
            grades = gradesData || [];
          }

          // Load assignments if allowed
          let assignments = [];
          if (link.can_view_assignments) {
            const { data: assignmentsData } = await supabase
              .from('assignments')
              .select('*')
              .order('due_date', { ascending: false })
              .limit(10);
            assignments = assignmentsData || [];
          }

          // Load messages if allowed
          let messages = [];
          if (link.can_view_messages) {
            const { data: messagesData } = await supabase
              .from('messages')
              .select('*')
              .or(`sender_id.eq.${link.student_id},receiver_id.eq.${link.student_id}`)
              .order('created_at', { ascending: false })
              .limit(10);
            messages = messagesData || [];
          }

          // Load achievements
          const { data: achievementsData } = await supabase
            .from('achievements')
            .select('*')
            .eq('student_id', link.student_id)
            .order('earned_at', { ascending: false })
            .limit(5);

          data[link.student_id] = {
            profile,
            grades,
            assignments,
            messages,
            achievements: achievementsData || []
          };
        }

        setStudentData(data);
      }

      // Load parent notifications
      const { data: notifs } = await supabase
        .from('parent_notifications')
        .select('*')
        .eq('parent_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setNotifications(notifs || []);

    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeAccess = async (studentId: string) => {
    try {
      const { error } = await supabase.functions.invoke('parent-portal-manager', {
        body: {
          action: 'revoke_access',
          parentId: user?.id,
          studentId
        }
      });

      if (error) throw error;

      toast({ title: 'Success', description: 'Access revoked' });
      loadParentData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading parent portal...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Parent Portal</h1>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList>
          <TabsTrigger value="students">
            <Users className="h-4 w-4 mr-2" />
            My Students ({linkedStudents.length})
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications ({notifications.filter(n => !n.read).length})
          </TabsTrigger>
          <TabsTrigger value="request">Request Access</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-6">
          {linkedStudents.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No linked students. Request access to monitor student progress.
              </AlertDescription>
            </Alert>
          ) : (
            linkedStudents.map((link) => {
              const data = studentData[link.student_id];
              if (!data?.profile) return null;

              return (
                <div key={link.id} className="space-y-2">
                  <StudentProgressCard
                    student={{
                      id: link.student_id,
                      name: data.profile.full_name,
                      email: data.profile.email,
                      grade_level: data.profile.grade_level
                    }}
                    grades={data.grades}
                    assignments={data.assignments}
                    messages={data.messages}
                    achievements={data.achievements}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRevokeAccess(link.student_id)}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Revoke Access
                  </Button>
                </div>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          {notifications.map((notif) => (
            <Card key={notif.id}>
              <CardHeader>
                <CardTitle className="text-base">{notif.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(notif.created_at).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="request">
          <ParentInvitationSystem />
        </TabsContent>
      </Tabs>
    </div>
  );
}
