import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface EssaySection {
  title: string;
  description: string;
  prompts: string[];
  wordCount: string;
  tips: string[];
}

const persuasiveEssayStructure: EssaySection[] = [
  {
    title: 'Introduction',
    description: 'Hook your reader and present your thesis statement',
    prompts: [
      'Start with a compelling statistic, quote, or question',
      'Provide background context on your topic',
      'State your clear thesis/position'
    ],
    wordCount: '100-150 words',
    tips: ['Make your thesis debatable', 'Avoid using "I think" or "I believe"']
  },
  {
    title: 'Body Paragraph 1',
    description: 'Present your strongest argument with evidence',
    prompts: [
      'Topic sentence stating your first main point',
      'Provide specific evidence (statistics, examples, expert quotes)',
      'Explain how this evidence supports your thesis'
    ],
    wordCount: '150-200 words',
    tips: ['Use credible sources', 'Connect evidence to your main argument']
  },
  {
    title: 'Body Paragraph 2',
    description: 'Present your second strongest argument',
    prompts: [
      'Topic sentence for your second main point',
      'Provide different type of evidence than paragraph 1',
      'Analyze the significance of this evidence'
    ],
    wordCount: '150-200 words',
    tips: ['Vary your evidence types', 'Use transition words between paragraphs']
  },
  {
    title: 'Counterargument & Rebuttal',
    description: 'Address opposing views and refute them',
    prompts: [
      'Acknowledge the strongest opposing argument',
      'Explain why this counterargument exists',
      'Provide evidence that refutes or weakens this opposing view'
    ],
    wordCount: '100-150 words',
    tips: ['Be fair to opposing views', 'Show why your position is stronger']
  },
  {
    title: 'Conclusion',
    description: 'Reinforce your argument and call for action',
    prompts: [
      'Restate your thesis in different words',
      'Summarize your main arguments briefly',
      'End with a call to action or broader implications'
    ],
    wordCount: '100-150 words',
    tips: ['Don\'t introduce new arguments', 'Leave readers with something to think about']
  }
];

export function EssayTemplates() {
  const [selectedStructure, setSelectedStructure] = useState<EssaySection[]>(persuasiveEssayStructure);
  const [activeSection, setActiveSection] = useState(0);
  const [sectionContent, setSectionContent] = useState<{[key: number]: string}>({});

  const essayTypes = [
    { name: 'Persuasive Essay', structure: persuasiveEssayStructure, description: 'Convince readers of your viewpoint' },
    { name: 'Narrative Essay', structure: [], description: 'Tell a personal story with meaning' },
    { name: 'Descriptive Essay', structure: [], description: 'Paint a vivid picture with words' },
    { name: 'Expository Essay', structure: [], description: 'Explain or inform about a topic' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {essayTypes.map((type, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {type.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-3">{type.description}</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => setSelectedStructure(type.structure)}
              >
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedStructure.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Essay Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedStructure.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveSection(index)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        activeSection === index 
                          ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{section.title}</span>
                        {sectionContent[index] && (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        )}
                      </div>
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
                <CardTitle>{selectedStructure[activeSection]?.title}</CardTitle>
                <p className="text-gray-600">{selectedStructure[activeSection]?.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Writing Prompts:</h4>
                  <ul className="space-y-1">
                    {selectedStructure[activeSection]?.prompts.map((prompt, index) => (
                      <li key={index} className="flex items-start">
                        <AlertCircle className="w-4 h-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{prompt}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Your Content:</h4>
                  <Textarea
                    placeholder={`Write your ${selectedStructure[activeSection]?.title.toLowerCase()} here...`}
                    value={sectionContent[activeSection] || ''}
                    onChange={(e) => setSectionContent({
                      ...sectionContent,
                      [activeSection]: e.target.value
                    })}
                    className="min-h-[200px]"
                  />
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Tips:</h4>
                  <div className="space-y-1">
                    {selectedStructure[activeSection]?.tips.map((tip, index) => (
                      <Badge key={index} variant="outline" className="mr-2 mb-1">
                        {tip}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}