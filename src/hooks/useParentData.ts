import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export interface Student {
  id: string;
  name: string;
  grade_level: number;
  avatar_url?: string;
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  due_date: string;
  total_points: number;
}

export interface Grade {
  id: string;
  assignment: Assignment;
  points_earned: number;
  total_points: number;
  percentage: number;
  status: 'completed' | 'late' | 'missing';
  submitted_at?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  earned_at: string;
}

export interface StudySession {
  id: string;
  subject: string;
  duration_minutes: number;
  session_date: string;
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  sender_name: string;
  created_at: string;
  is_read: boolean;
}

export const useParentData = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStudents();
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentData();
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('parent_id', user?.id);

      if (error) throw error;
      setStudents(data || []);
      if (data && data.length > 0) {
        setSelectedStudent(data[0]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchStudentData = async () => {
    if (!selectedStudent) return;
    
    setLoading(true);
    try {
      await Promise.all([
        fetchAssignments(),
        fetchGrades(),
        fetchAchievements(),
        fetchStudySessions(),
        fetchMessages()
      ]);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('grade_level', selectedStudent?.grade_level)
      .order('due_date', { ascending: true });

    if (error) throw error;
    setAssignments(data || []);
  };

  const fetchGrades = async () => {
    const { data, error } = await supabase
      .from('grades')
      .select(`
        *,
        assignment:assignments(*)
      `)
      .eq('student_id', selectedStudent?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    setGrades(data || []);
  };

  const fetchAchievements = async () => {
    const { data, error } = await supabase
      .from('student_achievements')
      .select(`
        *,
        achievement:achievements(*)
      `)
      .eq('student_id', selectedStudent?.id)
      .order('earned_at', { ascending: false });

    if (error) throw error;
    
    const formattedAchievements = data?.map(item => ({
      id: item.achievement.id,
      name: item.achievement.name,
      description: item.achievement.description,
      badge_icon: item.achievement.badge_icon,
      badge_color: item.achievement.badge_color,
      earned_at: item.earned_at
    })) || [];
    
    setAchievements(formattedAchievements);
  };

  const fetchStudySessions = async () => {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('student_id', selectedStudent?.id)
      .order('session_date', { ascending: false })
      .limit(30);

    if (error) throw error;
    setStudySessions(data || []);
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:sender_id(email)
      `)
      .eq('student_id', selectedStudent?.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedMessages = data?.map(msg => ({
      id: msg.id,
      subject: msg.subject,
      content: msg.content,
      sender_name: msg.sender?.email || 'Unknown',
      created_at: msg.created_at,
      is_read: msg.is_read
    })) || [];
    
    setMessages(formattedMessages);
  };

  return {
    students,
    selectedStudent,
    setSelectedStudent,
    assignments,
    grades,
    achievements,
    studySessions,
    messages,
    loading,
    refetch: fetchStudentData
  };
};