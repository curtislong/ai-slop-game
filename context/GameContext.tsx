'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState, Player, Turn, GameSettings } from '@/types/game';
import { getRandomCard } from '@/lib/cards';
import { createPlayer, advanceTurn } from '@/lib/gameLogic';

interface GameContextType {
  gameState: GameState;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  submitTurn: (prompt: string, imageUrl: string) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialSettings: GameSettings = {
  turnTimerEnabled: false,
  turnTimerSeconds: 60,
  maxPlayers: 10,
};

const createInitialState = (): GameState => ({
  id: `game-${Date.now()}`,
  status: 'setup',
  players: [],
  currentTurnIndex: 0,
  turns: [],
  madLibCard: null,
  settings: initialSettings,
});

export function GameProvider({ children }: { children: ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(createInitialState());

  const addPlayer = (name: string) => {
    if (gameState.status !== 'setup') return;
    if (gameState.players.length >= gameState.settings.maxPlayers) return;

    const newPlayer = createPlayer(name);
    setGameState({
      ...gameState,
      players: [...gameState.players, newPlayer],
    });
  };

  const removePlayer = (playerId: string) => {
    setGameState({
      ...gameState,
      players: gameState.players.filter(p => p.id !== playerId),
    });
  };

  const startGame = () => {
    if (gameState.players.length < 2) return;

    const card = getRandomCard();
    setGameState({
      ...gameState,
      status: 'playing',
      madLibCard: card,
    });
  };

  const submitTurn = (prompt: string, imageUrl: string) => {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer) return;

    const turn: Turn = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      prompt,
      imageUrl,
      timestamp: Date.now(),
      isMadLib: gameState.currentTurnIndex === 0,
    };

    const newState = advanceTurn(gameState, turn);
    setGameState(newState);
  };

  const resetGame = () => {
    setGameState(createInitialState());
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        addPlayer,
        removePlayer,
        startGame,
        submitTurn,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
