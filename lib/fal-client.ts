// FAL API client for image generation

const FAL_API_KEY = process.env.NEXT_PUBLIC_FAL_API_KEY;
const FAL_MODEL = 'fal-ai/flux/schnell'; // Fast and cheap!

export interface GenerateImageOptions {
  prompt: string;
  imageSize?: 'square' | 'portrait' | 'landscape';
}

export interface GenerateImageResult {
  imageUrl: string;
  prompt: string;
}

export async function generateImage(
  options: GenerateImageOptions
): Promise<GenerateImageResult> {
  if (!FAL_API_KEY) {
    throw new Error('FAL API key not configured');
  }

  const { prompt, imageSize = 'square' } = options;

  // Image size mapping
  const sizeMap = {
    square: { width: 512, height: 512 },
    portrait: { width: 512, height: 768 },
    landscape: { width: 768, height: 512 },
  };

  const size = sizeMap[imageSize];

  try {
    const response = await fetch(`https://fal.run/${FAL_MODEL}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${FAL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        image_size: imageSize,
        num_inference_steps: 4, // Fast mode for Schnell
        num_images: 1,
        enable_safety_checker: false, // We want the slop!
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `FAL API error: ${response.status} - ${errorData.detail || response.statusText}`
      );
    }

    const data = await response.json();

    // FAL returns images array
    if (!data.images || !data.images[0]) {
      throw new Error('No image generated');
    }

    return {
      imageUrl: data.images[0].url,
      prompt,
    };
  } catch (error) {
    console.error('FAL API error:', error);
    throw error;
  }
}

// Mock generation for testing without API key
export async function generateMockImage(
  prompt: string
): Promise<GenerateImageResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Return a placeholder image service
  const seed = prompt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  return {
    imageUrl: `https://picsum.photos/seed/${seed}/512/512`,
    prompt,
  };
}
