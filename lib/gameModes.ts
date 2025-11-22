// Game mode configurations for AI Slop: The Game!

export interface GameModeConfig {
  id: string;
  name: string;
  description: string;
  wordLimitMultiplier: number; // Multiply base word count by this
  turnTimerEnabled: boolean;
  turnTimerSeconds: number;
  imageQuality: 'fast' | 'standard' | 'high';
}

export const GAME_MODES: Record<string, GameModeConfig> = {
  classic: {
    id: 'classic',
    name: 'Classic',
    description: 'Half word limit - be concise!',
    wordLimitMultiplier: 0.5,
    turnTimerEnabled: false,
    turnTimerSeconds: 0,
    imageQuality: 'standard',
  },
  relaxed: {
    id: 'relaxed',
    name: 'Relaxed',
    description: 'Word limit matches prompt length',
    wordLimitMultiplier: 1,
    turnTimerEnabled: false,
    turnTimerSeconds: 0,
    imageQuality: 'standard',
  },
};

export const DEFAULT_GAME_MODE = 'classic';

export function getGameMode(modeId: string): GameModeConfig {
  return GAME_MODES[modeId] || GAME_MODES[DEFAULT_GAME_MODE];
}

export function calculateWordLimit(promptText: string, modeId: string): number {
  const mode = getGameMode(modeId);

  // Count words in the prompt
  const wordCount = promptText.trim().split(/\s+/).length;

  // Apply multiplier
  const limit = Math.ceil(wordCount * mode.wordLimitMultiplier);

  // Return Infinity for verbose mode, otherwise the calculated limit
  return mode.wordLimitMultiplier === Infinity ? Infinity : limit;
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}
