import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BookOpen, Edit, Save, X } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  assignments: { [key: string]: number | null };
  average: number;
}

interface Assignment {
  id: string;
  title: string;
  points: number;
  due_date: string;
}

export const TeacherGradebook: React.FC = () => {
  const [editingCell, setEditingCell] = useState<{ studentId: string; assignmentId: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const assignments: Assignment[] = [
    { id: '1', title: 'Fractions Quiz', points: 100, due_date: '2024-01-20' },
    { id: '2', title: 'Geometry Project', points: 150, due_date: '2024-01-25' },
    { id: '3', title: 'Word Problems', points: 100, due_date: '2024-01-30' }
  ];

  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'Emma Wilson',
      assignments: { '1': 95, '2': 88, '3': null },
      average: 91.5
    },
    {
      id: '2',
      name: 'Liam Johnson',
      assignments: { '1': 87, '2': 92, '3': null },
      average: 89.5
    },
    {
      id: '3',
      name: 'Sophia Davis',
      assignments: { '1': 98, '2': 95, '3': null },
      average: 96.5
    }
  ]);

  const handleEditStart = (studentId: string, assignmentId: string, currentValue: number | null) => {
    setEditingCell({ studentId, assignmentId });
    setEditValue(currentValue?.toString() || '');
  };

  const handleEditSave = () => {
    if (!editingCell) return;
    
    const newValue = editValue === '' ? null : parseInt(editValue);
    setStudents(prev => prev.map(student => {
      if (student.id === editingCell.studentId) {
        const newAssignments = { ...student.assignments, [editingCell.assignmentId]: newValue };
        const scores = Object.values(newAssignments).filter(score => score !== null) as number[];
        const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        
        return { ...student, assignments: newAssignments, average };
      }
      return student;
    }));
    
    setEditingCell(null);
    setEditValue('');
  };

  const handleEditCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getGradeColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 text-gray-400';
    if (score >= 90) return 'bg-green-100 text-green-800';
    if (score >= 80) return 'bg-blue-100 text-blue-800';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Gradebook - 5th Grade Math
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48">Student Name</TableHead>
                {assignments.map(assignment => (
                  <TableHead key={assignment.id} className="text-center min-w-32">
                    <div className="space-y-1">
                      <div className="font-medium">{assignment.title}</div>
                      <div className="text-xs text-gray-500">{assignment.points} pts</div>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center">Average</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map(student => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  {assignments.map(assignment => {
                    const score = student.assignments[assignment.id];
                    const isEditing = editingCell?.studentId === student.id && editingCell?.assignmentId === assignment.id;
                    
                    return (
                      <TableCell key={assignment.id} className="text-center">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              className="w-16 h-8 text-center"
                              min="0"
                              max={assignment.points}
                            />
                            <Button size="sm" variant="ghost" onClick={handleEditSave}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded cursor-pointer ${getGradeColor(score)}`}
                            onClick={() => handleEditStart(student.id, assignment.id, score)}
                          >
                            <span>{score ?? '-'}</span>
                            <Edit className="h-3 w-3" />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center">
                    <Badge variant={student.average >= 90 ? 'default' : student.average >= 80 ? 'secondary' : 'destructive'}>
                      {student.average.toFixed(1)}%
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};