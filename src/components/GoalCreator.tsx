import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckCircle, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface GoalCreatorProps {
  onGoalCreated: () => void;
  selectedTemplate?: any;
}

export const GoalCreator: React.FC<GoalCreatorProps> = ({ onGoalCreated, selectedTemplate }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: selectedTemplate?.title || '',
    description: selectedTemplate?.description || '',
    subject: selectedTemplate?.subject || '',
    goalType: selectedTemplate?.goalType || 'weekly',
    targetValue: selectedTemplate?.targetValue || '',
    unit: selectedTemplate?.unit || 'hours',
    startDate: new Date(),
    endDate: new Date()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [smartValidation, setSmartValidation] = useState({
    specific: false,
    measurable: false,
    achievable: false,
    relevant: false,
    timeBound: false
  });

  const validateSMART = () => {
    const validation = {
      specific: formData.title.length > 10 && formData.description.length > 20,
      measurable: formData.targetValue && formData.unit,
      achievable: parseInt(formData.targetValue) > 0 && parseInt(formData.targetValue) < 1000,
      relevant: formData.subject && formData.subject.length > 0,
      timeBound: formData.startDate && formData.endDate && formData.endDate > formData.startDate
    };
    setSmartValidation(validation);
    return Object.values(validation).every(v => v);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    const isSmartValid = validateSMART();

    try {
      const { error } = await supabase
        .from('goals')
        .insert([{
          student_id: user.id,
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          goal_type: formData.goalType,
          target_value: parseInt(formData.targetValue),
          unit: formData.unit,
          start_date: formData.startDate.toISOString().split('T')[0],
          end_date: formData.endDate.toISOString().split('T')[0],
          is_smart_validated: isSmartValid,
          template_used: selectedTemplate?.id || null
        }]);

      if (error) throw error;
      onGoalCreated();
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Goal</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Enter a specific goal title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your goal in detail"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Select value={formData.subject} onValueChange={(value) => setFormData({...formData, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="General">General Study</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="goalType">Goal Type</Label>
              <Select value={formData.goalType} onValueChange={(value) => setFormData({...formData, goalType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetValue">Target Value</Label>
              <Input
                id="targetValue"
                type="number"
                value={formData.targetValue}
                onChange={(e) => setFormData({...formData, targetValue: e.target.value})}
                placeholder="Enter target number"
                required
              />
            </div>

            <div>
              <Label htmlFor="unit">Unit</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({...formData, unit: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="sessions">Sessions</SelectItem>
                  <SelectItem value="assignments">Assignments</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => date && setFormData({...formData, startDate: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(formData.endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate}
                    onSelect={(date) => date && setFormData({...formData, endDate: date})}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              SMART Goal Validation
              {Object.values(smartValidation).every(v => v) ? 
                <CheckCircle className="h-4 w-4 text-green-500" /> : 
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              }
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className={`flex items-center gap-2 ${smartValidation.specific ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${smartValidation.specific ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Specific
              </div>
              <div className={`flex items-center gap-2 ${smartValidation.measurable ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${smartValidation.measurable ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Measurable
              </div>
              <div className={`flex items-center gap-2 ${smartValidation.achievable ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${smartValidation.achievable ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Achievable
              </div>
              <div className={`flex items-center gap-2 ${smartValidation.relevant ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${smartValidation.relevant ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Relevant
              </div>
              <div className={`flex items-center gap-2 ${smartValidation.timeBound ? 'text-green-600' : 'text-gray-500'}`}>
                <div className={`w-2 h-2 rounded-full ${smartValidation.timeBound ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                Time-bound
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
            onClick={validateSMART}
          >
            {isSubmitting ? 'Creating Goal...' : 'Create Goal'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};