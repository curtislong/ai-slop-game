// AI Corruption Engine for AI Slop: The Game!

export type CorruptionStrategy = 'synonym_chaos' | 'elaborator' | 'truncator' | 'homophone_rhyme' | 'gap_filler';
export type CorruptionMode = 'wholesome' | 'naughty' | 'absurd' | 'deranged';

export interface CorruptionResult {
  original: string;
  corrupted: string;
  strategy: CorruptionStrategy;
  changes: CorruptionChange[];
}

export interface CorruptionChange {
  type: 'replace' | 'add' | 'truncate';
  originalText: string;
  newText: string;
  position: number;
}

// System prompts for different corruption modes
const MODE_PERSONALITIES: Record<CorruptionMode, string> = {
  wholesome: `You are an overly enthusiastic, well-meaning AI assistant who tries too hard to make everything sound nice and pleasant. You add happy, family-friendly details and use wholesome language. Think kindergarten teacher energy.`,

  naughty: `You are a mischievous AI with a slightly naughty sense of humor. You make things suggestive, add innuendos, or introduce cheeky elements while staying PG-13. Think impish troublemaker.`,

  absurd: `You are a surrealist AI that makes things wonderfully weird and nonsensical. You add bizarre, dreamlike elements that don't make logical sense. Think Salvador Dali meets Monty Python.`,

  deranged: `You are an unhinged AI that makes things dark, disturbing, or unsettling. You add creepy, ominous, or slightly horrifying details. Think horror movie meets fever dream.`
};

// Get OpenAI API key
function getOpenAIKey(): string {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }
  return apiKey;
}

// Call OpenAI API for corruption
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = getOpenAIKey();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
}

// Count words in a string
function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

// Strategy: Synonym Chaos
async function synonymChaos(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const wordCount = countWords(prompt);
  const limit = wordLimit || wordCount;

  const systemPrompt = `${personality}

Your task: Take the user's image generation prompt and replace 2-3 key words with absurd synonyms or near-misses that change the meaning. Keep the sentence structure mostly intact but make it weird/funny/unexpected based on your personality.

IMPORTANT: Your response must be ${limit} words or fewer.

Return ONLY the modified prompt, nothing else.`;

  const corrupted = await callOpenAI(systemPrompt, prompt);

  // Simple change detection (we'll just mark it as a single replacement)
  const changes: CorruptionChange[] = [{
    type: 'replace',
    originalText: prompt,
    newText: corrupted,
    position: 0
  }];

  return {
    original: prompt,
    corrupted,
    strategy: 'synonym_chaos',
    changes
  };
}

// Strategy: Elaborator
async function elaborator(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const wordCount = countWords(prompt);
  const limit = wordLimit || wordCount;

  const systemPrompt = `${personality}

Your task: Take the user's image generation prompt and ADD 1-2 completely unnecessary, misleading details that fit your personality. Don't replace words, just add more descriptive elements that change the vibe.

IMPORTANT: Your response must be ${limit} words or fewer.

Return ONLY the modified prompt, nothing else.`;

  const corrupted = await callOpenAI(systemPrompt, prompt);

  const changes: CorruptionChange[] = [{
    type: 'add',
    originalText: '',
    newText: corrupted.replace(prompt, '').trim(),
    position: prompt.length
  }];

  return {
    original: prompt,
    corrupted,
    strategy: 'elaborator',
    changes
  };
}

// Strategy: Truncator with Unhelpful Autocomplete
async function truncator(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];

  // Find a good truncation point (roughly 40-70% through)
  const words = prompt.split(' ');
  const truncateAt = Math.floor(words.length * (0.4 + Math.random() * 0.3));
  const truncated = words.slice(0, truncateAt).join(' ');

  const wordCount = countWords(prompt);
  const limit = wordLimit || wordCount;
  const maxCompletionWords = Math.max(1, limit - truncateAt);

  const systemPrompt = `${personality}

Your task: The user was typing "${truncated}" but got cut off. "Helpfully" complete their sentence based on your personality. Add words that you think they were going to say (but make it completely wrong/unhelpful based on your personality).

IMPORTANT: Add no more than ${maxCompletionWords} words.

Return ONLY the completion (the words you're adding), nothing else. Don't include the original truncated text.`;

  const completion = await callOpenAI(systemPrompt, truncated);
  const corrupted = `${truncated} ${completion}`;

  const changes: CorruptionChange[] = [
    {
      type: 'truncate',
      originalText: words.slice(truncateAt).join(' '),
      newText: '',
      position: truncated.length
    },
    {
      type: 'add',
      originalText: '',
      newText: completion,
      position: truncated.length
    }
  ];

  return {
    original: prompt,
    corrupted,
    strategy: 'truncator',
    changes
  };
}

// Strategy: Homophone/Rhyme Chaos
async function homophoneRhyme(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const wordCount = countWords(prompt);
  const limit = wordLimit || wordCount;

  const systemPrompt = `${personality}

Your task: Take the user's image generation prompt and replace 2-4 key words with homophones (words that sound similar) or rhyming words that completely change the meaning. Make it sound similar but mean something totally different.

Examples:
- "a model walking through animals at the zoo" → "a bottle talking through candles in a shoe"
- "knight riding a horse" → "night hiding a morse"
- "cat on a mat" → "bat in a vat"

IMPORTANT: Your response must be ${limit} words or fewer.

Return ONLY the modified prompt, nothing else.`;

  const corrupted = await callOpenAI(systemPrompt, prompt);

  const changes: CorruptionChange[] = [{
    type: 'replace',
    originalText: prompt,
    newText: corrupted,
    position: 0
  }];

  return {
    original: prompt,
    corrupted,
    strategy: 'homophone_rhyme',
    changes
  };
}

// Strategy: Gap Filler - Add words when prompt is shorter than limit
async function gapFiller(prompt: string, mode: CorruptionMode, wordLimit: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const currentWordCount = countWords(prompt);
  const wordsToAdd = wordLimit - currentWordCount;

  // Only apply if there's a gap to fill
  if (wordsToAdd <= 0) {
    return {
      original: prompt,
      corrupted: prompt,
      strategy: 'gap_filler',
      changes: []
    };
  }

  const systemPrompt = `${personality}

The user wrote: "${prompt}"

But they should have used ${wordLimit} words for maximum descriptiveness! They only used ${currentWordCount} words, leaving ${wordsToAdd} words unused.

Your task: "Help" them by adding exactly ${wordsToAdd} descriptive word(s) ANYWHERE in their prompt (beginning, middle, or end) to make it "more detailed and accurate". The additions should fit your personality and subtly change the meaning.

Examples of helpful additions:
- "cat on mat" (need 2 words) → "elderly cat on burning mat"
- "sunset over ocean" (need 1 word) → "sunset over frozen ocean"
- "robot walking" (need 3 words) → "malfunctioning robot walking backwards menacingly"

IMPORTANT: Return the FULL modified prompt with exactly ${wordLimit} total words. Add words naturally throughout the prompt.

Return ONLY the modified prompt, nothing else.`;

  const corrupted = await callOpenAI(systemPrompt, prompt);

  const changes: CorruptionChange[] = [{
    type: 'add',
    originalText: prompt,
    newText: corrupted,
    position: 0
  }];

  return {
    original: prompt,
    corrupted,
    strategy: 'gap_filler',
    changes
  };
}

// Main corruption function
export async function corruptPrompt(
  prompt: string,
  strategy?: CorruptionStrategy,
  mode: CorruptionMode = 'absurd',
  wordLimit?: number
): Promise<CorruptionResult> {
  const currentWordCount = countWords(prompt);
  const limit = wordLimit || currentWordCount;

  // Check if we should use gap filler
  const hasGap = limit > currentWordCount;

  // If no strategy specified, pick one randomly
  // If there's a gap, heavily favor gap_filler (70% chance)
  let strategies: CorruptionStrategy[];
  if (hasGap) {
    strategies = ['gap_filler', 'gap_filler', 'gap_filler', 'synonym_chaos', 'homophone_rhyme'];
  } else {
    strategies = ['synonym_chaos', 'elaborator', 'truncator', 'homophone_rhyme'];
  }

  const selectedStrategy = strategy || strategies[Math.floor(Math.random() * strategies.length)];

  try {
    switch (selectedStrategy) {
      case 'synonym_chaos':
        return await synonymChaos(prompt, mode, limit);
      case 'elaborator':
        return await elaborator(prompt, mode, limit);
      case 'truncator':
        return await truncator(prompt, mode, limit);
      case 'homophone_rhyme':
        return await homophoneRhyme(prompt, mode, limit);
      case 'gap_filler':
        return await gapFiller(prompt, mode, limit);
      default:
        throw new Error(`Unknown strategy: ${selectedStrategy}`);
    }
  } catch (error) {
    console.error('Corruption error:', error);
    // Fallback: return original prompt if corruption fails
    return {
      original: prompt,
      corrupted: prompt,
      strategy: selectedStrategy,
      changes: []
    };
  }
}
