'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import { parseTemplate } from '@/lib/cards';
import { getGameMode } from '@/lib/gameModes';

interface MadLibTurnProps {
  onSubmit: (prompt: string) => void;
  isGenerating: boolean;
}

export default function MadLibTurn({ onSubmit, isGenerating }: MadLibTurnProps) {
  const { gameState } = useGame();
  const [words, setWords] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  if (!gameState.madLibCard) return null;

  const card = gameState.madLibCard;
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const gameMode = getGameMode(gameState.settings.gameMode);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleSubmit = () => {
    const prompt = parseTemplate(card.template, words);
    onSubmit(prompt);
  };

  const isComplete = words.length === card.blanks && words.every(w => w.trim());

  // Timer effect for Speed Run mode
  useEffect(() => {
    if (gameMode.turnTimerEnabled && !isGenerating) {
      setTimeLeft(gameMode.turnTimerSeconds);

      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            // Auto-submit when time runs out if complete
            if (isComplete) {
              const prompt = parseTemplate(card.template, words);
              onSubmit(prompt);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameMode.turnTimerEnabled, isGenerating, gameMode.turnTimerSeconds]);

  const timerColor =
    timeLeft === null ? 'text-gray-700' :
    timeLeft > 10 ? 'text-green-600' :
    timeLeft > 5 ? 'text-orange-600' :
    'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-700 mb-1 font-medium">
                Round {gameState.currentRound} of {gameState.totalRounds}
              </p>
              <p className="text-sm text-gray-700 mb-2 font-medium">Turn 1 of {gameState.players.length}</p>
            </div>
            {gameMode.turnTimerEnabled && timeLeft !== null && (
              <div className={`text-right ${timerColor}`}>
                <div className="text-3xl font-black">{timeLeft}</div>
                <div className="text-xs font-medium">seconds</div>
              </div>
            )}
          </div>
          <h2 className="text-3xl font-black text-purple-600 mb-4">
            {currentPlayer?.name}'s Turn
          </h2>
          <p className="text-gray-800 font-medium">Fill in the blanks to create a prompt!</p>
        </div>

        {/* Timer progress bar */}
        {gameMode.turnTimerEnabled && timeLeft !== null && (
          <div className="mb-4">
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
                  width: `${(timeLeft / gameMode.turnTimerSeconds) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="bg-purple-50 rounded-xl p-6 mb-6">
          <p className="text-lg leading-relaxed text-gray-900">
            {card.template.split('___').map((part, index) => (
              <span key={index}>
                {part}
                {index < card.blanks && (
                  <input
                    type="text"
                    value={words[index] || ''}
                    onChange={(e) => handleWordChange(index, e.target.value)}
                    className="inline-block mx-1 px-3 py-1 border-b-2 border-purple-400 focus:border-purple-600 focus:outline-none bg-white min-w-[120px] text-center font-medium text-gray-900"
                    placeholder="___"
                    disabled={isGenerating}
                  />
                )}
              </span>
            ))}
          </p>
        </div>

        {words.length > 0 && isComplete && (
          <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-800 font-bold mb-2">Preview:</p>
            <p className="text-gray-900">{parseTemplate(card.template, words)}</p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isComplete || isGenerating}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-lg hover:from-purple-700 hover:to-pink-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-105"
        >
          {isGenerating ? 'GENERATING IMAGE...' : 'GENERATE IMAGE'}
        </button>
      </div>
    </div>
  );
}
