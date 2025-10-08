import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Trash2, Plus } from 'lucide-react';

export interface Question {
  id: string;
  type: 'multiple_choice' | 'essay' | 'file_upload' | 'short_answer';
  question: string;
  points: number;
  options?: string[];
  correct_answer?: string | number;
  rubric?: string;
}

interface QuestionTypesProps {
  questions: Question[];
  onUpdateQuestions: (questions: Question[]) => void;
}

export const QuestionTypes: React.FC<QuestionTypesProps> = ({ questions, onUpdateQuestions }) => {
  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      question: '',
      points: 10,
      ...(type === 'multiple_choice' && { options: ['', '', '', ''], correct_answer: 0 })
    };
    onUpdateQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onUpdateQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const deleteQuestion = (id: string) => {
    onUpdateQuestions(questions.filter(q => q.id !== id));
  };

  const renderQuestion = (question: Question, index: number) => (
    <Card key={question.id} className="p-4">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-medium">Question {index + 1} - {question.type.replace('_', ' ').toUpperCase()}</h4>
        <div className="flex gap-2">
          <Input
            type="number"
            value={question.points}
            onChange={(e) => updateQuestion(question.id, { points: Number(e.target.value) })}
            className="w-20"
            min="1"
          />
          <Button size="sm" variant="destructive" onClick={() => deleteQuestion(question.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Textarea
        placeholder="Enter your question..."
        value={question.question}
        onChange={(e) => updateQuestion(question.id, { question: e.target.value })}
        className="mb-3"
        rows={2}
      />

      {question.type === 'multiple_choice' && (
        <div className="space-y-2">
          {question.options?.map((option, i) => (
            <div key={i} className="flex gap-2">
              <Input
                placeholder={`Option ${i + 1}`}
                value={option}
                onChange={(e) => {
                  const newOptions = [...(question.options || [])];
                  newOptions[i] = e.target.value;
                  updateQuestion(question.id, { options: newOptions });
                }}
              />
              <Button
                size="sm"
                variant={question.correct_answer === i ? "default" : "outline"}
                onClick={() => updateQuestion(question.id, { correct_answer: i })}
              >
                Correct
              </Button>
            </div>
          ))}
        </div>
      )}

      {(question.type === 'essay' || question.type === 'file_upload') && (
        <Textarea
          placeholder="Grading rubric (optional)"
          value={question.rubric || ''}
          onChange={(e) => updateQuestion(question.id, { rubric: e.target.value })}
          rows={3}
        />
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <Button size="sm" onClick={() => addQuestion('multiple_choice')}>
          <Plus className="h-4 w-4 mr-1" /> Multiple Choice
        </Button>
        <Button size="sm" onClick={() => addQuestion('essay')}>
          <Plus className="h-4 w-4 mr-1" /> Essay
        </Button>
        <Button size="sm" onClick={() => addQuestion('short_answer')}>
          <Plus className="h-4 w-4 mr-1" /> Short Answer
        </Button>
        <Button size="sm" onClick={() => addQuestion('file_upload')}>
          <Plus className="h-4 w-4 mr-1" /> File Upload
        </Button>
      </div>
      
      {questions.map((question, index) => renderQuestion(question, index))}
    </div>
  );
};