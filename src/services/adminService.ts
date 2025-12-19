// adminService.ts - UPDATED VERSION WITH PROFILES TABLE
// Admin-specific database queries for Literary Genius Academy

import { supabase } from '@/lib/supabase';

export const AdminService = {
  /**
   * Get all students with their stats
   */
  async getAllStudents() {
    try {
      console.log('📚 [AdminService] Getting all students...');
      
      // Get all profiles with role 'student'
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });
      
      if (profileError) {
        console.error('❌ [AdminService] Error fetching profiles:', profileError);
        return { success: false, data: [] };
      }

      // Get book counts for each student
      const studentsWithStats = await Promise.all(
        profiles.map(async (profile) => {
          const { data: books } = await supabase
            .from('books')
            .select('*')
            .eq('user_id', profile.id);

          const publishedCount = books?.filter(b => b.status === 'published').length || 0;
          const draftCount = books?.filter(b => b.status === 'draft').length || 0;
          const totalPages = books?.reduce((sum, book) => sum + (book.pages?.length || 0), 0) || 0;

          return {
            id: profile.id,
            email: profile.email,
            name: profile.full_name || 'Unknown',
            age: profile.age,
            gradeLevel: profile.grade_level,
            parentEmail: profile.parent_email,
            createdAt: profile.created_at,
            lastActive: profile.last_login_at,
            booksCount: books?.length || 0,
            publishedCount,
            draftCount,
            totalPages,
            isActive: profile.is_active,
            subscriptionStatus: profile.subscription_status
          };
        })
      );

      console.log(`✅ [AdminService] Found ${studentsWithStats.length} students`);
      return { success: true, data: studentsWithStats };
    } catch (error) {
      console.error('❌ [AdminService] Unexpected error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get all parents with their children
   */
  async getAllParents() {
    try {
      console.log('👨‍👩‍👧 [AdminService] Getting all parents...');
      
      const { data: parents, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'parent')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ [AdminService] Error fetching parents:', error);
        return { success: false, data: [] };
      }

      // Get children count for each parent
      const parentsWithChildren = await Promise.all(
        parents.map(async (parent) => {
          const { count } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('parent_email', parent.email)
            .eq('role', 'student');

          return {
            ...parent,
            childrenCount: count || 0
          };
        })
      );

      console.log(`✅ [AdminService] Found ${parentsWithChildren.length} parents`);
      return { success: true, data: parentsWithChildren };
    } catch (error) {
      console.error('❌ [AdminService] Unexpected error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get all books from all students
   */
  async getAllBooks() {
    try {
      console.log('📖 [AdminService] Getting all books...');
      
      const { data: books, error } = await supabase
        .from('books')
        .select(`
          *,
          profile:user_id (
            email,
            full_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [AdminService] Error fetching books:', error);
        return { success: false, data: [] };
      }

      // Format with author name
      const formattedBooks = books.map(book => ({
        ...book,
        authorEmail: book.profile?.email,
        authorName: book.author || book.profile?.full_name || 'Unknown'
      }));

      console.log(`✅ [AdminService] Found ${formattedBooks.length} books`);
      return { success: true, data: formattedBooks };
    } catch (error) {
      console.error('❌ [AdminService] Unexpected error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get platform statistics
   */
  async getStatistics() {
    try {
      console.log('📊 [AdminService] Getting statistics...');
      
      // Get total students
      const { count: studentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // Get total parents
      const { count: parentCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'parent');

      // Get all books
      const { data: allBooks } = await supabase
        .from('books')
        .select('*');

      const publishedBooks = allBooks?.filter(b => b.status === 'published').length || 0;
      const draftBooks = allBooks?.filter(b => b.status === 'draft').length || 0;
      const totalPages = allBooks?.reduce((sum, book) => 
        sum + (book.pages?.length || 0), 0
      ) || 0;

      // Get active users (updated in last 24 hours)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const { count: activeCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('last_login_at', yesterday.toISOString());

      const stats = {
        totalStudents: studentCount || 0,
        totalParents: parentCount || 0,
        totalUsers: (studentCount || 0) + (parentCount || 0),
        totalBooks: allBooks?.length || 0,
        publishedBooks,
        draftBooks,
        totalPages,
        activeToday: activeCount || 0,
        averagePagesPerBook: allBooks?.length ? Math.round(totalPages / allBooks.length) : 0
      };

      console.log('✅ [AdminService] Statistics:', stats);
      return { success: true, data: stats };
    } catch (error) {
      console.error('❌ [AdminService] Error getting statistics:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Get recent activity (last 50 events)
   */
  async getRecentActivity() {
    try {
      console.log('⏰ [AdminService] Getting recent activity...');
      
      const { data: recentBooks } = await supabase
        .from('books')
        .select(`
          *,
          profile:user_id (
            email,
            full_name
          )
        `)
        .order('updated_at', { ascending: false })
        .limit(50);

      const activities = recentBooks?.map(book => ({
        studentName: book.author || book.profile?.full_name || 'Unknown',
        studentEmail: book.profile?.email,
        action: book.status === 'published' ? 'published' : 'updated draft',
        bookTitle: book.title,
        timestamp: book.updated_at,
        bookId: book.id
      })) || [];

      console.log(`✅ [AdminService] Found ${activities.length} recent activities`);
      return { success: true, data: activities };
    } catch (error) {
      console.error('❌ [AdminService] Error getting activity:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get popular books (most pages or most recent)
   */
  async getPopularBooks(limit: number = 10) {
    try {
      console.log('🌟 [AdminService] Getting popular books...');
      
      const { data: books } = await supabase
        .from('books')
        .select(`
          *,
          profile:user_id (
            full_name
          )
        `)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(limit);

      const popularBooks = books?.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author || book.profile?.full_name || 'Unknown',
        pages: book.pages?.length || 0,
        createdAt: book.created_at,
        // Downloads would need separate tracking table
        downloads: 0 
      })) || [];

      console.log(`✅ [AdminService] Found ${popularBooks.length} popular books`);
      return { success: true, data: popularBooks };
    } catch (error) {
      console.error('❌ [AdminService] Error getting popular books:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Search students by name or email
   */
  async searchStudents(query: string) {
    try {
      console.log(`🔍 [AdminService] Searching for: "${query}"`);
      
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`);

      if (error) {
        console.error('❌ [AdminService] Search error:', error);
        return { success: false, data: [] };
      }

      console.log(`✅ [AdminService] Found ${profiles.length} matching students`);
      return { success: true, data: profiles };
    } catch (error) {
      console.error('❌ [AdminService] Unexpected search error:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Get detailed student info
   */
  async getStudentDetails(userId: string) {
    try {
      console.log(`👤 [AdminService] Getting details for user: ${userId}`);
      
      // Get profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('❌ [AdminService] Error fetching profile:', profileError);
        return { success: false, data: null };
      }

      // Get all their books
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      const details = {
        profile,
        books: books || [],
        stats: {
          totalBooks: books?.length || 0,
          published: books?.filter(b => b.status === 'published').length || 0,
          drafts: books?.filter(b => b.status === 'draft').length || 0,
          totalPages: books?.reduce((sum, b) => sum + (b.pages?.length || 0), 0) || 0
        }
      };

      console.log('✅ [AdminService] Student details retrieved');
      return { success: true, data: details };
    } catch (error) {
      console.error('❌ [AdminService] Error getting student details:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Update user profile (admin only)
   */
  async updateProfile(userId: string, updates: any) {
    try {
      console.log(`✏️ [AdminService] Updating profile for: ${userId}`);
      
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('❌ [AdminService] Update error:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ [AdminService] Profile updated successfully');
      return { success: true, data };
    } catch (error) {
      console.error('❌ [AdminService] Unexpected update error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a student and all their books
   */
  async deleteStudent(userId: string) {
    try {
      console.log(`🗑️ [AdminService] Deleting user: ${userId}`);
      
      // Delete all their books first
      const { error: booksError } = await supabase
        .from('books')
        .delete()
        .eq('user_id', userId);

      if (booksError) {
        console.error('❌ [AdminService] Error deleting books:', booksError);
        return { success: false, error: booksError.message };
      }

      // Delete profile (will cascade delete from auth.users)
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (profileError) {
        console.error('❌ [AdminService] Error deleting profile:', profileError);
        return { success: false, error: profileError.message };
      }

      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);

      if (authError) {
        console.error('❌ [AdminService] Error deleting auth user:', authError);
        return { success: false, error: authError.message };
      }

      console.log('✅ [AdminService] User deleted successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ [AdminService] Unexpected deletion error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Export all data as CSV
   */
  async exportData(type: 'students' | 'books' | 'parents') {
    try {
      console.log(`📤 [AdminService] Exporting ${type} data...`);
      
      if (type === 'students') {
        const result = await this.getAllStudents();
        if (!result.success) throw new Error('Failed to fetch students');

        const headers = ['Name', 'Email', 'Age', 'Grade', 'Parent Email', 'Joined', 'Total Books', 'Published', 'Drafts', 'Total Pages', 'Status'];
        const rows = result.data.map(s => [
          s.name,
          s.email,
          s.age || 'N/A',
          s.gradeLevel || 'N/A',
          s.parentEmail || 'N/A',
          new Date(s.createdAt).toLocaleDateString(),
          s.booksCount,
          s.publishedCount,
          s.draftCount,
          s.totalPages,
          s.subscriptionStatus
        ]);

        console.log('✅ [AdminService] Students data exported');
        return { success: true, data: { headers, rows } };
        
      } else if (type === 'parents') {
        const result = await this.getAllParents();
        if (!result.success) throw new Error('Failed to fetch parents');

        const headers = ['Name', 'Email', 'Children Count', 'Joined', 'Status'];
        const rows = result.data.map(p => [
          p.full_name,
          p.email,
          p.childrenCount,
          new Date(p.created_at).toLocaleDateString(),
          p.subscription_status
        ]);

        console.log('✅ [AdminService] Parents data exported');
        return { success: true, data: { headers, rows } };
        
      } else {
        const result = await this.getAllBooks();
        if (!result.success) throw new Error('Failed to fetch books');

        const headers = ['Title', 'Author', 'Email', 'Status', 'Pages', 'Created', 'Updated'];
        const rows = result.data.map(b => [
          b.title,
          b.authorName,
          b.authorEmail,
          b.status,
          b.pages?.length || 0,
          new Date(b.created_at).toLocaleDateString(),
          new Date(b.updated_at).toLocaleDateString()
        ]);

        console.log('✅ [AdminService] Books data exported');
        return { success: true, data: { headers, rows } };
      }
    } catch (error) {
      console.error('❌ [AdminService] Export error:', error);
      return { success: false, data: null };
    }
  },

  /**
   * Check if current user is admin
   */
  async isCurrentUserAdmin() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      return profile?.is_admin === true;
    } catch (error) {
      console.error('❌ [AdminService] Error checking admin status:', error);
      return false;
    }
  }
};
