'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { BookOpen, Target, CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import StandardPracticeSession from './StandardPracticeSession';

interface Standard {
  id: number;
  code: string;
  grade: string;
  subject: string;
  domain: string;
  description: string;
  cluster?: string;
}

interface GroupedStandards {
  [domain: string]: Standard[];
}

interface StandardsCurriculumDisplayProps {
  studentId: string;
  initialSubject?: string;
  initialGrade?: string;
}

export default function StandardsCurriculumDisplay({
  studentId,
  initialSubject = 'Mathematics',
  initialGrade = '5'
}: StandardsCurriculumDisplayProps) {
  const [subject, setSubject] = useState(initialSubject);
  const [grade, setGrade] = useState(initialGrade);
  const [standards, setStandards] = useState<Standard[]>([]);
  const [groupedStandards, setGroupedStandards] = useState<GroupedStandards>({});
  const [loading, setLoading] = useState(true);
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [completedStandards, setCompletedStandards] = useState<Set<number>>(new Set());
  const [practicingStandard, setPracticingStandard] = useState<Standard | null>(null);

  const subjects = [
    { value: 'Mathematics', label: 'Mathematics', code: 'math' },
    { value: 'English Language Arts', label: 'English', code: 'ela' },
    { value: 'Science', label: 'Science', code: 'science' },
    { value: 'Social Studies', label: 'Social Studies', code: 'social_studies' }
  ];

  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];

  useEffect(() => {
    loadStandards();
  }, [subject, grade]);

  useEffect(() => {
    loadCompletedStandards();
  }, [studentId]);

  const loadStandards = async () => {
    setLoading(true);
    try {
      const subjectCode = subjects.find(s => s.value === subject)?.code || 'math';
      
      console.log('Loading standards for:', { subject, subjectCode, grade });
      
      const { data, error } = await supabase
        .from('standards')
        .select('*')
        .eq('subject', subjectCode)
        .eq('grade', grade)
        .order('code', { ascending: true });

      if (error) {
        console.error('Error loading standards:', error);
        throw error;
      }

      console.log('Loaded standards:', data?.length || 0);
      setStandards(data || []);
      
      // Group by domain
      const grouped = (data || []).reduce((acc, standard) => {
        const domain = standard.domain || 'Uncategorized';
        if (!acc[domain]) {
          acc[domain] = [];
        }
        acc[domain].push(standard);
        return acc;
      }, {} as GroupedStandards);
      
      // Sort domains alphabetically, but put "Other" and "Uncategorized" at the end
      const sortedGrouped: GroupedStandards = {};
      Object.keys(grouped)
        .sort((a, b) => {
          if (a === 'Other' || a === 'Uncategorized') return 1;
          if (b === 'Other' || b === 'Uncategorized') return -1;
          return a.localeCompare(b);
        })
        .forEach(key => {
          sortedGrouped[key] = grouped[key];
        });
      
      setGroupedStandards(sortedGrouped);

      setGroupedStandards(grouped);
      
      // Auto-expand first domain
      if (Object.keys(grouped).length > 0) {
        setExpandedDomains(new Set([Object.keys(grouped)[0]]));
      }
    } catch (error) {
      console.error('Error loading standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedStandards = async () => {
    try {
      // Load student's practice history
      const { data, error } = await supabase
        .from('practice_sessions')
        .select('standard_id')
        .eq('student_id', studentId)
        .eq('mastery_level', 'mastered');

      if (error) throw error;

      const completed = new Set((data || []).map(d => d.standard_id));
      setCompletedStandards(completed);
    } catch (error) {
      console.error('Error loading completed standards:', error);
    }
  };

  const toggleDomain = (domain: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domain)) {
      newExpanded.delete(domain);
    } else {
      newExpanded.add(domain);
    }
    setExpandedDomains(newExpanded);
  };

  const handlePracticeStandard = (standard: Standard) => {
    setPracticingStandard(standard);
  };

  const handlePracticeComplete = () => {
    // Reload completed standards to update UI
    loadCompletedStandards();
    setPracticingStandard(null);
  };

  // If practicing a standard, show the practice session
  if (practicingStandard) {
    return (
      <StandardPracticeSession
        standard={practicingStandard}
        studentId={studentId}
        onComplete={handlePracticeComplete}
        onBack={() => setPracticingStandard(null)}
      />
    );
  }

  const getSkillCount = (domain: string) => {
    return groupedStandards[domain]?.length || 0;
  };

  const getCompletedCount = (domain: string) => {
    return groupedStandards[domain]?.filter(s => completedStandards.has(s.id)).length || 0;
  };

  const getDomainProgress = (domain: string) => {
    const total = getSkillCount(domain);
    const completed = getCompletedCount(domain);
    return total > 0 ? (completed / total) * 100 : 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subject Tabs */}
      <Tabs value={subject} onValueChange={setSubject}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          {subjects.map(s => (
            <TabsTrigger key={s.value} value={s.value}>
              {s.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Grade Selector */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-gray-700 flex items-center">
          Select Grade:
        </span>
        {grades.map(g => (
          <Button
            key={g}
            variant={grade === g ? 'default' : 'outline'}
            size="sm"
            onClick={() => setGrade(g)}
            className="min-w-[60px]"
          >
            {g === 'K' ? 'Pre-K' : `Grade ${g}`}
          </Button>
        ))}
      </div>

      {/* Standards Count */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {subject} • Grade {grade}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {standards.length} skills
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Your Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {completedStandards.size} completed
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domains with Standards */}
      <div className="space-y-4">
        {Object.entries(groupedStandards).map(([domain, domainStandards]) => {
          const isExpanded = expandedDomains.has(domain);
          const skillCount = getSkillCount(domain);
          const completedCount = getCompletedCount(domain);
          const progress = getDomainProgress(domain);

          return (
            <Card key={domain} className="overflow-hidden">
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleDomain(domain)}
              >
                <div className="flex items-center space-x-3 flex-1">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">
                      {domain}
                    </h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {skillCount} skills
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        {completedCount} completed
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <Progress value={progress} className="h-2" />
                  </div>
                  <Badge variant={progress === 100 ? 'default' : 'secondary'}>
                    {Math.round(progress)}%
                  </Badge>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-white">
                  <div className="p-4 space-y-2">
                    {domainStandards.map((standard, index) => {
                      const isCompleted = completedStandards.has(standard.id);
                      
                      return (
                        <div
                          key={standard.id}
                          className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                        >
                          <div className="flex items-center space-x-3 flex-1">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5" />
                            )}
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium text-gray-700">
                                  {index + 1}.
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {standard.code}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-900">
                                {standard.description}
                              </p>
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant={isCompleted ? 'outline' : 'default'}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePracticeStandard(standard);
                            }}
                          >
                            <Target className="h-4 w-4 mr-1" />
                            {isCompleted ? 'Review' : 'Practice'}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {standards.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              No standards found for {subject} - Grade {grade}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
