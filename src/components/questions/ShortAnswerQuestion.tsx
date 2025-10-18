import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle } from 'lucide-react';

interface ShortAnswerQuestionProps {
  question: string;
  correctAnswer: string;
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export default function ShortAnswerQuestion({
  question,
  correctAnswer,
  explanation,
  onAnswer
}: ShortAnswerQuestionProps) {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    const userAnswer = answer.toLowerCase().trim();
    const correct = correctAnswer.toLowerCase().trim();
    const isMatch = userAnswer.includes(correct) || correct.includes(userAnswer);
    setIsCorrect(isMatch);
    setSubmitted(true);
    setTimeout(() => onAnswer(isMatch), 2500);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{question}</h3>
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          disabled={submitted}
          className="min-h-[100px]"
        />
        {submitted && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-blue-50'}`}>
            <div className="flex items-center gap-2 mb-2">
              {isCorrect ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-orange-600" />
              )}
              <p className="font-medium">
                {isCorrect ? 'Excellent!' : 'Good try!'}
              </p>
            </div>
            <p className="text-sm mb-2"><strong>Expected:</strong> {correctAnswer}</p>
            <p className="text-sm">{explanation}</p>
          </div>
        )}
        {!submitted && (
          <Button onClick={handleSubmit} disabled={!answer.trim()} className="w-full">
            Submit Answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
