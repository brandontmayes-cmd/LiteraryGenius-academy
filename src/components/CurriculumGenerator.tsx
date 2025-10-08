import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Wand2, BookOpen, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function CurriculumGenerator() {
  const [subject, setSubject] = useState('Mathematics');
  const [gradeLevel, setGradeLevel] = useState('1');
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies'];
  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  const generateCurriculum = async () => {
    setGenerating(true);
    setProgress([]);

    try {
      // Generate lessons
      for (let i = 0; i < 10; i++) {
        setProgress(prev => [...prev, `Generating lesson ${i + 1} for ${subject} Grade ${gradeLevel}...`]);
        
        const { data: lesson } = await supabase.functions.invoke('curriculum-content-generator', {
          body: { action: 'generate_lesson', subject, gradeLevel }
        });

        if (lesson?.lesson) {
          await supabase.from('curriculum_lessons').insert({
            grade_level: gradeLevel,
            subject,
            lesson_title: lesson.lesson.title,
            lesson_description: lesson.lesson.description,
            learning_objectives: lesson.lesson.objectives,
            lesson_content: { sections: lesson.lesson.content },
            practice_problems: lesson.lesson.practice_problems,
            difficulty_level: i < 3 ? 'Beginner' : i < 7 ? 'Intermediate' : 'Advanced',
            estimated_time: 30 + (i * 5)
          });
        }
      }

      // Generate diagnostic questions
      setProgress(prev => [...prev, 'Generating diagnostic test questions...']);
      const { data: questions } = await supabase.functions.invoke('curriculum-content-generator', {
        body: { action: 'generate_diagnostic_questions', subject, gradeLevel }
      });

      if (questions?.questions) {
        for (const q of questions.questions) {
          await supabase.from('diagnostic_test_questions').insert({
            subject,
            grade_level: gradeLevel,
            question_text: q.question_text,
            question_type: 'multiple_choice',
            options: q.options,
            correct_answer: q.correct_answer,
            difficulty_level: q.difficulty_level,
            skill_category: q.skill_category
          });
        }
      }

      setProgress(prev => [...prev, '✅ Complete!']);
    } catch (error) {
      console.error('Error generating curriculum:', error);
      setProgress(prev => [...prev, `❌ Error: ${error.message}`]);
    } finally {
      setGenerating(false);
    }
  };

  const generateAllCurriculum = async () => {
    setGenerating(true);
    setProgress([]);

    for (const subj of subjects) {
      for (const grade of grades) {
        setSubject(subj);
        setGradeLevel(grade);
        await generateCurriculum();
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-6 w-6 text-purple-600" />
          AI Curriculum Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {subjects.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Grade Level</label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {grades.map(g => (
                  <SelectItem key={g} value={g}>
                    {g === 'K' ? 'Pre-K' : `Grade ${g}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-4">
          <Button onClick={generateCurriculum} disabled={generating}>
            <BookOpen className="mr-2 h-4 w-4" />
            Generate for Selected
          </Button>
          <Button onClick={generateAllCurriculum} disabled={generating} variant="secondary">
            <Wand2 className="mr-2 h-4 w-4" />
            Generate All (PK-12)
          </Button>
        </div>

        {progress.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {progress.map((msg, idx) => (
              <div key={idx} className="text-sm flex items-center gap-2">
                {msg.includes('✅') ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                )}
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
