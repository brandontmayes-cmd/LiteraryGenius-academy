import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { BookOpen, Search, FileText, BarChart3 } from 'lucide-react';

interface ResearchSection {
  title: string;
  description: string;
  guidelines: string[];
  wordCount: string;
  citationStyle: string;
}

const researchPaperStructure: ResearchSection[] = [
  {
    title: 'Title Page',
    description: 'Professional title page with all required information',
    guidelines: [
      'Include full title, your name, institution, and date',
      'Follow APA/MLA formatting guidelines',
      'Center all information on the page'
    ],
    wordCount: 'N/A',
    citationStyle: 'APA/MLA'
  },
  {
    title: 'Abstract',
    description: 'Concise summary of your entire research paper',
    guidelines: [
      'Summarize your research question and methodology',
      'Include key findings and conclusions',
      'Write this section last, after completing the paper'
    ],
    wordCount: '150-250 words',
    citationStyle: 'No citations needed'
  },
  {
    title: 'Introduction',
    description: 'Introduce your topic and research question',
    guidelines: [
      'Provide background context on your research topic',
      'State your research question or thesis clearly',
      'Outline the structure of your paper'
    ],
    wordCount: '300-500 words',
    citationStyle: 'Include background sources'
  },
  {
    title: 'Literature Review',
    description: 'Review existing research on your topic',
    guidelines: [
      'Summarize relevant studies and their findings',
      'Identify gaps in current research',
      'Show how your research fits into the existing body of knowledge'
    ],
    wordCount: '500-800 words',
    citationStyle: 'Heavy citation required'
  },
  {
    title: 'Methodology',
    description: 'Explain how you conducted your research',
    guidelines: [
      'Describe your research methods and approach',
      'Explain why you chose these methods',
      'Include details about data collection and analysis'
    ],
    wordCount: '400-600 words',
    citationStyle: 'Cite methodological sources'
  },
  {
    title: 'Results/Findings',
    description: 'Present your research findings objectively',
    guidelines: [
      'Present data clearly with tables, charts, or graphs',
      'Report findings without interpretation',
      'Use subheadings to organize different types of results'
    ],
    wordCount: '400-700 words',
    citationStyle: 'Minimal citations'
  },
  {
    title: 'Discussion',
    description: 'Interpret your findings and their significance',
    guidelines: [
      'Explain what your findings mean',
      'Connect results back to your research question',
      'Discuss limitations and areas for future research'
    ],
    wordCount: '500-800 words',
    citationStyle: 'Compare with other studies'
  },
  {
    title: 'Conclusion',
    description: 'Summarize key points and implications',
    guidelines: [
      'Restate your research question and main findings',
      'Discuss broader implications of your research',
      'Suggest areas for future investigation'
    ],
    wordCount: '200-400 words',
    citationStyle: 'Minimal citations'
  }
];

export function ResearchPaperTemplates() {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionContent, setSectionContent] = useState<{[key: number]: string}>({});
  const [citations, setCitations] = useState<string[]>([]);

  const paperTypes = [
    { name: 'Scientific Research', icon: <BarChart3 className="w-5 h-5" />, description: 'Empirical research with data analysis' },
    { name: 'Literature Review', icon: <BookOpen className="w-5 h-5" />, description: 'Analysis of existing research' },
    { name: 'Case Study', icon: <Search className="w-5 h-5" />, description: 'In-depth analysis of specific cases' },
    { name: 'Theoretical Paper', icon: <FileText className="w-5 h-5" />, description: 'Conceptual analysis and theory development' }
  ];

  const citationFormats = [
    { style: 'APA', example: 'Smith, J. (2023). Research methods. Academic Press.' },
    { style: 'MLA', example: 'Smith, John. Research Methods. Academic Press, 2023.' },
    { style: 'Chicago', example: 'Smith, John. Research Methods. Academic Press, 2023.' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {paperTypes.map((type, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                {type.icon}
                <span className="ml-2">{type.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">{type.description}</p>
              <Button size="sm" className="w-full">
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Paper Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {researchPaperStructure.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === index 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">{section.title}</div>
                    <div className="text-sm text-gray-600 mt-1">
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
              <CardTitle>{researchPaperStructure[activeSection]?.title}</CardTitle>
              <p className="text-gray-600">{researchPaperStructure[activeSection]?.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Guidelines:</h4>
                <ul className="space-y-2">
                  {researchPaperStructure[activeSection]?.guidelines.map((guideline, index) => (
                    <li key={index} className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                      <span className="text-sm">{guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Content:</h4>
                <Textarea
                  placeholder={`Write your ${researchPaperStructure[activeSection]?.title.toLowerCase()} here...`}
                  value={sectionContent[activeSection] || ''}
                  onChange={(e) => setSectionContent({
                    ...sectionContent,
                    [activeSection]: e.target.value
                  })}
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <Badge variant="outline">
                  {researchPaperStructure[activeSection]?.wordCount}
                </Badge>
                <Badge variant="outline">
                  {researchPaperStructure[activeSection]?.citationStyle}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Citation Helper</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Citation Formats:</h4>
                <div className="space-y-2">
                  {citationFormats.map((format, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded">
                      <div className="font-medium text-sm">{format.style}</div>
                      <div className="text-xs text-gray-600 mt-1">{format.example}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Add Citation:</h4>
                <Input placeholder="Enter citation..." className="mb-2" />
                <Button size="sm" className="w-full">Add Citation</Button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Word Count:</h4>
                <div className="text-2xl font-bold text-blue-600">
                  {sectionContent[activeSection]?.split(' ').length || 0}
                </div>
                <div className="text-sm text-gray-600">words</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}