import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Clock, Award } from 'lucide-react';

interface WritingSession {
  date: string;
  wordsWritten: number;
  timeSpent: number;
  grammarScore: number;
  readabilityScore: number;
}

interface WritingGoal {
  type: 'daily' | 'weekly' | 'project';
  target: number;
  current: number;
  unit: 'words' | 'minutes' | 'assignments';
  deadline?: string;
}

export const WritingProgressTracker: React.FC = () => {
  const recentSessions: WritingSession[] = [
    {
      date: '2024-01-15',
      wordsWritten: 450,
      timeSpent: 35,
      grammarScore: 92,
      readabilityScore: 78
    },
    {
      date: '2024-01-14',
      wordsWritten: 320,
      timeSpent: 28,
      grammarScore: 88,
      readabilityScore: 82
    },
    {
      date: '2024-01-13',
      wordsWritten: 580,
      timeSpent: 42,
      grammarScore: 95,
      readabilityScore: 85
    }
  ];

  const goals: WritingGoal[] = [
    {
      type: 'daily',
      target: 500,
      current: 450,
      unit: 'words'
    },
    {
      type: 'weekly',
      target: 3000,
      current: 2150,
      unit: 'words'
    },
    {
      type: 'project',
      target: 5,
      current: 3,
      unit: 'assignments',
      deadline: '2024-01-30'
    }
  ];

  const totalWordsThisWeek = recentSessions.reduce((sum, session) => sum + session.wordsWritten, 0);
  const averageGrammarScore = recentSessions.reduce((sum, session) => sum + session.grammarScore, 0) / recentSessions.length;
  const averageReadabilityScore = recentSessions.reduce((sum, session) => sum + session.readabilityScore, 0) / recentSessions.length;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Words This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWordsThisWeek}</div>
            <p className="text-xs text-muted-foreground">+12% from last week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grammar Score</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrammarScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Average this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readability</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageReadabilityScore.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Average score</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Writing Goals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {goals.map((goal, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {goal.type}
                  </Badge>
                  <span className="text-sm font-medium">
                    {goal.target} {goal.unit}
                  </span>
                  {goal.deadline && (
                    <span className="text-xs text-muted-foreground">
                      Due: {new Date(goal.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {goal.current} / {goal.target}
                </span>
              </div>
              <Progress value={(goal.current / goal.target) * 100} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Writing Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentSessions.map((session, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">
                    {new Date(session.date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.wordsWritten} words • {session.timeSpent} minutes
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={session.grammarScore >= 90 ? "default" : "secondary"}>
                    Grammar: {session.grammarScore}%
                  </Badge>
                  <Badge variant={session.readabilityScore >= 80 ? "default" : "secondary"}>
                    Readability: {session.readabilityScore}%
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};