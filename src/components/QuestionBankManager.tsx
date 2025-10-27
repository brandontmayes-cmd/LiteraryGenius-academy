import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Trash2, Eye, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

export default function QuestionBankManager() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, bySubject: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('diagnostic_test_questions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    
    if (data) {
      setQuestions(data);
      const bySubject = data.reduce((acc: any, q) => {
        acc[q.subject] = (acc[q.subject] || 0) + 1;
        return acc;
      }, {});
      setStats({ total: data.length, bySubject });
    }
    setLoading(false);
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    
    const { error } = await supabase
      .from('diagnostic_test_questions')
      .delete()
      .eq('id', id);
    
    if (!error) {
      toast({ title: 'Deleted', description: 'Question removed' });
      loadQuestions();
    }
  };

  const seedSampleQuestions = async () => {
    const samples = [
      {
        subject: 'Mathematics',
        grade_level: '3',
        question_text: 'What is 5 + 7?',
        question_type: 'multiple_choice',
        options: ['10', '11', '12', '13'],
        correct_answer: '12',
        difficulty_level: 1,
        skill_category: 'Addition'
      },
      {
        subject: 'English Language Arts',
        grade_level: '3',
        question_text: 'Which word is a noun?',
        question_type: 'multiple_choice',
        options: ['run', 'happy', 'dog', 'quickly'],
        correct_answer: 'dog',
        difficulty_level: 1,
        skill_category: 'Parts of Speech'
      },
      {
        subject: 'Science',
        grade_level: '3',
        question_text: 'What is the center of our solar system?',
        question_type: 'multiple_choice',
        options: ['Earth', 'Moon', 'Sun', 'Mars'],
        correct_answer: 'Sun',
        difficulty_level: 1,
        skill_category: 'Solar System'
      }
    ];

    for (const q of samples) {
      await supabase.from('diagnostic_test_questions').insert(q);
    }
    
    toast({ title: 'Success', description: 'Sample questions added' });
    loadQuestions();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Database className="h-6 w-6 text-blue-600" />
            Question Bank Manager
          </span>
          <Button onClick={seedSampleQuestions} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Samples
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Questions</p>
            </CardContent>
          </Card>
          {Object.entries(stats.bySubject).map(([subject, count]) => (
            <Card key={subject}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{count as number}</div>
                <p className="text-sm text-muted-foreground">{subject}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-center text-muted-foreground">No questions yet. Generate some!</p>
          ) : (
            questions.map((q) => (
              <Card key={q.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{q.question_text}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{q.subject}</Badge>
                        <Badge variant="outline">Grade {q.grade_level}</Badge>
                        <Badge variant="secondary">Level {q.difficulty_level}</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteQuestion(q.id)}>
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
