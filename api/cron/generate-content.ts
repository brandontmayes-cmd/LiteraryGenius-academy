// File: api/cron/generate-content.ts
// This runs automatically every Sunday at 9 PM
// Generates weekly content for all grades and subjects

import { createClient } from '@supabase/supabase-js';

// Configuration for Vercel Cron
export const config = {
  runtime: 'edge',
  // Uncomment when ready to schedule (runs every Sunday at 9 PM)
  // schedule: '0 21 * * 0',
};

// Content generation templates
const CONTENT_TEMPLATES = {
  math_problems: {
    K: 'Create 5 simple counting and number recognition problems for Kindergarten students.',
    '1': 'Create 5 addition and subtraction word problems (within 20) for 1st grade.',
    '2': 'Create 5 two-digit addition and subtraction problems for 2nd grade.',
    '3': 'Create 5 multiplication and division word problems for 3rd grade.',
    '4': 'Create 5 multi-step word problems involving all four operations for 4th grade.',
    '5': 'Create 5 fraction and decimal problems for 5th grade.',
    '6': 'Create 5 ratio, rate, and percentage problems for 6th grade.',
    '7': 'Create 5 algebra and equation problems for 7th grade.',
    '8': 'Create 5 geometry and algebraic expression problems for 8th grade.',
  },
  
  spelling_words: {
    K: 'Create a list of 5 simple CVC (consonant-vowel-consonant) words for Kindergarten.',
    '1': 'Create a list of 10 words with short vowel sounds for 1st grade.',
    '2': 'Create a list of 12 words with long vowel patterns for 2nd grade.',
    '3': 'Create a list of 15 words with consonant blends and digraphs for 3rd grade.',
    '4': 'Create a list of 15 words with prefixes and suffixes for 4th grade.',
    '5': 'Create a list of 20 multi-syllable words for 5th grade.',
    '6': 'Create a list of 20 words with Greek and Latin roots for 6th grade.',
    '7': 'Create a list of 20 challenging vocabulary words for 7th grade.',
    '8': 'Create a list of 20 advanced academic vocabulary words for 8th grade.',
  },

  writing_prompts: {
    K: 'Create 3 simple picture-based writing prompts for Kindergarten (1-2 sentences).',
    '1': 'Create 3 narrative writing prompts for 1st grade (3-5 sentences).',
    '2': 'Create 3 creative writing prompts for 2nd grade (1 paragraph).',
    '3': 'Create 3 opinion writing prompts for 3rd grade (3 paragraphs).',
    '4': 'Create 3 informative writing prompts for 4th grade (4-5 paragraphs).',
    '5': 'Create 3 argumentative writing prompts for 5th grade (5 paragraphs).',
    '6': 'Create 3 analytical writing prompts for 6th grade.',
    '7': 'Create 3 research-based writing prompts for 7th grade.',
    '8': 'Create 3 persuasive essay prompts for 8th grade.',
  }
};

async function generateContent(
  contentType: string,
  grade: string,
  subject: string,
  anthropicKey: string
) {
  const template = CONTENT_TEMPLATES[contentType]?.[grade];
  if (!template) return null;

  const prompt = `You are an experienced ${grade} grade teacher creating educational content.

${template}

Requirements:
- Content must be age-appropriate for ${grade} grade
- Follow Common Core standards
- Be engaging and clear
- Include answer keys where applicable

Return ONLY a JSON object with this structure:
{
  "title": "Brief descriptive title",
  "items": [array of problems/words/prompts],
  "answers": [answer key if applicable],
  "instructions": "Student instructions"
}

Return ONLY valid JSON, no other text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.content[0].text;
  
  // Extract JSON from response (Claude sometimes wraps it in markdown)
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

export default async function handler(req: Request) {
  const startTime = Date.now();
  
  try {
    // 1. Get environment variables
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!anthropicKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables');
    }

    // 2. Initialize Supabase with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 3. Determine current week number (1-36 for school year)
    const now = new Date();
    const schoolYearStart = new Date(now.getFullYear(), 7, 1); // Aug 1
    if (now < schoolYearStart) {
      schoolYearStart.setFullYear(schoolYearStart.getFullYear() - 1);
    }
    const weekNumber = Math.floor(
      (now.getTime() - schoolYearStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    ) + 1;

    console.log(`🤖 Starting content generation for Week ${weekNumber}`);

    // 4. Generate content for each grade and type
    const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8'];
    const contentTypes = ['math_problems', 'spelling_words', 'writing_prompts'];
    
    let itemsGenerated = 0;
    const errors = [];

    for (const grade of grades) {
      for (const contentType of contentTypes) {
        try {
          console.log(`Generating ${contentType} for grade ${grade}...`);
          
          const content = await generateContent(
            contentType,
            grade,
            contentType.includes('math') ? 'Math' : 'English Language Arts',
            anthropicKey
          );

          if (content) {
            // Save to database
            const { error } = await supabase
              .from('ai_generated_content')
              .insert({
                content_type: contentType,
                subject: contentType.includes('math') ? 'Math' : 'English Language Arts',
                grade_level: grade,
                title: content.title || `${contentType} - Week ${weekNumber}`,
                content: content,
                week_number: weekNumber,
                status: 'published',
              });

            if (error) {
              console.error(`Error saving ${contentType} for grade ${grade}:`, error);
              errors.push(`${grade}-${contentType}: ${error.message}`);
            } else {
              itemsGenerated++;
              console.log(`✅ Saved ${contentType} for grade ${grade}`);
            }
          }

          // Rate limiting: wait 1 second between API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error: any) {
          console.error(`Error generating ${contentType} for grade ${grade}:`, error);
          errors.push(`${grade}-${contentType}: ${error.message}`);
        }
      }
    }

    // 5. Log the run
    const executionTime = Date.now() - startTime;
    await supabase.from('content_generation_log').insert({
      status: errors.length === 0 ? 'success' : 'partial',
      items_generated: itemsGenerated,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      execution_time_ms: executionTime,
      metadata: {
        week_number: weekNumber,
        errors_count: errors.length,
      },
    });

    console.log(`✅ Content generation complete! Generated ${itemsGenerated} items in ${executionTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        items_generated: itemsGenerated,
        execution_time_ms: executionTime,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Fatal error in content generation:', error);
    
    const executionTime = Date.now() - startTime;
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        execution_time_ms: executionTime,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
