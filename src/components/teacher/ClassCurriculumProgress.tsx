import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { BookOpen, CheckCircle, Clock, TrendingUp } from 'lucide-react';

export default function ClassCurriculumProgress() {
  const [students, setStudents] = useState<any[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [subject, setSubject] = useState('all');
  const [grade, setGrade] = useState('all');

  useEffect(() => {
    loadData();
  }, [subject, grade]);

  const loadData = async () => {
    const { data: studentsData } = await supabase.from('students').select('*');
    setStudents(studentsData || []);

    const { data: progressData } = await supabase
      .from('student_lesson_progress')
      .select('*, curriculum_lessons(*)');
    
    setProgress(progressData || []);
  };

  const getStudentProgress = (studentId: string) => {
    const studentProgress = progress.filter(p => p.student_id === studentId);
    const completed = studentProgress.filter(p => p.mastered).length;
    const total = studentProgress.length;
    return { completed, total, percentage: total ? (completed / total) * 100 : 0 };
  };

  const getClassAverage = () => {
    const averages = students.map(s => getStudentProgress(s.id).percentage);
    return averages.reduce((a, b) => a + b, 0) / (averages.length || 1);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Total Lessons</p>
              <p className="text-2xl font-bold">{progress.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold">{progress.filter(p => p.mastered).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold">{progress.filter(p => !p.mastered && p.attempts > 0).length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Class Average</p>
              <p className="text-2xl font-bold">{getClassAverage().toFixed(0)}%</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex gap-4">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            <SelectItem value="English">English</SelectItem>
            <SelectItem value="Mathematics">Mathematics</SelectItem>
            <SelectItem value="Science">Science</SelectItem>
            <SelectItem value="Social Studies">Social Studies</SelectItem>
          </SelectContent>
        </Select>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
              <SelectItem key={g} value={g}>Grade {g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Student Progress</h3>
        <div className="space-y-4">
          {students.map(student => {
            const { completed, total, percentage } = getStudentProgress(student.id);
            return (
              <div key={student.id} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{student.name}</span>
                  <span className="text-sm text-gray-600">{completed}/{total} lessons</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}