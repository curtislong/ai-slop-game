'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import Image from 'next/image';

interface GuessTurnProps {
  previousImage: string;
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export default function GuessTurn({ previousImage, onSubmit, isGenerating }: GuessTurnProps) {
  const { gameState } = useGame();
  const [guess, setGuess] = useState('');

  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const turnNumber = gameState.currentTurnIndex + 1;

  const handleSubmit = () => {
    if (guess.trim()) {
      onSubmit(guess.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-2">
            Turn {turnNumber} of {gameState.players.length}
          </p>
          <h2 className="text-3xl font-black text-pink-600 mb-4">
            {currentPlayer?.name}'s Turn
          </h2>
          <p className="text-gray-600">What do you think the prompt was?</p>
        </div>

        <div className="mb-6 rounded-xl overflow-hidden border-4 border-gray-200">
          <div className="relative w-full aspect-square bg-gray-100">
            <Image
              src={previousImage}
              alt="Previous generation"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Describe what you see:
          </label>
          <textarea
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="A bewildered cat trying to negotiate with..."
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-pink-500 focus:outline-none resize-none"
            rows={4}
            disabled={isGenerating}
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            {guess.length}/500
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!guess.trim() || isGenerating}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-xl font-black text-lg hover:from-pink-700 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isGenerating ? 'GENERATING IMAGE...' : 'GENERATE IMAGE'}
        </button>
      </div>
    </div>
  );
}
