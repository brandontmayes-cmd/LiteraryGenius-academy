import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, BookOpen, Calculator, Microscope, Globe, ArrowRight } from 'lucide-react';

interface MultiSubjectPath {
  subjects: Array<{
    name: string;
    activities: Array<{
      title: string;
      type: string;
      difficulty: number;
      crossCurricular: string[];
    }>;
  }>;
  crossCurricularActivities: Array<{
    title: string;
    subjects: string[];
    description: string;
  }>;
  reasoning: string;
}

interface Props {
  studentId: string;
}

export default function MultiSubjectLearningPath({ studentId }: Props) {
  const [path, setPath] = useState<MultiSubjectPath | null>(null);
  const [loading, setLoading] = useState(false);

  const generatePath = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setPath({
        subjects: [
          {
            name: 'Mathematics',
            activities: [
              { title: 'Fraction Operations', type: 'lesson', difficulty: 3, crossCurricular: ['Science'] },
              { title: 'Data Analysis Project', type: 'project', difficulty: 4, crossCurricular: ['Social Studies'] }
            ]
          },
          {
            name: 'Science',
            activities: [
              { title: 'Measurement Lab', type: 'experiment', difficulty: 3, crossCurricular: ['Math'] },
              { title: 'Weather Patterns', type: 'research', difficulty: 2, crossCurricular: ['Social Studies'] }
            ]
          }
        ],
        crossCurricularActivities: [
          {
            title: 'Climate Change Data Analysis',
            subjects: ['Math', 'Science', 'Social Studies'],
            description: 'Analyze temperature data using statistical methods'
          }
        ],
        reasoning: 'Path designed to strengthen math skills while connecting to real-world science applications.'
      });
      setLoading(false);
    }, 2000);
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject.toLowerCase()) {
      case 'mathematics': return <Calculator className="w-4 h-4" />;
      case 'science': return <Microscope className="w-4 h-4" />;
      case 'social studies': return <Globe className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Multi-Subject Learning Path
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={generatePath} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Multi-Subject Path'}
          </Button>
        </CardContent>
      </Card>

      {path && (
        <Tabs defaultValue="subjects" className="space-y-4">
          <TabsList>
            <TabsTrigger value="subjects">Subject Paths</TabsTrigger>
            <TabsTrigger value="cross-curricular">Cross-Curricular</TabsTrigger>
          </TabsList>

          <TabsContent value="subjects" className="space-y-4">
            {path.subjects.map((subject, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getSubjectIcon(subject.name)}
                    {subject.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subject.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{activity.type}</Badge>
                            <Badge variant="secondary">Level {activity.difficulty}</Badge>
                            {activity.crossCurricular.length > 0 && (
                              <Badge className="bg-green-100 text-green-800">
                                Connects to: {activity.crossCurricular.join(', ')}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="cross-curricular" className="space-y-4">
            {path.crossCurricularActivities.map((activity, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{activity.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{activity.description}</p>
                  <div className="flex gap-2">
                    {activity.subjects.map((subject, subIndex) => (
                      <Badge key={subIndex} className="bg-purple-100 text-purple-800">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}