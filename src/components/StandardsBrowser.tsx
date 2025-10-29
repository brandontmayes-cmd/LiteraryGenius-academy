import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, BookOpen, Target } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Standard {
  id: string;
  code: string;
  description: string;
  grade_level: string;
  subject: string;
}

export default function StandardsBrowser({ onSelectStandard }: { onSelectStandard?: (standard: Standard) => void }) {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [filteredStandards, setFilteredStandards] = useState<Standard[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandards();
  }, []);

  useEffect(() => {
    filterStandards();
  }, [searchTerm, selectedGrade, selectedSubject, standards]);

  const fetchStandards = async () => {
    try {
      const { data, error } = await supabase
        .from('common_core_standards')
        .select('*')
        .order('grade_level', { ascending: true });

      if (error) throw error;
      setStandards(data || []);
      setFilteredStandards(data || []);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStandards = () => {
    let filtered = [...standards];

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter(s => s.grade_level === selectedGrade);
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(s => s.subject === selectedSubject);
    }

    setFilteredStandards(filtered);
  };

  const grades = ['all', ...Array.from(new Set(standards.map(s => s.grade_level)))];
  const subjects = ['all', ...Array.from(new Set(standards.map(s => s.subject)))];

  if (loading) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Common Core Standards Browser
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search standards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {grades.map(g => <option key={g} value={g}>{g === 'all' ? 'All Grades' : `Grade ${g}`}</option>)}
          </select>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            {subjects.map(s => <option key={s} value={s}>{s === 'all' ? 'All Subjects' : s}</option>)}
          </select>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredStandards.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No standards found</p>
          ) : (
            filteredStandards.map((standard) => (
              <Card key={standard.id} className="p-3 hover:shadow-md transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline">{standard.code}</Badge>
                      <Badge>{standard.subject}</Badge>
                      <Badge variant="secondary">Grade {standard.grade_level}</Badge>
                    </div>
                    <p className="text-sm text-gray-700">{standard.description}</p>
                  </div>
                  {onSelectStandard && (
                    <Button size="sm" onClick={() => onSelectStandard(standard)}>
                      <Target className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
