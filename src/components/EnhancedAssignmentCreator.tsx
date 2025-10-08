import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, Clock, BookOpen, Users, FileText, Save, Send } from 'lucide-react';
import { QuestionTypes, Question } from './assignment/QuestionTypes';
import { AssignmentTemplates } from './assignment/AssignmentTemplates';

interface EnhancedAssignmentCreatorProps {
  onSave: (assignment: any) => void;
  onCancel: () => void;
  editingAssignment?: any;
}

export const EnhancedAssignmentCreator: React.FC<EnhancedAssignmentCreatorProps> = ({ 
  onSave, 
  onCancel, 
  editingAssignment 
}) => {
  const [formData, setFormData] = useState({
    title: editingAssignment?.title || '',
    subject: editingAssignment?.subject || '',
    description: editingAssignment?.description || '',
    due_date: editingAssignment?.due_date || '',
    due_time: editingAssignment?.due_time || '23:59',
    points: editingAssignment?.points || '',
    type: editingAssignment?.type || 'homework',
    instructions: editingAssignment?.instructions || '',
    allow_late: editingAssignment?.allow_late || false,
    late_penalty: editingAssignment?.late_penalty || 10,
    attempts_allowed: editingAssignment?.attempts_allowed || 1,
    time_limit: editingAssignment?.time_limit || '',
    randomize_questions: editingAssignment?.randomize_questions || false
  });

  const [questions, setQuestions] = useState<Question[]>(editingAssignment?.questions || []);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const handleSubmit = (status: 'draft' | 'published') => {
    const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
    
    onSave({
      ...formData,
      id: editingAssignment?.id || Date.now().toString(),
      questions,
      total_points: totalPoints,
      created_at: editingAssignment?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status,
      assigned_classes: selectedClasses
    });
  };

  const handleTemplateSelect = (template: any) => {
    setFormData({
      ...formData,
      title: template.name,
      subject: template.subject,
      description: template.description
    });
    setQuestions(template.questions);
    setShowTemplates(false);
  };

  const classes = ['Class 6A', 'Class 6B', 'Class 7A', 'Class 7B', 'Class 8A'];

  return (
    <>
      <Card className="w-full max-w-6xl mx-auto max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
            </div>
            <Button variant="outline" onClick={() => setShowTemplates(true)}>
              <FileText className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="distribute">Distribute</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Assignment Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter assignment title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English Language Arts</SelectItem>
                      <SelectItem value="math">Mathematics</SelectItem>
                      <SelectItem value="science">Science</SelectItem>
                      <SelectItem value="history">Social Studies</SelectItem>
                      <SelectItem value="art">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Due Date</label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Due Time</label>
                  <Input
                    type="time"
                    value={formData.due_time}
                    onChange={(e) => setFormData({ ...formData, due_time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="homework">Homework</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="discussion">Discussion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time Limit (minutes)</label>
                  <Input
                    type="number"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: e.target.value })}
                    placeholder="No limit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the assignment"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Instructions</label>
                <Textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Detailed instructions for students"
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="questions">
              <QuestionTypes questions={questions} onUpdateQuestions={setQuestions} />
              {questions.length > 0 && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Questions: {questions.length}</span>
                    <span className="font-medium">Total Points: {questions.reduce((sum, q) => sum + q.points, 0)}</span>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Submission Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Attempts Allowed</label>
                      <Select 
                        value={formData.attempts_allowed.toString()} 
                        onValueChange={(value) => setFormData({ ...formData, attempts_allowed: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 attempt</SelectItem>
                          <SelectItem value="2">2 attempts</SelectItem>
                          <SelectItem value="3">3 attempts</SelectItem>
                          <SelectItem value="-1">Unlimited</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="allow_late"
                        checked={formData.allow_late}
                        onChange={(e) => setFormData({ ...formData, allow_late: e.target.checked })}
                      />
                      <label htmlFor="allow_late" className="text-sm font-medium">Allow late submissions</label>
                    </div>

                    {formData.allow_late && (
                      <div>
                        <label className="block text-sm font-medium mb-1">Late penalty (%)</label>
                        <Input
                          type="number"
                          value={formData.late_penalty}
                          onChange={(e) => setFormData({ ...formData, late_penalty: Number(e.target.value) })}
                          min="0"
                          max="100"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Display Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="randomize"
                        checked={formData.randomize_questions}
                        onChange={(e) => setFormData({ ...formData, randomize_questions: e.target.checked })}
                      />
                      <label htmlFor="randomize" className="text-sm font-medium">Randomize question order</label>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="distribute" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Select Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {classes.map(className => (
                      <div key={className} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={className}
                          checked={selectedClasses.includes(className)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClasses([...selectedClasses, className]);
                            } else {
                              setSelectedClasses(selectedClasses.filter(c => c !== className));
                            }
                          }}
                        />
                        <label htmlFor={className} className="text-sm font-medium">{className}</label>
                      </div>
                    ))}
                  </div>
                  {selectedClasses.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Selected classes:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedClasses.map(className => (
                          <Badge key={className} variant="secondary">{className}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="button" variant="outline" onClick={() => handleSubmit('draft')}>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button type="button" onClick={() => handleSubmit('published')}>
              <Send className="h-4 w-4 mr-2" />
              Publish Assignment
            </Button>
          </div>
        </CardContent>
      </Card>

      {showTemplates && (
        <AssignmentTemplates
          onSelectTemplate={handleTemplateSelect}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </>
  );
};