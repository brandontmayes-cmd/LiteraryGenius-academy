import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { Search, BookOpen, Target, CheckCircle } from 'lucide-react';

interface Standard {
  id: string;
  standard_code: string;
  grade_level: string;
  subject: string;
  domain: string;
  cluster: string;
  standard_text: string;
}

interface StandardsAlignmentProps {
  contentId?: string;
  selectedStandards?: string[];
  onStandardsChange?: (standards: string[]) => void;
  viewMode?: 'browse' | 'select' | 'track';
}

export const StandardsAlignment: React.FC<StandardsAlignmentProps> = ({
  contentId,
  selectedStandards = [],
  onStandardsChange,
  viewMode = 'browse'
}) => {
  const [standards, setStandards] = useState<Standard[]>([]);
  const [filteredStandards, setFilteredStandards] = useState<Standard[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandards();
  }, []);

  useEffect(() => {
    filterStandards();
  }, [standards, selectedGrade, selectedSubject, searchTerm]);

  const fetchStandards = async () => {
    try {
      const { data, error } = await supabase
        .from('common_core_standards')
        .select('*')
        .order('grade_level', { ascending: true })
        .order('subject')
        .order('standard_code');

      if (error) throw error;
      setStandards(data || []);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStandards = () => {
    let filtered = standards;

    if (selectedGrade) {
      filtered = filtered.filter(s => s.grade_level === selectedGrade);
    }

    if (selectedSubject) {
      filtered = filtered.filter(s => s.subject === selectedSubject);
    }

    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.standard_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.standard_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.domain.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredStandards(filtered);
  };

  const toggleStandard = (standardId: string) => {
    if (!onStandardsChange) return;
    
    const newSelected = selectedStandards.includes(standardId)
      ? selectedStandards.filter(id => id !== standardId)
      : [...selectedStandards, standardId];
    
    onStandardsChange(newSelected);
  };

  const grades = [...new Set(standards.map(s => s.grade_level))].sort();
  const subjects = [...new Set(standards.map(s => s.subject))];

  if (loading) {
    return <div className="flex justify-center p-8">Loading standards...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Common Core Standards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Grades</SelectItem>
                {grades.map(grade => (
                  <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search standards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Standards List */}
      <div className="grid gap-4">
        {filteredStandards.map((standard) => (
          <Card key={standard.id} className={`transition-all ${
            selectedStandards.includes(standard.id) ? 'ring-2 ring-primary' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline">{standard.standard_code}</Badge>
                    <Badge variant="secondary">Grade {standard.grade_level}</Badge>
                    <Badge>{standard.subject}</Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <strong>{standard.domain}</strong>
                    {standard.cluster && ` • ${standard.cluster}`}
                  </div>
                  
                  <p className="text-sm">{standard.standard_text}</p>
                </div>

                {viewMode === 'select' && onStandardsChange && (
                  <Button
                    variant={selectedStandards.includes(standard.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleStandard(standard.id)}
                  >
                    {selectedStandards.includes(standard.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      'Select'
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStandards.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No standards found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};