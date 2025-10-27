import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Wand2, BookOpen, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export default function StandardsBasedQuestionGenerator() {
  const [standards, setStandards] = useState<any[]>([]);
  const [selectedStandard, setSelectedStandard] = useState('');
  const [subject, setSubject] = useState('Mathematics');
  const [gradeLevel, setGradeLevel] = useState('3');
  const [numQuestions, setNumQuestions] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  const subjects = ['Mathematics', 'English Language Arts', 'Science', 'Social Studies'];
  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    loadStandards();
  }, [subject, gradeLevel]);

  const loadStandards = async () => {
    const { data } = await supabase
      .from('common_core_standards')
      .select('*')
      .eq('subject', subject)
      .eq('grade_level', gradeLevel)
      .order('code');
    
    if (data) setStandards(data);
  };

  const generateQuestions = async () => {
    setGenerating(true);
    setProgress([]);

    try {
      const standard = standards.find(s => s.id === selectedStandard);
      if (!standard) {
        toast({ title: 'Error', description: 'Please select a standard', variant: 'destructive' });
        return;
      }

      setProgress(prev => [...prev, `Generating ${numQuestions} questions for ${standard.code}...`]);

      // Generate questions using AI
      const questions = await generateAIQuestions(standard, numQuestions);

      // Save to database
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await supabase.from('diagnostic_test_questions').insert({
          subject,
          grade_level: gradeLevel,
          standard_id: standard.id,
          question_text: q.question,
          question_type: q.type,
          options: q.options,
          correct_answer: q.correctAnswer,
          difficulty_level: q.difficulty,
          skill_category: standard.code
        });
        setProgress(prev => [...prev, `✓ Question ${i + 1} saved`]);
      }

      setProgress(prev => [...prev, '✅ Complete!']);
      toast({ title: 'Success', description: `Generated ${numQuestions} questions` });
    } catch (error: any) {
      setProgress(prev => [...prev, `❌ Error: ${error.message}`]);
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const generateAIQuestions = async (standard: any, count: number) => {
    const questions = [];
    const types = ['multiple_choice', 'short_answer', 'true_false'];
    const difficulties = ['easy', 'medium', 'hard'];
    
    // Generate questions in batches to avoid timeout
    const batchSize = 5;
    for (let i = 0; i < count; i += batchSize) {
      const currentBatch = Math.min(batchSize, count - i);
      const type = types[Math.floor(Math.random() * types.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      setProgress(prev => [...prev, `Generating batch ${Math.floor(i / batchSize) + 1}...`]);
      
      const { data, error } = await supabase.functions.invoke('question-generator', {
        body: {
          standardId: standard.id,
          standardCode: standard.code,
          standardDescription: standard.description,
          questionType: type,
          count: currentBatch,
          difficulty
        }
      });

      if (error) throw error;
      
      // Transform the response to match our format
      if (data?.questions) {
        for (const q of data.questions) {
          questions.push({
            question: q.question,
            type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            difficulty: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
            explanation: q.explanation
          });
        }
      }
    }
    
    return questions;
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-600" />
          AI Question Generator (Standards-Based)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Grade</label>
            <Select value={gradeLevel} onValueChange={setGradeLevel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {grades.map(g => <SelectItem key={g} value={g}>Grade {g}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Standard</label>
          <Select value={selectedStandard} onValueChange={setSelectedStandard}>
            <SelectTrigger><SelectValue placeholder="Select a standard" /></SelectTrigger>
            <SelectContent>
              {standards.map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.code}: {s.description.substring(0, 50)}...
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Number of Questions</label>
          <Input type="number" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} min={1} max={50} />
        </div>

        <Button onClick={generateQuestions} disabled={generating || !selectedStandard} className="w-full">
          <Wand2 className="mr-2 h-4 w-4" />
          Generate Questions
        </Button>

        {progress.length > 0 && (
          <div className="space-y-1 max-h-64 overflow-y-auto text-sm">
            {progress.map((msg, idx) => (
              <div key={idx} className="flex items-center gap-2">
                {msg.includes('✅') ? <CheckCircle className="h-4 w-4 text-green-600" /> : 
                 msg.includes('✓') ? <CheckCircle className="h-3 w-3 text-green-500" /> :
                 <div className="h-3 w-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                <span>{msg}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
