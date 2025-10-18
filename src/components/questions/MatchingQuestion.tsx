import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

interface MatchingQuestionProps {
  question: string;
  pairs: { left: string; right: string }[];
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export default function MatchingQuestion({
  question,
  pairs,
  explanation,
  onAnswer
}: MatchingQuestionProps) {
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);

  const rightItems = [...pairs.map(p => p.right)].sort(() => Math.random() - 0.5);

  const handleRightClick = (rightIdx: number) => {
    if (submitted || selectedLeft === null) return;
    setMatches({ ...matches, [selectedLeft]: rightIdx });
    setSelectedLeft(null);
  };

  const handleSubmit = () => {
    let correct = 0;
    pairs.forEach((pair, idx) => {
      if (rightItems[matches[idx]] === pair.right) correct++;
    });
    const isCorrect = correct === pairs.length;
    setSubmitted(true);
    setTimeout(() => onAnswer(isCorrect), 2000);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{question}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            {pairs.map((pair, idx) => (
              <button
                key={idx}
                onClick={() => !submitted && setSelectedLeft(idx)}
                className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                  selectedLeft === idx ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                {pair.left}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {rightItems.map((item, idx) => {
              const isMatched = Object.values(matches).includes(idx);
              const matchedLeft = Object.keys(matches).find(k => matches[parseInt(k)] === idx);
              const isCorrect = matchedLeft && rightItems[idx] === pairs[parseInt(matchedLeft)].right;
              
              return (
                <button
                  key={idx}
                  onClick={() => handleRightClick(idx)}
                  disabled={submitted || isMatched}
                  className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                    submitted && isCorrect
                      ? 'border-green-500 bg-green-50'
                      : submitted && isMatched
                      ? 'border-red-500 bg-red-50'
                      : isMatched
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item}</span>
                    {submitted && isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        {submitted && (
          <div className="p-4 rounded-lg bg-blue-50">
            <p className="text-sm">{explanation}</p>
          </div>
        )}
        {!submitted && (
          <Button onClick={handleSubmit} disabled={Object.keys(matches).length !== pairs.length} className="w-full">
            Submit Answer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
