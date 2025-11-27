'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase, supabaseFunctions } from '@/lib/supabase';
import { CheckCircle2, XCircle, Target, Brain, TrendingUp } from 'lucide-react';
import QuestionVisual from './QuestionVisual';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer';
  choices?: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: number;
  domain: string;
  visual?: any;
}

interface DiagnosticResults {
  overallScore: number;
  domainScores: Record<string, { correct: number; total: number; percentage: number }>;
  suggestedGradeLevel: number;
  strengths: string[];
  weaknesses: string[];
}

interface AdaptiveMathDiagnosticProps {
  studentId: string;
  onComplete: (results: DiagnosticResults) => void;
}

export default function AdaptiveMathDiagnostic({ studentId, onComplete }: AdaptiveMathDiagnosticProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [results, setResults] = useState<Array<{ correct: boolean; difficulty: number; domain: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [currentDifficulty, setCurrentDifficulty] = useState(4); // Start at grade 4
  const [sessionId, setSessionId] = useState<string | null>(null);

  const TOTAL_QUESTIONS = 10;
  const domains = ['Numbers & Operations', 'Algebra', 'Geometry', 'Measurement & Data'];

  useEffect(() => {
    initializeDiagnostic();
  }, []);

  const initializeDiagnostic = async () => {
    try {
      // Create diagnostic session
      const { data: session, error } = await supabase
        .from('diagnostic_results')
        .insert({
          student_id: studentId,
          subject: 'math',
          completed: false
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(session.id);

      // Generate first question
      await generateQuestion(currentDifficulty);
    } catch (error) {
      console.error('Error initializing diagnostic:', error);
      setLoading(false);
    }
  };

  const generateQuestion = async (difficulty: number) => {
    setLoading(true);
    try {
      console.log('Generating diagnostic question:', { difficulty, subject: 'math' });

      const { data, error } = await supabaseFunctions.functions.invoke('generate-diagnostic-question', {
        body: {
          difficulty,
          subject: 'math',
          standardCode: `${difficulty}.Math.Diagnostic`,
          standardDescription: `Grade ${difficulty} mathematics diagnostic assessment`,
          previousQuestions: questions.map(q => q.id)
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Generated question:', data);

      const question: Question = {
        ...data,
        difficulty,
        domain: domains[Math.floor(Math.random() * domains.length)]
      };

      setQuestions(prev => [...prev, question]);
    } catch (error) {
      console.error('Error generating question:', error);
      // If generation fails, use a fallback question
      const fallbackQuestion: Question = {
        id: crypto.randomUUID(),
        text: 'What is 5 + 7?',
        type: 'multiple_choice',
        choices: ['10', '11', '12', '13'],
        correctAnswer: '12',
        explanation: '5 + 7 = 12',
        difficulty,
        domain: 'Numbers & Operations'
      };
      setQuestions(prev => [...prev, fallbackQuestion]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setIsAnswered(true);
    
    // Record result
    const newResult = {
      correct: isCorrect,
      difficulty: currentQuestion.difficulty,
      domain: currentQuestion.domain
    };
    setResults(prev => [...prev, newResult]);

    // Update difficulty adaptively
    let newDifficulty = currentDifficulty;
    if (isCorrect && currentDifficulty < 12) {
      newDifficulty = currentDifficulty + 1;
    } else if (!isCorrect && currentDifficulty > 1) {
      newDifficulty = currentDifficulty - 1;
    }
    setCurrentDifficulty(newDifficulty);
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < TOTAL_QUESTIONS) {
      // Generate next question at adapted difficulty
      await generateQuestion(currentDifficulty);
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setIsAnswered(false);
    } else {
      // Diagnostic complete
      await completeDiagnostic();
    }
  };

  const completeDiagnostic = async () => {
    try {
      // Calculate results
      const correctCount = results.filter(r => r.correct).length;
      const overallScore = Math.round((correctCount / results.length) * 100);

      // Calculate domain scores
      const domainScores: Record<string, { correct: number; total: number; percentage: number }> = {};
      domains.forEach(domain => {
        const domainResults = results.filter(r => r.domain === domain);
        const correct = domainResults.filter(r => r.correct).length;
        const total = domainResults.length;
        domainScores[domain] = {
          correct,
          total,
          percentage: total > 0 ? Math.round((correct / total) * 100) : 0
        };
      });

      // Determine suggested grade level
      const avgDifficulty = results.reduce((sum, r) => sum + r.difficulty, 0) / results.length;
      const suggestedGradeLevel = Math.round(avgDifficulty);

      // Identify strengths and weaknesses
      const strengths = Object.entries(domainScores)
        .filter(([_, score]) => score.percentage >= 70)
        .map(([domain, _]) => domain);

      const weaknesses = Object.entries(domainScores)
        .filter(([_, score]) => score.percentage < 50)
        .map(([domain, _]) => domain);

      const diagnosticResults: DiagnosticResults = {
        overallScore,
        domainScores,
        suggestedGradeLevel,
        strengths,
        weaknesses
      };

      // Save to database
      if (sessionId) {
        await supabase
          .from('diagnostic_results')
          .update({
            score: overallScore,
            grade_level: suggestedGradeLevel,
            results: diagnosticResults,
            completed: true,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }

      setShowResults(true);
      onComplete(diagnosticResults);
    } catch (error) {
      console.error('Error completing diagnostic:', error);
    }
  };

  if (showResults) {
    const correctCount = results.filter(r => r.correct).length;
    const overallScore = Math.round((correctCount / results.length) * 100);

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Diagnostic Complete!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-purple-600">
              {overallScore}%
            </div>
            <p className="text-lg text-gray-600">
              {correctCount} out of {results.length} correct
            </p>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Suggested Grade Level: {currentDifficulty}
            </Badge>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance by Domain</span>
            </h3>
            {domains.map(domain => {
              const domainResults = results.filter(r => r.domain === domain);
              const correct = domainResults.filter(r => r.correct).length;
              const total = domainResults.length;
              const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

              return (
                <div key={domain} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">{domain}</span>
                    <span className="text-sm text-gray-600">
                      {correct}/{total} ({percentage}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">Recommended Next Steps</h4>
            <p className="text-purple-800">
              Based on your performance, we recommend starting with Grade {currentDifficulty} content.
              Focus on practicing skills to build a strong foundation.
            </p>
          </div>

          <Button onClick={() => onComplete({
            overallScore,
            domainScores: {},
            suggestedGradeLevel: currentDifficulty,
            strengths: [],
            weaknesses: []
          })} className="w-full">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="text-gray-600">Generating diagnostic questions...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-semibold">Math Diagnostic Assessment</span>
            </div>
            <Badge variant="secondary">
              Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS}
            </Badge>
          </div>
          <Progress 
            value={((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100} 
            className="h-2 mt-4" 
          />
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="outline">{currentQuestion.domain}</Badge>
            <Badge variant="outline">Grade {currentQuestion.difficulty}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{currentQuestion.text}</div>

          {/* Visual Component */}
          {currentQuestion.visual && (
            <QuestionVisual visual={currentQuestion.visual} />
          )}

          {/* Multiple Choice */}
          {currentQuestion.type === 'multiple_choice' && currentQuestion.choices && (
            <div className="space-y-3">
              {currentQuestion.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => !isAnswered && setSelectedAnswer(choice)}
                  disabled={isAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === choice
                      ? isAnswered
                        ? selectedAnswer === currentQuestion.correctAnswer
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    isAnswered && choice === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : ''
                  }`}
                >
                  {choice}
                </button>
              ))}
            </div>
          )}

          {/* Feedback */}
          {isAnswered && (
            <div
              className={`p-4 rounded-lg ${
                selectedAnswer === currentQuestion.correctAnswer
                  ? 'bg-green-50 border-2 border-green-200'
                  : 'bg-red-50 border-2 border-red-200'
              }`}
            >
              <div className="flex items-center space-x-2">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">
                      Not quite. The correct answer is: {currentQuestion.correctAnswer}
                    </span>
                  </>
                )}
              </div>
              {currentQuestion.explanation && (
                <p className="text-sm text-gray-700 mt-2">{currentQuestion.explanation}</p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {!isAnswered ? (
              <Button 
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNextQuestion} size="lg">
                {currentQuestionIndex + 1 < TOTAL_QUESTIONS ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
