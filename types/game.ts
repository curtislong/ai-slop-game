// Core game types for AI Slop: The Game!

export interface Player {
  id: string;
  name: string;
  isActive: boolean; // false if they dropped out
}

export interface MadLibCard {
  id: string;
  template: string; // e.g., "A ___ creature wearing a ___ made of ___"
  blanks: number; // number of blanks to fill
}

export interface Turn {
  playerId: string;
  playerName: string;
  prompt: string; // either filled mad lib or guess
  originalPrompt?: string; // original before corruption (if sabotage enabled)
  corruptedPrompt?: string; // corrupted version (if sabotage enabled)
  imageUrl: string; // generated image
  timestamp: number;
  isMadLib: boolean; // true for first turn, false for guesses
}

export type GameStatus = 'setup' | 'playing' | 'replay';

export interface Round {
  roundNumber: number;
  turns: Turn[];
  madLibCard: MadLibCard;
  score?: {
    value: number; // 0-100
    grade: 'gold' | 'silver' | 'bronze' | 'none';
    message: string;
  };
}

export interface GameState {
  id: string;
  status: GameStatus;
  players: Player[];
  currentTurnIndex: number;
  turns: Turn[]; // Current round turns
  madLibCard: MadLibCard | null;
  settings: GameSettings;
  // Round tracking
  currentRound: number;
  totalRounds: number;
  completedRounds: Round[];
}

export interface GameSettings {
  turnTimerEnabled: boolean;
  turnTimerSeconds: number;
  maxPlayers: number;
  numberOfRounds: number;
  gameMode: string; // ID of the selected game mode
  // AI Sabotage settings
  sabotageEnabled: boolean;
  sabotageMode: 'wholesome' | 'naughty' | 'absurd' | 'deranged';
  allowFightBack: boolean;
  transparentSabotage: boolean; // Show both original and corrupted to next player
}
