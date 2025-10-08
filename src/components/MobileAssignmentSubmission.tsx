import React, { useState } from 'react';
import { Upload, Camera, FileText, Send, X, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MobileCameraCapture } from './MobileCameraCapture';
import { supabase } from '@/lib/supabase';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  submissionType: 'text' | 'file' | 'both';
}

interface MobileAssignmentSubmissionProps {
  assignment: Assignment;
  onSubmit: (submission: any) => void;
  onClose: () => void;
}

export const MobileAssignmentSubmission: React.FC<MobileAssignmentSubmissionProps> = ({
  assignment,
  onSubmit,
  onClose
}) => {
  const [textSubmission, setTextSubmission] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCameraCapture = (file: File) => {
    setFiles(prev => [...prev, file]);
    setShowCamera(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files: File[]) => {
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileName = `${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('assignment-files')
        .upload(fileName, file);

      if (error) throw error;
      
      uploadedFiles.push({
        name: file.name,
        path: data.path,
        size: file.size,
        type: file.type
      });

      setUploadProgress(((i + 1) / files.length) * 100);
    }
    
    return uploadedFiles;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let uploadedFiles = [];
      
      if (files.length > 0) {
        uploadedFiles = await uploadFiles(files);
      }

      const submission = {
        assignmentId: assignment.id,
        textContent: textSubmission,
        files: uploadedFiles,
        submittedAt: new Date().toISOString(),
        status: 'submitted'
      };

      // Save to database
      const { error } = await supabase
        .from('assignment_submissions')
        .insert(submission);

      if (error) throw error;

      onSubmit(submission);
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDaysUntilDue = () => {
    const dueDate = new Date(assignment.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0;
  const isDueSoon = daysUntilDue <= 2 && daysUntilDue >= 0;

  if (showCamera) {
    return (
      <MobileCameraCapture
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
        acceptedTypes={['image/*', 'application/pdf']}
        maxSize={10}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold truncate">Submit Assignment</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="p-4 space-y-6">
        {/* Assignment Info */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">{assignment.title}</CardTitle>
              <Badge 
                variant={isOverdue ? 'destructive' : isDueSoon ? 'secondary' : 'default'}
                className="ml-2"
              >
                {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : `${daysUntilDue} days`}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </span>
              <span>{assignment.maxPoints} points</span>
            </div>
          </CardContent>
        </Card>

        {/* Text Submission */}
        {(assignment.submissionType === 'text' || assignment.submissionType === 'both') && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Written Response
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Textarea
                placeholder="Type your response here..."
                value={textSubmission}
                onChange={(e) => setTextSubmission(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <div className="text-xs text-gray-500 mt-2">
                {textSubmission.length} characters
              </div>
            </CardContent>
          </Card>
        )}

        {/* File Submission */}
        {(assignment.submissionType === 'file' || assignment.submissionType === 'both') && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">File Attachments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {/* Upload Options */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowCamera(true)}
                  className="flex items-center gap-2 h-12"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  className="flex items-center gap-2 h-12"
                >
                  <Upload className="w-4 h-4" />
                  Upload File
                </Button>
              </div>

              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*,application/pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />

              {/* File List */}
              {files.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Attached Files:</h4>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="p-1 h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upload Progress */}
        {isSubmitting && uploadProgress > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading files...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || (!textSubmission && files.length === 0)}
          className="w-full flex items-center gap-2 h-12"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Submit Assignment
            </>
          )}
        </Button>
      </div>
    </div>
  );
};