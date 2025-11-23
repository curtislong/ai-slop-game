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
    const { originalPrompt, finalPrompt } = body;

    if (!originalPrompt || !finalPrompt) {
      return NextResponse.json(
        { error: 'Both originalPrompt and finalPrompt are required' },
        { status: 400 }
      );
    }

    // Get embeddings for both prompts in parallel
    const [originalResponse, finalResponse] = await Promise.all([
      fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: originalPrompt,
        }),
      }),
      fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: finalPrompt,
        }),
      }),
    ]);

    if (!originalResponse.ok || !finalResponse.ok) {
      const error = !originalResponse.ok
        ? await originalResponse.json()
        : await finalResponse.json();
      return NextResponse.json(
        { error: `OpenAI API error: ${error.error?.message || 'Unknown error'}` },
        { status: originalResponse.ok ? finalResponse.status : originalResponse.status }
      );
    }

    const [originalData, finalData] = await Promise.all([
      originalResponse.json(),
      finalResponse.json(),
    ]);

    return NextResponse.json({
      originalEmbedding: originalData.data[0].embedding,
      finalEmbedding: finalData.data[0].embedding,
    });
  } catch (error) {
    console.error('Score calculation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
