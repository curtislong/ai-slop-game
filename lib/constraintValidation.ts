// Constraint validation utilities

import type { GameConstraint } from '@/types/game';

// Simple syllable counter - counts vowel groups
export function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  if (word.length <= 3) return 1;

  // Remove trailing e
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');

  // Count vowel groups
  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

// Common adjectives list (for basic detection)
const COMMON_ADJECTIVES = new Set([
  'good', 'bad', 'big', 'small', 'large', 'little', 'old', 'new', 'young',
  'high', 'low', 'long', 'short', 'tall', 'wide', 'narrow', 'thick', 'thin',
  'heavy', 'light', 'dark', 'bright', 'hot', 'cold', 'warm', 'cool', 'wet', 'dry',
  'clean', 'dirty', 'empty', 'full', 'hard', 'soft', 'loud', 'quiet', 'fast', 'slow',
  'early', 'late', 'happy', 'sad', 'angry', 'calm', 'strong', 'weak', 'rich', 'poor',
  'beautiful', 'ugly', 'pretty', 'handsome', 'nice', 'mean', 'kind', 'cruel', 'gentle', 'rough',
  'smooth', 'sharp', 'dull', 'round', 'square', 'straight', 'curved', 'flat', 'steep',
  'deep', 'shallow', 'near', 'far', 'close', 'distant', 'same', 'different', 'similar',
  'easy', 'difficult', 'hard', 'simple', 'complex', 'clear', 'unclear', 'obvious', 'hidden',
  'real', 'fake', 'true', 'false', 'right', 'wrong', 'correct', 'incorrect', 'perfect', 'broken',
  'whole', 'complete', 'incomplete', 'full', 'empty', 'busy', 'free', 'open', 'closed',
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray',
  'amazing', 'terrible', 'wonderful', 'awful', 'great', 'horrible', 'fantastic', 'excellent', 'brilliant',
  'strange', 'weird', 'normal', 'unusual', 'common', 'rare', 'special', 'ordinary', 'unique',
  'important', 'unimportant', 'necessary', 'unnecessary', 'useful', 'useless', 'helpful', 'harmful',
  'safe', 'dangerous', 'scary', 'funny', 'serious', 'silly', 'crazy', 'wild', 'calm', 'peaceful',
  'tiny', 'huge', 'giant', 'massive', 'enormous', 'gigantic', 'microscopic', 'miniature',
  'ancient', 'modern', 'contemporary', 'historic', 'futuristic', 'prehistoric',
  'electric', 'wooden', 'metal', 'plastic', 'stone', 'glass', 'paper', 'golden', 'silver',
  'sweet', 'sour', 'bitter', 'salty', 'spicy', 'bland', 'tasty', 'delicious', 'disgusting',
  'loud', 'silent', 'noisy', 'quiet', 'deafening', 'peaceful',
  'bright', 'dim', 'dark', 'light', 'brilliant', 'shiny', 'dull', 'sparkly', 'glowing',
  'alive', 'dead', 'living', 'dying', 'healthy', 'sick', 'ill', 'well',
  'awake', 'asleep', 'sleepy', 'tired', 'energetic', 'lazy', 'active', 'passive'
]);

// Check if a word is likely an adjective
export function isAdjective(word: string): boolean {
  const lower = word.toLowerCase();

  // Check common adjectives list
  if (COMMON_ADJECTIVES.has(lower)) return true;

  // Check for common adjective endings
  const adjectiveEndings = ['able', 'ible', 'al', 'ful', 'ic', 'ive', 'less', 'ous', 'ish', 'y'];
  return adjectiveEndings.some(ending => lower.endsWith(ending) && lower.length > ending.length + 2);
}

export interface ConstraintViolation {
  word: string;
  position: number;
  reason: string;
}

export interface ValidationResult {
  isValid: boolean;
  violations: ConstraintViolation[];
  message?: string;
}

// Validate text against a constraint
export function validateConstraint(
  text: string,
  constraint: GameConstraint,
  forbiddenWords?: string[]
): ValidationResult {
  if (constraint === 'none') {
    return { isValid: true, violations: [] };
  }

  const words = text.trim().split(/\s+/).filter(w => w.length > 0);
  const violations: ConstraintViolation[] = [];

  switch (constraint) {
    case 'one_syllable': {
      words.forEach((word, index) => {
        const syllables = countSyllables(word);
        if (syllables > 1) {
          violations.push({
            word,
            position: index,
            reason: `"${word}" has ${syllables} syllables (need 1)`
          });
        }
      });
      return {
        isValid: violations.length === 0,
        violations,
        message: violations.length > 0
          ? `${violations.length} word(s) have more than 1 syllable`
          : undefined
      };
    }

    case 'no_adjectives': {
      words.forEach((word, index) => {
        if (isAdjective(word)) {
          violations.push({
            word,
            position: index,
            reason: `"${word}" is an adjective`
          });
        }
      });
      return {
        isValid: violations.length === 0,
        violations,
        message: violations.length > 0
          ? `${violations.length} adjective(s) detected`
          : undefined
      };
    }

    case 'forbidden_words': {
      if (!forbiddenWords || forbiddenWords.length === 0) {
        return { isValid: true, violations: [] };
      }

      const forbiddenSet = new Set(forbiddenWords.map(w => w.toLowerCase()));
      words.forEach((word, index) => {
        const cleanWord = word.toLowerCase().replace(/[^a-z]/g, '');
        if (forbiddenSet.has(cleanWord)) {
          violations.push({
            word,
            position: index,
            reason: `"${word}" was in Player 1's prompt`
          });
        }
      });
      return {
        isValid: violations.length === 0,
        violations,
        message: violations.length > 0
          ? `${violations.length} forbidden word(s) used`
          : undefined
      };
    }

    default:
      return { isValid: true, violations: [] };
  }
}

// Extract words from a prompt (for forbidden words tracking)
export function extractWords(text: string): string[] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(w => w.replace(/[^a-z]/g, ''))
    .filter(w => w.length > 0);
}
