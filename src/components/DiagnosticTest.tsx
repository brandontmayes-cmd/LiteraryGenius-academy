import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Brain, BarChart3 } from 'lucide-react';
import AdaptiveQuiz from './AdaptiveQuiz';
import { supabase } from '@/lib/supabase';

interface DiagnosticResults {
  overallScore: number;
  subjectScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  recommendedPath: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface DiagnosticTestProps {
  studentId: string;
  onComplete: (results: DiagnosticResults) => void;
}

export default function DiagnosticTest({ studentId, onComplete }: DiagnosticTestProps) {
  const [currentSubject, setCurrentSubject] = useState(0);
  const [results, setResults] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<DiagnosticResults | null>(null);

  const subjects = ['Mathematics', 'English', 'Science', 'History'];

  const handleSubjectComplete = async (subjectResults: any) => {
    const newResults = { ...results, [subjects[currentSubject]]: subjectResults };
    setResults(newResults);

    if (currentSubject < subjects.length - 1) {
      setCurrentSubject(currentSubject + 1);
    } else {
      // All subjects complete, generate diagnostic results
      await generateDiagnosticResults(newResults);
    }
  };

  const generateDiagnosticResults = async (allResults: Record<string, any>) => {
    try {
      const { data, error } = await supabase.functions.invoke('adaptive-assessment-engine', {
        body: {
          action: 'generate_performance_analytics',
          studentId,
          currentPerformance: allResults
        }
      });

      if (error) throw error;

      // Calculate diagnostic results
      const subjectScores = Object.entries(allResults).reduce((acc, [subject, result]) => {
        acc[subject] = Math.round((result.score / result.totalQuestions) * 100);
        return acc;
      }, {} as Record<string, number>);

      const overallScore = Math.round(
        Object.values(subjectScores).reduce((sum, score) => sum + score, 0) / 
        Object.values(subjectScores).length
      );

      const strengths = Object.entries(subjectScores)
        .filter(([_, score]) => score >= 80)
        .map(([subject, _]) => subject);

      const weaknesses = Object.entries(subjectScores)
        .filter(([_, score]) => score < 60)
        .map(([subject, _]) => subject);

      let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
      if (overallScore >= 80) skillLevel = 'advanced';
      else if (overallScore >= 60) skillLevel = 'intermediate';

      const diagnosticData: DiagnosticResults = {
        overallScore,
        subjectScores,
        strengths,
        weaknesses,
        recommendedPath: `${skillLevel}_path`,
        skillLevel
      };

      setDiagnosticResults(diagnosticData);
      setShowResults(true);
      onComplete(diagnosticData);

    } catch (error) {
      console.error('Error generating diagnostic results:', error);
    }
  };

  if (showResults && diagnosticResults) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-green-600" />
            <span>Diagnostic Assessment Results</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {diagnosticResults.overallScore}%
            </div>
            <p className="text-gray-600">Overall Performance</p>
            <Badge 
              variant={diagnosticResults.skillLevel === 'advanced' ? 'default' : 
                      diagnosticResults.skillLevel === 'intermediate' ? 'secondary' : 'outline'}
              className="mt-2"
            >
              {diagnosticResults.skillLevel.charAt(0).toUpperCase() + diagnosticResults.skillLevel.slice(1)} Level
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Strengths</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {diagnosticResults.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {diagnosticResults.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{strength} ({diagnosticResults.subjectScores[strength]}%)</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Continue practicing to develop strengths</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <span>Areas for Improvement</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {diagnosticResults.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {diagnosticResults.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>{weakness} ({diagnosticResults.subjectScores[weakness]}%)</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-600">Great job! No major weaknesses identified</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Subject Performance</h3>
            {Object.entries(diagnosticResults.subjectScores).map(([subject, score]) => (
              <div key={subject} className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">{subject}</span>
                  <span className="text-sm text-gray-600">{score}%</span>
                </div>
                <Progress value={score} className="h-2" />
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Recommended Learning Path</h4>
            <p className="text-blue-800">
              Based on your performance, we recommend starting with our{' '}
              <strong>{diagnosticResults.skillLevel}</strong> level curriculum.
              {diagnosticResults.weaknesses.length > 0 && (
                <span> Focus on improving {diagnosticResults.weaknesses.join(', ')} for best results.</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Diagnostic Assessment</span>
          </CardTitle>
          <p className="text-gray-600">
            Complete assessments in all subjects to create your personalized learning path
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-4 mb-6">
            {subjects.map((subject, index) => (
              <Badge 
                key={subject}
                variant={index < currentSubject ? 'default' : 
                        index === currentSubject ? 'secondary' : 'outline'}
                className="px-3 py-1"
              >
                {index < currentSubject && <CheckCircle className="h-4 w-4 mr-1" />}
                {subject}
              </Badge>
            ))}
          </div>
          <Progress value={(currentSubject / subjects.length) * 100} className="mb-4" />
          <p className="text-center text-sm text-gray-600">
            Subject {currentSubject + 1} of {subjects.length}
          </p>
        </CardContent>
      </Card>

      <AdaptiveQuiz
        subject={subjects[currentSubject]}
        studentId={studentId}
        onComplete={handleSubjectComplete}
      />
    </div>
  );
}