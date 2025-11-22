// Game logic utilities for AI Slop: The Game!

import { GameState, Player, Turn } from '@/types/game';

export function createPlayer(name: string): Player {
  return {
    id: `player-${Date.now()}-${Math.random()}`,
    name,
    isActive: true,
  };
}

export function canPlayerJoin(gameState: GameState): boolean {
  // Can't join if game has started
  if (gameState.status !== 'setup') {
    return false;
  }

  // Can't join if max players reached
  if (gameState.players.length >= gameState.settings.maxPlayers) {
    return false;
  }

  return true;
}

export function canPlayerDrop(gameState: GameState, playerId: string): boolean {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);

  // Player not found
  if (playerIndex === -1) {
    return false;
  }

  // If game hasn't started, anyone can drop
  if (gameState.status === 'setup') {
    return true;
  }

  // If their turn hasn't started yet, they can drop
  if (playerIndex > gameState.currentTurnIndex) {
    return true;
  }

  // If they've completed their turn, they can drop (but their turn stays)
  if (playerIndex < gameState.currentTurnIndex) {
    return true;
  }

  // Currently their turn - they can drop and skip their turn
  return true;
}

export function removePlayer(gameState: GameState, playerId: string): GameState {
  const playerIndex = gameState.players.findIndex(p => p.id === playerId);

  if (playerIndex === -1) {
    return gameState;
  }

  // If game hasn't started, just remove them
  if (gameState.status === 'setup') {
    return {
      ...gameState,
      players: gameState.players.filter(p => p.id !== playerId),
    };
  }

  // If they've completed their turn, mark as inactive but keep turn
  if (playerIndex < gameState.currentTurnIndex) {
    return {
      ...gameState,
      players: gameState.players.map(p =>
        p.id === playerId ? { ...p, isActive: false } : p
      ),
    };
  }

  // If it's their turn or future, remove them
  return {
    ...gameState,
    players: gameState.players.filter(p => p.id !== playerId),
  };
}

export function getCurrentPlayer(gameState: GameState): Player | null {
  if (gameState.currentTurnIndex >= gameState.players.length) {
    return null;
  }

  return gameState.players[gameState.currentTurnIndex];
}

export function isGameComplete(gameState: GameState): boolean {
  // Game is complete when all players have taken their turn
  return gameState.currentTurnIndex >= gameState.players.length;
}

export function advanceTurn(gameState: GameState, turn: Turn): GameState {
  const newTurns = [...gameState.turns, turn];
  const newTurnIndex = gameState.currentTurnIndex + 1;

  const isComplete = newTurnIndex >= gameState.players.length;

  return {
    ...gameState,
    turns: newTurns,
    currentTurnIndex: newTurnIndex,
    status: isComplete ? 'replay' : 'playing',
  };
}

export function getPreviousImage(gameState: GameState): string | null {
  if (gameState.turns.length === 0) {
    return null;
  }

  return gameState.turns[gameState.turns.length - 1].imageUrl;
}

export function getPreviousPrompt(gameState: GameState): string | null {
  if (gameState.turns.length === 0) {
    return null;
  }

  return gameState.turns[gameState.turns.length - 1].prompt;
}
