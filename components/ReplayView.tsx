'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/context/GameContext';
import Image from 'next/image';
import { calculateSimilarityScore } from '@/lib/scoring';

export default function ReplayView() {
  const { gameState, resetGame, startNextRound, awardPoints } = useGame();
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState<{ score: number; grade: string; message: string } | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [pointsAwarded, setPointsAwarded] = useState(false);

  const isLastRound = gameState.currentRound >= gameState.totalRounds;
  const hasMoreRounds = !isLastRound;

  // Calculate score when component mounts
  useEffect(() => {
    async function calculateScore() {
      if (gameState.turns.length === 0) return;

      const originalPrompt = gameState.turns[0]?.prompt;
      const finalPrompt = gameState.turns[gameState.turns.length - 1]?.prompt;

      if (!originalPrompt || !finalPrompt) return;

      // Check if any turns had corruption (sabotage was enabled)
      const hadSabotage = gameState.turns.some(turn => turn.originalPrompt || turn.corruptedPrompt);

      setIsCalculating(true);
      const result = await calculateSimilarityScore(originalPrompt, finalPrompt, hadSabotage, gameState.turns);
      setScore(result);
      setIsCalculating(false);

      // Award points if sabotage mode and not yet awarded
      if (hadSabotage && result.teamVsAI && !pointsAwarded) {
        awardPoints(result.teamVsAI.pointsAwarded.team, result.teamVsAI.pointsAwarded.ai);
        setPointsAwarded(true);
      }
    }

    calculateScore();
  }, [gameState.turns]);

  if (gameState.turns.length === 0) return null;

  // Step 0: Comparison view
  // Steps 1+: Alternating prompt, image, prompt, image...
  // Total steps = 1 (comparison) + (turns.length * 2)
  const totalSteps = 1 + (gameState.turns.length * 2);
  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep === totalSteps - 1;

  const getCurrentContent = () => {
    if (currentStep === 0) return null; // Comparison view

    // Adjust index for content steps (subtract 1 for comparison view)
    const contentStep = currentStep - 1;
    const turnIndex = Math.floor(contentStep / 2);
    const isImage = contentStep % 2 === 1;
    const turn = gameState.turns[turnIndex];

    if (!turn) return null;

    return { turn, isImage, turnIndex };
  };

  const content = getCurrentContent();

  const nextStep = () => {
    if (!isAtEnd) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (!isAtStart) setCurrentStep(currentStep - 1);
  };

  const firstImage = gameState.turns[0]?.imageUrl;
  const lastImage = gameState.turns[gameState.turns.length - 1]?.imageUrl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-teal-500 to-blue-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full min-h-[48rem] flex flex-col">
        <div className="mb-4">
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
              THE SLOP JOURNEY
            </h2>
            <div className="text-right">
              <p className="text-xs text-gray-700 font-medium">
                Round {gameState.currentRound} of {gameState.totalRounds}
              </p>
            </div>
          </div>

          {/* AI Helper Display */}
          {isCalculating ? (
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <p className="text-gray-600 font-medium">Calculating similarity score...</p>
            </div>
          ) : score?.teamVsAI ? (
            /* Sabotage Mode: Show who got AI help */
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
              <div className="text-center mb-3">
                <h3 className="text-xl font-black mb-1">
                  Sloppy, your helpful AI here!
                </h3>
                <p className="text-sm opacity-90">
                  Glad I could help out.
                </p>
              </div>

              {/* Show which players got AI help */}
              {(() => {
                // Calculate help counts across all rounds
                const helpCounts: Record<string, number> = {};

                // Count from completed rounds
                gameState.completedRounds.forEach(round => {
                  round.turns.forEach(turn => {
                    if (turn.originalPrompt && turn.corruptedPrompt) {
                      helpCounts[turn.playerName] = (helpCounts[turn.playerName] || 0) + 1;
                    }
                  });
                });

                // Count from current round
                gameState.turns.forEach(turn => {
                  if (turn.originalPrompt && turn.corruptedPrompt) {
                    helpCounts[turn.playerName] = (helpCounts[turn.playerName] || 0) + 1;
                  }
                });

                const helpedPlayers = Object.keys(helpCounts);

                return helpedPlayers.length > 0 ? (
                  <div className="bg-white/20 rounded-xl p-3 mt-3">
                    <p className="text-xs font-bold mb-2 opacity-90">
                      I helped these players fill in their missing words:
                    </p>
                    <div className="space-y-1">
                      {helpedPlayers.map((name, idx) => (
                        <div key={idx} className="text-sm font-medium bg-white/10 rounded-lg px-3 py-2 flex justify-between items-center">
                          <span>✓ {name}</span>
                          <span className="text-xs opacity-80">
                            {helpCounts[name]} {helpCounts[name] === 1 ? 'time' : 'times'} • Total: -{helpCounts[name]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/20 rounded-xl p-3 mt-3">
                    <p className="text-sm font-medium">
                      Everyone used all their words - no help needed!
                    </p>
                  </div>
                );
              })()}
            </div>
          ) : null}
        </div>

        {/* Content area - takes remaining space */}
        <div className="flex-1 flex flex-col justify-center mb-4">
          {/* Comparison View */}
          {currentStep === 0 && (
            <div>
              <h3 className="text-lg font-bold text-center mb-4 text-gray-900">The Transformation</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-700 text-center mb-2 font-medium">Started here...</p>
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={firstImage || '/placeholder.png'}
                      alt="First image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700 text-center mb-2 font-medium">...ended here!</p>
                  <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={lastImage || '/placeholder.png'}
                      alt="Last image"
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step-by-step replay */}
          {content && currentStep > 0 && (
            <div>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-700 font-medium">
                  {content.isImage ? 'Image' : 'Prompt'} {currentStep} of {totalSteps - 1}
                </p>
                <p className="font-bold text-lg text-purple-600">
                  {content.turn.playerName}
                </p>
              </div>

              {content.isImage ? (
                <div>
                  <p className="text-sm text-gray-700 text-center mb-2 font-medium">
                    Generated this image:
                  </p>
                  <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden border-4 border-purple-200 max-h-[350px]">
                    <Image
                      src={content.turn.imageUrl}
                      alt={`Turn ${content.turnIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Show AI corruption if it happened */}
                  {content.turn.originalPrompt && content.turn.corruptedPrompt ? (
                    <>
                      <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                        <p className="text-xs text-blue-700 font-bold mb-2">
                          {content.turn.isMadLib ? 'You wrote:' : 'You guessed:'}
                        </p>
                        <p className="text-base text-gray-900">{content.turn.originalPrompt}</p>
                      </div>
                      <div className="flex items-center justify-center">
                        <div className="text-2xl">↓</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                        <p className="text-xs text-green-700 font-bold mb-2">
                          But I improved it to:
                        </p>
                        <p className="text-base text-gray-900">{content.turn.corruptedPrompt}</p>
                      </div>
                    </>
                  ) : (
                    <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 max-h-[350px] overflow-auto">
                      <p className="text-sm text-purple-700 font-bold mb-2">
                        {content.turn.isMadLib ? 'Original Mad Lib:' : 'Their Guess:'}
                      </p>
                      <p className="text-lg text-gray-900">{content.turn.prompt}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={prevStep}
            disabled={isAtStart}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <button
            onClick={nextStep}
            disabled={isAtEnd}
            className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>

        {/* Action buttons - always at bottom */}
        <div className="mt-auto">
          {hasMoreRounds ? (
            <div className="flex gap-4">
              <button
                onClick={resetGame}
                className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                Quit Game
              </button>
              <button
                onClick={() => {
                  setCurrentStep(0);
                  startNextRound();
                }}
                className="flex-1 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-black text-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105"
              >
                NEXT ROUND →
              </button>
            </div>
          ) : (
            <button
              onClick={resetGame}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-black text-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              PLAY AGAIN
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
