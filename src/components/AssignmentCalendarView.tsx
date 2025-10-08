import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { CalendarView } from './CalendarView';
import { StudySessionPlanner } from './StudySessionPlanner';
import { AssignmentSubmission } from './AssignmentSubmission';
import { Calendar, BookOpen, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Assignment } from '../hooks/useStudentData';

interface AssignmentCalendarViewProps {
  assignments: Assignment[];
  submissions: any[];
  onRefresh?: () => void;
}

export const AssignmentCalendarView: React.FC<AssignmentCalendarViewProps> = ({
  assignments,
  submissions,
  onRefresh
}) => {
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowSubmissionDialog(true);
  };

  const isAssignmentSubmitted = (assignmentId: string) => {
    return submissions.some(s => s.assignment_id === assignmentId);
  };

  const isOverdue = (assignment: Assignment) => {
    return new Date(assignment.due_date) < new Date() && !isAssignmentSubmitted(assignment.id);
  };

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);

    return assignments.filter(assignment => {
      const dueDate = new Date(assignment.due_date);
      return dueDate >= now && 
             dueDate <= threeDaysFromNow && 
             !isAssignmentSubmitted(assignment.id);
    });
  };

  const getOverdueAssignments = () => {
    return assignments.filter(isOverdue);
  };

  const getCompletedAssignments = () => {
    return assignments.filter(assignment => isAssignmentSubmitted(assignment.id));
  };

  return (
    <div className="space-y-6">
      {/* Deadline Alerts */}
      {(getUpcomingDeadlines().length > 0 || getOverdueAssignments().length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Assignment Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {getOverdueAssignments().length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium text-red-800 mb-2">Overdue Assignments</h4>
                <div className="space-y-2">
                  {getOverdueAssignments().map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-red-100 rounded">
                      <div>
                        <span className="font-medium text-red-800">{assignment.title}</span>
                        <span className="text-sm text-red-600 ml-2">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignmentClick(assignment)}
                        className="border-red-300 text-red-700 hover:bg-red-200"
                      >
                        Submit Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {getUpcomingDeadlines().length > 0 && (
              <div>
                <h4 className="font-medium text-orange-800 mb-2">Due Soon (Next 3 Days)</h4>
                <div className="space-y-2">
                  {getUpcomingDeadlines().map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-orange-100 rounded">
                      <div>
                        <span className="font-medium text-orange-800">{assignment.title}</span>
                        <span className="text-sm text-orange-600 ml-2">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignmentClick(assignment)}
                        className="border-orange-300 text-orange-700 hover:bg-orange-200"
                      >
                        Work On It
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="calendar" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
          <TabsTrigger value="planner" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Study Planner
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarView
            assignments={assignments}
            onAssignmentClick={handleAssignmentClick}
          />
        </TabsContent>

        <TabsContent value="planner">
          <StudySessionPlanner
            assignments={assignments}
            onSessionUpdate={onRefresh}
          />
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  Completed ({getCompletedAssignments().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getCompletedAssignments().slice(0, 5).map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <div>
                        <div className="font-medium text-green-800">{assignment.title}</div>
                        <div className="text-sm text-green-600">{assignment.subject}</div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        Done
                      </Badge>
                    </div>
                  ))}
                  {getCompletedAssignments().length === 0 && (
                    <p className="text-gray-500 text-center py-4">No completed assignments</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Clock className="h-5 w-5" />
                  Upcoming ({assignments.filter(a => new Date(a.due_date) > new Date() && !isAssignmentSubmitted(a.id)).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {assignments
                    .filter(a => new Date(a.due_date) > new Date() && !isAssignmentSubmitted(a.id))
                    .slice(0, 5)
                    .map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                      <div>
                        <div className="font-medium text-blue-800">{assignment.title}</div>
                        <div className="text-sm text-blue-600">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignmentClick(assignment)}
                      >
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="h-5 w-5" />
                  Overdue ({getOverdueAssignments().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {getOverdueAssignments().slice(0, 5).map(assignment => (
                    <div key={assignment.id} className="flex items-center justify-between p-2 bg-red-50 rounded">
                      <div>
                        <div className="font-medium text-red-800">{assignment.title}</div>
                        <div className="text-sm text-red-600">
                          Due: {new Date(assignment.due_date).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAssignmentClick(assignment)}
                        className="border-red-300 text-red-700 hover:bg-red-200"
                      >
                        Submit
                      </Button>
                    </div>
                  ))}
                  {getOverdueAssignments().length === 0 && (
                    <p className="text-gray-500 text-center py-4">No overdue assignments</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Assignment Submission Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submit Assignment</DialogTitle>
          </DialogHeader>
          
          {selectedAssignment && (
            <AssignmentSubmission
              assignment={selectedAssignment}
              onSubmit={() => {
                setShowSubmissionDialog(false);
                onRefresh?.();
              }}
              onCancel={() => setShowSubmissionDialog(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};