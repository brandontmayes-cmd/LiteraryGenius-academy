import { supabase } from '@/lib/supabase'
import type { Book, BookPage } from '@/lib/supabase'

export class BookService {
  
  // Save or update a book with all its pages
  static async saveBook(bookData: any, studentId: string): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      // 1. Upsert book record
      const { data: book, error: bookError } = await supabase
        .from('books')
        .upsert({
          id: bookData.id || undefined, // If exists, update; else create
          student_id: studentId,
          title: bookData.title,
          author: bookData.author,
          genre: bookData.genre,
          cover_image: bookData.coverImage,
          status: 'draft',
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (bookError) throw bookError

      // 2. Delete existing pages for this book (we'll recreate them)
      await supabase
        .from('book_pages')
        .delete()
        .eq('book_id', book.id)

      // 3. Insert all pages
      if (bookData.pages && bookData.pages.length > 0) {
        const pages = bookData.pages.map((page: any) => ({
          book_id: book.id,
          page_number: page.pageNumber,
          text: page.text,
          image_url: page.imageData ? null : page.imageUrl, // Will upload images separately
          // TODO: Upload images to Supabase Storage and get URLs
        }))

        const { error: pagesError } = await supabase
          .from('book_pages')
          .insert(pages)

        if (pagesError) throw pagesError
      }

      return { success: true, bookId: book.id }

    } catch (error: any) {
      console.error('Error saving book:', error)
      return { success: false, error: error.message }
    }
  }

  // Publish a book
  static async publishBook(bookData: any, studentId: string): Promise<{ success: boolean; bookId?: string; error?: string }> {
    try {
      // First save the book
      const saveResult = await this.saveBook(bookData, studentId)
      if (!saveResult.success) return saveResult

      // Then update status to published
      const { error } = await supabase
        .from('books')
        .update({
          status: 'published',
          published_at: new Date().toISOString()
        })
        .eq('id', saveResult.bookId)

      if (error) throw error

      return { success: true, bookId: saveResult.bookId }

    } catch (error: any) {
      console.error('Error publishing book:', error)
      return { success: false, error: error.message }
    }
  }

  // Get all books for a student
  static async getStudentBooks(studentId: string): Promise<Book[]> {
    try {
      const { data: books, error } = await supabase
        .from('books')
        .select(`
          *,
          pages:book_pages(*)
        `)
        .eq('student_id', studentId)
        .order('updated_at', { ascending: false })

      if (error) throw error

      return books || []

    } catch (error: any) {
      console.error('Error fetching books:', error)
      return []
    }
  }

  // Get a specific book with all pages
  static async getBook(bookId: string): Promise<Book | null> {
    try {
      const { data: book, error } = await supabase
        .from('books')
        .select(`
          *,
          pages:book_pages(*)
        `)
        .eq('id', bookId)
        .single()

      if (error) throw error

      return book

    } catch (error: any) {
      console.error('Error fetching book:', error)
      return null
    }
  }

  // Delete a book
  static async deleteBook(bookId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', bookId)

      if (error) throw error

      return { success: true }

    } catch (error: any) {
      console.error('Error deleting book:', error)
      return { success: false, error: error.message }
    }
  }
}