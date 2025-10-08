import { supabase } from './supabase'
import type { UserProfile, Student, Teacher, Assignment, Grade } from './supabase'

// User Profile Helpers
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
  return data
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Student Helpers
export async function getStudentByUserId(userId: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  if (error) {
    console.error('Error fetching student:', error)
    return null
  }
  return data
}

export async function updateStudentXP(studentId: string, xpToAdd: number) {
  const { data: student } = await supabase
    .from('students')
    .select('total_xp')
    .eq('id', studentId)
    .single()
  
  if (!student) return null
  
  const newXP = student.total_xp + xpToAdd
  const newLevel = Math.floor(newXP / 1000) + 1
  
  const { data, error } = await supabase
    .from('students')
    .update({ 
      total_xp: newXP,
      level: newLevel 
    })
    .eq('id', studentId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// Assignment Helpers
export async function getAssignmentsByTeacher(teacherId: string): Promise<Assignment[]> {
  const { data, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('teacher_id', teacherId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching assignments:', error)
    return []
  }
  return data || []
}

export async function getAssignmentsForStudent(gradeLevel?: number): Promise<Assignment[]> {
  let query = supabase
    .from('assignments')
    .select('*')
    .order('due_date', { ascending: true })
  
  if (gradeLevel) {
    query = query.eq('grade_level', gradeLevel)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching assignments:', error)
    return []
  }
  return data || []
}

// Grade Helpers
export async function getStudentGrades(studentId: string): Promise<Grade[]> {
  const { data, error } = await supabase
    .from('grades')
    .select('*, assignments(*)')
    .eq('student_id', studentId)
    .order('graded_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching grades:', error)
    return []
  }
  return data || []
}

export async function calculateGPA(studentId: string): Promise<number> {
  const grades = await getStudentGrades(studentId)
  
  if (grades.length === 0) return 0
  
  const totalPercentage = grades.reduce((sum, grade) => {
    return sum + (grade.score / grade.max_score) * 100
  }, 0)
  
  return (totalPercentage / grades.length) / 25 // Convert to 4.0 scale
}
