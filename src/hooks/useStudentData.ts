import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  due_date: string;
  created_at: string;
  questions?: any[];
  max_score?: number;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  answers: any;
  file_urls?: string[];
  submitted_at: string;
  grade?: number;
  feedback?: string;
  auto_graded: boolean;
  assignment?: Assignment;
}

export function useStudentData() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch assignments for student's grade/class
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('assignments')
          .select('*')
          .order('due_date', { ascending: true });

        if (assignmentsError) throw assignmentsError;

        // Fetch student's submissions
        const { data: submissionsData, error: submissionsError } = await supabase
          .from('assignment_submissions')
          .select(`
            *,
            assignment:assignments(*)
          `)
          .eq('student_id', user.id)
          .order('submitted_at', { ascending: false });

        if (submissionsError) throw submissionsError;

        setAssignments(assignmentsData || []);
        setSubmissions(submissionsData || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscriptions
    const assignmentsSubscription = supabase
      .channel('student_assignments')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignments' },
        () => fetchData()
      )
      .subscribe();

    const submissionsSubscription = supabase
      .channel('student_submissions')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'assignment_submissions',
          filter: `student_id=eq.${user.id}`
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      assignmentsSubscription.unsubscribe();
      submissionsSubscription.unsubscribe();
    };
  }, [user?.id]);

  const getUpcomingAssignments = () => {
    const now = new Date();
    const submittedIds = new Set(submissions.map(s => s.assignment_id));
    
    return assignments
      .filter(a => new Date(a.due_date) > now && !submittedIds.has(a.id))
      .slice(0, 5);
  };

  const getRecentSubmissions = () => {
    return submissions.slice(0, 10);
  };

  const getProgressStats = () => {
    const totalAssignments = assignments.length;
    const completedAssignments = submissions.length;
    const averageGrade = submissions
      .filter(s => s.grade !== null)
      .reduce((sum, s) => sum + (s.grade || 0), 0) / 
      submissions.filter(s => s.grade !== null).length || 0;

    return {
      totalAssignments,
      completedAssignments,
      completionRate: totalAssignments > 0 ? (completedAssignments / totalAssignments) * 100 : 0,
      averageGrade: Math.round(averageGrade * 10) / 10
    };
  };

  return {
    assignments,
    submissions,
    loading,
    error,
    getUpcomingAssignments,
    getRecentSubmissions,
    getProgressStats,
    refetch: () => {
      if (user?.id) {
        setLoading(true);
        // Trigger re-fetch
      }
    }
  };
}