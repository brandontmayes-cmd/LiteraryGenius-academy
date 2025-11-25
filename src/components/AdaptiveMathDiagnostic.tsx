'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Brain, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase , supabaseFunctions } from '@/lib/supabase';

interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'short_answer';
  choices?: string[];
  correctAnswer: string;
  standardCode: string;
  difficultyLevel: number;
  domain: string;
}

interface DiagnosticResultsData {
  skillLevel: number;
  gradeLevel: string;
  scorePercentage: number;
  questionsCorrect: number;
  questionsTotal: number;
  strengths: string[];
  weaknesses: string[];
  domainPerformance: Record<string, { correct: number; total: number }>;
}

interface AdaptiveMathDiagnosticProps {
  studentId: string;
  studentGrade: string; // K, 1, 2, ... 12
  onComplete: (results: DiagnosticResultsData) => void;
}

export default function AdaptiveMathDiagnostic({ 
  studentId, 
  studentGrade,
  onComplete 
}: AdaptiveMathDiagnosticProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isCorrect, setIsCorrect] = useState<Record<number, boolean>>({});
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(parseFloat(studentGrade === 'K' ? '0' : studentGrade));
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<DiagnosticResultsData | null>(null);
  const [diagnosticId, setDiagnosticId] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [hasAnswered, setHasAnswered] = useState(false);

  const TOTAL_QUESTIONS = 15;

  useEffect(() => {
    initializeDiagnostic();
  }, []);

  const initializeDiagnostic = async () => {
    try {
      // Create diagnostic result record
      const { data: diagnostic, error } = await supabase
        .from('diagnostic_results')
        .insert({
          student_id: studentId,
          subject: 'math',
          grade_level: studentGrade,
          questions_total: TOTAL_QUESTIONS
        })
        .select()
        .single();

      if (error) throw error;
      
      setDiagnosticId(diagnostic.id);
      
      // Generate first question at student's grade level
      await generateQuestion(currentDifficulty);
    } catch (error) {
      console.error('Error initializing diagnostic:', error);
    }
  };

const generateQuestion = async (difficulty: number) => {
  setLoading(true);
  try {
    const { data, error } = await supabaseFunctions.functions.invoke('generate-diagnostic-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          difficulty,
          subject: 'math',
          previousQuestions: questions.map(q => q.standardCode)
        })
      });

      if (!response.ok) throw new Error('Failed to generate question');

      const question = await response.json();
      setQuestions(prev => [...prev, question]);
    } catch (error) {
      console.error('Error generating question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || hasAnswered) return;

    const currentQ = questions[currentQuestion];
    const correct = selectedAnswer.trim().toLowerCase() === currentQ.correctAnswer.trim().toLowerCase();
    
    setIsCorrect(prev => ({ ...prev, [currentQuestion]: correct }));
    setAnswers(prev => ({ ...prev, [currentQuestion]: selectedAnswer }));
    setHasAnswered(true);

    // Save question result
    if (diagnosticId) {
      await supabase.from('diagnostic_questions').insert({
        diagnostic_result_id: diagnosticId,
        question_number: currentQuestion + 1,
        standard_code: currentQ.standardCode,
        difficulty_level: currentQ.difficultyLevel,
        question_text: currentQ.text,
        question_type: currentQ.type,
        correct_answer: currentQ.correctAnswer,
        student_answer: selectedAnswer,
        answer_choices: currentQ.choices ? { choices: currentQ.choices } : null,
        is_correct: correct
      });
    }

    // Adjust difficulty for next question
    let nextDifficulty = currentDifficulty;
    if (correct) {
      // Increase difficulty by 0.5 grade levels
      nextDifficulty = Math.min(12, currentDifficulty + 0.5);
    } else {
      // Decrease difficulty by 0.5 grade levels
      nextDifficulty = Math.max(0, currentDifficulty - 0.5);
    }
    setCurrentDifficulty(nextDifficulty);
  };

  const handleNext = async () => {
    if (currentQuestion + 1 < TOTAL_QUESTIONS) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setHasAnswered(false);
      
      // Generate next question at adjusted difficulty
      await generateQuestion(currentDifficulty);
    } else {
      // Test complete, calculate results
      await calculateResults();
    }
  };

  const calculateResults = async () => {
    const correctCount = Object.values(isCorrect).filter(Boolean).length;
    const scorePercentage = (correctCount / TOTAL_QUESTIONS) * 100;

    // Calculate skill level based on adaptive difficulty
    const difficultyLevels = questions.map(q => q.difficultyLevel);
    const correctAnswerDifficulties = questions
      .filter((_, i) => isCorrect[i])
      .map(q => q.difficultyLevel);
    
    const skillLevel = correctAnswerDifficulties.length > 0
      ? correctAnswerDifficulties.reduce((sum, d) => sum + d, 0) / correctAnswerDifficulties.length
      : currentDifficulty;

    // Group by domain to find strengths/weaknesses
    const domainPerformance: Record<string, { correct: number; total: number }> = {};
    questions.forEach((q, i) => {
      if (!domainPerformance[q.domain]) {
        domainPerformance[q.domain] = { correct: 0, total: 0 };
      }
      domainPerformance[q.domain].total++;
      if (isCorrect[i]) {
        domainPerformance[q.domain].correct++;
      }
    });

    // Identify strengths (80%+ correct) and weaknesses (<60% correct)
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    Object.entries(domainPerformance).forEach(([domain, perf]) => {
      const percentage = (perf.correct / perf.total) * 100;
      if (percentage >= 80) strengths.push(domain);
      if (percentage < 60) weaknesses.push(domain);
    });

    const resultsData: DiagnosticResultsData = {
      skillLevel: Math.round(skillLevel * 10) / 10,
      gradeLevel: `Grade ${Math.floor(skillLevel)}`,
      scorePercentage: Math.round(scorePercentage),
      questionsCorrect: correctCount,
      questionsTotal: TOTAL_QUESTIONS,
      strengths,
      weaknesses,
      domainPerformance
    };

    // Update diagnostic result in database
    if (diagnosticId) {
      await supabase
        .from('diagnostic_results')
        .update({
          skill_level: resultsData.skillLevel,
          score_percentage: resultsData.scorePercentage,
          questions_correct: correctCount,
          strengths: { domains: strengths },
          weaknesses: { domains: weaknesses },
          completed_at: new Date().toISOString()
        })
        .eq('id', diagnosticId);
    }

    setResults(resultsData);
    setShowResults(true);
    onComplete(resultsData);
  };

  if (showResults && results) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Math Diagnostic Results</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overall Score */}
          <div className="text-center space-y-4">
            <div>
              <div className="text-5xl font-bold text-blue-600">
                {results.skillLevel}
              </div>
              <p className="text-lg text-gray-600 mt-2">Skill Level</p>
              <p className="text-sm text-gray-500">
                You're performing at a {results.gradeLevel} level in Math
              </p>
            </div>

            <div className="flex justify-center items-center space-x-8">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {results.questionsCorrect}/{results.questionsTotal}
                </div>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">
                  {results.scorePercentage}%
                </div>
                <p className="text-sm text-gray-600">Score</p>
              </div>
            </div>
          </div>

          <Progress value={results.scorePercentage} className="h-3" />

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {results.strengths.map((strength, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">Keep practicing to build strengths!</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Areas to Improve</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {results.weaknesses.map((weakness, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-600">Great job! No major weaknesses.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Domain Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance by Topic</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(results.domainPerformance).map(([domain, perf]) => {
                const percentage = Math.round((perf.correct / perf.total) * 100);
                return (
                  <div key={domain} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{domain}</span>
                      <span className="text-gray-600">
                        {perf.correct}/{perf.total} ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="bg-blue-50 p-6 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-3">📚 What's Next?</h4>
            <p className="text-blue-800 mb-4">
              Based on your {results.gradeLevel} skill level, we've created a personalized 
              learning path to help you grow.
            </p>
            {results.weaknesses.length > 0 && (
              <p className="text-blue-800">
                Start by practicing: <strong>{results.weaknesses.join(', ')}</strong>
              </p>
            )}
          </div>

          <Button 
            className="w-full" 
            size="lg"
            onClick={() => window.location.href = '/student-dashboard'}
          >
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <Brain className="h-12 w-12 text-purple-600 mx-auto animate-pulse" />
            <p className="text-lg">Generating your question...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentQ = questions[currentQuestion];
  if (!currentQ) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span>Math Diagnostic</span>
            </CardTitle>
            <Badge variant="secondary">
              Question {currentQuestion + 1} of {TOTAL_QUESTIONS}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={((currentQuestion + 1) / TOTAL_QUESTIONS) * 100} className="h-2" />
          <p className="text-sm text-gray-600 mt-2">
            Current Level: Grade {currentDifficulty.toFixed(1)}
          </p>
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card>
        <CardHeader>
          <Badge variant="outline" className="w-fit">
            {currentQ.domain}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-lg font-medium">{currentQ.text}</div>

          {/* Multiple Choice */}
          {currentQ.type === 'multiple_choice' && currentQ.choices && (
            <div className="space-y-3">
              {currentQ.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => !hasAnswered && setSelectedAnswer(choice)}
                  disabled={hasAnswered}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    selectedAnswer === choice
                      ? hasAnswered
                        ? isCorrect[currentQuestion]
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                        : 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${hasAnswered && choice === currentQ.correctAnswer ? 'border-green-500 bg-green-50' : ''}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswer === choice ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    }`}>
                      {selectedAnswer === choice && (
                        <CheckCircle className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <span>{choice}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {currentQ.type === 'short_answer' && (
            <input
              type="text"
              value={selectedAnswer}
              onChange={(e) => !hasAnswered && setSelectedAnswer(e.target.value)}
              disabled={hasAnswered}
              placeholder="Type your answer..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          )}

          {/* Feedback */}
          {hasAnswered && (
            <div className={`p-4 rounded-lg ${
              isCorrect[currentQuestion] ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center space-x-2">
                {isCorrect[currentQuestion] ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900">Correct!</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    <span className="font-medium text-red-900">
                      Not quite. The correct answer is: {currentQ.correctAnswer}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            {!hasAnswered ? (
              <Button 
                onClick={handleAnswerSubmit}
                disabled={!selectedAnswer}
                size="lg"
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext} size="lg">
                {currentQuestion + 1 < TOTAL_QUESTIONS ? 'Next Question' : 'See Results'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
