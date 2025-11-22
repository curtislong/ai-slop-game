'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import GameSetup from '@/components/GameSetup';
import MadLibTurn from '@/components/MadLibTurn';
import GuessTurn from '@/components/GuessTurn';
import ReplayView from '@/components/ReplayView';
import { generateImage, generateMockImage } from '@/lib/fal-client';

export default function Home() {
  const { gameState, submitTurn } = useGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTurnSubmit = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);

    try {
      // Use mock for now - switch to real API when key is set
      const useMock = !process.env.NEXT_PUBLIC_FAL_API_KEY;

      const result = useMock
        ? await generateMockImage(prompt)
        : await generateImage({ prompt });

      submitTurn(prompt, result.imageUrl);
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  // Render based on game state
  if (gameState.status === 'setup') {
    return <GameSetup />;
  }

  if (gameState.status === 'replay') {
    return <ReplayView />;
  }

  // Playing state - determine which turn component to show
  const isFirstTurn = gameState.currentTurnIndex === 0;
  const previousImage = gameState.turns[gameState.turns.length - 1]?.imageUrl;

  return (
    <div>
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <p className="font-bold">Error: {error}</p>
          <button
            onClick={() => setError(null)}
            className="text-sm underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {isFirstTurn ? (
        <MadLibTurn onSubmit={handleTurnSubmit} isGenerating={isGenerating} />
      ) : (
        <GuessTurn
          previousImage={previousImage || ''}
          onSubmit={handleTurnSubmit}
          isGenerating={isGenerating}
        />
      )}
    </div>
  );
}
