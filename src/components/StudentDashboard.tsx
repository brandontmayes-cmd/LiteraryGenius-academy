import React, { useState } from 'react';
import { 
  BookOpen, 
  Pen,
  Sparkles,
  Camera,
  User,
  Settings,
  Plus,
  Eye,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookViewer } from '@/components/BookViewer';

interface StudentDashboardProps {
  studentName?: string;
  publishedBooks?: any[];
  draftBooks?: any[];
  onNavigate?: (view: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  studentName = 'Young Author',
  publishedBooks = [],
  draftBooks = [],
  onNavigate
}) => {
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  const totalBooks = publishedBooks.length + draftBooks.length;
  const totalPages = publishedBooks.reduce((sum, book) => sum + (book.pages?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Modern Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-sm"></div>
                <div className="relative h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                  ?
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Literary Genius Academy
                </h1>
                <p className="text-xs text-gray-600">Where Young Authors Are Born</p>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">
                Hello, <span className="text-purple-600">{studentName}</span>! 👋
              </span>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-purple-100"
              >
                <User className="w-5 h-5 text-gray-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-full hover:bg-purple-100"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Published Books</p>
                  <p className="text-3xl font-bold mt-1">{publishedBooks.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-rose-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-pink-100 text-sm font-medium">Pages Written</p>
                  <p className="text-3xl font-bold mt-1">{totalPages}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm font-medium">Drafts in Progress</p>
                  <p className="text-3xl font-bold mt-1">{draftBooks.length}</p>
                </div>
                <div className="bg-white/20 p-3 rounded-full">
                  <Pen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section - Create Book CTA */}
        <Card className="mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white border-0 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <CardContent className="relative pt-8 pb-8">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4">
                  <Sparkles className="w-4 h-4" />
                  <span>Start Your Next Masterpiece</span>
                </div>
                <h2 className="text-4xl font-bold mb-3">
                  Ready to Write Your Next Book?
                </h2>
                <p className="text-lg mb-6 text-purple-100 max-w-xl">
                  Every great author started with a blank page. Let's create something amazing together!
                </p>
                <Button 
                  size="lg" 
                  className="bg-white text-purple-600 hover:bg-gray-50 shadow-lg hover:shadow-xl transition-all font-semibold"
                  onClick={() => handleNavigate('create')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Book
                </Button>
              </div>
              <div className="hidden lg:block">
                <div className="text-9xl opacity-20">📚</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Book Creator Card */}
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 hover:-translate-y-1 bg-white"
            onClick={() => handleNavigate('create')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Pen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Book Creator</CardTitle>
                    <p className="text-xs text-gray-500">Create & publish books</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Write and illustrate your own books, page by page. Become a published author today!
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Primary Feature
                </Badge>
                <Zap className="w-5 h-5 text-purple-400 group-hover:text-purple-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Writing Coach Card */}
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 hover:-translate-y-1 bg-white"
            onClick={() => handleNavigate('coach')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Writing Coach</CardTitle>
                    <p className="text-xs text-gray-500">AI-powered feedback</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Get AI help to improve your writing, develop characters, and craft better stories!
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                  <Award className="w-3 h-3 mr-1" />
                  Level Up
                </Badge>
                <Sparkles className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Homework Helper Card */}
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-green-200 hover:border-green-400 hover:-translate-y-1 bg-white"
            onClick={() => handleNavigate('homework')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Homework Helper</CardTitle>
                    <p className="text-xs text-gray-500">Quick photo help</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Upload a photo of your homework and get clear explanations to help you learn!
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200">
                  <Camera className="w-3 h-3 mr-1" />
                  Instant Help
                </Badge>
                <Camera className="w-5 h-5 text-green-400 group-hover:text-green-600 transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Books Section */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                  My Published Books
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Your author portfolio</p>
              </div>
              {publishedBooks.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => handleNavigate('books')}
                  className="hover:bg-purple-50 hover:border-purple-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {publishedBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {publishedBooks.map((book) => (
                  <div 
                    key={book.id} 
                    className="group cursor-pointer"
                    onClick={() => setSelectedBook(book)}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-purple-200 via-pink-200 to-rose-200 rounded-lg mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all overflow-hidden relative">
                      {book.cover_image ? (
                        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-pink-400/20"></div>
                          <BookOpen className="w-12 h-12 text-purple-400 relative z-10" />
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-purple-600 transition-colors line-clamp-2">
                      {book.title}
                    </h3>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{book.pages?.length || 0} pages</span>
                      <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                        ✨ Published
                      </Badge>
                    </div>
                  </div>
                ))}

                {/* Add New Book Card */}
                <div 
                  className="group cursor-pointer"
                  onClick={() => handleNavigate('create')}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mb-3 flex flex-col items-center justify-center border-2 border-dashed border-purple-300 group-hover:border-purple-500 group-hover:bg-purple-100 transition-all shadow-sm group-hover:shadow-md">
                    <Plus className="w-12 h-12 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-purple-600 font-medium">New Book</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                  <BookOpen className="w-10 h-10 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No published books yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start your author journey today! Create your first book and share your stories with the world.
                </p>
                <Button 
                  onClick={() => handleNavigate('create')}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Book
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Author Credibility Footer */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-purple-100">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">
              Created by <span className="font-semibold text-gray-800">Brandon Mayes</span>, 
              published children's book author
            </span>
          </div>
        </div>
      </main>

      {/* Book Viewer Modal */}
      {selectedBook && (
        <BookViewer 
          book={selectedBook} 
          onClose={() => setSelectedBook(null)} 
        />
      )}
    </div>
  );
};
