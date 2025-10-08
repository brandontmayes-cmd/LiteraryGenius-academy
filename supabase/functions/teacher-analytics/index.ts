import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { action, teacherId, classId, timeRange = '30d' } = await req.json()

    switch (action) {
      case 'getClassAnalytics':
        return await getClassAnalytics(supabaseClient, teacherId, classId, timeRange)
      case 'getStudentPerformance':
        return await getStudentPerformance(supabaseClient, teacherId, classId)
      case 'identifyStrugglingStudents':
        return await identifyStrugglingStudents(supabaseClient, classId)
      case 'generateProgressReport':
        return await generateProgressReport(supabaseClient, classId, timeRange)
      default:
        throw new Error('Invalid action')
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function getClassAnalytics(supabase: any, teacherId: string, classId: string, timeRange: string) {
  const days = parseInt(timeRange.replace('d', ''))
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  // Get quiz results
  const { data: quizResults } = await supabase
    .from('quiz_results')
    .select(`
      *, 
      student:profiles(name),
      quiz:quizzes(title, subject)
    `)
    .eq('class_id', classId)
    .gte('created_at', startDate.toISOString())

  // Get assignment submissions
  const { data: submissions } = await supabase
    .from('assignment_submissions')
    .select(`
      *, 
      student:profiles(name),
      assignment:assignments(title, subject)
    `)
    .eq('class_id', classId)
    .gte('created_at', startDate.toISOString())

  // Calculate analytics
  const analytics = {
    totalAssessments: (quizResults?.length || 0) + (submissions?.length || 0),
    averageScore: calculateAverageScore([...quizResults || [], ...submissions || []]),
    completionRate: calculateCompletionRate(quizResults || [], submissions || []),
    subjectPerformance: calculateSubjectPerformance([...quizResults || [], ...submissions || []]),
    timeSeriesData: generateTimeSeriesData([...quizResults || [], ...submissions || []], days),
    topPerformers: identifyTopPerformers([...quizResults || [], ...submissions || []]),
    improvementTrends: calculateImprovementTrends([...quizResults || [], ...submissions || []])
  }

  return new Response(
    JSON.stringify({ analytics }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

function calculateAverageScore(results: any[]) {
  if (results.length === 0) return 0
  const total = results.reduce((sum, result) => sum + (result.score || 0), 0)
  return Math.round((total / results.length) * 100) / 100
}

function calculateCompletionRate(quizResults: any[], submissions: any[]) {
  const completed = [...quizResults, ...submissions].filter(r => r.status === 'completed')
  const total = quizResults.length + submissions.length
  return total > 0 ? Math.round((completed.length / total) * 100) : 0
}

function calculateSubjectPerformance(results: any[]) {
  const subjects: { [key: string]: { total: number, count: number } } = {}
  
  results.forEach(result => {
    const subject = result.quiz?.subject || result.assignment?.subject || 'General'
    if (!subjects[subject]) subjects[subject] = { total: 0, count: 0 }
    subjects[subject].total += result.score || 0
    subjects[subject].count += 1
  })

  return Object.entries(subjects).map(([subject, data]) => ({
    subject,
    averageScore: Math.round((data.total / data.count) * 100) / 100,
    assessmentCount: data.count
  }))
}

function generateTimeSeriesData(results: any[], days: number) {
  const data = []
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dayResults = results.filter(r => {
      const resultDate = new Date(r.created_at)
      return resultDate.toDateString() === date.toDateString()
    })
    
    data.push({
      date: date.toISOString().split('T')[0],
      assessments: dayResults.length,
      averageScore: calculateAverageScore(dayResults)
    })
  }
  return data
}

function identifyTopPerformers(results: any[]) {
  const studentScores: { [key: string]: { name: string, scores: number[], total: number } } = {}
  
  results.forEach(result => {
    const studentId = result.student_id
    const studentName = result.student?.name || 'Unknown'
    if (!studentScores[studentId]) {
      studentScores[studentId] = { name: studentName, scores: [], total: 0 }
    }
    studentScores[studentId].scores.push(result.score || 0)
    studentScores[studentId].total += result.score || 0
  })

  return Object.entries(studentScores)
    .map(([id, data]) => ({
      studentId: id,
      name: data.name,
      averageScore: data.total / data.scores.length,
      assessmentCount: data.scores.length
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 5)
}

function calculateImprovementTrends(results: any[]) {
  const studentTrends: { [key: string]: { name: string, scores: { date: string, score: number }[] } } = {}
  
  results.forEach(result => {
    const studentId = result.student_id
    const studentName = result.student?.name || 'Unknown'
    if (!studentTrends[studentId]) {
      studentTrends[studentId] = { name: studentName, scores: [] }
    }
    studentTrends[studentId].scores.push({
      date: result.created_at,
      score: result.score || 0
    })
  })

  return Object.entries(studentTrends)
    .map(([id, data]) => {
      const sortedScores = data.scores.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const firstHalf = sortedScores.slice(0, Math.ceil(sortedScores.length / 2))
      const secondHalf = sortedScores.slice(Math.ceil(sortedScores.length / 2))
      
      const firstAvg = firstHalf.reduce((sum, s) => sum + s.score, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, s) => sum + s.score, 0) / secondHalf.length
      
      return {
        studentId: id,
        name: data.name,
        improvement: secondAvg - firstAvg,
        assessmentCount: sortedScores.length
      }
    })
    .filter(t => t.assessmentCount >= 4)
    .sort((a, b) => b.improvement - a.improvement)
}

async function identifyStrugglingStudents(supabase: any, classId: string) {
  const { data: recentResults } = await supabase
    .from('quiz_results')
    .select(`
      *, 
      student:profiles(name)
    `)
    .eq('class_id', classId)
    .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())

  const studentPerformance: { [key: string]: { name: string, scores: number[], avgScore: number } } = {}
  
  recentResults?.forEach(result => {
    const studentId = result.student_id
    if (!studentPerformance[studentId]) {
      studentPerformance[studentId] = { 
        name: result.student?.name || 'Unknown', 
        scores: [], 
        avgScore: 0 
      }
    }
    studentPerformance[studentId].scores.push(result.score || 0)
  })

  const strugglingStudents = Object.entries(studentPerformance)
    .map(([id, data]) => ({
      studentId: id,
      name: data.name,
      averageScore: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length,
      assessmentCount: data.scores.length,
      consistentlyLow: data.scores.filter(s => s < 60).length / data.scores.length > 0.7
    }))
    .filter(student => student.averageScore < 65 || student.consistentlyLow)
    .sort((a, b) => a.averageScore - b.averageScore)

  return new Response(
    JSON.stringify({ strugglingStudents }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}