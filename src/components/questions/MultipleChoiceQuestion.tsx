import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface MultipleChoiceQuestionProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export default function MultipleChoiceQuestion({
  question,
  options,
  correctAnswer,
  explanation,
  onAnswer
}: MultipleChoiceQuestionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selected) return;
    const correct = selected === correctAnswer;
    setSubmitted(true);
    setTimeout(() => onAnswer(correct), 2000);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{question}</h3>
        <div className="space-y-2">
          {options.map((option, idx) => {
            const isSelected = selected === option;
            const isCorrect = option === correctAnswer;
            const showResult = submitted;
            
            return (
              <button
                key={idx}
                onClick={() => !submitted && setSelected(option)}
                disabled={submitted}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all ${
                  showResult && isCorrect
                    ? 'border-green-500 bg-green-50'
                    : showResult && isSelected && !isCorrect
                    ? 'border-red-500 bg-red-50'
                    : isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-red-600" />}
                </div>
              </button>
            );
          })}
        </div>
        {submitted && (
          <div className={`p-4 rounded-lg ${selected === correctAnswer ? 'bg-green-50' : 'bg-blue-50'}`}>
            <p className="font-medium mb-2">
              {selected === correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p className="text-sm">{explanation}</p>
          </div>
        )}
        {!submitted && (
          <Button onClick={handleSubmit} disabled={!selected} className="w-full">
            Submit Answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
