import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  // Read environment variable inside the handler for Edge Functions
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { systemPrompt, userPrompt } = body;

    if (!systemPrompt || !userPrompt) {
      return NextResponse.json(
        { error: 'Both systemPrompt and userPrompt are required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 1.2,
        max_tokens: 150,
        frequency_penalty: 0.8,
        presence_penalty: 0.6,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const corruptedText = data.choices[0].message.content.trim();

    return NextResponse.json({ corruptedText });
  } catch (error) {
    console.error('Corruption error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to corrupt prompt' },
      { status: 500 }
    );
  }
}
