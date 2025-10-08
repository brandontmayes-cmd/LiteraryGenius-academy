import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Upload
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface SimilarityReport {
  originality_score: number;
  similarity_percentage: number;
  plagiarism_risk: 'low' | 'medium' | 'high';
  sources: Array<{
    url: string;
    title: string;
    similarity: number;
    matched_text: string;
  }>;
  flagged_sections: Array<{
    text: string;
    source: string;
    confidence: number;
  }>;
  recommendations: string[];
}

export function PlagiarismDetectionSystem() {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<SimilarityReport | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      const reader = new FileReader();
      reader.onload = (e) => setText(e.target?.result as string);
      reader.readAsText(uploadedFile);
    }
  };

  const checkPlagiarism = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('plagiarism-checker', {
        body: { text: text.trim() }
      });
      if (data?.success) setReport(data.data);
    } catch (error) {
      console.error('Plagiarism check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span>Comprehensive Plagiarism Detection</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="text" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Text Input</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
            </TabsList>
            <TabsContent value="text" className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your essay or document here..."
                className="min-h-[300px]"
              />
            </TabsContent>
            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <input
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Button variant="outline">Upload Document</Button>
                </label>
                {file && <p className="mt-2 text-sm text-gray-600">{file.name}</p>}
              </div>
            </TabsContent>
          </Tabs>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{text.length} characters</span>
            <Button onClick={checkPlagiarism} disabled={!text.trim() || loading}>
              {loading ? 'Analyzing...' : 'Check for Plagiarism'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {report && (
        <Tabs defaultValue="report" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="report">Similarity Report</TabsTrigger>
            <TabsTrigger value="sources">Source Citations</TabsTrigger>
            <TabsTrigger value="guidance">Academic Integrity</TabsTrigger>
            <TabsTrigger value="recommendations">Improvements</TabsTrigger>
          </TabsList>

          <TabsContent value="report" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Plagiarism Analysis Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {report.originality_score}%
                    </div>
                    <p className="text-sm text-gray-600">Original Content</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {report.similarity_percentage}%
                    </div>
                    <p className="text-sm text-gray-600">Similar Content</p>
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
                
                {report.flagged_sections.map((section, index) => (
                  <Alert key={index} className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <p className="font-medium">Potential Match Found</p>
                        <p className="text-sm bg-yellow-50 p-2 rounded">"{section.text}"</p>
                        <div className="flex justify-between text-xs text-gray-600">
                          <span>Source: {section.source}</span>
                          <span>{section.confidence}% confidence</span>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Source Citations & References</CardTitle>
              </CardHeader>
              <CardContent>
                {report.sources.map((source, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 mb-4">
                    <h4 className="font-medium text-blue-700">{source.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{source.url}</p>
                    <div className="bg-gray-50 p-3 rounded text-sm">
                      <p className="mb-2"><strong>Matched Text:</strong></p>
                      <p className="italic">"{source.matched_text}"</p>
                      <div className="mt-2 flex justify-between">
                        <span>Similarity: {source.similarity}%</span>
                        <Button size="sm" variant="outline">Generate Citation</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guidance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Academic Integrity Guidelines</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    <h4 className="font-medium mb-2">What is Plagiarism?</h4>
                    <p className="text-sm">Plagiarism is using someone else's words, ideas, or work without proper attribution. This includes copying text, paraphrasing without citation, and self-plagiarism.</p>
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">✓ Good Practices</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Always cite your sources</li>
                      <li>• Use quotation marks for direct quotes</li>
                      <li>• Paraphrase in your own words</li>
                      <li>• Keep detailed research notes</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h4 className="font-medium text-red-800 mb-2">✗ Avoid These</h4>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Copying without attribution</li>
                      <li>• Buying or sharing papers</li>
                      <li>• Improper paraphrasing</li>
                      <li>• Missing citations</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Improvement Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {report.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <p className="text-sm text-blue-800">{rec}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Next Steps</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>1. Review flagged sections and add proper citations</li>
                    <li>2. Paraphrase content in your own words</li>
                    <li>3. Ensure all sources are properly referenced</li>
                    <li>4. Run another plagiarism check before submission</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}