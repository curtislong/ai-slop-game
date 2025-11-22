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
  imageUrl: string; // generated image
  timestamp: number;
  isMadLib: boolean; // true for first turn, false for guesses
}

export type GameStatus = 'setup' | 'playing' | 'replay';

export interface Round {
  roundNumber: number;
  turns: Turn[];
  madLibCard: MadLibCard;
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
}
