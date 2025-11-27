'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase, supabaseFunctions } from '@/lib/supabase';
import { CheckCircle2, XCircle, Target, ArrowLeft, Trophy } from 'lucide-react';
import QuestionVisual from './QuestionVisual';

interface Standard {
  id: number;
  code: string;
  grade: string;
  subject: string;
  domain: string;
  description: string;
}

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer';
  choices?: string[];
  correctAnswer: string;
  explanation?: string;
  visual?: {
    type: 'bar' | 'line' | 'pie' | 'table' | 'image';
    data?: Array<{ name: string; value: number }>;
    headers?: string[];
    rows?: string[][];
    url?: string;
    alt?: string;
    title?: string;
    xLabel?: string;
    yLabel?: string;
    caption?: string;
  };
}

interface StandardPracticeSessionProps {
  standard: Standard;
  studentId: string;
  onComplete: () => void;
  onBack: () => void;
}

export default function StandardPracticeSession({
  standard,
  studentId,
  onComplete,
  onBack
}: StandardPracticeSessionProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const QUESTIONS_PER_SESSION = 5;

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      // Create practice session record
      const { data: session, error } = await supabase
        .from('practice_sessions')
        .insert({
          student_id: studentId,
          standard_id: standard.id,
          mastery_level: 'learning'
        })
        .select()
        .single();

      if (error) throw error;
      setSessionId(session.id);

      // Generate first question
      await generateQuestion();
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const generateQuestion = async () => {
    console.log('=== STANDARD OBJECT ===');
    console.log('Full standard:', standard);
    console.log('standard.code:', standard.code);
    console.log('standard.description:', standard.description);
    console.log('standard.subject:', standard.subject);
   
    setLoading(true);
    try {
      // Get the difficulty based on standard's grade
      const difficulty = parseFloat(standard.grade === 'K' ? '0' : standard.grade);

      console.log('=== SENDING TO EDGE FUNCTION ===');
      const requestBody = {
        difficulty,
        subject: standard.subject,
        standardCode: standard.code,
        standardDescription: standard.description,
        previousQuestions: questions.map(q => q.text) // ✅ Send actual question texts to avoid repeats!
      };
      console.log('Request body:', requestBody);

      const { data, error } = await supabaseFunctions.functions.invoke('generate-diagnostic-question', {
        body: requestBody
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      console.log('Generated question:', data);
      setQuestions(prev => [...prev, data]);
    } catch (error) {
      console.error('Error generating question:', error);
      // If generation fails, still allow practice to continue
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer || isAnswered) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.trim().toLowerCase();

    setIsAnswered(true);
    setScore(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1
    }));
  };

  const handleNextQuestion = async () => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < QUESTIONS_PER_SESSION) {
      // Move to next question or generate new one
      if (nextIndex >= questions.length) {
        await generateQuestion();
      }
      setCurrentQuestionIndex(nextIndex);
      setSelectedAnswer('');
      setIsAnswered(false);
    } else {
      // Session complete
      await completeSession();
    }
  };

  const completeSession = async () => {
    const percentage = (score.correct / score.total) * 100;
    let masteryLevel = 'learning';
    
    if (percentage >= 80) masteryLevel = 'mastered';
    else if (percentage >= 60) masteryLevel = 'practicing';

    try {
      // Update session
      if (sessionId) {
        await supabase
          .from('practice_sessions')
          .update({
            mastery_level: masteryLevel,
            score: score.correct,
            completed_at: new Date().toISOString()
          })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }

    setShowResults(true);
  };

  if (showResults) {
    const percentage = Math.round((score.correct / score.total) * 100);
    const isMastered = percentage >= 80;

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className={`h-6 w-6 ${isMastered ? 'text-yellow-500' : 'text-gray-400'}`} />
            <span>Practice Complete!</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-blue-600">
              {percentage}%
            </div>
            <p className="text-lg text-gray-600">
              {score.correct} out of {score.total} correct
            </p>
          </div>

          <Progress value={percentage} className="h-4" />

          <div className={`p-6 rounded-lg ${isMastered ? 'bg-green-50 border-2 border-green-200' : 'bg-blue-50 border-2 border-blue-200'}`}>
            {isMastered ? (
              <div className="text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-green-900 mb-2">
                  🎉 Mastered!
                </h3>
                <p className="text-green-800">
                  Great job! You've mastered this skill.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Target className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-blue-900 mb-2">
                  Keep Practicing!
                </h3>
                <p className="text-blue-800">
                  You're making progress. Try practicing this skill again to improve.
                </p>
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Skill Practiced:</h4>
            <Badge className="mb-2">{standard.code}</Badge>
            <p className="text-sm text-gray-700">{standard.description}</p>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={onBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Skills
            </Button>
            {!isMastered && (
              <Button 
                onClick={() => {
                  setShowResults(false);
                  setCurrentQuestionIndex(0);
                  setQuestions([]);
                  setScore({ correct: 0, total: 0 });
                  initializeSession();
                }}
                className="flex-1"
              >
                <Target className="h-4 w-4 mr-2" />
                Practice Again
              </Button>
            )}
            {isMastered && (
              <Button 
                onClick={onComplete}
                className="flex-1"
              >
                Continue Learning
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && questions.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Generating practice questions...</p>
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
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Badge variant="secondary">
          Question {currentQuestionIndex + 1} of {QUESTIONS_PER_SESSION}
        </Badge>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{score.correct} correct • {score.total - score.correct} incorrect</span>
            </div>
            <Progress 
              value={((currentQuestionIndex + 1) / QUESTIONS_PER_SESSION) * 100} 
              className="h-2" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Skill Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Target className="h-5 w-5 text-blue-600 mt-1" />
            <div>
              <Badge className="mb-2">{standard.code}</Badge>
              <p className="text-sm text-gray-700">{standard.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">{standard.domain}</Badge>
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
                        : 'border-blue-500 bg-blue-50'
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

          {/* Short Answer */}
          {currentQuestion.type === 'short_answer' && (
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => !isAnswered && setSelectedAnswer(e.target.value)}
              disabled={isAnswered}
              placeholder="Type your answer..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
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
                {currentQuestionIndex + 1 < QUESTIONS_PER_SESSION ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
