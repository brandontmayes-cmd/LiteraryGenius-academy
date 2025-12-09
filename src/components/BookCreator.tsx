import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save,
  Eye,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Lightbulb,
  X,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WritingAssistant } from '@/components/WritingAssistant';

interface BookPage {
  id: string;
  pageNumber: number;
  text: string;
  imageUrl?: string;
  imageData?: string;
}

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  pages: BookPage[];
  genre?: string;
  createdAt: Date;
  status: 'draft' | 'published';
}

interface BookCreatorProps {
  studentProfile?: any;
  onSave?: (book: Book) => void;
  onPublish?: (book: Book) => void;
}

export const BookCreator: React.FC<BookCreatorProps> = ({
  studentProfile,
  onSave,
  onPublish
}) => {
  const [book, setBook] = useState<Book>({
    id: Date.now().toString(),
    title: '',
    author: studentProfile?.name || '',
    pages: [
      {
        id: '1',
        pageNumber: 1,
        text: '',
      }
    ],
    createdAt: new Date(),
    status: 'draft'
  });

  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showPrompts, setShowPrompts] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [showWritingAssistant, setShowWritingAssistant] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPage = book.pages[currentPageIndex];

  // Writing prompts by genre
  const writingPrompts = {
    general: [
      "Write about a day when everything went wrong, but turned out great in the end.",
      "Describe your perfect adventure. Where would you go? Who would you meet?",
      "Imagine you found a magical object. What is it and what does it do?",
      "Write about a character who discovers they have a special talent.",
      "Tell a story about an unlikely friendship between two different creatures."
    ],
    fantasy: [
      "You discover a secret door in your house that leads to a magical world...",
      "A dragon egg appears on your doorstep. What happens when it hatches?",
      "You wake up with magical powers. What are they and how do you use them?",
      "Write about a kingdom where magic is forbidden, but you're secretly a wizard.",
      "A talking animal needs your help to save their enchanted forest."
    ],
    mystery: [
      "Something valuable has disappeared from school. Can you solve the case?",
      "You find a mysterious note with clues. Where does it lead?",
      "Strange things keep happening in your neighborhood. What's going on?",
      "You overhear a conversation that doesn't make sense. Investigate!",
      "A new student at school is hiding a secret. What is it?"
    ],
    adventure: [
      "You find a treasure map in your attic. Where does it lead?",
      "A time machine appears in your backyard. Where do you go?",
      "You're stranded on a deserted island. How do you survive?",
      "An ancient civilization needs your help to save their people.",
      "You join a crew on a ship sailing to uncharted waters."
    ],
    realistic: [
      "Write about moving to a new town and making your first friend.",
      "Tell the story of learning something difficult and not giving up.",
      "Describe a family tradition that means a lot to you.",
      "Write about standing up for what's right, even when it's hard.",
      "Tell about a time when you helped someone who really needed it."
    ]
  };

  // Add new page
  const addPage = () => {
    const newPage: BookPage = {
      id: Date.now().toString(),
      pageNumber: book.pages.length + 1,
      text: '',
    };
    setBook({
      ...book,
      pages: [...book.pages, newPage]
    });
    setCurrentPageIndex(book.pages.length);
  };

  // Delete current page
  const deletePage = () => {
    if (book.pages.length === 1) {
      alert("You need at least one page in your book!");
      return;
    }
    
    const newPages = book.pages.filter((_, index) => index !== currentPageIndex);
    const renumberedPages = newPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1
    }));
    
    setBook({
      ...book,
      pages: renumberedPages
    });
    
    if (currentPageIndex >= renumberedPages.length) {
      setCurrentPageIndex(renumberedPages.length - 1);
    }
  };

  // Update page text
  const updatePageText = (text: string) => {
    const updatedPages = [...book.pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      text
    };
    setBook({
      ...book,
      pages: updatedPages
    });
  };

  // Handle image upload
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      
      const updatedPages = [...book.pages];
      updatedPages[currentPageIndex] = {
        ...updatedPages[currentPageIndex],
        imageUrl: previewUrl,
        imageData: base64Data
      };
      setBook({
        ...book,
        pages: updatedPages
      });
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const removePageImage = () => {
    const updatedPages = [...book.pages];
    updatedPages[currentPageIndex] = {
      ...updatedPages[currentPageIndex],
      imageUrl: undefined,
      imageData: undefined
    };
    setBook({
      ...book,
      pages: updatedPages
    });
  };

  // Save draft
  const saveDraft = () => {
    if (!book.title) {
      alert('Please add a title to your book!');
      return;
    }
    if (onSave) {
      onSave(book);
    }
  };

  // Publish book
  const publishBook = () => {
    if (!book.title) {
      alert('Please add a title to your book!');
      return;
    }
    if (book.pages.every(page => !page.text)) {
      alert('Please write something in your book first!');
      return;
    }
    
    const publishedBook = {
      ...book,
      status: 'published' as const
    };
    
    if (onPublish) {
      onPublish(publishedBook);
    }
  };

  // Use a writing prompt
  const usePrompt = (prompt: string) => {
    updatePageText(prompt + '\n\n');
    setShowPrompts(false);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Onboarding Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                  Welcome to Book Creator!
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowOnboarding(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">🎨 How to Create Your Book:</h3>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">1.</span>
                    <span><strong>Add Your Book Info:</strong> Give your book a title and pick a genre</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">2.</span>
                    <span><strong>Write Your Story:</strong> Type your story page by page (or use writing prompts for ideas!)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">3.</span>
                    <span><strong>Add Pictures:</strong> Upload photos of your drawings or other images</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">4.</span>
                    <span><strong>Preview:</strong> See how your book looks before publishing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold text-purple-600">5.</span>
                    <span><strong>Publish:</strong> Click publish and become a real author! 🎉</span>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Quick Tips:
                </h3>
                <ul className="space-y-1 text-sm">
                  <li>• Save your work often using the "Save" button</li>
                  <li>• Need ideas? Click "Writing Prompts" for story starters</li>
                  <li>• Each page can have text AND a picture</li>
                  <li>• You can add as many pages as you want!</li>
                </ul>
              </div>

              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600"
                onClick={() => setShowOnboarding(false)}
              >
                Start Creating! 📚
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Writing Prompts Modal */}
      {showPrompts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Writing Prompts
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setShowPrompts(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-sm text-gray-600">Click any prompt to use it as your story starter!</p>
            </CardHeader>
            <ScrollArea className="flex-1 px-6 pb-6">
              <div className="space-y-4">
                {Object.entries(writingPrompts).map(([genre, prompts]) => (
                  <div key={genre}>
                    <h3 className="font-semibold text-sm uppercase text-gray-500 mb-2">
                      {genre === 'general' ? 'General Ideas' : genre}
                    </h3>
                    <div className="space-y-2">
                      {prompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => usePrompt(prompt)}
                          className="w-full text-left p-3 bg-gray-50 hover:bg-purple-50 rounded-lg transition-colors border border-gray-200 hover:border-purple-300"
                        >
                          <p className="text-sm">{prompt}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* Header */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              <CardTitle>Book Creator</CardTitle>
              <Badge variant={book.status === 'published' ? 'default' : 'secondary'}>
                {book.status === 'published' ? '✨ Published' : '📝 Draft'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowOnboarding(true)}
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Help
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                <Eye className="w-4 h-4 mr-1" />
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
              <Button variant="outline" size="sm" onClick={saveDraft}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button size="sm" onClick={publishBook} className="bg-purple-500 hover:bg-purple-600">
                <Sparkles className="w-4 h-4 mr-1" />
                Publish
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Book Info */}
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium flex items-center gap-1">
                Book Title 
                <span className="text-red-500">*</span>
              </label>
              <Input
                value={book.title}
                onChange={(e) => setBook({ ...book, title: e.target.value })}
                placeholder="My Amazing Story"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Author</label>
              <Input
                value={book.author}
                onChange={(e) => setBook({ ...book, author: e.target.value })}
                placeholder="Your Name"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Genre (Optional)</label>
              <select
                value={book.genre || ''}
                onChange={(e) => setBook({ ...book, genre: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a genre...</option>
                <option value="fantasy">Fantasy</option>
                <option value="mystery">Mystery</option>
                <option value="adventure">Adventure</option>
                <option value="realistic">Realistic Fiction</option>
                <option value="science-fiction">Science Fiction</option>
                <option value="poetry">Poetry</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Editor or Preview */}
      {!showPreview ? (
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  Page {currentPage.pageNumber} of {book.pages.length}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPrompts(true)}
                  className="text-xs"
                >
                  <Lightbulb className="w-3 h-3 mr-1" />
                  Writing Prompts
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowWritingAssistant(true)}
                  className="text-xs"
                  disabled={!currentPage.text || currentPage.text.trim().length === 0}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Get Writing Help
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
                  disabled={currentPageIndex === 0}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPageIndex(Math.min(book.pages.length - 1, currentPageIndex + 1))}
                  disabled={currentPageIndex === book.pages.length - 1}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={addPage}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Page
                </Button>
                {book.pages.length > 1 && (
                  <Button variant="outline" size="sm" onClick={deletePage}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col space-y-4">
            {/* Image Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Page Image (Optional)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4 mr-1" />
                  Add Image
                </Button>
              </div>
              
              {currentPage.imageUrl && (
                <div className="relative inline-block">
                  <img
                    src={currentPage.imageUrl}
                    alt={`Page ${currentPage.pageNumber}`}
                    className="max-h-48 rounded border border-gray-300"
                  />
                  <button
                    onClick={removePageImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Text Section */}
            <div className="flex-1 flex flex-col">
              <label className="text-sm font-medium mb-2">Page Text</label>
              <Textarea
                value={currentPage.text}
                onChange={(e) => updatePageText(e.target.value)}
                placeholder="Start writing your story here... or click 'Writing Prompts' for ideas!"
                className="flex-1 min-h-[200px] resize-none text-base leading-relaxed"
              />
              <div className="text-xs text-gray-500 mt-1">
                {currentPage.text.length} characters
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Preview Mode
        <Card className="flex-1 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-center text-2xl">{book.title || 'Untitled Book'}</CardTitle>
            <p className="text-center text-sm text-gray-600">by {book.author}</p>
            {book.genre && (
              <p className="text-center text-xs text-gray-500 capitalize">{book.genre}</p>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-8 max-w-2xl mx-auto">
                {book.pages.map((page) => (
                  <div key={page.id} className="border-b pb-8 last:border-b-0">
                    <div className="text-sm font-medium text-gray-500 mb-4">Page {page.pageNumber}</div>
                    {page.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="max-w-full rounded border border-gray-300 mx-auto"
                        />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap text-base leading-relaxed">
                      {page.text || '(Empty page)'}
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
      
      {/* Writing Assistant Modal */}
      {showWritingAssistant && (
        <WritingAssistant
          pageText={currentPage.text}
          gradeLevel={studentProfile?.grade_level || 4}
          onClose={() => setShowWritingAssistant(false)}
        />
      )}
    </div>
  );
};
