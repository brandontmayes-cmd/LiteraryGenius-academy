// bookService.ts - DIAGNOSTIC VERSION
// This will tell us exactly what's happening when you try to save

import { supabase } from '@/lib/supabase';

export const BookService = {
  /**
   * Get all books for a student
   */
  async getStudentBooks(userId: string) {
    console.log('📚 [BookService] getStudentBooks called');
    console.log('📚 [BookService] User ID:', userId);
    
    try {
      console.log('📚 [BookService] Querying Supabase...');
      
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('❌ [BookService] Supabase error:', error);
        console.error('❌ [BookService] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }
      
      console.log('✅ [BookService] Books loaded:', data?.length || 0);
      console.log('✅ [BookService] Books data:', data);
      return data || [];
      
    } catch (error: any) {
      console.error('❌ [BookService] Unexpected error:', error);
      console.error('❌ [BookService] Error stack:', error.stack);
      return [];
    }
  },

  /**
   * Save a book (draft)
   */
  async saveBook(book: any, userId: string) {
    console.log('💾 [BookService] ========== SAVE BOOK STARTED ==========');
    console.log('💾 [BookService] Book data:', JSON.stringify(book, null, 2));
    console.log('💾 [BookService] User ID:', userId);
    
    try {
      // Validation
      if (!book.title) {
        console.error('❌ [BookService] Validation failed: No title');
        return { success: false, error: 'Book title is required' };
      }
      
      if (!userId) {
        console.error('❌ [BookService] Validation failed: No user ID');
        return { success: false, error: 'User must be logged in' };
      }

      // Prepare data
      const bookData = {
        title: book.title,
        author: book.author || 'Young Author',
        genre: book.genre || null,
        cover_image: book.coverImage || null,
        pages: book.pages || [],
        status: 'draft',
        user_id: userId,
        updated_at: new Date().toISOString()
      };

      // Add ID if updating existing book
      if (book.id) {
        bookData.id = book.id;
        console.log('💾 [BookService] Updating existing book, ID:', book.id);
      } else {
        bookData.created_at = new Date().toISOString();
        console.log('💾 [BookService] Creating new book (no ID)');
      }

      console.log('💾 [BookService] Prepared data:', JSON.stringify(bookData, null, 2));
      console.log('💾 [BookService] Sending to Supabase...');

      const { data, error } = await supabase
        .from('books')
        .upsert(bookData, { 
          onConflict: 'id',
          returning: 'representation' 
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ [BookService] Supabase error:', error);
        console.error('❌ [BookService] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          success: false, 
          error: `Database error: ${error.message}` 
        };
      }
      
      console.log('✅ [BookService] Book saved successfully!');
      console.log('✅ [BookService] Saved book data:', data);
      console.log('💾 [BookService] ========== SAVE BOOK ENDED ==========');
      
      return { success: true, data };
      
    } catch (error: any) {
      console.error('❌ [BookService] Unexpected error:', error);
      console.error('❌ [BookService] Error message:', error.message);
      console.error('❌ [BookService] Error stack:', error.stack);
      console.log('💾 [BookService] ========== SAVE BOOK FAILED ==========');
      
      return { 
        success: false, 
        error: `Unexpected error: ${error.message}` 
      };
    }
  },

  /**
   * Publish a book
   */
  async publishBook(book: any, userId: string) {
    console.log('🎉 [BookService] ========== PUBLISH BOOK STARTED ==========');
    console.log('🎉 [BookService] Book data:', JSON.stringify(book, null, 2));
    console.log('🎉 [BookService] User ID:', userId);
    
    try {
      // Validation
      if (!book.title) {
        console.error('❌ [BookService] Validation failed: No title');
        return { success: false, error: 'Book title is required' };
      }
      
      if (!userId) {
        console.error('❌ [BookService] Validation failed: No user ID');
        return { success: false, error: 'User must be logged in' };
      }

      const hasContent = book.pages && book.pages.some((page: any) => page.text && page.text.trim());
      if (!hasContent) {
        console.error('❌ [BookService] Validation failed: No content');
        return { 
          success: false, 
          error: 'Please write something before publishing' 
        };
      }

      // Prepare data
      const bookData = {
        title: book.title,
        author: book.author || 'Young Author',
        genre: book.genre || null,
        cover_image: book.coverImage || null,
        pages: book.pages || [],
        status: 'published',
        user_id: userId,
        updated_at: new Date().toISOString(),
        published_at: new Date().toISOString()
      };

      if (book.id) {
        bookData.id = book.id;
        console.log('🎉 [BookService] Publishing existing book, ID:', book.id);
      } else {
        bookData.created_at = new Date().toISOString();
        console.log('🎉 [BookService] Publishing new book (no ID)');
      }

      console.log('🎉 [BookService] Prepared data:', JSON.stringify(bookData, null, 2));
      console.log('🎉 [BookService] Sending to Supabase...');

      const { data, error } = await supabase
        .from('books')
        .upsert(bookData, { 
          onConflict: 'id',
          returning: 'representation' 
        })
        .select()
        .single();
      
      if (error) {
        console.error('❌ [BookService] Supabase error:', error);
        console.error('❌ [BookService] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return { 
          success: false, 
          error: `Database error: ${error.message}` 
        };
      }
      
      console.log('✅ [BookService] Book published successfully!');
      console.log('✅ [BookService] Published book data:', data);
      console.log('🎉 [BookService] ========== PUBLISH BOOK ENDED ==========');
      
      return { success: true, data };
      
    } catch (error: any) {
      console.error('❌ [BookService] Unexpected error:', error);
      console.error('❌ [BookService] Error message:', error.message);
      console.error('❌ [BookService] Error stack:', error.stack);
      console.log('🎉 [BookService] ========== PUBLISH BOOK FAILED ==========');
      
      return { 
        success: false, 
        error: `Unexpected error: ${error.message}` 
      };
    }
  },

  /**
   * Delete a book
   */
  async deleteBook(bookId: string, userId: string) {
    console.log('🗑️ [BookService] Deleting book:', bookId);
    
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('user_id', userId);
      
      if (error) {
        console.error('❌ [BookService] Delete error:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to delete book' 
        };
      }
      
      console.log('✅ [BookService] Book deleted successfully');
      return { success: true };
      
    } catch (error: any) {
      console.error('❌ [BookService] Delete error:', error);
      return { 
        success: false, 
        error: error.message || 'An unexpected error occurred' 
      };
    }
  }
};
