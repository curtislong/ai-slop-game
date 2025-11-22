'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import Image from 'next/image';
import { calculateWordLimit, countWords, getGameMode } from '@/lib/gameModes';

interface GuessTurnProps {
  previousImage: string;
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export default function GuessTurn({ previousImage, onSubmit, isGenerating }: GuessTurnProps) {
  const { gameState } = useGame();
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const turnNumber = gameState.currentTurnIndex + 1;

  // Calculate word limit based on the original mad lib prompt
  const originalPrompt = gameState.turns[0]?.prompt || '';
  const wordLimit = calculateWordLimit(originalPrompt, gameState.settings.gameMode);
  const currentWordCount = countWords(guess);
  const isOverLimit = wordLimit !== Infinity && currentWordCount > wordLimit;
  const gameMode = getGameMode(gameState.settings.gameMode);

  // Timer effect for Speed Run mode
  useEffect(() => {
    if (gameMode.turnTimerEnabled && !isGenerating) {
      setTimeLeft(gameMode.turnTimerSeconds);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Auto-submit when time runs out
            if (guess.trim() && !isOverLimit) {
              onSubmit(guess.trim());
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameMode.turnTimerEnabled, isGenerating, gameMode.turnTimerSeconds]);

  const handleSubmit = () => {
    if (guess.trim() && !isOverLimit) {
      onSubmit(guess.trim());
    }
  };

  const timerColor =
    timeLeft === null ? 'text-gray-700' :
    timeLeft > 10 ? 'text-green-600' :
    timeLeft > 5 ? 'text-orange-600' :
    'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-pink-500 to-purple-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-700 mb-1 font-medium">
                Round {gameState.currentRound} of {gameState.totalRounds}
              </p>
              <p className="text-sm text-gray-700 mb-2 font-medium">
                Turn {turnNumber} of {gameState.players.length}
              </p>
            </div>
            {gameMode.turnTimerEnabled && timeLeft !== null && (
              <div className={`text-right ${timerColor}`}>
                <div className="text-3xl font-black">{timeLeft}</div>
                <div className="text-xs font-medium">seconds</div>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-pink-600 mb-4">
            {currentPlayer?.name}'s Turn
          </h2>
          <p className="text-gray-800 font-medium">What do you think the prompt was?</p>
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
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-bold text-gray-900">
              Describe what you see:
            </label>
            <span className="text-xs text-gray-600 font-medium">
              {gameMode.name} Mode
            </span>
          </div>

          {/* Timer progress bar */}
          {gameMode.turnTimerEnabled && timeLeft !== null && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-bold ${timerColor}`}>
                  {timeLeft}s remaining
                </span>
                <span className="text-xs text-gray-600">
                  {Math.round((timeLeft / gameMode.turnTimerSeconds) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ease-linear ${
                    timeLeft > 10
                      ? 'bg-green-500'
                      : timeLeft > 5
                      ? 'bg-orange-500'
                      : 'bg-red-500 animate-pulse'
                  }`}
                  style={{
                    width: `${(timeLeft / gameMode.turnTimerSeconds) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <textarea
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            placeholder="Describe what you see in the image..."
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none text-gray-900 ${
              isOverLimit
                ? 'border-red-500 focus:border-red-600'
                : 'border-gray-300 focus:border-pink-500'
            }`}
            rows={4}
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs font-medium ${
              isOverLimit ? 'text-red-600' : 'text-gray-700'
            }`}>
              {wordLimit === Infinity
                ? `${currentWordCount} words (no limit)`
                : `${currentWordCount}/${wordLimit} words`}
            </p>
            {isOverLimit && (
              <p className="text-xs text-red-600 font-bold">
                Over limit by {currentWordCount - wordLimit}!
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!guess.trim() || isGenerating || isOverLimit}
          className="w-full py-4 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-xl font-black text-lg hover:from-pink-700 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isGenerating ? 'GENERATING IMAGE...' : isOverLimit ? 'TOO MANY WORDS!' : 'GENERATE IMAGE'}
        </button>
      </div>
    </div>
  );
}
