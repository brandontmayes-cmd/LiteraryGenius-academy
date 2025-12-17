import React, { useState, useEffect } from 'react';
import { StudentDashboard } from '@/components/StudentDashboard';
import { BookCreator } from '@/components/BookCreator';
import { AITutor } from '@/components/AITutor';
import { BookService } from '@/services/bookService'; // ← CAPITAL S - FIXED!
import { useAuth } from '@/contexts/AuthContext';

export const StudentView = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [books, setBooks] = useState([]);
  const [currentBook, setCurrentBook] = useState(null);
  const { user } = useAuth();
  
  const studentProfile = {
    id: user?.id,
    name: user?.user_metadata?.name || 'Young Author',
    grade_level: user?.user_metadata?.grade_level || 4
  };

  // Load books when component mounts
  useEffect(() => {
    if (user?.id) {
      loadBooks();
    }
  }, [user?.id]);

  const loadBooks = async () => {
    const studentBooks = await BookService.getStudentBooks(user.id);
    setBooks(studentBooks);
  };

  const handleNavigate = (view: string, book: any = null) => {
    if (view === 'create') {
      setCurrentBook(book); // Can be null for new book, or existing book for editing
    }
    setCurrentView(view);
  };

  const handleSaveBook = async (book: any) => {
    const result = await BookService.saveBook(book, user.id);
    
    if (result.success) {
      alert('Book saved! ✅');
      await loadBooks(); // Reload books
    } else {
      alert(`Error saving book: ${result.error}`);
    }
  };

  const handlePublishBook = async (book: any) => {
    const result = await BookService.publishBook(book, user.id);
    
    if (result.success) {
      alert('🎉 Congratulations! Your book is published!');
      await loadBooks(); // Reload books
      setCurrentView('dashboard'); // Return to dashboard
    } else {
      alert(`Error publishing book: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen">
      {currentView === 'dashboard' && (
        <StudentDashboard
          studentName={studentProfile.name}
          publishedBooks={books.filter(b => b.status === 'published')}
          draftBooks={books.filter(b => b.status === 'draft')}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'create' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="bg-[#1a2744] border-b border-[#ffd700]/20 p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-[#ffd700] hover:text-[#ffd700]/80 flex items-center gap-2 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="container mx-auto p-4">
            <BookCreator
              studentProfile={studentProfile}
              existingBook={currentBook}
              onSave={handleSaveBook}
              onPublish={handlePublishBook}
            />
          </div>
        </div>
      )}

      {currentView === 'coach' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="bg-[#1a2744] border-b border-[#ffd700]/20 p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-[#ffd700] hover:text-[#ffd700]/80 flex items-center gap-2 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="container mx-auto p-4">
            <AITutor
              studentProfile={studentProfile}
              subject="Writing"
              context="Creative writing and story development"
            />
          </div>
        </div>
      )}

      {currentView === 'homework' && (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="bg-[#1a2744] border-b border-[#ffd700]/20 p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-[#ffd700] hover:text-[#ffd700]/80 flex items-center gap-2 font-medium"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="container mx-auto p-4">
            <AITutor
              studentProfile={studentProfile}
              subject="Homework Help"
              context="Upload a photo of your homework or ask any question!"
            />
          </div>
        </div>
      )}
    </div>
  );
};
