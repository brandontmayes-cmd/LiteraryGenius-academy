import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PracticeEngine from './PracticeEngine';

interface StandardsPracticeDashboardProps {
  studentId: string;
  gradeLevel: string;
  subject: string;
}

export default function StandardsPracticeDashboard({
  studentId,
  gradeLevel,
  subject
}: StandardsPracticeDashboardProps) {
  const [standards, setStandards] = useState<any[]>([]);
  const [selectedStandard, setSelectedStandard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandards();
  }, [gradeLevel, subject]);

  const fetchStandards = async () => {
    setLoading(true);
    try {
      const { data: standardsData, error } = await supabase
        .from('common_core_standards')
        .select('*')
        .eq('grade_level', gradeLevel)
        .eq('subject', subject)
        .order('code');

      if (error) throw error;

      const standardIds = standardsData?.map(s => s.id) || [];
      const { data: masteryData } = await supabase
        .from('student_standards_mastery')
        .select('*')
        .eq('student_id', studentId)
        .in('standard_id', standardIds);

      const masteryMap = new Map(masteryData?.map(m => [m.standard_id, m]) || []);
      
      const enriched = standardsData?.map(standard => ({
        ...standard,
        mastery: masteryMap.get(standard.id)
      })) || [];

      setStandards(enriched);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  if (selectedStandard) {
    return (
      <div className="space-y-4">
        <Button onClick={() => setSelectedStandard(null)} variant="outline">
          ← Back to Standards
        </Button>
        <PracticeEngine
          standardId={selectedStandard.id}
          standardCode={selectedStandard.code}
          standardDescription={selectedStandard.description}
          studentId={studentId}
          onComplete={() => {
            setSelectedStandard(null);
            fetchStandards();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6" />
            {subject} Standards - Grade {gradeLevel}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Practice unlimited questions for each standard. Master each skill at your own pace!
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {standards.map(standard => {
          const masteryLevel = standard.mastery?.mastery_level || 0;
          const practiceCount = standard.mastery?.practice_count || 0;
          
          return (
            <Card key={standard.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{standard.code}</Badge>
                      {masteryLevel >= 80 && (
                        <Trophy className="h-5 w-5 text-yellow-500" />
                      )}
                    </div>
                    <h3 className="font-semibold">{standard.description}</h3>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Mastery Level</span>
                        <span className="font-medium">{masteryLevel}%</span>
                      </div>
                      <Progress value={masteryLevel} className="h-2" />
                      <p className="text-xs text-gray-500">
                        {practiceCount} practice session{practiceCount !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                  </div>
                  
                  <Button onClick={() => setSelectedStandard(standard)} className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Practice
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
