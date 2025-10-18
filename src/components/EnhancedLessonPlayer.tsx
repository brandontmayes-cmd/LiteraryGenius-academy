import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, PlayCircle, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PracticeEngine from './PracticeEngine';

interface EnhancedLessonPlayerProps {
  lessonId: string;
  studentId: string;
  onComplete: () => void;
}

export default function EnhancedLessonPlayer({ lessonId, studentId, onComplete }: EnhancedLessonPlayerProps) {
  const [lesson, setLesson] = useState<any>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showPractice, setShowPractice] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    try {
      const { data, error } = await supabase
        .from('curriculum_lessons')
        .select('*, common_core_standards(*)')
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

  if (loading) return <div className="text-center p-12">Loading lesson...</div>;
  if (!lesson) return <div className="text-center p-12">Lesson not found</div>;

  if (showPractice) {
    return (
      <PracticeEngine
        standardId={lesson.standard_id}
        standardCode={lesson.common_core_standards?.code}
        standardDescription={lesson.common_core_standards?.description}
        studentId={studentId}
        onComplete={onComplete}
      />
    );
  }

  const sections = lesson.lesson_content?.sections || [];
  const section = sections[currentSection];
  const progress = ((currentSection + 1) / sections.length) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {lesson.lesson_title}
            </CardTitle>
            <Badge>{lesson.difficulty_level}</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
          <p className="text-sm text-gray-600 mt-2">
            Section {currentSection + 1} of {sections.length}
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-8">
          {section && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-bold text-blue-600">{currentSection + 1}</span>
                </div>
                <h2 className="text-2xl font-bold">{section.title}</h2>
              </div>
              
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />

              {section.examples && (
                <div className="bg-blue-50 p-6 rounded-lg space-y-3">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Examples
                  </h3>
                  {section.examples.map((example: string, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded border-l-4 border-blue-500">
                      {example}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between gap-4">
            <Button
              onClick={() => setCurrentSection(currentSection - 1)}
              disabled={currentSection === 0}
              variant="outline"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentSection < sections.length - 1 ? (
              <Button onClick={() => setCurrentSection(currentSection + 1)}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setShowPractice(true)} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="mr-2 h-4 w-4" />
                Start Practice
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
