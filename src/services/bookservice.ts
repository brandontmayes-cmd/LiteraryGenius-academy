// Mock BookService (no database) - for testing

export interface Book {
  id: string;
  student_id?: string;
  title: string;
  author: string;
  genre?: string;
  cover_image?: string;
  status: 'draft' | 'published';
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

// Generate UUID-like IDs
function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Simple in-memory storage (resets on page refresh)
let mockBooks: Book[] = [];

export class BookService {
  
  // Save or update a book
  static async saveBook(bookData: any, studentId: string): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      const book: Book = {
        id: bookData.id || generateId(),  // ← Fixed!
        student_id: studentId,
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre,
        cover_image: bookData.coverImage,
        status: 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        pages: bookData.pages || []
      };

      // Update existing or add new
      const existingIndex = mockBooks.findIndex(b => b.id === book.id);
      if (existingIndex >= 0) {
        mockBooks[existingIndex] = book;
      } else {
        mockBooks.push(book);
      }

      console.log('✅ Book saved (in-memory):', book);
      return { success: true, bookId: book.id };

    } catch (error: any) {
      console.error('❌ Error saving book:', error);
      return { success: false, error: error.message };
    }
  }

  // Publish a book
  static async publishBook(bookData: any, studentId: string): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      // First save it
      const saveResult = await this.saveBook(bookData, studentId);
      if (!saveResult.success) return saveResult;

      // Then mark as published
      const book = mockBooks.find(b => b.id === saveResult.bookId);
      if (book) {
        book.status = 'published';
        book.published_at = new Date().toISOString();
      }

      console.log('✅ Book published (in-memory):', book);
      return { success: true, bookId: saveResult.bookId };

    } catch (error: any) {
      console.error('❌ Error publishing book:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all books for a student
  static async getStudentBooks(studentId: string): Promise<Book[]> {
    try {
      const books = mockBooks.filter(b => b.student_id === studentId);
      console.log('📚 Loaded books (in-memory):', books);
      return books;

    } catch (error: any) {
      console.error('❌ Error fetching books:', error);
      return [];
    }
  }

  // Get a specific book
  static async getBook(bookId: string): Promise<Book | null> {
    try {
      const book = mockBooks.find(b => b.id === bookId);
      return book || null;

    } catch (error: any) {
      console.error('❌ Error fetching book:', error);
      return null;
    }
  }

  // Delete a book
  static async deleteBook(bookId: string): Promise<{ success: boolean; error?: string }> {
    try {
      mockBooks = mockBooks.filter(b => b.id !== bookId);
      console.log('✅ Book deleted (in-memory)');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Error deleting book:', error);
      return { success: false, error: error.message };
    }
  }
}