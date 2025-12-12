// src/services/bookService.ts
// Real database implementation using Supabase

import { supabase } from '@/lib/supabase';

export interface Book {
  id: string;
  student_id?: string;
  title: string;
  author: string;
  genre?: string;
  cover_image?: string;
  status: 'draft' | 'published';
  is_public?: boolean;
  is_featured?: boolean;
  view_count?: number;
  like_count?: number;
  created_at?: string;
  updated_at?: string;
  published_at?: string;
  pages?: BookPage[];
}

export interface BookPage {
  id: string;
  book_id?: string;
  page_number: number;
  text?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export class BookService {
  
  // Save or update a book
  static async saveBook(bookData: any, studentId: string): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      const bookPayload = {
        student_id: studentId,
        title: bookData.title || 'Untitled Book',
        author: bookData.author || 'Unknown Author',
        genre: bookData.genre,
        cover_image: bookData.coverImage,
        status: 'draft' as const,
      };

      let bookId = bookData.id;

      if (bookId) {
        // Update existing book
        const { error: bookError } = await supabase
          .from('books')
          .update(bookPayload)
          .eq('id', bookId)
          .eq('student_id', studentId);

        if (bookError) throw bookError;

        // Delete existing pages
        await supabase
          .from('pages')
          .delete()
          .eq('book_id', bookId);

      } else {
        // Insert new book
        const { data: newBook, error: bookError } = await supabase
          .from('books')
          .insert(bookPayload)
          .select()
          .single();

        if (bookError) throw bookError;
        bookId = newBook.id;
      }

      // Insert pages
      if (bookData.pages && bookData.pages.length > 0) {
        const pagesPayload = bookData.pages.map((page: any, index: number) => ({
          book_id: bookId,
          page_number: page.pageNumber || index + 1,
          text: page.text,
          image_url: page.imageUrl,
        }));

        const { error: pagesError } = await supabase
          .from('pages')
          .insert(pagesPayload);

        if (pagesError) throw pagesError;
      }

      console.log('✅ Book saved to database:', bookId);
      return { success: true, bookId };

    } catch (error: any) {
      console.error('❌ Error saving book:', error);
      return { success: false, error: error.message };
    }
  }

  // Publish a book
  static async publishBook(bookData: any, studentId: string): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      // First save the book as draft
      const saveResult = await this.saveBook(bookData, studentId);
      if (!saveResult.success) return saveResult;

      // Then update to published
      const { error } = await supabase
        .from('books')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', saveResult.bookId)
        .eq('student_id', studentId);

      if (error) throw error;

      console.log('✅ Book published to database:', saveResult.bookId);
      return { success: true, bookId: saveResult.bookId };

    } catch (error: any) {
      console.error('❌ Error publishing book:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all books for a student
  static async getStudentBooks(studentId: string): Promise<Book[]> {
    try {
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select(`
          *,
          pages (*)
        `)
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false });

      if (booksError) throw booksError;

      console.log('📚 Loaded books from database:', books?.length || 0);
      return books || [];

    } catch (error: any) {
      console.error('❌ Error fetching books:', error);
      return [];
    }
  }

  // Get a specific book
  static async getBook(bookId: string): Promise<Book | null> {
    try {
      const { data: book, error } = await supabase
        .from('books')
        .select(`
          *,
          pages (*)
        `)
        .eq('id', bookId)
        .single();

      if (error) throw error;

      return book;

    } catch (error: any) {
      console.error('❌ Error fetching book:', error);
      return null;
    }
  }

  // Delete a book
  static async deleteBook(bookId: string, studentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)
        .eq('student_id', studentId);

      if (error) throw error;

      console.log('✅ Book deleted from database');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error deleting book:', error);
      return { success: false, error: error.message };
    }
  }
}
