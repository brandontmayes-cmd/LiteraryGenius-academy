import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import AdaptiveMathDiagnostic from './AdaptiveMathDiagnostic';

interface DiagnosticTestProps {
  studentId: string;
  studentGrade?: string; // e.g., "5" or "K"
}

export default function DiagnosticTest({ studentId, studentGrade = '5' }: DiagnosticTestProps) {
  const [started, setStarted] = useState(false);

  const handleComplete = (results: any) => {
    console.log('Diagnostic complete!', results);
    // TODO: Save to student profile, navigate to dashboard, etc.
  };

  if (!started) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-purple-600" />
            <span>Math Diagnostic Assessment</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg space-y-4">
            <h3 className="font-semibold text-lg">What to Expect:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>✓ 15 adaptive math questions</li>
              <li>✓ Questions adjust to your skill level</li>
              <li>✓ Takes about 10-15 minutes</li>
              <li>✓ Find your true math level</li>
              <li>✓ Get personalized learning path</li>
            </ul>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Tip:</strong> Do your best, but don't worry if questions get hard! 
              The test adapts to find your exact skill level.
            </p>
          </div>

          <Button 
            onClick={() => setStarted(true)}
            size="lg"
            className="w-full"
          >
            Start Diagnostic Test
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <AdaptiveMathDiagnostic
      studentId={studentId}
      studentGrade={studentGrade}
      onComplete={handleComplete}
    />
  );
}