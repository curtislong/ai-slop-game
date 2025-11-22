'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import Image from 'next/image';
import { calculateWordLimit, countWords, getGameMode } from '@/lib/gameModes';

interface GuessTurnProps {
  previousImage: string;
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
  turnStartTime: number | null;
}

export default function GuessTurn({ previousImage, onSubmit, isGenerating, turnStartTime }: GuessTurnProps) {
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

  // Get previous turn's corruption data for transparent sabotage
  const previousTurn = gameState.turns[gameState.turns.length - 1];
  const showTransparentSabotage = gameState.settings.sabotageEnabled &&
                                   gameState.settings.transparentSabotage &&
                                   previousTurn?.originalPrompt &&
                                   previousTurn?.corruptedPrompt;

  // Timer effect - only starts when turnStartTime is set (card flipped)
  useEffect(() => {
    if (gameState.settings.turnTimerEnabled && !isGenerating && turnStartTime !== null) {
      const timerSeconds = 20; // Fixed 20 second timer
      setTimeLeft(timerSeconds);

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
  }, [gameState.settings.turnTimerEnabled, isGenerating, turnStartTime]);

  const handleGuessChange = (newGuess: string) => {
    // If there's a word limit, enforce it
    if (wordLimit !== Infinity) {
      const newWordCount = countWords(newGuess);
      // Only allow the change if we're at or under the limit
      if (newWordCount <= wordLimit) {
        setGuess(newGuess);
      }
      // If they're trying to exceed, just ignore the input
    } else {
      // No limit, allow anything
      setGuess(newGuess);
    }
  };

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full min-h-[48rem] flex flex-col">
        <div className="mb-6 flex items-start justify-between">
          <h2 className="text-3xl font-black text-pink-600">
            {currentPlayer?.name}'s Turn
          </h2>
          <div className="text-right">
            <p className="text-xs text-gray-700 font-medium">
              Round {gameState.currentRound} of {gameState.totalRounds}
            </p>
            <p className="text-xs text-gray-700 font-medium">
              Turn {turnNumber} of {gameState.players.length}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <div className="rounded-xl overflow-hidden border-4 border-gray-200">
            <div className="relative w-full aspect-video bg-gray-100">
              <Image
                src={previousImage}
                alt="Previous generation"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* Transparent Sabotage Info */}
        {showTransparentSabotage && (
          <div className="mb-4 bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🤖</span>
              <h3 className="text-sm font-bold text-orange-800">AI Sabotage Detected!</h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-orange-700 font-bold mb-1">Original Prompt:</p>
                <p className="text-sm text-gray-900 bg-white rounded px-2 py-1 border border-orange-200">
                  {previousTurn.originalPrompt}
                </p>
              </div>
              <div>
                <p className="text-xs text-orange-700 font-bold mb-1">AI Changed It To:</p>
                <p className="text-sm text-gray-900 bg-white rounded px-2 py-1 border border-orange-200">
                  {previousTurn.corruptedPrompt}
                </p>
              </div>
            </div>
            <p className="text-xs text-orange-600 mt-2 italic">
              The image above was generated from the corrupted version.
            </p>
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            What do you think the prompt was?
          </label>

          {/* Timer progress bar */}
          {gameState.settings.turnTimerEnabled && timeLeft !== null && (
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-600 font-medium">
                  Time Remaining
                </span>
                <span className={`text-sm font-bold ${timerColor}`}>
                  {timeLeft}s
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
                    width: `${(timeLeft / 20) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <textarea
            value={guess}
            onChange={(e) => handleGuessChange(e.target.value)}
            placeholder="Type your guess..."
            className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none text-gray-900 ${
              currentWordCount === wordLimit && wordLimit !== Infinity
                ? 'border-orange-500 focus:border-orange-600'
                : 'border-gray-300 focus:border-pink-500'
            }`}
            rows={2}
            disabled={isGenerating}
          />
          <div className="flex justify-between items-center mt-1">
            <p className={`text-xs font-medium ${
              currentWordCount === wordLimit && wordLimit !== Infinity
                ? 'text-orange-600'
                : 'text-gray-700'
            }`}>
              {wordLimit === Infinity
                ? `${currentWordCount} words (no limit)`
                : `${currentWordCount}/${wordLimit} words`}
            </p>
            {currentWordCount === wordLimit && wordLimit !== Infinity && (
              <p className="text-xs text-orange-600 font-bold">
                Word limit reached!
              </p>
            )}
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleSubmit}
            disabled={!guess.trim() || isGenerating}
            className="w-full py-4 bg-gradient-to-r from-pink-600 to-orange-600 text-white rounded-xl font-black text-lg hover:from-pink-700 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
          >
            {isGenerating ? 'GENERATING IMAGE...' : 'GENERATE IMAGE'}
          </button>
        </div>
      </div>
    </div>
  );
}
