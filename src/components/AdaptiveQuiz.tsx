import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Brain, Clock, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  type: 'multiple_choice' | 'short_answer' | 'problem_solving';
  question: string;
  options?: string[];
  correct_answer: string;
  difficulty: number;
  learning_objective: string;
  estimated_time: string;
  explanation: string;
}

interface AdaptiveQuizProps {
  subject: string;
  studentId: string;
  onComplete: (results: any) => void;
}

export default function AdaptiveQuiz({ subject, studentId, onComplete }: AdaptiveQuizProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [difficulty, setDifficulty] = useState(3);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    generateAdaptiveTest();
    const timer = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const generateAdaptiveTest = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('adaptive-assessment-engine', {
        body: {
          action: 'generate_adaptive_test',
          studentId,
          subject,
          difficulty,
          questionCount: 10,
          currentPerformance: { score, difficulty }
        }
      });

      if (error) throw error;
      if (data.success) {
        setQuestions(data.data.questions);
      }
    } catch (error) {
      console.error('Error generating adaptive test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentAnswer.toLowerCase().trim() === 
                     currentQuestion.correct_answer.toLowerCase().trim();
    
    if (isCorrect) {
      setScore(score + 1);
    }

    const newAnswers = { ...answers, [currentQuestion.id]: currentAnswer };
    setAnswers(newAnswers);

    // Adjust difficulty based on performance
    if (currentQuestionIndex > 2) {
      const recentAnswers = Object.values(newAnswers).slice(-3);
      const recentScore = recentAnswers.filter((answer, index) => {
        const questionIndex = currentQuestionIndex - 2 + index;
        return questionIndex >= 0 && questions[questionIndex] && 
               answer.toLowerCase().trim() === questions[questionIndex].correct_answer.toLowerCase().trim();
      }).length;

      if (recentScore >= 2 && difficulty < 5) {
        setDifficulty(difficulty + 1);
      } else if (recentScore <= 1 && difficulty > 1) {
        setDifficulty(difficulty - 1);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setCurrentAnswer('');
    } else {
      // Quiz complete
      const results = {
        score,
        totalQuestions: questions.length,
        timeSpent,
        difficulty,
        answers: newAnswers,
        subject
      };
      onComplete(results);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <Brain className="h-6 w-6 animate-spin text-blue-600" />
            <span>Generating adaptive assessment...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p>Unable to generate assessment. Please try again.</p>
          <Button onClick={generateAdaptiveTest} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-blue-600" />
            <span>Adaptive {subject} Assessment</span>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>Difficulty: {difficulty}/5</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(timeSpent)}</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-1">
              <TrendingUp className="h-4 w-4" />
              <span>Score: {score}/{currentQuestionIndex}</span>
            </Badge>
          </div>
        </div>
        <Progress value={progress} className="mt-4" />
        <p className="text-sm text-gray-600 mt-2">
          Question {currentQuestionIndex + 1} of {questions.length}
        </p>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
            <Badge variant="secondary" className="mb-4">
              {currentQuestion.learning_objective}
            </Badge>
          </div>

          {currentQuestion.type === 'multiple_choice' && currentQuestion.options && (
            <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {(currentQuestion.type === 'short_answer' || currentQuestion.type === 'problem_solving') && (
            <Textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Enter your answer here..."
              className="min-h-[120px]"
            />
          )}

          <div className="flex justify-between items-center pt-4">
            <div className="text-sm text-gray-600">
              Estimated time: {currentQuestion.estimated_time} minutes
            </div>
            <Button 
              onClick={handleAnswerSubmit}
              disabled={!currentAnswer.trim()}
              className="px-8"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Assessment'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}