import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  WifiOff, 
  Save,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
  points: number;
}

interface EnhancedAssignmentSubmissionProps {
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

export function EnhancedAssignmentSubmission({
  assignment, 
  questions = [], 
  studentId, 
  onSubmissionComplete 
}: EnhancedAssignmentSubmissionProps) {
  const { syncStatus, saveSubmissionOffline } = useOfflineSync();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [autoSaveProgress, setAutoSaveProgress] = useState(0);

  // Auto-save draft functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(answers).length > 0 || textResponse.trim()) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [answers, textResponse]);

  // Load existing draft on component mount
  useEffect(() => {
    loadDraft();
  }, []);

  const saveDraft = async () => {
    try {
      setAutoSaveProgress(0);
      const draftData = {
        assignment_id: assignment.id,
        student_id: studentId,
        answers: questions.length > 0 ? answers : null,
        content: textResponse || null,
        is_draft: true,
        last_saved: new Date().toISOString()
      };

      localStorage.setItem(`draft_${assignment.id}`, JSON.stringify(draftData));
      setIsDraft(true);
      
      // Simulate progress
      for (let i = 0; i <= 100; i += 20) {
        setAutoSaveProgress(i);
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setTimeout(() => setAutoSaveProgress(0), 2000);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  };

  const loadDraft = () => {
    try {
      const draftData = localStorage.getItem(`draft_${assignment.id}`);
      if (draftData) {
        const draft = JSON.parse(draftData);
        if (draft.answers) setAnswers(draft.answers);
        if (draft.content) setTextResponse(draft.content);
        setIsDraft(true);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const submissionData = {
        id: crypto.randomUUID(),
        assignment_id: assignment.id,
        student_id: studentId,
        answers: questions.length > 0 ? answers : {},
        content: textResponse || null,
        file_urls: file ? [file.name] : [],
        submitted_at: new Date().toISOString(),
        auto_graded: false,
        is_draft: false
      };

      // Save to offline storage
      await saveSubmissionOffline(submissionData);

      // Clear draft
      localStorage.removeItem(`draft_${assignment.id}`);
      setIsDraft(false);
      setIsSubmitted(true);
      onSubmissionComplete?.();

    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionStatus = () => {
    if (isSubmitted) return 'submitted';
    if (!syncStatus.isOnline) return 'offline';
    if (isDraft) return 'draft';
    return 'ready';
  };

  const getStatusBadge = () => {
    const status = getSubmissionStatus();
    
    switch (status) {
      case 'submitted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'offline':
        return <Badge variant="secondary"><WifiOff className="w-3 h-3 mr-1" />Offline Mode</Badge>;
      case 'draft':
        return <Badge variant="outline"><Save className="w-3 h-3 mr-1" />Draft Saved</Badge>;
      default:
        return <Badge variant="default">Ready to Submit</Badge>;
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Assignment Submitted!</h3>
          <p className="text-gray-600 mb-4">
            {syncStatus.isOnline 
              ? "Your submission has been received and your teacher has been notified."
              : "Your submission is saved offline and will sync when you're back online."
            }
          </p>
          {!syncStatus.isOnline && (
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Will sync when online</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const dueDate = new Date(assignment.due_date);
  const isOverdue = dueDate < new Date();
  const timeUntilDue = dueDate.getTime() - new Date().getTime();
  const hoursUntilDue = Math.floor(timeUntilDue / (1000 * 60 * 60));

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {assignment.title}
              {getStatusBadge()}
            </CardTitle>
            <p className="text-gray-600 mt-1">{assignment.description}</p>
            <div className="flex items-center gap-4 mt-2">
              <p className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
                Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString()}
              </p>
              {!isOverdue && hoursUntilDue < 24 && (
                <div className="flex items-center gap-1 text-orange-600">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="text-xs">Due in {hoursUntilDue}h</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {autoSaveProgress > 0 && (
          <div className="mt-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Save className="w-3 h-3" />
              <span>Auto-saving...</span>
            </div>
            <Progress value={autoSaveProgress} className="h-1" />
          </div>
        )}

        {!syncStatus.isOnline && (
          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Working offline - your work will sync automatically</span>
            </div>
          </div>
        )}
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
                      <label key={optIndex} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={question.id}
                          value={option}
                          checked={answers[question.id] === option}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          className="w-4 h-4"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
                {question.question_type === 'short_answer' && (
                  <Input
                    value={answers[question.id] || ''}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    placeholder="Enter your answer..."
                    className="mt-2"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {(assignment.type === 'essay' || questions.length === 0) && (
          <div>
            <label className="block text-sm font-medium mb-2">Your Response:</label>
            <Textarea
              value={textResponse}
              onChange={(e) => setTextResponse(e.target.value)}
              placeholder="Write your response here..."
              rows={6}
              className="resize-none"
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
              accept=".pdf,.doc,.docx,.txt,.jpg,.png"
            />
            {file && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={saveDraft}
            variant="outline"
            className="flex-1"
            disabled={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || (!Object.keys(answers).length && !textResponse.trim())}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Assignment'}
            <Upload className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {syncStatus.pendingItems > 0 && (
          <div className="text-center text-sm text-gray-500">
            {syncStatus.pendingItems} item(s) waiting to sync
          </div>
        )}
      </CardContent>
    </Card>
  );
}