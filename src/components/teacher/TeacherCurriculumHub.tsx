import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import CustomLessonCreator from './CustomLessonCreator';
import LessonAssignmentTool from './LessonAssignmentTool';
import ClassCurriculumProgress from './ClassCurriculumProgress';
import CustomDiagnosticTestCreator from './CustomDiagnosticTestCreator';
import CurriculumPlanningCalendar from './CurriculumPlanningCalendar';
import { BookOpen, Send, BarChart3, FileText, Calendar } from 'lucide-react';

export default function TeacherCurriculumHub() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Curriculum Management</h1>
        <p className="text-gray-600">Create, assign, and track curriculum across your classes</p>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Progress
          </TabsTrigger>
          <TabsTrigger value="assign" className="flex items-center gap-2">
            <Send className="w-4 h-4" /> Assign
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Create Lesson
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Create Test
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          <ClassCurriculumProgress />
        </TabsContent>

        <TabsContent value="assign">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Assign Lessons</h2>
            <LessonAssignmentTool />
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create Custom Lesson</h2>
            <CustomLessonCreator />
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create Diagnostic Test</h2>
            <CustomDiagnosticTestCreator />
          </Card>
        </TabsContent>

        <TabsContent value="calendar">
          <CurriculumPlanningCalendar />
        </TabsContent>
      </Tabs>
    </div>
  );
}