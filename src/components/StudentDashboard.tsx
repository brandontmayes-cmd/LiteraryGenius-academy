import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // ← Move this to top with other imports
import { 
  BookOpen, 
  Pen,
  Sparkles,
  Camera,
  User,
  Settings,
  LogOut,
  Plus,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StudentDashboardProps {
  studentName?: string;
  onNavigate?: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentName = 'Young Author',
  onNavigate
}) => {
  const navigate = useNavigate();  // ← Add this INSIDE the component
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'books' | 'coach' | 'homework'>('dashboard');

  // Sample books data (replace with real data from your backend)
  const publishedBooks = [
    {
      id: '1',
      title: 'The Magic Dragon',
      coverImage: null,
      status: 'published',
      pages: 5
    },
    // Add more sample books or load from API
  ];

  const handleNavigate = (view: string) => {
    setActiveView(view as any);
    if (onNavigate) {
      onNavigate(view);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* Header with Logo */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <img 
                src="/logo" 
                alt="Literary Genius Academy" 
                className="h-12 w-12"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Literary Genius Academy
                </h1>
                <p className="text-sm text-gray-600">Where Young Authors Are Born</p>
              </div>
            </div>

            {/* User Menu - UPDATED BUTTONS */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Hello, {studentName}!</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/settings')}
                title="Profile"
              >
                <User className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate('/settings')}
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - Create Book CTA */}
        <Card className="mb-8 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-bold mb-3">
                  ✨ Ready to Write Your Next Book?
                </h2>
                <p className="text-lg mb-6 text-purple-100">
                  Every great author started with a blank page. Let's create something amazing together!
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-100"
                  onClick={() => handleNavigate('create')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Book
                </Button>
              </div>
              <div className="hidden md:block">
                <div className="text-8xl">📚</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Book Creator Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-purple-200"
            onClick={() => handleNavigate('create')}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-purple-100 p-2 rounded">
                  <Pen className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Book Creator</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Write and illustrate your own books, page by page!
              </p>
              <Badge className="bg-purple-500">Primary Feature</Badge>
            </CardContent>
          </Card>

          {/* Writing Coach Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleNavigate('coach')}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Writing Coach</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Get AI help to improve your writing and develop your story!
              </p>
            </CardContent>
          </Card>

          {/* Homework Helper Card */}
          <Card 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleNavigate('homework')}
          >
            <CardHeader>
              <div className="flex items-center gap-2">
                <div className="bg-green-100 p-2 rounded">
                  <Camera className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-lg">Homework Helper</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Quick help with homework - upload a photo and get explanations!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* My Books Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-purple-600" />
                My Published Books
              </CardTitle>
              <Button 
                variant="outline"
                onClick={() => handleNavigate('books')}
              >
                <Eye className="w-4 h-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {publishedBooks.length > 0 ? (
              <div className="grid md:grid-cols-4 gap-6">
                {publishedBooks.map((book) => (
                  <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      {/* Book Cover Placeholder */}
                      <div className="aspect-[3/4] bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg mb-3 flex items-center justify-center">
                        {book.coverImage ? (
                          <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BookOpen className="w-12 h-12 text-purple-400" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-1">{book.title}</h3>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{book.pages} pages</span>
                        <Badge variant="secondary" className="text-xs">
                          {book.status === 'published' ? '✨ Published' : '📝 Draft'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Add New Book Card */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-dashed border-purple-300"
                  onClick={() => handleNavigate('create')}
                >
                  <CardContent className="pt-6">
                    <div className="aspect-[3/4] bg-purple-50 rounded-lg mb-3 flex flex-col items-center justify-center">
                      <Plus className="w-12 h-12 text-purple-400 mb-2" />
                      <span className="text-sm text-purple-600 font-medium">New Book</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  No published books yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Create your first book and become a published author!
                </p>
                <Button onClick={() => handleNavigate('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Book
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Author Credibility Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm border">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">
              Created by <span className="font-semibold text-gray-800">Brandon Mayes</span>, 
              published children's book author
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};