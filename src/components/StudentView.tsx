import React, { useState } from 'react';
import { StudentDashboard } from '@/components/StudentDashboard';
import { BookCreator } from '@/components/BookCreator';
import { AITutor } from '@/components/AITutor';

export const StudentView = () => {
  // Track which view is active
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Get student info (replace with your actual auth/user data)
  const studentProfile = {
    name: 'Alivia', // Or get from your auth system
    grade_level: '4'
  };

  // Handle navigation between views
  const handleNavigate = (view: string) => {
    console.log('Navigating to:', view);
    setCurrentView(view);
  };

  // Handle book save
  const handleSaveBook = (book: any) => {
    console.log('Saving book:', book);
    // TODO: Call your API to save the book
    // fetch('/api/books/save', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ book })
    // });
    alert('Book saved! ✅');
  };

  // Handle book publish
  const handlePublishBook = (book: any) => {
    console.log('Publishing book:', book);
    // TODO: Call your API to publish the book
    // fetch('/api/books/publish', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ book })
    // });
    alert('🎉 Congratulations! Your book is published!');
    
    // Navigate back to dashboard to see the published book
    setCurrentView('dashboard');
  };

  return (
    <div className="min-h-screen">
      {/* DASHBOARD VIEW */}
      {currentView === 'dashboard' && (
        <StudentDashboard
          studentName={studentProfile.name}
          onNavigate={handleNavigate}
        />
      )}

      {/* BOOK CREATOR VIEW */}
      {currentView === 'create' && (
        <div className="min-h-screen bg-gray-50">
          {/* Back button */}
          <div className="bg-white border-b p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="container mx-auto p-4">
            <BookCreator
              studentProfile={studentProfile}
              onSave={handleSaveBook}
              onPublish={handlePublishBook}
            />
          </div>
        </div>
      )}

      {/* WRITING COACH VIEW */}
      {currentView === 'coach' && (
        <div className="min-h-screen bg-gray-50">
          {/* Back button */}
          <div className="bg-white border-b p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
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

      {/* HOMEWORK HELPER VIEW */}
      {currentView === 'homework' && (
        <div className="min-h-screen bg-gray-50">
          {/* Back button */}
          <div className="bg-white border-b p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="container mx-auto p-4">
            <AITutor
              studentProfile={studentProfile}
              subject="General"
              context="Homework help - upload a photo or ask questions"
            />
          </div>
        </div>
      )}

      {/* BOOKS VIEW (Portfolio) */}
      {currentView === 'books' && (
        <div className="min-h-screen bg-gray-50">
          {/* Back button */}
          <div className="bg-white border-b p-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">My Published Books</h1>
            <p className="text-gray-600">
              Book portfolio view coming soon! This will show all of {studentProfile.name}'s published books.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
