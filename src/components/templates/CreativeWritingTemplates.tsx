import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { PenTool, Heart, Zap, Globe, Users } from 'lucide-react';

interface CreativePrompt {
  title: string;
  description: string;
  prompts: string[];
  techniques: string[];
  wordCount: string;
}

const storyStructure: CreativePrompt[] = [
  {
    title: 'Character Development',
    description: 'Create compelling, three-dimensional characters',
    prompts: [
      'What does your protagonist want more than anything?',
      'What is their greatest fear or weakness?',
      'What unique trait makes them memorable?'
    ],
    techniques: ['Character backstory', 'Internal conflict', 'Character arc'],
    wordCount: '200-300 words'
  },
  {
    title: 'Setting & World-building',
    description: 'Establish the time, place, and atmosphere',
    prompts: [
      'Where and when does your story take place?',
      'What mood or atmosphere do you want to create?',
      'How does the setting influence your characters?'
    ],
    techniques: ['Sensory details', 'Mood creation', 'Symbolic elements'],
    wordCount: '150-250 words'
  },
  {
    title: 'Plot Development',
    description: 'Structure your narrative with conflict and resolution',
    prompts: [
      'What problem or conflict drives your story?',
      'What obstacles will your character face?',
      'How will the conflict be resolved?'
    ],
    techniques: ['Rising action', 'Climax', 'Resolution'],
    wordCount: '300-500 words'
  },
  {
    title: 'Dialogue & Voice',
    description: 'Develop authentic character voices and conversations',
    prompts: [
      'How does each character speak differently?',
      'What subtext lies beneath their words?',
      'What does dialogue reveal about relationships?'
    ],
    techniques: ['Subtext', 'Character voice', 'Realistic speech patterns'],
    wordCount: '200-400 words'
  }
];

const creativeGenres = [
  { name: 'Short Story', icon: <PenTool className="w-5 h-5" />, description: 'Complete narrative in under 5,000 words' },
  { name: 'Poetry', icon: <Heart className="w-5 h-5" />, description: 'Express emotions through verse and rhythm' },
  { name: 'Flash Fiction', icon: <Zap className="w-5 h-5" />, description: 'Ultra-short stories under 1,000 words' },
  { name: 'World-building', icon: <Globe className="w-5 h-5" />, description: 'Create detailed fictional universes' },
  { name: 'Character Study', icon: <Users className="w-5 h-5" />, description: 'Deep exploration of character psychology' }
];

const writingPrompts = [
  'A character finds a door that wasn\'t there yesterday',
  'Two strangers are stuck in an elevator for hours',
  'A person can hear everyone\'s thoughts for one day',
  'The last bookstore in the world is closing',
  'Someone discovers their reflection is acting independently'
];

export function CreativeWritingTemplates() {
  const [activeSection, setActiveSection] = useState(0);
  const [sectionContent, setSectionContent] = useState<{[key: number]: string}>({});
  const [selectedGenre, setSelectedGenre] = useState(creativeGenres[0]);
  const [customPrompt, setCustomPrompt] = useState('');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {creativeGenres.map((genre, index) => (
          <Card 
            key={index} 
            className={`hover:shadow-md transition-shadow cursor-pointer ${
              selectedGenre.name === genre.name ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedGenre(genre)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                {genre.icon}
                <span className="ml-2">{genre.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-xs">{genre.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Story Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {storyStructure.map((section, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSection(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeSection === index 
                        ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium text-sm">{section.title}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {section.wordCount}
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Writing Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {writingPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setCustomPrompt(prompt)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{storyStructure[activeSection]?.title}</CardTitle>
              <p className="text-gray-600">{storyStructure[activeSection]?.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Creative Prompts:</h4>
                <div className="space-y-2">
                  {storyStructure[activeSection]?.prompts.map((prompt, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg">
                      <span className="text-sm font-medium text-purple-800">{prompt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Your Writing:</h4>
                <Textarea
                  placeholder={`Develop your ${storyStructure[activeSection]?.title.toLowerCase()} here...`}
                  value={sectionContent[activeSection] || ''}
                  onChange={(e) => setSectionContent({
                    ...sectionContent,
                    [activeSection]: e.target.value
                  })}
                  className="min-h-[250px]"
                />
              </div>

              <div>
                <h4 className="font-semibold mb-2">Writing Techniques:</h4>
                <div className="flex flex-wrap gap-2">
                  {storyStructure[activeSection]?.techniques.map((technique, index) => (
                    <Badge key={index} variant="outline" className="bg-purple-50 text-purple-700">
                      {technique}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Writing Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Custom Prompt:</h4>
                <Input 
                  placeholder="Enter your own prompt..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="mb-2"
                />
                <Button size="sm" className="w-full">Use Prompt</Button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Word Count:</h4>
                <div className="text-2xl font-bold text-purple-600">
                  {sectionContent[activeSection]?.split(' ').length || 0}
                </div>
                <div className="text-sm text-gray-600">words</div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Genre:</h4>
                <Badge className="bg-purple-100 text-purple-800">
                  {selectedGenre.name}
                </Badge>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Quick Actions:</h4>
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full">
                    Save Draft
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">
                    Export Text
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