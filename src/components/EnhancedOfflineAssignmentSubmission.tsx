import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfflineDataSync } from '@/hooks/useOfflineDataSync';
import { OfflineSyncIndicator } from './OfflineSyncIndicator';
import { 
  Upload, 
  Save, 
  WifiOff, 
  CheckCircle, 
  Clock,
  FileText,
  Camera
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  due_date: string;
  max_score?: number;
}

interface EnhancedOfflineAssignmentSubmissionProps {
  assignment: Assignment;
  studentId: string;
  onSubmissionComplete?: (submissionId: string) => void;
}

export const EnhancedOfflineAssignmentSubmission: React.FC<EnhancedOfflineAssignmentSubmissionProps> = ({
  assignment,
  studentId,
  onSubmissionComplete
}) => {
  const { syncStatus, saveOfflineData } = useOfflineDataSync();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'draft' | 'submitted' | 'synced'>('draft');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (Object.keys(answers).length > 0 || files.length > 0) {
        handleAutoSave();
      }
    }, 2000);

    return () => clearTimeout(autoSaveTimer);
  }, [answers, files]);

  const handleAutoSave = async () => {
    setAutoSaveStatus('saving');
    try {
      const draftData = {
        id: `draft_${assignment.id}_${studentId}`,
        assignment_id: assignment.id,
        student_id: studentId,
        answers,
        file_urls: files.map(f => f.name),
        submitted_at: new Date().toISOString(),
        auto_graded: false,
        synced: false,
        last_modified: new Date().toISOString(),
        offline_created: true,
        status: 'draft'
      };

      await saveOfflineData('submission', draftData, 'update');
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const submissionData = {
        id: crypto.randomUUID(),
        assignment_id: assignment.id,
        student_id: studentId,
        answers,
        file_urls: files.map(f => f.name), // In real app, upload files first
        submitted_at: new Date().toISOString(),
        auto_graded: false,
        synced: false,
        last_modified: new Date().toISOString(),
        offline_created: true
      };

      await saveOfflineData('submission', submissionData, 'create');
      
      setSubmissionStatus(syncStatus.isOnline ? 'synced' : 'submitted');
      onSubmissionComplete?.(submissionData.id);
      
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionStatusBadge = () => {
    switch (submissionStatus) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'submitted':
        return (
          <Badge variant="secondary" className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Submitted (Pending Sync)</span>
          </Badge>
        );
      case 'synced':
        return (
          <Badge variant="default" className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Submitted & Synced</span>
          </Badge>
        );
    }
  };

  const getAutoSaveIndicator = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return (
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <div className="h-2 w-2 bg-yellow-500 rounded-full animate-pulse" />
            <span>Saving...</span>
          </div>
        );
      case 'saved':
        return (
          <div className="flex items-center space-x-1 text-xs text-green-600">
            <CheckCircle className="h-3 w-3" />
            <span>Saved</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-1 text-xs text-red-600">
            <span>Save failed</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with sync status */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{assignment.title}</h2>
          <p className="text-muted-foreground">Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getAutoSaveIndicator()}
          <OfflineSyncIndicator compact />
          {getSubmissionStatusBadge()}
        </div>
      </div>

      {/* Offline mode alert */}
      {!syncStatus.isOnline && (
        <Alert>
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're working offline. Your submission will be saved locally and synced when you're back online.
          </AlertDescription>
        </Alert>
      )}

      {/* Assignment description */}
      <Card>
        <CardHeader>
          <CardTitle>Assignment Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{assignment.description}</p>
          {assignment.max_score && (
            <p className="text-sm font-medium mt-2">Maximum Score: {assignment.max_score} points</p>
          )}
        </CardContent>
      </Card>

      {/* Answer form */}
      <Card>
        <CardHeader>
          <CardTitle>Your Response</CardTitle>
          <CardDescription>
            Your work is automatically saved as you type
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="main-answer">Answer</Label>
            <Textarea
              id="main-answer"
              placeholder="Type your answer here..."
              value={answers.main || ''}
              onChange={(e) => handleAnswerChange('main', e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          {/* File attachments */}
          <div className="space-y-2">
            <Label>File Attachments</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Add Files
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {/* Camera capture functionality */}}
              >
                <Camera className="h-4 w-4 mr-2" />
                Take Photo
              </Button>
            </div>

            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit button */}
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={handleAutoSave}
          disabled={autoSaveStatus === 'saving'}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Draft
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || submissionStatus !== 'draft'}
        >
          {isSubmitting ? (
            <>
              <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Submitting...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit Assignment
            </>
          )}
        </Button>
      </div>

      {/* Submission confirmation */}
      {submissionStatus !== 'draft' && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Assignment submitted successfully! 
            {!syncStatus.isOnline && ' It will be synced when you go back online.'}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};