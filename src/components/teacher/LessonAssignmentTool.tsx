import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Calendar, Users, Send } from 'lucide-react';

export default function LessonAssignmentTool() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedLesson, setSelectedLesson] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [className, setClassName] = useState('');
  const [lessonType, setLessonType] = useState('curriculum');

  useEffect(() => {
    loadLessons();
    loadStudents();
  }, [lessonType]);

  const loadLessons = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (lessonType === 'custom') {
      const { data } = await supabase.from('teacher_lessons')
        .select('*').eq('teacher_id', user?.id);
      setLessons(data || []);
    } else {
      const { data } = await supabase.from('curriculum_lessons').select('*');
      setLessons(data || []);
    }
  };

  const loadStudents = async () => {
    const { data } = await supabase.from('students').select('*');
    setStudents(data || []);
  };

  const toggleStudent = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedStudents(students.map(s => s.id));
  };

  const handleAssign = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase.from('lesson_assignments').insert({
      teacher_id: user?.id,
      lesson_id: selectedLesson,
      lesson_type: lessonType,
      student_ids: selectedStudents,
      class_name: className,
      due_date: dueDate,
      instructions
    });

    setSelectedLesson('');
    setSelectedStudents([]);
    setInstructions('');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Select value={lessonType} onValueChange={setLessonType}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="curriculum">Curriculum Lessons</SelectItem>
            <SelectItem value="custom">My Custom Lessons</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedLesson} onValueChange={setSelectedLesson}>
          <SelectTrigger><SelectValue placeholder="Select Lesson" /></SelectTrigger>
          <SelectContent>
            {lessons.map(l => (
              <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Class Name" value={className} onChange={(e) => setClassName(e.target.value)} />
        <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>

      <Textarea placeholder="Instructions for students..." value={instructions} onChange={(e) => setInstructions(e.target.value)} />

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" /> Select Students
          </h3>
          <Button size="sm" variant="outline" onClick={selectAll}>Select All</Button>
        </div>
        <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
          {students.map(student => (
            <div key={student.id} className="flex items-center gap-2">
              <Checkbox 
                checked={selectedStudents.includes(student.id)}
                onCheckedChange={() => toggleStudent(student.id)}
              />
              <span>{student.name}</span>
            </div>
          ))}
        </div>
      </Card>

      <Button onClick={handleAssign} disabled={!selectedLesson || selectedStudents.length === 0} className="w-full">
        <Send className="w-4 h-4 mr-2" /> Assign to {selectedStudents.length} Student(s)
      </Button>
    </div>
  );
}