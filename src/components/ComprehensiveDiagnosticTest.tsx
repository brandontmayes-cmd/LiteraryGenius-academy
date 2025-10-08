import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  subject: string;
  grade_level: string;
  difficulty_level: number;
  skill_category: string;
}

interface ComprehensiveDiagnosticTestProps {
  studentId: string;
  onComplete: (results: any) => void;
}

export default function ComprehensiveDiagnosticTest({ 
  studentId, 
  onComplete 
}: ComprehensiveDiagnosticTestProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);

  const subjects = ['Mathematics', 'English', 'Science', 'Social Studies'];

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const allQuestions: Question[] = [];
      
      for (const subject of subjects) {
        for (let grade = 1; grade <= 12; grade++) {
          for (let difficulty = 1; difficulty <= 3; difficulty++) {
            const { data } = await supabase
              .from('diagnostic_test_questions')
              .select('*')
              .eq('subject', subject)
              .eq('grade_level', grade.toString())
              .eq('difficulty_level', difficulty)
              .limit(2);
            
            if (data) allQuestions.push(...data);
          }
        }
      }
      
      setQuestions(allQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [questions[currentIndex].id]: answer });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = async () => {
    const subjectScores: Record<string, any> = {};
    
    subjects.forEach(subject => {
      const subjectQs = questions.filter(q => q.subject === subject);
      const correct = subjectQs.filter(q => answers[q.id] === q.correct_answer).length;
      subjectScores[subject] = {
        score: Math.round((correct / subjectQs.length) * 100),
        total: subjectQs.length,
        correct
      };
    });

    const overallScore = Math.round(
      Object.values(subjectScores).reduce((sum: number, s: any) => sum + s.score, 0) / subjects.length
    );

    const results = {
      overallScore,
      subjectScores,
      recommendedGrade: Math.ceil(overallScore / 10),
      strengths: Object.entries(subjectScores)
        .filter(([_, s]: any) => s.score >= 80)
        .map(([subj]) => subj),
      weaknesses: Object.entries(subjectScores)
        .filter(([_, s]: any) => s.score < 60)
        .map(([subj]) => subj)
    };

    onComplete(results);
    setShowResults(true);
  };

  if (loading) return <div className="text-center p-8">Loading comprehensive diagnostic test...</div>;

  const progress = ((currentIndex + 1) / questions.length) * 100;
  const current = questions[currentIndex];

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-purple-600" />
          Comprehensive Diagnostic Assessment
        </CardTitle>
        <p className="text-sm text-gray-600">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Badge>{current?.subject}</Badge>
          <Badge variant="outline">Grade {current?.grade_level}</Badge>
          <Badge variant="secondary">{current?.skill_category}</Badge>
        </div>
        
        <div className="text-lg font-medium">{current?.question_text}</div>
        
        <div className="space-y-3">
          {current?.options?.map((option, idx) => (
            <Button
              key={idx}
              variant="outline"
              className="w-full justify-start text-left h-auto py-4"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
