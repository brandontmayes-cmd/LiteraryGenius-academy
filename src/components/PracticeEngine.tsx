import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import SortQuestion from './questions/SortQuestion';
import ShortAnswerQuestion from './questions/ShortAnswerQuestion';
import MatchingQuestion from './questions/MatchingQuestion';

interface PracticeEngineProps {
  standardId: string;
  standardCode: string;
  standardDescription: string;
  studentId: string;
  onComplete?: () => void;
}

export default function PracticeEngine({
  standardId,
  standardCode,
  standardDescription,
  studentId,
  onComplete
}: PracticeEngineProps) {
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const questionTypes = ['multiple_choice', 'short_answer', 'matching', 'sorting'];

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
      const { data, error } = await supabase.functions.invoke('question-generator', {
        body: {
          standardId,
          standardCode,
          standardDescription,
          questionType: type,
          count: 5,
          difficulty: 'medium'
        }
      });

      if (error) throw error;
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Error generating questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const newScore = {
      correct: score.correct + (correct ? 1 : 0),
      total: score.total + 1
    };
    setScore(newScore);

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 500);
    } else {
      setCompleted(true);
      saveProgress(newScore);
    }
  };

  const saveProgress = async (finalScore: any) => {
    const percentage = Math.round((finalScore.correct / finalScore.total) * 100);
    await supabase.from('student_standards_mastery').upsert({
      student_id: studentId,
      standard_id: standardId,
      mastery_level: percentage,
      updated_at: new Date().toISOString()
    });
  };

  if (loading) {
    return <Card><CardContent className="p-12 text-center">Generating questions...</CardContent></Card>;
  }

  if (completed) {
    const percentage = Math.round((score.correct / score.total) * 100);
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            Practice Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600">{percentage}%</div>
            <p className="text-gray-600 mt-2">{score.correct} out of {score.total} correct</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setCompleted(false); setCurrentQuestion(0); setScore({ correct: 0, total: 0 }); generateQuestions(); }} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" /> Practice Again
            </Button>
            {onComplete && <Button onClick={onComplete} variant="outline" className="flex-1">Done</Button>}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Question {currentQuestion + 1} of {questions.length}</span>
            <span className="text-sm text-gray-600">Score: {score.correct}/{score.total}</span>
          </div>
          <Progress value={((currentQuestion + 1) / questions.length) * 100} />
        </CardContent>
      </Card>

      {question.options && (
        <MultipleChoiceQuestion
          question={question.question}
          options={question.options}
          correctAnswer={question.correctAnswer}
          explanation={question.explanation}
          onAnswer={handleAnswer}
        />
      )}
      {question.pairs && (
        <MatchingQuestion
          question={question.question}
          pairs={question.pairs}
          explanation={question.explanation}
          onAnswer={handleAnswer}
        />
      )}
      {question.items && (
        <SortQuestion
          question={question.question}
          items={question.items}
          correctOrder={question.correctOrder}
          explanation={question.explanation}
          onAnswer={handleAnswer}
        />
      )}
      {!question.options && !question.pairs && !question.items && (
        <ShortAnswerQuestion
          question={question.question}
          correctAnswer={question.correctAnswer}
          explanation={question.explanation}
          onAnswer={handleAnswer}
        />
      )}
    </div>
  );
}
