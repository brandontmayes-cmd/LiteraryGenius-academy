import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Assignment } from '../hooks/useStudentData';

interface CalendarViewProps {
  assignments: Assignment[];
  onAssignmentClick?: (assignment: Assignment) => void;
}

const SUBJECT_COLORS = {
  'Math': 'bg-blue-500',
  'Science': 'bg-green-500',
  'English': 'bg-purple-500',
  'History': 'bg-orange-500',
  'Art': 'bg-pink-500',
  'PE': 'bg-red-500',
  'Music': 'bg-yellow-500',
  'default': 'bg-gray-500'
};

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({ 
  assignments, 
  onAssignmentClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const assignmentsByDate = useMemo(() => {
    const grouped: { [key: string]: Assignment[] } = {};
    
    assignments.forEach(assignment => {
      const dueDate = new Date(assignment.due_date);
      const dateKey = dueDate.toISOString().split('T')[0];
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(assignment);
    });
    
    return grouped;
  }, [assignments]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      const days = direction === 'prev' ? -7 : 7;
      newDate.setDate(prev.getDate() + days);
      return newDate;
    });
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getWeekDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getAssignmentsForDate = (date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    return assignmentsByDate[dateKey] || [];
  };

  const isOverdue = (assignment: Assignment) => {
    return new Date(assignment.due_date) < today;
  };

  const renderDayCell = (date: Date) => {
    const dayAssignments = getAssignmentsForDate(date);
    const isCurrentMonthDay = isCurrentMonth(date);
    const isTodayDate = isToday(date);
    
    return (
      <div
        key={date.toISOString()}
        className={`
          min-h-[120px] p-2 border border-gray-200 
          ${isTodayDate ? 'bg-blue-50 border-blue-300' : ''}
          ${!isCurrentMonthDay ? 'bg-gray-50 text-gray-400' : ''}
          ${view === 'week' ? 'min-h-[200px]' : ''}
        `}
      >
        <div className={`text-sm font-medium mb-1 ${isTodayDate ? 'text-blue-600' : ''}`}>
          {date.getDate()}
        </div>
        
        <div className="space-y-1">
          {dayAssignments.map((assignment, idx) => (
            <div
              key={assignment.id}
              onClick={() => onAssignmentClick?.(assignment)}
              className={`
                text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity
                ${SUBJECT_COLORS[assignment.subject as keyof typeof SUBJECT_COLORS] || SUBJECT_COLORS.default}
                text-white truncate
                ${isOverdue(assignment) ? 'ring-2 ring-red-400' : ''}
              `}
              title={`${assignment.title} - ${assignment.subject}`}
            >
              <div className="flex items-center gap-1">
                {isOverdue(assignment) && <AlertTriangle className="h-3 w-3" />}
                <span className="truncate">{assignment.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const days = view === 'month' ? getMonthDays() : getWeekDays();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Assignment Calendar
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-semibold">
              {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              {view === 'week' && ` - Week of ${currentDate.toLocaleDateString()}`}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs">
          {Object.entries(SUBJECT_COLORS).map(([subject, color]) => (
            subject !== 'default' && (
              <div key={subject} className="flex items-center gap-1">
                <div className={`w-3 h-3 rounded ${color}`}></div>
                <span>{subject}</span>
              </div>
            )
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {WEEKDAYS.map(day => (
            <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
          
          {days.map(renderDayCell)}
        </div>
      </CardContent>
    </Card>
  );
};