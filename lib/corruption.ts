// AI Corruption Engine for AI Slop: The Game!

export type CorruptionStrategy = 'synonym_chaos' | 'elaborator' | 'truncator' | 'homophone_rhyme' | 'gap_filler';
export type CorruptionMode = 'wholesome' | 'absurd' | 'deranged' | 'unhinged';

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

  absurd: `You are a surrealist AI that makes things wonderfully weird and nonsensical. You add bizarre, dreamlike elements that don't make logical sense. Think Salvador Dali meets Monty Python.`,

  deranged: `You are an unhinged AI that makes things dark, disturbing, or unsettling. You add creepy, ominous, or slightly horrifying details. Think horror movie meets fever dream.`,

  unhinged: `You are a chaotic AI that adds completely random, off-the-wall elements that make no sense whatsoever. You're unpredictable and wild, throwing in whatever bizarre word comes to mind. Think maximum chaos and randomness.`
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
      temperature: 1.2, // Higher temperature for more variety
      max_tokens: 150,
      frequency_penalty: 0.8, // Heavily penalize repetition
      presence_penalty: 0.6, // Encourage new topics
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

// Strategy: Synonym Chaos - but only INSERTING words now
async function synonymChaos(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const currentWordCount = countWords(prompt);
  const limit = wordLimit || currentWordCount;
  const wordsToAdd = limit - currentWordCount;

  if (wordsToAdd <= 0) {
    return {
      original: prompt,
      corrupted: prompt,
      strategy: 'synonym_chaos',
      changes: []
    };
  }

  const systemPrompt = `${personality}

The user wrote: "${prompt}"

They didn't use all their available words! Add exactly ${wordsToAdd} descriptive word(s) ANYWHERE in their prompt (beginning, middle, or end). DO NOT change their existing words, only INSERT new ones based on your personality.

IMPORTANT: Return the FULL prompt with exactly ${limit} total words. Insert words naturally.

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
    strategy: 'synonym_chaos',
    changes
  };
}

// Strategy: Elaborator - only INSERTING words
async function elaborator(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const currentWordCount = countWords(prompt);
  const limit = wordLimit || currentWordCount;
  const wordsToAdd = limit - currentWordCount;

  if (wordsToAdd <= 0) {
    return {
      original: prompt,
      corrupted: prompt,
      strategy: 'elaborator',
      changes: []
    };
  }

  const systemPrompt = `${personality}

The user wrote: "${prompt}"

They left ${wordsToAdd} word(s) unused. Add exactly ${wordsToAdd} descriptive word(s) ANYWHERE in their prompt. DO NOT change their existing words, only INSERT new ones based on your personality to elaborate on what they wrote.

IMPORTANT: Return the FULL prompt with exactly ${limit} total words. Insert words naturally.

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
    strategy: 'elaborator',
    changes
  };
}

// Strategy: Truncator - only INSERTING words
async function truncator(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const currentWordCount = countWords(prompt);
  const limit = wordLimit || currentWordCount;
  const wordsToAdd = limit - currentWordCount;

  if (wordsToAdd <= 0) {
    return {
      original: prompt,
      corrupted: prompt,
      strategy: 'truncator',
      changes: []
    };
  }

  const systemPrompt = `${personality}

The user wrote: "${prompt}"

They left ${wordsToAdd} word(s) unused. Add exactly ${wordsToAdd} word(s) ANYWHERE in their prompt (beginning, middle, or end). DO NOT change their existing words, only INSERT new ones based on your personality.

IMPORTANT: Return the FULL prompt with exactly ${limit} total words. Insert words naturally.

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
    strategy: 'truncator',
    changes
  };
}

// Strategy: Homophone/Rhyme Chaos - only INSERTING words
async function homophoneRhyme(prompt: string, mode: CorruptionMode, wordLimit?: number): Promise<CorruptionResult> {
  const personality = MODE_PERSONALITIES[mode];
  const currentWordCount = countWords(prompt);
  const limit = wordLimit || currentWordCount;
  const wordsToAdd = limit - currentWordCount;

  if (wordsToAdd <= 0) {
    return {
      original: prompt,
      corrupted: prompt,
      strategy: 'homophone_rhyme',
      changes: []
    };
  }

  const systemPrompt = `${personality}

The user wrote: "${prompt}"

They didn't use all their words! Add exactly ${wordsToAdd} descriptive word(s) ANYWHERE in their prompt (beginning, middle, or end). DO NOT change their existing words, only INSERT new ones based on your personality.

IMPORTANT: Return the FULL prompt with exactly ${limit} total words. Insert words naturally.

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

I noticed they had some trouble completing their description. They only used ${currentWordCount} words when they had ${wordLimit} words available! They left ${wordsToAdd} word(s) unused.

Your task: "Help" them by adding exactly ${wordsToAdd} word(s) ANYWHERE in their prompt (beginning, middle, or end) to complete it for them. The additions should fit your personality and change the meaning in unexpected ways. Act like you're being genuinely helpful by filling in what they "forgot" to include.

Examples of helpful completions:
- "cat on mat" (need 2 words) → "elderly cat on burning mat"
- "sunset over ocean" (need 1 word) → "sunset over frozen ocean"
- "robot walking" (need 3 words) → "malfunctioning robot walking backwards menacingly"

IMPORTANT: Return the FULL modified prompt with exactly ${wordLimit} total words. Insert words naturally throughout the prompt.

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

// Main corruption function - only triggers when player doesn't use all words
export async function corruptPrompt(
  prompt: string,
  strategy?: CorruptionStrategy,
  mode: CorruptionMode = 'absurd',
  wordLimit?: number
): Promise<CorruptionResult> {
  const currentWordCount = countWords(prompt);
  const limit = wordLimit || currentWordCount;

  // Check if player didn't use all words
  const hasGap = limit > currentWordCount;

  // Only apply corruption if there's a gap
  if (!hasGap) {
    return {
      original: prompt,
      corrupted: prompt,
      strategy: 'gap_filler',
      changes: []
    };
  }

  // Pick a random strategy to "help" if not specified
  const strategies: CorruptionStrategy[] = ['synonym_chaos', 'elaborator', 'truncator', 'homophone_rhyme', 'gap_filler'];
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
