import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Save } from 'lucide-react';

const subjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
const grades = ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function CustomLessonCreator({ onSave }: { onSave?: () => void }) {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(45);
  const [standards, setStandards] = useState<string[]>(['']);
  const [sections, setSections] = useState([{ type: 'text', content: '' }]);
  const [saving, setSaving] = useState(false);

  const addSection = (type: string) => {
    setSections([...sections, { type, content: '' }]);
  };

  const updateSection = (index: number, content: string) => {
    const updated = [...sections];
    updated[index].content = content;
    setSections(updated);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('teacher_lessons').insert({
      teacher_id: user?.id,
      title,
      subject,
      grade_level: grade,
      description,
      content: { sections },
      standards: standards.filter(s => s.trim()),
      duration_minutes: duration
    });

    setSaving(false);
    if (!error) {
      onSave?.();
      setTitle('');
      setDescription('');
      setSections([{ type: 'text', content: '' }]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <Input placeholder="Lesson Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input type="number" placeholder="Duration (min)" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Select value={subject} onValueChange={setSubject}>
          <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
          <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={grade} onValueChange={setGrade}>
          <SelectTrigger><SelectValue placeholder="Grade" /></SelectTrigger>
          <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />

      <div className="space-y-2">
        <label className="font-semibold">Standards</label>
        {standards.map((std, i) => (
          <Input key={i} value={std} onChange={(e) => {
            const updated = [...standards];
            updated[i] = e.target.value;
            setStandards(updated);
          }} placeholder="e.g., CCSS.ELA-LITERACY.RL.5.1" />
        ))}
        <Button size="sm" variant="outline" onClick={() => setStandards([...standards, ''])}>
          <Plus className="w-4 h-4 mr-2" /> Add Standard
        </Button>
      </div>

      <div className="space-y-4">
        <label className="font-semibold">Lesson Content</label>
        {sections.map((section, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between mb-2">
              <span className="font-medium capitalize">{section.type}</span>
              <Button size="sm" variant="ghost" onClick={() => removeSection(i)}><Trash2 className="w-4 h-4" /></Button>
            </div>
            <Textarea value={section.content} onChange={(e) => updateSection(i, e.target.value)} />
          </Card>
        ))}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => addSection('text')}>Add Text</Button>
          <Button size="sm" variant="outline" onClick={() => addSection('video')}>Add Video</Button>
          <Button size="sm" variant="outline" onClick={() => addSection('quiz')}>Add Quiz</Button>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Lesson'}
      </Button>
    </div>
  );
}