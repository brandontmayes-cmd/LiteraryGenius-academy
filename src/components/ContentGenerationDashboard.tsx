// File: src/components/ContentGenerationDashboard.tsx
// Admin dashboard to monitor and control the content generation agent

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  CheckCircle, 
  XCircle, 
  Clock, 
  PlayCircle, 
  RefreshCw,
  TrendingUp,
  FileText,
  Calendar
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GenerationLog {
  id: string;
  run_date: string;
  status: string;
  items_generated: number;
  error_message?: string;
  execution_time_ms: number;
  metadata?: any;
}

interface ContentStats {
  total_items: number;
  by_type: { [key: string]: number };
  by_grade: { [key: string]: number };
  this_week: number;
}

export const ContentGenerationDashboard: React.FC = () => {
  const [logs, setLogs] = useState<GenerationLog[]>([]);
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRun, setLastRun] = useState<GenerationLog | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Load generation logs
    const { data: logsData } = await supabase
      .from('content_generation_log')
      .select('*')
      .order('run_date', { ascending: false })
      .limit(10);

    if (logsData && logsData.length > 0) {
      setLogs(logsData);
      setLastRun(logsData[0]);
    }

    // Load content stats
    const { data: contentData } = await supabase
      .from('ai_generated_content')
      .select('content_type, grade_level, generated_at');

    if (contentData) {
      const byType: { [key: string]: number } = {};
      const byGrade: { [key: string]: number } = {};
      let thisWeek = 0;
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      contentData.forEach((item) => {
        byType[item.content_type] = (byType[item.content_type] || 0) + 1;
        byGrade[item.grade_level] = (byGrade[item.grade_level] || 0) + 1;
        if (new Date(item.generated_at) > oneWeekAgo) thisWeek++;
      });

      setStats({
        total_items: contentData.length,
        by_type: byType,
        by_grade: byGrade,
        this_week: thisWeek,
      });
    }
  };

  const triggerGeneration = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/cron/generate-content', {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(`✅ Success! Generated ${result.items_generated} items in ${(result.execution_time_ms / 1000).toFixed(1)}s`);
      } else {
        alert(`❌ Error: ${result.error}`);
      }
      
      // Reload data
      await loadData();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50';
      case 'partial': return 'text-yellow-600 bg-yellow-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'partial': return <Clock className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="w-8 h-8 text-blue-500" />
            Content Generation Agent
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor and control your automated content generation
          </p>
        </div>
        <Button
          onClick={triggerGeneration}
          disabled={isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <PlayCircle className="w-4 h-4" />
              Run Now
            </>
          )}
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Last Run Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Last Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            {lastRun ? (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(lastRun.status)}>
                    {getStatusIcon(lastRun.status)}
                    <span className="ml-1">{lastRun.status}</span>
                  </Badge>
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(lastRun.run_date).toLocaleString()}
                </p>
                <p className="text-2xl font-bold mt-2">
                  {lastRun.items_generated} items
                </p>
              </>
            ) : (
              <p className="text-gray-400">No runs yet</p>
            )}
          </CardContent>
        </Card>

        {/* Total Content */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <p className="text-2xl font-bold">
                {stats?.total_items || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Generated items in database
            </p>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-2xl font-bold">
                {stats?.this_week || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Generated in last 7 days
            </p>
          </CardContent>
        </Card>

        {/* Next Run */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Next Scheduled Run
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <p className="text-lg font-bold">
                Sunday 9 PM
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Automatic weekly generation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By Type */}
        <Card>
          <CardHeader>
            <CardTitle>Content by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.by_type && Object.keys(stats.by_type).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.by_type).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No content yet</p>
            )}
          </CardContent>
        </Card>

        {/* By Grade */}
        <Card>
          <CardHeader>
            <CardTitle>Content by Grade</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.by_grade && Object.keys(stats.by_grade).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(stats.by_grade)
                  .sort(([a], [b]) => {
                    if (a === 'K') return -1;
                    if (b === 'K') return 1;
                    return parseInt(a) - parseInt(b);
                  })
                  .map(([grade, count]) => (
                    <div key={grade} className="flex items-center justify-between">
                      <span className="text-sm">Grade {grade}</span>
                      <Badge variant="secondary">{count}</Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-400">No content yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Generation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Generation History
            <Button variant="outline" size="sm" onClick={loadData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(log.status)}>
                        {getStatusIcon(log.status)}
                      </Badge>
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(log.run_date).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {log.items_generated} items • {(log.execution_time_ms / 1000).toFixed(1)}s
                        </p>
                        {log.error_message && (
                          <p className="text-xs text-red-600 mt-1">
                            {log.error_message}
                          </p>
                        )}
                      </div>
                    </div>
                    {log.metadata?.week_number && (
                      <Badge variant="outline">
                        Week {log.metadata.week_number}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No generation history yet</p>
                <p className="text-sm mt-1">Click "Run Now" to start</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
