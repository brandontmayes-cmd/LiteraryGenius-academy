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
  Zap,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookViewer } from '@/components/BookViewer';
import { PDFExportButton } from './PDFExportButton';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { user, signOut } = useAuth();
  const [selectedBook, setSelectedBook] = useState<any>(null);

  const handleNavigate = (view: string) => {
    if (onNavigate) {
      onNavigate(view);
    }
  };

  // Use auth user name if available
  const displayName = user?.user_metadata?.name || user?.firstName || studentName;
  const userEmail = user?.email;

  const totalBooks = publishedBooks.length + draftBooks.length;
  const totalPages = publishedBooks.reduce((sum, book) => sum + (book.pages?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a2744] via-[#243352] to-[#2d3e5f]">
      {/* Modern Header */}
      <header className="bg-[#1a2744]/80 backdrop-blur-md border-b border-[#ffd700]/20 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[#ffd700] rounded-xl blur-sm opacity-50"></div>
                <div className="relative h-12 w-12 bg-[#ffd700] rounded-xl flex items-center justify-center text-[#1a2744] text-xl font-bold">
                  ☀
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#ffd700]">
                  Literary Genius Academy
                </h1>
                <p className="text-xs text-gray-300">Where Young Authors Are Born</p>
              </div>
            </div>

            {/* User Menu with Logout */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-200 hidden sm:block">
                Hello, <span className="text-[#ffd700]">{displayName}</span>! 👋
              </span>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="rounded-full hover:bg-[#ffd700]/20 text-gray-300 hover:text-[#ffd700]"
                  >
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      {userEmail && (
                        <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => window.location.href = '/settings'}>
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={signOut}
                    className="text-red-600 focus:text-red-600 focus:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-[#ffd700] to-[#e6c200] text-[#1a2744] border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1a2744]/70 text-sm font-medium">Published Books</p>
                  <p className="text-3xl font-bold mt-1">{publishedBooks.length}</p>
                </div>
                <div className="bg-[#1a2744]/20 p-3 rounded-full">
                  <BookOpen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#ffd700]/80 to-[#e6c200]/80 text-[#1a2744] border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1a2744]/70 text-sm font-medium">Pages Written</p>
                  <p className="text-3xl font-bold mt-1">{totalPages}</p>
                </div>
                <div className="bg-[#1a2744]/20 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#ffd700]/60 to-[#e6c200]/60 text-[#1a2744] border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#1a2744]/70 text-sm font-medium">Drafts in Progress</p>
                  <p className="text-3xl font-bold mt-1">{draftBooks.length}</p>
                </div>
                <div className="bg-[#1a2744]/20 p-3 rounded-full">
                  <Pen className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hero Section - Create Book CTA */}
        <Card className="mb-6 bg-gradient-to-r from-[#1a2744] via-[#243352] to-[#2d3e5f] text-white border-0 shadow-xl overflow-hidden relative">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, #ffd700 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
          </div>
          <CardContent className="relative pt-8 pb-8">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-[#ffd700]/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm mb-4 border border-[#ffd700]/30">
                  <Sparkles className="w-4 h-4 text-[#ffd700]" />
                  <span className="text-[#ffd700]">Start Your Next Masterpiece</span>
                </div>
                <h2 className="text-3xl font-bold mb-3">Ready to write your next story?</h2>
                <p className="text-gray-300 mb-6 text-lg">
                  Create a new book, get AI feedback on your writing, or get help with homework!
                </p>
                <Button 
                  onClick={() => handleNavigate('create')}
                  size="lg"
                  className="bg-[#ffd700] text-[#1a2744] hover:bg-[#ffd700]/90 shadow-lg text-lg h-12 px-8"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Book
                </Button>
              </div>
              <div className="hidden lg:block">
                <div className="w-48 h-48 bg-[#ffd700]/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-[#ffd700]/30">
                  <BookOpen className="w-24 h-24 text-[#ffd700]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Book Creator Card */}
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-[#ffd700]/30 hover:border-[#ffd700]/70 hover:-translate-y-1 bg-white"
            onClick={() => handleNavigate('create')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#ffd700] to-[#e6c200] p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-[#1a2744]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#1a2744]">Book Creator</CardTitle>
                    <p className="text-xs text-gray-500">Create amazing stories</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Write your own books with pictures! Add pages, illustrations, and publish when you're ready.
              </p>
              <div className="flex items-center justify-between">
                <Badge className="bg-[#ffd700]/20 text-[#1a2744] hover:bg-[#ffd700]/30">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Get Started
                </Badge>
                <BookOpen className="w-5 h-5 text-[#ffd700] group-hover:text-[#e6c200] transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Writing Coach Card */}
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-[#ffd700]/30 hover:border-[#ffd700]/70 hover:-translate-y-1 bg-white"
            onClick={() => handleNavigate('coach')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#ffd700] to-[#e6c200] p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Sparkles className="w-6 h-6 text-[#1a2744]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#1a2744]">Writing Coach</CardTitle>
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
                <Badge className="bg-[#ffd700]/20 text-[#1a2744] hover:bg-[#ffd700]/30">
                  <Award className="w-3 h-3 mr-1" />
                  Level Up
                </Badge>
                <Sparkles className="w-5 h-5 text-[#ffd700] group-hover:text-[#e6c200] transition-colors" />
              </div>
            </CardContent>
          </Card>

          {/* Homework Helper Card */}
          <Card 
            className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 border-[#ffd700]/30 hover:border-[#ffd700]/70 hover:-translate-y-1 bg-white md:col-span-2"
            onClick={() => handleNavigate('homework')}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-[#ffd700] to-[#e6c200] p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6 text-[#1a2744]" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#1a2744]">Homework Helper</CardTitle>
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
                <Badge className="bg-[#ffd700]/20 text-[#1a2744] hover:bg-[#ffd700]/30">
                  <Camera className="w-3 h-3 mr-1" />
                  Instant Help
                </Badge>
                <Camera className="w-5 h-5 text-[#ffd700] group-hover:text-[#e6c200] transition-colors" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Books Section */}
        <Card className="shadow-lg bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2 text-[#1a2744]">
                  <BookOpen className="w-6 h-6 text-[#ffd700]" />
                  My Published Books
                </CardTitle>
                <p className="text-sm text-gray-500 mt-1">Your author portfolio</p>
              </div>
              {publishedBooks.length > 0 && (
                <Button 
                  variant="outline"
                  onClick={() => handleNavigate('books')}
                  className="hover:bg-[#ffd700]/10 hover:border-[#ffd700] hover:text-[#1a2744]"
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
                  <div key={book.id} className="group relative">
                    <div className="aspect-[3/4] bg-gradient-to-br from-[#1a2744] to-[#2d3e5f] rounded-lg mb-3 flex items-center justify-center shadow-md group-hover:shadow-xl transition-all overflow-hidden relative border-2 border-[#ffd700]/30 cursor-pointer"
                      onClick={() => {
                        // TODO: View book modal
                      }}
                    >
                      {book.cover_image ? (
                        <img src={book.cover_image} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-[#ffd700]/10 to-[#ffd700]/5"></div>
                          <BookOpen className="w-12 h-12 text-[#ffd700] relative z-10" />
                        </>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    </div>
                    
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-[#ffd700] transition-colors line-clamp-2 text-[#1a2744]">
                      {book.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>{book.pages?.length || 0} pages</span>
                      <Badge variant="secondary" className="text-xs bg-[#ffd700]/20 text-[#1a2744]">
                        ✨ Published
                      </Badge>
                    </div>
                    
                    {/* PDF Download Button */}
                    <PDFExportButton 
                      book={book} 
                      className="w-full text-xs h-8"
                    />
                  </div>
                ))}

                {/* Add New Book Card */}
                <div 
                  className="group cursor-pointer"
                  onClick={() => handleNavigate('create')}
                >
                  <div className="aspect-[3/4] bg-gradient-to-br from-[#ffd700]/20 to-[#ffd700]/10 rounded-lg mb-3 flex flex-col items-center justify-center border-2 border-dashed border-[#ffd700]/50 group-hover:border-[#ffd700] group-hover:bg-[#ffd700]/30 transition-all shadow-sm group-hover:shadow-md">
                    <Plus className="w-12 h-12 text-[#ffd700] mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-sm text-[#1a2744] font-medium">New Book</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ffd700]/20 to-[#ffd700]/10 rounded-full mb-4 border-2 border-[#ffd700]/30">
                  <BookOpen className="w-10 h-10 text-[#ffd700]" />
                </div>
                <h3 className="text-xl font-semibold text-[#1a2744] mb-2">
                  No published books yet
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Start your author journey today! Create your first book and share your stories with the world.
                </p>
                <Button 
                  onClick={() => handleNavigate('create')}
                  size="lg"
                  className="bg-[#ffd700] text-[#1a2744] hover:bg-[#ffd700]/90 shadow-lg"
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
          <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md border border-[#ffd700]/30">
            <Sparkles className="w-4 h-4 text-[#ffd700]" />
            <span className="text-sm text-gray-600">
              Created by <span className="font-semibold text-[#1a2744]">Brandon Mayes</span>, 
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
