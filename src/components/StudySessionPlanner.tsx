import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Clock, Plus, Edit, Trash2, BookOpen, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface StudySession {
  id: string;
  title: string;
  description: string;
  subject: string;
  scheduled_date: string;
  duration_minutes: number;
  assignment_id?: string;
  student_id: string;
  completed: boolean;
  created_at: string;
}

interface StudySessionPlannerProps {
  assignments: any[];
  onSessionUpdate?: () => void;
}

export const StudySessionPlanner: React.FC<StudySessionPlannerProps> = ({ 
  assignments, 
  onSessionUpdate 
}) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    scheduled_date: '',
    duration_minutes: 60,
    assignment_id: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchStudySessions();
    }
  }, [user?.id]);

  const fetchStudySessions = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('student_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching study sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      const sessionData = {
        ...formData,
        student_id: user.id,
        completed: false,
        assignment_id: formData.assignment_id || null
      };

      if (editingSession) {
        const { error } = await supabase
          .from('study_sessions')
          .update(sessionData)
          .eq('id', editingSession.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('study_sessions')
          .insert([sessionData]);
        
        if (error) throw error;
      }

      await fetchStudySessions();
      resetForm();
      setShowCreateDialog(false);
      setEditingSession(null);
      onSessionUpdate?.();
    } catch (error) {
      console.error('Error saving study session:', error);
    }
  };

  const handleDelete = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;
      await fetchStudySessions();
      onSessionUpdate?.();
    } catch (error) {
      console.error('Error deleting study session:', error);
    }
  };

  const toggleComplete = async (session: StudySession) => {
    try {
      const { error } = await supabase
        .from('study_sessions')
        .update({ completed: !session.completed })
        .eq('id', session.id);

      if (error) throw error;
      await fetchStudySessions();
      onSessionUpdate?.();
    } catch (error) {
      console.error('Error updating study session:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      subject: '',
      scheduled_date: '',
      duration_minutes: 60,
      assignment_id: ''
    });
  };

  const openEditDialog = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      title: session.title,
      description: session.description,
      subject: session.subject,
      scheduled_date: session.scheduled_date.split('T')[0],
      duration_minutes: session.duration_minutes,
      assignment_id: session.assignment_id || ''
    });
    setShowCreateDialog(true);
  };

  const getUpcomingSessions = () => {
    const now = new Date();
    return sessions.filter(s => new Date(s.scheduled_date) >= now && !s.completed);
  };

  const getCompletedSessions = () => {
    return sessions.filter(s => s.completed);
  };

  if (loading) {
    return <div className="flex justify-center p-4">Loading study sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Study Session Planner
            </CardTitle>
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Session
                </Button>
              </DialogTrigger>
              
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSession ? 'Edit Study Session' : 'Create Study Session'}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Study session title"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Subject"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Related Assignment (Optional)</label>
                    <Select value={formData.assignment_id} onValueChange={(value) => setFormData({ ...formData, assignment_id: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select assignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No assignment</SelectItem>
                        {assignments.map((assignment) => (
                          <SelectItem key={assignment.id} value={assignment.id}>
                            {assignment.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <Input
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
                      <Input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                        min="15"
                        step="15"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="What will you study?"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSession ? 'Update' : 'Create'} Session
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Upcoming Sessions</h3>
              <div className="space-y-3">
                {getUpcomingSessions().map((session) => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{session.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{session.description}</p>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.scheduled_date).toLocaleDateString()}
                          <Clock className="h-4 w-4 ml-2" />
                          {session.duration_minutes} min
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary">{session.subject}</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(session)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleComplete(session)}
                        >
                          Complete
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(session.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getUpcomingSessions().length === 0 && (
                  <p className="text-gray-500 text-center py-4">No upcoming study sessions</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Completed Sessions</h3>
              <div className="space-y-3">
                {getCompletedSessions().slice(0, 5).map((session) => (
                  <div key={session.id} className="border rounded-lg p-4 bg-green-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{session.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.scheduled_date).toLocaleDateString()}
                          <Badge variant="secondary" className="ml-2">{session.subject}</Badge>
                        </div>
                      </div>
                      
                      <Badge variant="default" className="bg-green-600">
                        Completed
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {getCompletedSessions().length === 0 && (
                  <p className="text-gray-500 text-center py-4">No completed sessions yet</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};