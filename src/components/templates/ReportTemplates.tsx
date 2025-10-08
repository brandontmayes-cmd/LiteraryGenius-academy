import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { BarChart3, FileText, TrendingUp, PieChart, Target } from 'lucide-react';

interface ReportSection {
  title: string;
  description: string;
  guidelines: string[];
  wordCount: string;
  includesData: boolean;
}

const labReportStructure: ReportSection[] = [
  {
    title: 'Title & Abstract',
    description: 'Clear title and summary of the experiment',
    guidelines: [
      'Create a descriptive title that explains what was studied',
      'Write a brief abstract summarizing purpose, methods, and key findings',
      'Keep abstract under 200 words'
    ],
    wordCount: '150-200 words',
    includesData: false
  },
  {
    title: 'Introduction',
    description: 'Background information and hypothesis',
    guidelines: [
      'Provide scientific background on the topic',
      'State your hypothesis clearly',
      'Explain why this experiment is important'
    ],
    wordCount: '200-300 words',
    includesData: false
  },
  {
    title: 'Materials & Methods',
    description: 'Detailed procedure and materials used',
    guidelines: [
      'List all materials and equipment used',
      'Describe the procedure step-by-step',
      'Include enough detail for replication'
    ],
    wordCount: '250-400 words',
    includesData: false
  },
  {
    title: 'Results',
    description: 'Present data and observations objectively',
    guidelines: [
      'Present data in tables, graphs, or charts',
      'Describe observations without interpretation',
      'Include all relevant measurements and calculations'
    ],
    wordCount: '200-350 words',
    includesData: true
  },
  {
    title: 'Discussion',
    description: 'Analyze results and draw conclusions',
    guidelines: [
      'Interpret your results and explain their significance',
      'Compare results to your hypothesis',
      'Discuss sources of error and limitations'
    ],
    wordCount: '300-500 words',
    includesData: false
  },
  {
    title: 'Conclusion',
    description: 'Summarize findings and implications',
    guidelines: [
      'Restate your main findings',
      'Explain whether your hypothesis was supported',
      'Suggest areas for future research'
    ],
    wordCount: '150-250 words',
    includesData: false
  }
];

const reportTypes = [
  { name: 'Lab Report', icon: <BarChart3 className="w-5 h-5" />, description: 'Scientific experiment documentation' },
  { name: 'Business Report', icon: <TrendingUp className="w-5 h-5" />, description: 'Professional business analysis' },
  { name: 'Technical Report', icon: <FileText className="w-5 h-5" />, description: 'Technical analysis and recommendations' },
  { name: 'Progress Report', icon: <Target className="w-5 h-5" />, description: 'Project status and milestone tracking' },
  { name: 'Data Analysis', icon: <PieChart className="w-5 h-5" />, description: 'Statistical analysis and interpretation' }
];

export function ReportTemplates() {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionContent, setSectionContent] = useState<{[key: number]: string}>({});
  const [selectedType, setSelectedType] = useState(reportTypes[0]);
  const [dataPoints, setDataPoints] = useState<string[]>([]);

  const addDataPoint = () => {
    setDataPoints([...dataPoints, '']);
  };

  const updateDataPoint = (index: number, value: string) => {
    const updated = [...dataPoints];
    updated[index] = value;
    setDataPoints(updated);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {reportTypes.map((type, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedType.name === type.name ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => setSelectedType(type)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                {type.icon}
                <span className="ml-2">{type.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-xs">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {labReportStructure.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === index 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{section.title}</span>
                      {section.includesData && (
                        <BarChart3 className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {section.wordCount}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{labReportStructure[activeSection]?.title}</CardTitle>
              <p className="text-gray-600">{labReportStructure[activeSection]?.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Guidelines:</h4>
                <ul className="space-y-2">
                  {labReportStructure[activeSection]?.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {labReportStructure[activeSection]?.includesData && (
                <div>
                  <h4 className="font-semibold mb-2">Data Entry:</h4>
                  <div className="space-y-2">
                    {dataPoints.map((point, index) => (
                      <Input
                        key={index}
                        placeholder={`Data point ${index + 1}`}
                        value={point}
                        onChange={(e) => updateDataPoint(index, e.target.value)}
                      />
                    ))}
                    <Button size="sm" onClick={addDataPoint} variant="outline">
                      Add Data Point
                    </Button>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Content:</h4>
                <Textarea
                  placeholder={`Write your ${labReportStructure[activeSection]?.title.toLowerCase()} here...`}
                  value={sectionContent[activeSection] || ''}
                  onChange={(e) => setSectionContent({
                    ...sectionContent,
                    [activeSection]: e.target.value
                  })}
                  className="min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Report Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Report Type:</h4>
                <Badge className="bg-green-100 text-green-800">
                  {selectedType.name}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Word Count:</h4>
                <div className="text-2xl font-bold text-green-600">
                  {sectionContent[activeSection]?.split(' ').length || 0}
                </div>
                <div className="text-sm text-gray-600">words</div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Progress:</h4>
                <div className="space-y-1">
                  {labReportStructure.map((section, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{section.title}</span>
                      <Badge variant={sectionContent[index] ? "default" : "outline"}>
                        {sectionContent[index] ? "Done" : "Todo"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Actions:</h4>
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full">
                    Generate Chart
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Export PDF
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Save Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}