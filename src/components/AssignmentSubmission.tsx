import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  points: number;
}

interface AssignmentSubmissionProps {
  assignment: {
    id: string;
    title: string;
    description: string;
    type: string;
    due_date: string;
  };
  questions?: Question[];
  studentId: string;
  onSubmissionComplete?: () => void;
}

export function AssignmentSubmission({
  assignment, 
  questions = [], 
  studentId, 
  onSubmissionComplete 
}: AssignmentSubmissionProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleFileUpload = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${studentId}/${assignment.id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('assignment-files')
      .upload(fileName, file);

    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('assignment-files')
      .getPublicUrl(fileName);

    return { url: publicUrl, fileName: file.name, size: file.size };
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let fileData = null;
      
      if (file) {
        fileData = await handleFileUpload(file);
      }

      const { data, error } = await supabase.functions.invoke('process-assignment-submission', {
        body: {
          assignmentId: assignment.id,
          studentId,
          answers: questions.length > 0 ? answers : null,
          content: textResponse || null,
          fileUrl: fileData?.url,
          fileName: fileData?.fileName,
          fileSize: fileData?.size
        }
      });

      if (error) throw error;

      setIsSubmitted(true);
      onSubmissionComplete?.();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Assignment Submitted!</h3>
          <p className="text-gray-600">Your submission has been received and your teacher has been notified.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{assignment.title}</CardTitle>
        <p className="text-gray-600">{assignment.description}</p>
        <p className="text-sm text-red-600">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {questions.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-semibold">Questions:</h4>
            {questions.map((question, index) => (
              <div key={question.id} className="p-4 border rounded-lg">
                <p className="font-medium mb-2">{index + 1}. {question.question_text}</p>
                {question.question_type === 'multiple_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {assignment.type === 'essay' && (
          <div>
            <label className="block text-sm font-medium mb-2">Your Response:</label>
            <Textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              placeholder="Write your response here..."
              rows={6}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Upload File (Optional):</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <Input
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="mb-2"
            />
            {file && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
          <Upload className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}