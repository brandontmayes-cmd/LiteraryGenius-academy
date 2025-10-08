import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Search,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PlagiarismReport {
  originality_score: number;
  plagiarism_risk: 'low' | 'medium' | 'high';
  similarity_percentage: number;
  flagged_sections: Array<{
    text: string;
    reason: string;
    confidence: number;
  }>;
  analysis: {
    writing_style: string;
    vocabulary_complexity: string;
    sentence_structure: string;
  };
  recommendations: string[];
  detailed_report: string;
}

interface PlagiarismCheckerProps {
  assignmentId?: string;
  studentId?: string;
  onReportGenerated?: (report: PlagiarismReport) => void;
}

export default function PlagiarismChecker({ 
  assignmentId, 
  studentId, 
  onReportGenerated 
}: PlagiarismCheckerProps) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<PlagiarismReport | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleCheck = async () => {
    if (!text.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('plagiarism-checker', {
        body: {
          text: text.trim(),
          assignmentId,
          studentId
        }
      });

      if (error) throw error;

      if (data.success) {
        setReport(data.data);
        onReportGenerated?.(data.data);
      }
    } catch (error) {
      console.error('Error checking plagiarism:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'medium': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'high': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5" />;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>AI Plagiarism Checker</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your text here to check for plagiarism..."
            className="min-h-[200px]"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {text.length} characters
            </span>
            <Button 
              onClick={handleCheck}
              disabled={!text.trim() || loading}
              className="flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Search className="h-4 w-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  <span>Check Plagiarism</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <div className="space-y-6">
          {/* Overall Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Plagiarism Analysis Results</span>
                {getRiskIcon(report.plagiarism_risk)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {report.originality_score}%
                  </div>
                  <p className="text-sm text-gray-600">Originality Score</p>
                </div>
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${getRiskColor(report.plagiarism_risk)}`}>
                    {report.similarity_percentage}%
                  </div>
                  <p className="text-sm text-gray-600">Similarity Found</p>
                </div>
                <div className="text-center">
                  <Badge 
                    variant={report.plagiarism_risk === 'low' ? 'secondary' : 
                            report.plagiarism_risk === 'medium' ? 'outline' : 'destructive'}
                    className="text-lg px-4 py-2"
                  >
                    {report.plagiarism_risk.toUpperCase()} RISK
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Originality</span>
                  <span>{report.originality_score}%</span>
                </div>
                <Progress value={report.originality_score} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Flagged Sections */}
          {report.flagged_sections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <span>Flagged Sections ({report.flagged_sections.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {report.flagged_sections.map((section, index) => (
                  <Alert key={index} className="border-orange-200">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">"{section.text}"</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">{section.reason}</span>
                          <Badge variant="outline">
                            {section.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Writing Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Writing Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Writing Style</h4>
                  <p className="text-sm text-gray-600">{report.analysis.writing_style}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Vocabulary</h4>
                  <p className="text-sm text-gray-600">{report.analysis.vocabulary_complexity}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sentence Structure</h4>
                  <p className="text-sm text-gray-600">{report.analysis.sentence_structure}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {report.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Detailed Report */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Detailed Analysis Report</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                  className="flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>{showDetails ? 'Hide' : 'Show'} Details</span>
                </Button>
              </CardTitle>
            </CardHeader>
            {showDetails && (
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {report.detailed_report}
                  </pre>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}