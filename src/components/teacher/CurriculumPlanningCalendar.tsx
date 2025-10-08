import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/lib/supabase';
import { Calendar, Plus, BookOpen, FileText, Users, ClipboardCheck } from 'lucide-react';

export default function CurriculumPlanningCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showDialog, setShowDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    event_type: 'lesson',
    start_date: '',
    end_date: '',
    class_name: '',
    notes: ''
  });

  useEffect(() => {
    loadEvents();
  }, [currentMonth]);

  const loadEvents = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data } = await supabase.from('curriculum_planning_events')
      .select('*')
      .eq('teacher_id', user?.id);
    setEvents(data || []);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { firstDay, daysInMonth };
  };

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.start_date.startsWith(dateStr));
  };

  const handleSaveEvent = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('curriculum_planning_events').insert({
      ...newEvent,
      teacher_id: user?.id
    });
    setShowDialog(false);
    loadEvents();
  };

  const { firstDay, daysInMonth } = getDaysInMonth();
  const eventIcons = {
    lesson: <BookOpen className="w-3 h-3" />,
    test: <FileText className="w-3 h-3" />,
    review: <ClipboardCheck className="w-3 h-3" />,
    project: <Users className="w-3 h-3" />
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
            Previous
          </Button>
          <h2 className="text-xl font-bold px-4 py-2">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <Button variant="outline" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
            Next
          </Button>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Event</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Calendar Event</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Title" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} />
              <Select value={newEvent.event_type} onValueChange={(v) => setNewEvent({...newEvent, event_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="lesson">Lesson</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                </SelectContent>
              </Select>
              <Input type="date" value={newEvent.start_date} onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})} />
              <Input placeholder="Class Name" value={newEvent.class_name} onChange={(e) => setNewEvent({...newEvent, class_name: e.target.value})} />
              <Textarea placeholder="Notes" value={newEvent.notes} onChange={(e) => setNewEvent({...newEvent, notes: e.target.value})} />
              <Button onClick={handleSaveEvent} className="w-full">Save Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm p-2">{day}</div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayEvents = getEventsForDay(day);
            return (
              <div key={day} className="border rounded p-2 min-h-24 hover:bg-gray-50">
                <div className="font-semibold text-sm mb-1">{day}</div>
                <div className="space-y-1">
                  {dayEvents.map(event => (
                    <div key={event.id} className="text-xs p-1 rounded bg-blue-100 flex items-center gap-1">
                      {eventIcons[event.event_type as keyof typeof eventIcons]}
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}