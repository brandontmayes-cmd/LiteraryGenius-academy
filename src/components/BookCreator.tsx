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
  Mic,
  Volume2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    author: studentProfile?.name || 'Young Author',
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
  const [isAskingAI, setIsAskingAI] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentPage = book.pages[currentPageIndex];

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
    setCurrentPageIndex(book.pages.length); // Move to new page
  };

  // Delete current page
  const deletePage = () => {
    if (book.pages.length === 1) {
      alert("You need at least one page in your book!");
      return;
    }
    
    const newPages = book.pages.filter((_, index) => index !== currentPageIndex);
    // Renumber pages
    const renumberedPages = newPages.map((page, index) => ({
      ...page,
      pageNumber: index + 1
    }));
    
    setBook({
      ...book,
      pages: renumberedPages
    });
    
    // Move to previous page if we deleted the last one
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

  // Handle image upload for page
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    
    // Convert to base64
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

  // Remove image from page
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

  // Get AI writing help
  const getAIHelp = async () => {
    setIsAskingAI(true);
    try {
      // TODO: Call your AI API here
      // For now, just show a message
      alert('AI Writing Coach coming soon! This will help you improve your writing, develop characters, and suggest what happens next in your story.');
    } catch (error) {
      console.error('AI help error:', error);
    } finally {
      setIsAskingAI(false);
    }
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
    alert('Book saved! ✅');
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
    setBook(publishedBook);
    alert('🎉 Congratulations! Your book is published! You are now a published author!');
  };

  return (
    <div className="h-full flex flex-col">
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
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Book Title</label>
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
              <Input
                value={book.genre || ''}
                onChange={(e) => setBook({ ...book, genre: e.target.value })}
                placeholder="Adventure, Fantasy, Mystery, etc."
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Page Editor */}
      {!showPreview ? (
        <Card className="flex-1 flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  Page {currentPage.pageNumber} of {book.pages.length}
                </span>
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
          
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 space-y-4">
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
                  placeholder="Once upon a time..."
                  className="flex-1 min-h-[200px] resize-none"
                />
              </div>

              {/* AI Help Button */}
              <Button
                variant="outline"
                onClick={getAIHelp}
                disabled={isAskingAI}
                className="w-full"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Get AI Writing Help
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Preview Mode
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-center">{book.title || 'Untitled Book'}</CardTitle>
            <p className="text-center text-sm text-gray-600">by {book.author}</p>
            {book.genre && (
              <p className="text-center text-xs text-gray-500">{book.genre}</p>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-8">
                {book.pages.map((page) => (
                  <div key={page.id} className="border-b pb-8 last:border-b-0">
                    <div className="text-sm text-gray-500 mb-2">Page {page.pageNumber}</div>
                    {page.imageUrl && (
                      <div className="mb-4">
                        <img
                          src={page.imageUrl}
                          alt={`Page ${page.pageNumber}`}
                          className="max-w-full rounded border border-gray-300"
                        />
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{page.text || '(Empty page)'}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
