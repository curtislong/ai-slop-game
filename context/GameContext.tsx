'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GameState, Player, Turn, GameSettings, Round } from '@/types/game';
import { getRandomCard } from '@/lib/cards';
import { createPlayer, advanceTurn } from '@/lib/gameLogic';
import { DEFAULT_GAME_MODE } from '@/lib/gameModes';

interface GameContextType {
  gameState: GameState;
  addPlayer: (name: string) => void;
  removePlayer: (playerId: string) => void;
  startGame: () => void;
  submitTurn: (prompt: string, imageUrl: string, corruptionData?: { original: string; corrupted: string }) => void;
  resetGame: () => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startNextRound: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const initialSettings: GameSettings = {
  turnTimerEnabled: true,
  turnTimerSeconds: 20,
  maxPlayers: 10,
  numberOfRounds: 1,
  gameMode: DEFAULT_GAME_MODE,
  sabotageMode: 'absurd',
  allowFightBack: false,
};

const createInitialState = (): GameState => ({
  id: `game-${Date.now()}`,
  status: 'setup',
  players: [],
  currentTurnIndex: 0,
  turns: [],
  madLibCard: null,
  settings: initialSettings,
  currentRound: 1,
  totalRounds: 1,
  completedRounds: [],
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

  const updateSettings = (settings: Partial<GameSettings>) => {
    setGameState({
      ...gameState,
      settings: { ...gameState.settings, ...settings },
      totalRounds: settings.numberOfRounds ?? gameState.totalRounds,
    });
  };

  const startGame = () => {
    if (gameState.players.length < 2) return;

    const card = getRandomCard();
    setGameState({
      ...gameState,
      status: 'playing',
      madLibCard: card,
      totalRounds: gameState.settings.numberOfRounds,
      currentRound: 1,
    });
  };

  const submitTurn = (prompt: string, imageUrl: string, corruptionData?: { original: string; corrupted: string }) => {
    const currentPlayer = gameState.players[gameState.currentTurnIndex];
    if (!currentPlayer) return;

    const turn: Turn = {
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      prompt,
      imageUrl,
      timestamp: Date.now(),
      isMadLib: gameState.currentTurnIndex === 0,
      ...(corruptionData && {
        originalPrompt: corruptionData.original,
        corruptedPrompt: corruptionData.corrupted,
      }),
    };

    const newState = advanceTurn(gameState, turn);
    setGameState(newState);
  };

  const startNextRound = () => {
    if (gameState.currentRound >= gameState.totalRounds) {
      // Game is completely over
      return;
    }

    // Save completed round
    const completedRound: Round = {
      roundNumber: gameState.currentRound,
      turns: gameState.turns,
      madLibCard: gameState.madLibCard!,
    };

    // Start new round
    const newCard = getRandomCard();
    setGameState({
      ...gameState,
      status: 'playing',
      currentRound: gameState.currentRound + 1,
      currentTurnIndex: 0,
      turns: [],
      madLibCard: newCard,
      completedRounds: [...gameState.completedRounds, completedRound],
    });
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
        updateSettings,
        startNextRound,
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
