// File: api/tutor.ts
// This is a Vercel serverless function that keeps your API key secure

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const { message, subject, gradeLevel, context } = body;

    // Get API key from environment variable (secure, server-side only)
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY not set in environment variables');
      return new Response(
        JSON.stringify({ error: 'API key not configured on server' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Call Anthropic API from the server (key stays hidden)
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: `You are a helpful ${subject || 'General'} tutor for a ${gradeLevel || '4th'} grade student at Literary Genius Academy.

Your teaching approach:
- Be encouraging and patient
- Use age-appropriate language (${gradeLevel || '4th'} grade level)
- Give concrete examples from daily life
- Ask questions to check understanding
- Guide thinking rather than giving direct answers
- Make learning fun and engaging
- Never just give the answer - help them figure it out

Student question: ${message}

Context: ${context || 'General learning'}

Provide a clear, helpful response that helps the student learn and think critically.`
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', errorData);
      return new Response(
        JSON.stringify({ 
          error: `API error: ${response.status}`,
          details: errorData.error?.message || 'Unknown error'
        }), 
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ 
        response: data.content[0].text 
      }), 
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Tutor API error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
