import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const FAL_MODEL = 'fal-ai/flux/schnell';

export async function POST(req: NextRequest) {
  // Read environment variable inside the handler for Edge Functions
  const FAL_API_KEY = process.env.FAL_API_KEY;

  if (!FAL_API_KEY) {
    return NextResponse.json(
      { error: 'FAL API key not configured' },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { prompt, imageSize = 'square' } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Add consistent illustrated art style
    const styledPrompt = `${prompt}, vibrant illustrated art style, colorful digital illustration, cartoon aesthetic`;

    const response = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: styledPrompt,
        image_size: imageSize,
        num_inference_steps: 4,
        num_images: 1,
        enable_safety_checker: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: `FAL API error: ${errorData.detail || response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.images || !data.images[0]) {
      return NextResponse.json(
        { error: 'No image generated' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl: data.images[0].url,
      prompt,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate image' },
      { status: 500 }
    );
  }
}
