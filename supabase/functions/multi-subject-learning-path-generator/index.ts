import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LearningPathRequest {
  studentId: string;
  subjects: string[];
  focusAreas?: string[];
  crossCurricular?: boolean;
  difficultyPreference?: 'adaptive' | 'challenging' | 'supportive';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { studentId, subjects, focusAreas, crossCurricular, difficultyPreference } = await req.json() as LearningPathRequest

    // Get student performance data across all subjects
    const { data: performanceData } = await supabase
      .from('student_performance_analytics')
      .select('*')
      .eq('student_id', studentId)

    // Get standards mastery data
    const { data: masteryData } = await supabase
      .from('student_standards_mastery')
      .select('*')
      .eq('student_id', studentId)

    // Get cross-curricular connections
    const { data: connections } = await supabase
      .from('cross_curricular_connections')
      .select('*')

    // AI-powered path generation
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'system',
          content: `You are an AI educational specialist creating personalized multi-subject learning paths. 
          Analyze student performance data and create adaptive learning sequences that:
          1. Address individual strengths and weaknesses across subjects
          2. Create cross-curricular connections when beneficial
          3. Adapt difficulty based on performance patterns
          4. Suggest remediation and enrichment activities
          5. Sequence activities based on prerequisites and mastery levels`
        }, {
          role: 'user',
          content: `Create a personalized learning path for student ${studentId}:
          
          Subjects: ${subjects.join(', ')}
          Focus Areas: ${focusAreas?.join(', ') || 'General curriculum progression'}
          Cross-curricular: ${crossCurricular ? 'Yes' : 'No'}
          Difficulty Preference: ${difficultyPreference || 'adaptive'}
          
          Performance Data: ${JSON.stringify(performanceData)}
          Mastery Data: ${JSON.stringify(masteryData)}
          Cross-curricular Connections: ${JSON.stringify(connections)}
          
          Return a JSON object with:
          - multiSubjectPath: array of learning sequences for each subject
          - crossCurricularActivities: activities that connect multiple subjects
          - adaptiveDifficulty: difficulty adjustments based on performance
          - reasoning: explanation of the path design`
        }],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const aiResult = await openAIResponse.json()
    const pathData = JSON.parse(aiResult.choices[0].message.content)

    return new Response(JSON.stringify({
      success: true,
      learningPath: pathData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})