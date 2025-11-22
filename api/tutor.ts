// File: api/tutor.ts
// FIXED VERSION - Now maintains conversation history!

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, subject, gradeLevel, context } = await req.json();

    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Build the system prompt based on grade level and subject
    const systemPrompt = `You are a patient, encouraging AI tutor helping a ${gradeLevel} grade student learn ${subject}.

Your teaching style:
- Use age-appropriate language for grade ${gradeLevel}
- Be encouraging and supportive
- Break down complex concepts into simple steps
- Use examples and analogies that ${gradeLevel} graders can relate to
- Ask guiding questions to help students think
- Celebrate their progress and effort
- When they get something wrong, gently correct and explain why
- Use emojis occasionally to keep things fun and engaging

Current context: ${context}

Remember: You're talking to a ${gradeLevel} grader, so keep explanations simple and encouraging!`;

    // Call Anthropic API with conversation history
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
        system: systemPrompt,
        messages: messages, // Pass the FULL conversation history!
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Anthropic API error:', errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Tutor API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
