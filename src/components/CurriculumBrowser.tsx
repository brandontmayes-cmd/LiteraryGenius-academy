import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Lock, CheckCircle, PlayCircle, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Lesson {
  id: string;
  lesson_title: string;
  grade_level: string;
  subject: string;
  difficulty_level: string;
  estimated_time: number;
  mastery_threshold: number;
  progress?: {
    status: string;
    score: number;
    mastered: boolean;
  };
}

interface CurriculumBrowserProps {
  studentId: string;
  gradeLevel?: string;
  subject?: string;
  onLessonSelect: (lessonId: string) => void;
}

export default function CurriculumBrowser({ 
  studentId, 
  gradeLevel, 
  subject,
  onLessonSelect 
}: CurriculumBrowserProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState(subject || 'Mathematics');
  const [selectedGrade, setSelectedGrade] = useState(gradeLevel || 'K');

  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies'];
  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  useEffect(() => {
    fetchLessons();
  }, [selectedSubject, selectedGrade, studentId]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select(`
          *,
          progress:student_lesson_progress!left(status, score, mastered)
        `)
        .eq('subject', selectedSubject)
        .eq('grade_level', selectedGrade)
        .order('created_at');

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLessonIcon = (lesson: Lesson) => {
    if (lesson.progress?.mastered) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (lesson.progress?.status === 'in_progress') return <PlayCircle className="h-5 w-5 text-blue-500" />;
    return <BookOpen className="h-5 w-5 text-gray-400" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Curriculum Browser</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              {subjects.map(subj => (
                <Button
                  key={subj}
                  variant={selectedSubject === subj ? 'default' : 'outline'}
                  onClick={() => setSelectedSubject(subj)}
                  size="sm"
                >
                  {subj}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {grades.map(grade => (
              <Button
                key={grade}
                variant={selectedGrade === grade ? 'default' : 'outline'}
                onClick={() => setSelectedGrade(grade)}
                size="sm"
              >
                {grade === 'K' ? 'Pre-K' : `Grade ${grade}`}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {lessons.map(lesson => (
          <Card key={lesson.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4 flex-1">
                  <div className="mt-1">{getLessonIcon(lesson)}</div>
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-lg">{lesson.lesson_title}</h3>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">{lesson.difficulty_level}</Badge>
                      <Badge variant="secondary">{lesson.estimated_time} min</Badge>
                      {lesson.progress?.mastered && (
                        <Badge className="bg-yellow-500">Mastered</Badge>
                      )}
                    </div>
                    {lesson.progress && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{lesson.progress.score || 0}%</span>
                        </div>
                        <Progress value={lesson.progress.score || 0} />
                      </div>
                    )}
                  </div>
                </div>
                <Button onClick={() => onLessonSelect(lesson.id)}>
                  {lesson.progress?.status === 'in_progress' ? 'Continue' : 'Start'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
