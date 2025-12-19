'use client';

import React, { useState } from 'react';
import StandardsCurriculumDisplay from './StandardsCurriculumDisplay';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CurriculumBrowserProps {
  studentId: string;
  onLessonSelect?: (lessonId: string) => void;
}

export default function CurriculumBrowser({ studentId, onLessonSelect }: CurriculumBrowserProps) {
  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const [activeGrade, setActiveGrade] = useState('1');

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="pt-6">
          <h2 className="text-2xl font-bold mb-2">Curriculum Browser</h2>
          <p className="text-blue-100">
            Explore standards and skills organized by subject and grade level
          </p>
        </CardContent>
      </Card>

      <StandardsCurriculumDisplay
        studentId={studentId}
        initialSubject={activeSubject}
        initialGrade={activeGrade}
      />
    </div>
  );
}
