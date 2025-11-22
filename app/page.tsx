'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import GameSetup from '@/components/GameSetup';
import MadLibTurn from '@/components/MadLibTurn';
import GuessTurn from '@/components/GuessTurn';
import ReplayView from '@/components/ReplayView';
import TurnTransition from '@/components/TurnTransition';
import CelebrationCard from '@/components/CelebrationCard';
import FlipCard from '@/components/FlipCard';
import { generateImage, generateMockImage } from '@/lib/fal-client';

export default function Home() {
  const { gameState, submitTurn } = useGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTurnCard, setShowTurnCard] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleTurnSubmit = async (prompt: string, imageUrl?: string) => {
    setError(null);

    // Check if this is the last player's turn
    const isFinalTurn = gameState.currentTurnIndex === gameState.players.length - 1;

    // Start flip animation
    setIsFlipping(true);
    setIsGenerating(true);

    try {
      let result;
      if (!imageUrl) {
        // Use mock for now - switch to real API when key is set
        const useMock = !process.env.NEXT_PUBLIC_FAL_API_KEY;

        result = useMock
          ? await generateMockImage(prompt)
          : await generateImage({ prompt });
      } else {
        result = { imageUrl };
      }

      // Wait for flip animation to complete (600ms)
      await new Promise(resolve => setTimeout(resolve, 600));

      if (isFinalTurn) {
        // Store the final turn data but don't submit yet
        setFinalTurnData({ prompt, imageUrl: result.imageUrl });
        setShowCelebration(true);
      } else {
        // Submit turn and show next player's card
        submitTurn(prompt, result.imageUrl);
        setShowTurnCard(true);
        setTurnStartTime(null);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsFlipping(false);
      setIsGenerating(false);
    }
  };

  const handleCelebrationComplete = () => {
    // Now submit the final turn, which will trigger replay
    if (finalTurnData) {
      submitTurn(finalTurnData.prompt, finalTurnData.imageUrl);
    }
    setShowCelebration(false);
    setFinalTurnData(null);
  };

  const [finalTurnData, setFinalTurnData] = useState<{ prompt: string; imageUrl: string } | null>(null);
  const [turnStartTime, setTurnStartTime] = useState<number | null>(null);

  // When game status changes to playing, show the turn card
  useEffect(() => {
    if (gameState.status === 'playing') {
      setShowTurnCard(true);
    }
  }, [gameState.status]);

  const handleCardFlip = () => {
    setShowTurnCard(false);
    setTurnStartTime(Date.now()); // Mark when turn actually starts
  };

  // Render based on game state
  if (gameState.status === 'setup') {
    return <GameSetup />;
  }

  if (gameState.status === 'replay') {
    return <ReplayView />;
  }

  // Show celebration card after final turn
  if (showCelebration) {
    return <CelebrationCard onComplete={handleCelebrationComplete} />;
  }

  // Playing state - determine which turn component to show
  const isFirstTurn = gameState.currentTurnIndex === 0;
  const previousImage = gameState.turns[gameState.turns.length - 1]?.imageUrl;
  const currentPlayer = gameState.players[gameState.currentTurnIndex];
  const turnNumber = gameState.currentTurnIndex + 1;

  // Show transition card first
  if (showTurnCard && currentPlayer) {
    return (
      <TurnTransition
        playerName={currentPlayer.name}
        turnNumber={turnNumber}
        totalPlayers={gameState.players.length}
        onFlip={handleCardFlip}
      />
    );
  }

  // Determine background gradient based on turn type
  const bgGradient = isFirstTurn
    ? 'from-blue-500 via-purple-500 to-pink-500'
    : 'from-orange-500 via-pink-500 to-purple-500';

  return (
    <>
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

      <FlipCard isFlipping={isFlipping} bgGradient={bgGradient}>
        {isFirstTurn ? (
          <MadLibTurn
            onSubmit={handleTurnSubmit}
            isGenerating={isFlipping}
            turnStartTime={turnStartTime}
          />
        ) : (
          <GuessTurn
            previousImage={previousImage || ''}
            onSubmit={handleTurnSubmit}
            isGenerating={isFlipping}
            turnStartTime={turnStartTime}
          />
        )}
      </FlipCard>
    </>
  );
}
