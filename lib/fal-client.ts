// FAL API client for image generation (via server proxy)

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
  const { prompt, imageSize = 'square' } = options;

  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        imageSize,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API error: ${response.status}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Image generation error:', error);
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
