import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { FileText, BookOpen, PenTool, BarChart3, Download, Eye, Edit } from 'lucide-react';
import { EssayTemplates } from './templates/EssayTemplates';
import { ResearchPaperTemplates } from './templates/ResearchPaperTemplates';
import { CreativeWritingTemplates } from './templates/CreativeWritingTemplates';
import { ReportTemplates } from './templates/ReportTemplates';

interface Template {
  id: string;
  title: string;
  description: string;
  type: 'essay' | 'research' | 'creative' | 'report';
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  sections: number;
  tags: string[];
}

const templates: Template[] = [
  {
    id: 'persuasive-essay',
    title: 'Persuasive Essay',
    description: 'Structure for argumentative writing with claim, evidence, and counterarguments',
    type: 'essay',
    level: 'intermediate',
    estimatedTime: '45 mins',
    sections: 5,
    tags: ['argument', 'evidence', 'persuasion']
  },
  {
    id: 'research-paper',
    title: 'Research Paper',
    description: 'Academic paper format with citations, methodology, and analysis',
    type: 'research',
    level: 'advanced',
    estimatedTime: '2 hours',
    sections: 8,
    tags: ['academic', 'citations', 'analysis']
  },
  {
    id: 'short-story',
    title: 'Short Story',
    description: 'Creative narrative structure with character development and plot',
    type: 'creative',
    level: 'beginner',
    estimatedTime: '60 mins',
    sections: 6,
    tags: ['narrative', 'character', 'plot']
  },
  {
    id: 'lab-report',
    title: 'Lab Report',
    description: 'Scientific report format with hypothesis, methods, and conclusions',
    type: 'report',
    level: 'intermediate',
    estimatedTime: '90 mins',
    sections: 7,
    tags: ['scientific', 'data', 'analysis']
  }
];

export function WritingTemplatesLibrary() {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay': return <FileText className="w-4 h-4" />;
      case 'research': return <BookOpen className="w-4 h-4" />;
      case 'creative': return <PenTool className="w-4 h-4" />;
      case 'report': return <BarChart3 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Writing Templates Library</h1>
        <p className="text-gray-600">Choose from structured templates to guide your writing process</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="browse">Browse All</TabsTrigger>
          <TabsTrigger value="essay">Essays</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
          <TabsTrigger value="creative">Creative</TabsTrigger>
          <TabsTrigger value="report">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(template.type)}
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                    </div>
                    <Badge className={getLevelColor(template.level)}>
                      {template.level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{template.description}</p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-3">
                    <span>{template.sections} sections</span>
                    <span>{template.estimatedTime}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="essay">
          <EssayTemplates />
        </TabsContent>

        <TabsContent value="research">
          <ResearchPaperTemplates />
        </TabsContent>

        <TabsContent value="creative">
          <CreativeWritingTemplates />
        </TabsContent>

        <TabsContent value="report">
          <ReportTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}