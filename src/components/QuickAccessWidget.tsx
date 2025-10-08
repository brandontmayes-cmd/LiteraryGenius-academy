import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface Assignment {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  status?: string;
}

export const QuickAccessWidget: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) loadUpcoming();
  }, [user]);

  const loadUpcoming = async () => {
    try {
      const { data, error } = await supabase
        .from('assignments')
        .select('id, title, subject, due_date')
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(5);

      if (error) throw error;
      setAssignments(data || []);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDueDateLabel = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isToday(date)) return { text: 'Due Today', color: 'bg-red-500' };
    if (isTomorrow(date)) return { text: 'Due Tomorrow', color: 'bg-orange-500' };
    return { text: format(date, 'MMM d'), color: 'bg-blue-500' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Assignments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {assignments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>All caught up!</p>
          </div>
        ) : (
          assignments.map((assignment) => {
            const dueInfo = getDueDateLabel(assignment.due_date);
            return (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{assignment.title}</p>
                  <p className="text-sm text-gray-500">{assignment.subject}</p>
                </div>
                <Badge className={`${dueInfo.color} text-white ml-2`}>
                  {dueInfo.text}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
