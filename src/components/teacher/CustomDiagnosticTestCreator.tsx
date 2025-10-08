import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Plus, Trash2, Save } from 'lucide-react';

const subjects = ['English', 'Mathematics', 'Science', 'Social Studies'];
const grades = ['PK', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

export default function CustomDiagnosticTestCreator({ onSave }: { onSave?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(60);
  const [questions, setQuestions] = useState([{
    question: '',
    type: 'multiple-choice',
    options: ['', '', '', ''],
    correctAnswer: 0,
    subject: '',
    difficulty: 'medium'
  }]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, {
      question: '',
      type: 'multiple-choice',
      options: ['', '', '', ''],
      correctAnswer: 0,
      subject: '',
      difficulty: 'medium'
    }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('custom_diagnostic_tests').insert({
      teacher_id: user?.id,
      title,
      description,
      subjects: selectedSubjects,
      grade_levels: selectedGrades,
      questions,
      time_limit_minutes: timeLimit
    });

    setSaving(false);
    if (!error) {
      onSave?.();
      setTitle('');
      setDescription('');
      setQuestions([{
        question: '',
        type: 'multiple-choice',
        options: ['', '', '', ''],
        correctAnswer: 0,
        subject: '',
        difficulty: 'medium'
      }]);
    }
  };

  return (
    <div className="space-y-6">
      <Input placeholder="Test Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-semibold mb-2 block">Subjects</label>
          {subjects.map(s => (
            <div key={s} className="flex items-center gap-2 mb-2">
              <Checkbox 
                checked={selectedSubjects.includes(s)}
                onCheckedChange={(checked) => {
                  setSelectedSubjects(checked ? [...selectedSubjects, s] : selectedSubjects.filter(sub => sub !== s));
                }}
              />
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div>
          <label className="font-semibold mb-2 block">Grade Levels</label>
          <div className="grid grid-cols-3 gap-2">
            {grades.map(g => (
              <div key={g} className="flex items-center gap-2">
                <Checkbox 
                  checked={selectedGrades.includes(g)}
                  onCheckedChange={(checked) => {
                    setSelectedGrades(checked ? [...selectedGrades, g] : selectedGrades.filter(gr => gr !== g));
                  }}
                />
                <span>{g}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Input type="number" placeholder="Time Limit (minutes)" value={timeLimit} onChange={(e) => setTimeLimit(Number(e.target.value))} />

      <div className="space-y-4">
        <label className="font-semibold">Questions</label>
        {questions.map((q, i) => (
          <Card key={i} className="p-4">
            <div className="flex justify-between mb-3">
              <span className="font-medium">Question {i + 1}</span>
              <Button size="sm" variant="ghost" onClick={() => removeQuestion(i)}><Trash2 className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-3">
              <Textarea placeholder="Question" value={q.question} onChange={(e) => updateQuestion(i, 'question', e.target.value)} />
              <div className="grid grid-cols-3 gap-2">
                <Select value={q.subject} onValueChange={(v) => updateQuestion(i, 'subject', v)}>
                  <SelectTrigger><SelectValue placeholder="Subject" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={q.difficulty} onValueChange={(v) => updateQuestion(i, 'difficulty', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {q.options.map((opt, oi) => (
                <Input key={oi} placeholder={`Option ${oi + 1}`} value={opt} onChange={(e) => {
                  const updated = [...q.options];
                  updated[oi] = e.target.value;
                  updateQuestion(i, 'options', updated);
                }} />
              ))}
            </div>
          </Card>
        ))}
        <Button variant="outline" onClick={addQuestion}><Plus className="w-4 h-4 mr-2" /> Add Question</Button>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        <Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save Test'}
      </Button>
    </div>
  );
}