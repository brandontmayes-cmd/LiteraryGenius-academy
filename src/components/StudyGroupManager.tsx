import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Plus, BookOpen, MessageCircle, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  member_count: number;
  is_member: boolean;
  created_at: string;
}

export default function StudyGroupManager() {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    maxMembers: 10,
    isPublic: true
  });

  useEffect(() => {
    if (user) {
      fetchStudyGroups();
    }
  }, [user]);

  const fetchStudyGroups = async () => {
    try {
      const { data: groups, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members!inner(user_id),
          member_count:study_group_members(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsWithMembership = groups?.map(group => ({
        ...group,
        member_count: group.member_count?.[0]?.count || 0,
        is_member: group.study_group_members?.some((member: any) => member.user_id === user?.id)
      })) || [];

      setStudyGroups(groupsWithMembership);
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStudyGroup = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'create_study_group',
          data: {
            ...newGroup,
            userId: user?.id
          }
        }
      });

      if (error) throw error;

      setShowCreateDialog(false);
      setNewGroup({ name: '', description: '', subject: '', maxMembers: 10, isPublic: true });
      fetchStudyGroups();
    } catch (error) {
      console.error('Error creating study group:', error);
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('collaboration-manager', {
        body: {
          action: 'join_study_group',
          data: {
            groupId,
            userId: user?.id
          }
        }
      });

      if (error) throw error;
      fetchStudyGroups();
    } catch (error) {
      console.error('Error joining study group:', error);
    }
  };

  const subjects = ['Math', 'Science', 'ELA', 'Social Studies', 'Art', 'Music', 'PE'];

  if (loading) {
    return <div className="flex justify-center p-8">Loading study groups...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Study Groups</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
              />
              <Textarea
                placeholder="Description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
              />
              <Select value={newGroup.subject} onValueChange={(value) => setNewGroup({...newGroup, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={createStudyGroup} className="w-full">
                Create Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studyGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{group.name}</CardTitle>
                <Badge variant="secondary">{group.subject}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{group.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="w-4 h-4 mr-1" />
                  {group.member_count} members
                </div>
                {group.is_member ? (
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => joinStudyGroup(group.id)}>
                    Join
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}