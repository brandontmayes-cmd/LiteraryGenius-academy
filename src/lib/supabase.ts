// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
}

// Create Supabase client with enhanced configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'literary-genius-auth',
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'literary-genius-academy'
    }
  }
})

// Database helper types
export type UserRole = 'student' | 'teacher' | 'parent' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  role: UserRole
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Student {
  id: string
  user_id: string
  grade_level?: number
  school?: string
  parent_email?: string
  total_xp: number
  level: number
  streak_days: number
  coins: number
  created_at: string
}

export interface Teacher {
  id: string
  user_id: string
  school?: string
  subjects?: string[]
  bio?: string
  created_at: string
}

export interface Assignment {
  id: string
  teacher_id: string
  title: string
  description?: string
  type: 'essay' | 'quiz' | 'project' | 'homework'
  subject?: string
  grade_level?: number
  due_date?: string
  total_points: number
  standards?: string[]
  created_at: string
}

export interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_id: string
  content?: string
  file_urls?: string[]
  status: 'draft' | 'submitted' | 'graded'
  submitted_at?: string
  created_at: string
  updated_at: string
}

export interface Grade {
  id: string
  submission_id: string
  student_id: string
  assignment_id: string
  teacher_id?: string
  score: number
  max_score: number
  feedback?: string
  rubric_scores?: any
  graded_at: string
  created_at: string
}

export interface Book {
  id: string
  student_id: string
  title: string
  author: string
  genre?: string
  cover_image?: string
  status: 'draft' | 'published'
  is_public?: boolean
  is_featured?: boolean
  view_count?: number
  like_count?: number
  created_at: string
  updated_at: string
  published_at?: string
  pages?: BookPage[]
}

export interface BookPage {
  id: string
  book_id: string
  page_number: number
  text?: string
  image_url?: string
  created_at: string
  updated_at: string
}

// Service role client for server-side operations (admin functions)
export const supabaseFunctions = createClient(
  supabaseUrl, 
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: { persistSession: false }
  }
)
