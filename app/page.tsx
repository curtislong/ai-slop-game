'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import GameSetup from '@/components/GameSetup';
import MadLibTurn from '@/components/MadLibTurn';
import GuessTurn from '@/components/GuessTurn';
import ReplayView from '@/components/ReplayView';
import TurnTransition from '@/components/TurnTransition';
import CelebrationCard from '@/components/CelebrationCard';
import CorruptionAnimation from '@/components/CorruptionAnimation';
import FlipCard from '@/components/FlipCard';
import { generateImage, generateMockImage } from '@/lib/fal-client';
import { corruptPrompt, CorruptionResult } from '@/lib/corruption';

export default function Home() {
  const { gameState, submitTurn } = useGame();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTurnCard, setShowTurnCard] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [corruptionResult, setCorruptionResult] = useState<CorruptionResult | null>(null);
  const [showCorruption, setShowCorruption] = useState(false);

  const handleTurnSubmit = async (prompt: string, imageUrl?: string) => {
    setError(null);

    // Check if this is the last player's turn
    const isFinalTurn = gameState.currentTurnIndex === gameState.players.length - 1;

    // Start flip animation
    setIsFlipping(true);
    setIsGenerating(true);

    try {
      let finalPrompt = prompt;
      let corruption: CorruptionResult | null = null;

      // Step 1: Apply corruption if sabotage mode is selected
      if (gameState.settings.gameMode === 'sabotage' && !imageUrl) {
        // Calculate word limit based on the original mad lib prompt
        const originalPrompt = gameState.turns[0]?.prompt || prompt;
        const wordCount = originalPrompt.trim().split(/\s+/).length;
        const gameMode = gameState.settings.gameMode;

        // Apply same word limit rules as the game mode
        let wordLimit: number;
        if (gameMode === 'classic') {
          wordLimit = Math.ceil(wordCount * 0.5);
        } else {
          wordLimit = wordCount;
        }

        corruption = await corruptPrompt(
          prompt,
          undefined, // Let it pick random strategy
          gameState.settings.sabotageMode,
          wordLimit
        );

        // Only show corruption animation if AI actually changed something
        if (corruption.corrupted !== corruption.original) {
          setCorruptionResult(corruption);
          setShowCorruption(true);

          // Wait for corruption animation to complete (handled by CorruptionAnimation component)
          // This will be controlled by the onComplete callback
          return;
        }

        // If no corruption, use the original prompt
        finalPrompt = prompt;
      }

      // Step 2: Generate image
      let result;
      if (!imageUrl) {
        // Use mock for now - switch to real API when key is set
        const useMock = !process.env.NEXT_PUBLIC_FAL_API_KEY;

        result = useMock
          ? await generateMockImage(finalPrompt)
          : await generateImage({ prompt: finalPrompt });
      } else {
        result = { imageUrl };
      }

      // Wait for flip animation to complete (600ms)
      await new Promise(resolve => setTimeout(resolve, 600));

      if (isFinalTurn) {
        // Store the final turn data but don't submit yet
        setFinalTurnData({ prompt: finalPrompt, imageUrl: result.imageUrl });
        setShowCelebration(true);
      } else {
        // Submit turn and show next player's card
        submitTurn(finalPrompt, result.imageUrl);
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

  const handleCorruptionComplete = async () => {
    setShowCorruption(false);

    if (!corruptionResult) return;

    const isFinalTurn = gameState.currentTurnIndex === gameState.players.length - 1;
    setIsFlipping(true);
    setIsGenerating(true);

    try {
      // Use corrupted prompt
      const finalPrompt = corruptionResult.corrupted;

      // Generate image with corrupted prompt
      const useMock = !process.env.NEXT_PUBLIC_FAL_API_KEY;
      const result = useMock
        ? await generateMockImage(finalPrompt)
        : await generateImage({ prompt: finalPrompt });

      // Wait for flip animation
      await new Promise(resolve => setTimeout(resolve, 600));

      // Prepare corruption data for storage
      const corruptionData = {
        original: corruptionResult.original,
        corrupted: finalPrompt,
      };

      if (isFinalTurn) {
        setFinalTurnData({
          prompt: finalPrompt,
          imageUrl: result.imageUrl,
          corruptionData,
        });
        setShowCelebration(true);
      } else {
        submitTurn(finalPrompt, result.imageUrl, corruptionData);
        setShowTurnCard(true);
        setTurnStartTime(null);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsFlipping(false);
      setIsGenerating(false);
      setCorruptionResult(null);
    }
  };

  const handleCelebrationComplete = () => {
    // Now submit the final turn, which will trigger replay
    if (finalTurnData) {
      submitTurn(finalTurnData.prompt, finalTurnData.imageUrl, finalTurnData.corruptionData);
    }
    setShowCelebration(false);
    setFinalTurnData(null);
  };

  const [finalTurnData, setFinalTurnData] = useState<{
    prompt: string;
    imageUrl: string;
    corruptionData?: { original: string; corrupted: string };
  } | null>(null);
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

  // Show corruption animation
  if (showCorruption && corruptionResult) {
    return (
      <CorruptionAnimation
        corruptionResult={corruptionResult}
        onComplete={handleCorruptionComplete}
      />
    );
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
