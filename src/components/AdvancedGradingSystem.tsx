import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Calculator, FileText, Users, TrendingUp, Star } from 'lucide-react';

interface RubricCriteria {
  id: string;
  name: string;
  weight: number;
  levels: { score: number; description: string }[];
}

interface GradingRubric {
  id: string;
  name: string;
  criteria: RubricCriteria[];
  totalPoints: number;
}

export function AdvancedGradingSystem() {
  const [selectedRubric, setSelectedRubric] = useState<GradingRubric | null>(null);
  const [grades, setGrades] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [curveSettings, setCurveSettings] = useState({ enabled: false, type: 'linear', adjustment: 0 });

  const mockRubrics: GradingRubric[] = [
    {
      id: '1',
      name: 'Essay Grading Rubric',
      totalPoints: 100,
      criteria: [
        {
          id: 'content',
          name: 'Content & Ideas',
          weight: 40,
          levels: [
            { score: 4, description: 'Exceptional: Clear, focused, engaging content' },
            { score: 3, description: 'Proficient: Well-developed ideas' },
            { score: 2, description: 'Developing: Basic ideas present' },
            { score: 1, description: 'Beginning: Limited ideas' }
          ]
        },
        {
          id: 'organization',
          name: 'Organization',
          weight: 30,
          levels: [
            { score: 4, description: 'Exceptional: Clear structure, smooth transitions' },
            { score: 3, description: 'Proficient: Well-organized, logical flow' },
            { score: 2, description: 'Developing: Some structure present' },
            { score: 1, description: 'Beginning: Limited structure' }
          ]
        },
        {
          id: 'conventions',
          name: 'Grammar & Conventions',
          weight: 30,
          levels: [
            { score: 4, description: 'Exceptional: Error-free, sophisticated language' },
            { score: 3, description: 'Proficient: Few errors, clear communication' },
            { score: 2, description: 'Developing: Some errors, mostly clear' },
            { score: 1, description: 'Beginning: Many errors interfere with meaning' }
          ]
        }
      ]
    }
  ];

  const mockStudents = [
    { id: '1', name: 'Alice Johnson', submission: 'Essay on Climate Change...' },
    { id: '2', name: 'Bob Smith', submission: 'Research Paper on AI...' },
    { id: '3', name: 'Carol Davis', submission: 'Analysis of Literature...' }
  ];

  const calculateGrade = (studentId: string) => {
    if (!selectedRubric) return 0;
    let totalScore = 0;
    let totalWeight = 0;

    selectedRubric.criteria.forEach(criteria => {
      const score = grades[`${studentId}-${criteria.id}`] || 0;
      totalScore += score * criteria.weight;
      totalWeight += criteria.weight;
    });

    return totalWeight > 0 ? (totalScore / totalWeight) * 25 : 0; // Convert to 100-point scale
  };

  const applyGradeCurve = (originalGrade: number) => {
    if (!curveSettings.enabled) return originalGrade;
    
    switch (curveSettings.type) {
      case 'linear':
        return Math.min(100, originalGrade + curveSettings.adjustment);
      case 'square-root':
        return Math.min(100, Math.sqrt(originalGrade) * 10);
      default:
        return originalGrade;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Advanced Grading System</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Grades
          </Button>
          <Button>
            <Users className="w-4 h-4 mr-2" />
            Bulk Grade
          </Button>
        </div>
      </div>

      <Tabs defaultValue="individual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="individual">Individual Grading</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Grading</TabsTrigger>
          <TabsTrigger value="rubrics">Rubric Builder</TabsTrigger>
          <TabsTrigger value="curves">Grade Curves</TabsTrigger>
          <TabsTrigger value="analytics">Grade Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rubric Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Rubric</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {mockRubrics.map(rubric => (
                    <Button
                      key={rubric.id}
                      variant={selectedRubric?.id === rubric.id ? "default" : "outline"}
                      className="w-full justify-start"
                      onClick={() => setSelectedRubric(rubric)}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {rubric.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Student List */}
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockStudents.map(student => {
                    const grade = calculateGrade(student.id);
                    const curvedGrade = applyGradeCurve(grade);
                    return (
                      <div key={student.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium">{student.name}</h4>
                          <Badge variant={curvedGrade >= 80 ? "default" : "secondary"}>
                            {curvedGrade.toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress value={curvedGrade} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Grading Interface */}
            {selectedRubric && (
              <Card>
                <CardHeader>
                  <CardTitle>Grade with Rubric</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedRubric.criteria.map(criteria => (
                      <div key={criteria.id} className="space-y-2">
                        <h4 className="font-medium">{criteria.name} ({criteria.weight}%)</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {criteria.levels.map(level => (
                            <Button
                              key={level.score}
                              size="sm"
                              variant="outline"
                              className="h-auto p-2 text-left"
                              onClick={() => setGrades(prev => ({
                                ...prev,
                                [`1-${criteria.id}`]: level.score
                              }))}
                            >
                              <div>
                                <div className="font-medium">{level.score}/4</div>
                                <div className="text-xs text-gray-600">{level.description}</div>
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Feedback</h4>
                      <Textarea
                        placeholder="Enter detailed feedback..."
                        value={feedback['1'] || ''}
                        onChange={(e) => setFeedback(prev => ({ ...prev, '1': e.target.value }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="curves" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Grade Curve Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={curveSettings.enabled}
                  onChange={(e) => setCurveSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                />
                <label>Enable Grade Curve</label>
              </div>
              
              {curveSettings.enabled && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Curve Type</label>
                    <select
                      value={curveSettings.type}
                      onChange={(e) => setCurveSettings(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border rounded"
                    >
                      <option value="linear">Linear Adjustment</option>
                      <option value="square-root">Square Root Curve</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Adjustment (+/-)</label>
                    <Input
                      type="number"
                      value={curveSettings.adjustment}
                      onChange={(e) => setCurveSettings(prev => ({ ...prev, adjustment: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}