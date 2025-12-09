import React from 'react';
import { BookOpen, X, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BookViewerProps {
  book: any;
  onClose: () => void;
}

export const BookViewer: React.FC<BookViewerProps> = ({ book, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{book.title || 'Untitled Book'}</h1>
              <p className="text-lg text-purple-100">by {book.author}</p>
              {book.genre && (
                <p className="text-sm text-purple-200 mt-1 capitalize">{book.genre}</p>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>{book.pages?.length || 0} pages</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span>Published</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-2xl mx-auto space-y-12">
            {book.pages && book.pages.length > 0 ? (
              book.pages.map((page: any, index: number) => (
                <div key={page.id || index} className="border-b pb-8 last:border-b-0">
                  {/* Page Number */}
                  <div className="text-sm font-medium text-gray-500 mb-4">
                    Page {page.pageNumber || index + 1}
                  </div>

                  {/* Page Image */}
                  {page.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={page.imageUrl}
                        alt={`Page ${page.pageNumber || index + 1}`}
                        className="max-w-full rounded-lg border border-gray-200 shadow-sm mx-auto"
                        style={{ maxHeight: '400px' }}
                      />
                    </div>
                  )}

                  {/* Page Text */}
                  {page.text && (
                    <div className="prose prose-lg max-w-none">
                      <p className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {page.text}
                      </p>
                    </div>
                  )}

                  {/* Empty page indicator */}
                  {!page.text && !page.imageUrl && (
                    <p className="text-gray-400 italic text-center py-8">
                      (Empty page)
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No pages in this book yet.</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t p-4 flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={onClose}
          >
            Close
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              // TODO: Add share functionality
              alert('Share functionality coming soon!');
            }}
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </Card>
    </div>
  );
};
