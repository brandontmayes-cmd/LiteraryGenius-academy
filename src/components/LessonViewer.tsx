import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Trophy, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface LessonViewerProps {
  lessonId: string;
  studentId: string;
  onComplete: () => void;
}

export default function LessonViewer({ lessonId, studentId, onComplete }: LessonViewerProps) {
  const [lesson, setLesson] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [practiceMode, setPracticeMode] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('*')
        .eq('id', lessonId)
        .single();

      if (error) throw error;
      setLesson(data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePracticeSubmit = async () => {
    const problems = lesson.practice_problems || [];
    let correct = 0;
    problems.forEach((prob: any, idx: number) => {
      if (answers[idx] === prob.correct_answer) correct++;
    });

    const score = Math.round((correct / problems.length) * 100);
    const mastered = score >= lesson.mastery_threshold;

    await supabase.from('student_lesson_progress').upsert({
      student_id: studentId,
      lesson_id: lessonId,
      status: mastered ? 'completed' : 'in_progress',
      score,
      mastered,
      attempts: 1,
      updated_at: new Date().toISOString()
    });

    setResults({ score, mastered, correct, total: problems.length });
  };

  if (loading) return <div>Loading...</div>;
  if (!lesson) return <div>Lesson not found</div>;

  if (results) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {results.mastered ? <Trophy className="h-6 w-6 text-yellow-500" /> : <CheckCircle className="h-6 w-6" />}
            Practice Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600">{results.score}%</div>
            <p className="text-gray-600">
              {results.correct} out of {results.total} correct
            </p>
            {results.mastered && (
              <Badge className="mt-4 bg-yellow-500">🎉 Lesson Mastered!</Badge>
            )}
          </div>
          <Button onClick={onComplete} className="w-full">
            {results.mastered ? 'Next Lesson' : 'Try Again'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (practiceMode) {
    const problems = lesson.practice_problems || [];
    return (
      <Card>
        <CardHeader>
          <CardTitle>Practice Problems</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {problems.map((prob: any, idx: number) => (
            <div key={idx} className="space-y-3 p-4 border rounded-lg">
              <p className="font-medium">{idx + 1}. {prob.question}</p>
              <div className="space-y-2">
                {prob.options?.map((opt: string, optIdx: number) => (
                  <label key={optIdx} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`q${idx}`}
                      value={opt}
                      onChange={() => setAnswers({ ...answers, [idx]: opt })}
                      className="w-4 h-4"
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={handlePracticeSubmit} className="w-full">
            Submit Answers
          </Button>
        </CardContent>
      </Card>
    );
  }

  const content = lesson.lesson_content?.sections || [];
  const section = content[currentSection];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{lesson.lesson_title}</CardTitle>
        <Progress value={((currentSection + 1) / content.length) * 100} />
      </CardHeader>
      <CardContent className="space-y-6">
        {section && (
          <>
            <h3 className="text-xl font-semibold">{section.title}</h3>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
          </>
        )}
        <div className="flex justify-between">
          {currentSection < content.length - 1 ? (
            <Button onClick={() => setCurrentSection(currentSection + 1)}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => setPracticeMode(true)}>
              Start Practice
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
