import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GripVertical, CheckCircle, XCircle } from 'lucide-react';

interface SortQuestionProps {
  question: string;
  items: string[];
  correctOrder: number[];
  explanation: string;
  onAnswer: (correct: boolean) => void;
}

export default function SortQuestion({
  question,
  items,
  correctOrder,
  explanation,
  onAnswer
}: SortQuestionProps) {
  const [sortedItems, setSortedItems] = useState([...items]);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...sortedItems];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newItems.length) return;
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    setSortedItems(newItems);
  };

  const handleSubmit = () => {
    const userOrder = sortedItems.map(item => items.indexOf(item));
    const correct = JSON.stringify(userOrder) === JSON.stringify(correctOrder);
    setIsCorrect(correct);
    setSubmitted(true);
    setTimeout(() => onAnswer(correct), 2000);
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        <h3 className="text-lg font-semibold">{question}</h3>
        <div className="space-y-2">
          {sortedItems.map((item, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-3 p-4 border-2 rounded-lg ${
                submitted
                  ? sortedItems.indexOf(items[correctOrder[idx]]) === idx
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                  : 'border-gray-200'
              }`}
            >
              {!submitted && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === sortedItems.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              )}
              <GripVertical className="h-5 w-5 text-gray-400" />
              <span className="flex-1">{item}</span>
              {submitted && sortedItems.indexOf(items[correctOrder[idx]]) === idx && (
                <CheckCircle className="h-5 w-5 text-green-600" />
              )}
            </div>
          ))}
        </div>
        {submitted && (
          <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-blue-50'}`}>
            <p className="font-medium mb-2">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
            <p className="text-sm">{explanation}</p>
          </div>
        )}
        {!submitted && (
          <Button onClick={handleSubmit} className="w-full">Submit Answer</Button>
        )}
      </CardContent>
    </Card>
  );
}
