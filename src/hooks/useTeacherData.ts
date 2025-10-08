import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface TeacherData {
  teacher: {
    id: string;
    name: string;
    email: string;
    subject: string;
    class_name: string;
  } | null;
  students: Array<{
    id: string;
    name: string;
    grade: string;
    average_score: number;
    assignments_completed: number;
    total_assignments: number;
  }>;
  assignments: Array<{
    id: string;
    title: string;
    subject: string;
    due_date: string;
    submissions_count: number;
    total_students: number;
    status: 'draft' | 'published' | 'closed';
  }>;
  recentGrades: Array<{
    id: string;
    student_name: string;
    assignment_title: string;
    score: number;
    graded_at: string;
  }>;
  messages: Array<{
    id: string;
    parent_name: string;
    student_name: string;
    subject: string;
    content: string;
    sent_at: string;
    is_read: boolean;
  }>;
  submissions: Array<{
    id: string;
    student_name: string;
    assignment_title: string;
    submitted_at: string;
    status: string;
    auto_grade?: number;
    is_auto_graded: boolean;
    file_name?: string;
  }>;
}

export const useTeacherData = () => {
  const [data, setData] = useState<TeacherData>({
    teacher: null,
    students: [],
    assignments: [],
    recentGrades: [],
    messages: [],
    submissions: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeacherData();
    
    // Set up real-time subscription for submissions
    const submissionsSubscription = supabase
      .channel('assignment_submissions')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'assignment_submissions'
      }, (payload) => {
        fetchSubmissions(); // Refresh submissions when new ones arrive
      })
      .subscribe();

    return () => {
      submissionsSubscription.unsubscribe();
    };
  }, []);

  const fetchSubmissions = async () => {
    try {
      const { data: submissions, error } = await supabase
        .from('assignment_submissions')
        .select(`
          id,
          submitted_at,
          status,
          auto_grade,
          is_auto_graded,
          file_name,
          students(name),
          assignments(title)
        `)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedSubmissions = submissions?.map(sub => ({
        id: sub.id,
        student_name: sub.students?.name || 'Unknown',
        assignment_title: sub.assignments?.title || 'Unknown',
        submitted_at: sub.submitted_at,
        status: sub.status,
        auto_grade: sub.auto_grade,
        is_auto_graded: sub.is_auto_graded,
        file_name: sub.file_name
      })) || [];

      setData(prev => ({ ...prev, submissions: formattedSubmissions }));
    } catch (err) {
      console.error('Error fetching submissions:', err);
    }
  };

  const fetchTeacherData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: teacher } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!teacher) {
        const mockTeacher = {
          id: '1',
          name: 'Ms. Sarah Johnson',
          email: 'sarah.johnson@lga.edu',
          subject: 'Mathematics',
          class_name: '5th Grade Math'
        };

        setData(prev => ({
          ...prev,
          teacher: mockTeacher,
          students: [
            { id: '1', name: 'Emma Wilson', grade: '5th', average_score: 92, assignments_completed: 8, total_assignments: 10 },
            { id: '2', name: 'Liam Johnson', grade: '5th', average_score: 87, assignments_completed: 7, total_assignments: 10 },
            { id: '3', name: 'Sophia Davis', grade: '5th', average_score: 95, assignments_completed: 10, total_assignments: 10 }
          ],
          assignments: [
            { id: '1', title: 'Fractions Quiz', subject: 'Math', due_date: '2024-01-20', submissions_count: 18, total_students: 20, status: 'published' },
            { id: '2', title: 'Geometry Project', subject: 'Math', due_date: '2024-01-25', submissions_count: 5, total_students: 20, status: 'published' }
          ],
          recentGrades: [
            { id: '1', student_name: 'Emma Wilson', assignment_title: 'Fractions Quiz', score: 95, graded_at: '2024-01-15' },
            { id: '2', student_name: 'Liam Johnson', assignment_title: 'Fractions Quiz', score: 88, graded_at: '2024-01-15' }
          ],
          messages: [
            { id: '1', parent_name: 'Jennifer Wilson', student_name: 'Emma Wilson', subject: 'Math Progress', content: 'How is Emma doing in math?', sent_at: '2024-01-14', is_read: false }
          ]
        }));
        
        await fetchSubmissions();
        setLoading(false);
        return;
      }

      setData(prev => ({ ...prev, teacher }));
      await fetchSubmissions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, refetch: fetchTeacherData };
};