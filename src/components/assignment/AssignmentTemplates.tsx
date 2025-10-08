import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BookOpen, FileText, Calculator, Beaker } from 'lucide-react';
import { Question } from './QuestionTypes';

interface Template {
  id: string;
  name: string;
  subject: string;
  description: string;
  questions: Question[];
  icon: React.ReactNode;
}

interface AssignmentTemplatesProps {
  onSelectTemplate: (template: Template) => void;
  onClose: () => void;
}

export const AssignmentTemplates: React.FC<AssignmentTemplatesProps> = ({ onSelectTemplate, onClose }) => {
  const templates: Template[] = [
    {
      id: '1',
      name: 'Reading Comprehension Quiz',
      subject: 'English',
      description: 'Standard reading comprehension with multiple choice and essay questions',
      icon: <BookOpen className="h-5 w-5" />,
      questions: [
        {
          id: '1',
          type: 'multiple_choice',
          question: 'What is the main theme of the passage?',
          points: 5,
          options: ['Love', 'Friendship', 'Adventure', 'Mystery'],
          correct_answer: 0
        },
        {
          id: '2',
          type: 'essay',
          question: 'Analyze the character development in the story. Provide specific examples.',
          points: 15,
          rubric: 'Excellent (13-15): Clear analysis with multiple examples\nGood (10-12): Good analysis with some examples\nFair (7-9): Basic analysis with few examples\nPoor (0-6): Minimal analysis'
        }
      ]
    },
    {
      id: '2',
      name: 'Math Problem Set',
      subject: 'Mathematics',
      description: 'Mixed math problems with multiple choice and short answers',
      icon: <Calculator className="h-5 w-5" />,
      questions: [
        {
          id: '1',
          type: 'multiple_choice',
          question: 'Solve: 2x + 5 = 15',
          points: 5,
          options: ['x = 5', 'x = 10', 'x = 7.5', 'x = 20'],
          correct_answer: 0
        },
        {
          id: '2',
          type: 'short_answer',
          question: 'Calculate the area of a triangle with base 8cm and height 6cm.',
          points: 5
        }
      ]
    },
    {
      id: '3',
      name: 'Science Lab Report',
      subject: 'Science',
      description: 'Lab report template with file upload and essay components',
      icon: <Beaker className="h-5 w-5" />,
      questions: [
        {
          id: '1',
          type: 'file_upload',
          question: 'Upload your completed lab data sheet',
          points: 10
        },
        {
          id: '2',
          type: 'essay',
          question: 'Discuss your findings and conclusions from the experiment.',
          points: 20,
          rubric: 'Evaluate based on scientific accuracy, clarity of explanation, and use of evidence'
        }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Assignment Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {template.icon}
                    <div className="flex-1">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {template.subject}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    {template.questions.length} questions • {template.questions.reduce((sum, q) => sum + q.points, 0)} points
                  </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => onSelectTemplate(template)}
                  >
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};