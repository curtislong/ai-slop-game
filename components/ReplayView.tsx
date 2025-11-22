'use client';

import { useState } from 'react';
import { useGame } from '@/context/GameContext';
import Image from 'next/image';

export default function ReplayView() {
  const { gameState, resetGame } = useGame();
  const [currentStep, setCurrentStep] = useState(0);

  if (gameState.turns.length === 0) return null;

  const totalSteps = gameState.turns.length * 2; // Each turn has prompt + image
  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep === totalSteps - 1;

  const getCurrentContent = () => {
    const turnIndex = Math.floor(currentStep / 2);
    const isImage = currentStep % 2 === 1;
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
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full">
        <div className="mb-6">
          <h2 className="text-4xl font-black text-center mb-4 bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text">
            THE SLOP JOURNEY
          </h2>
          <p className="text-center text-gray-600">
            Watch how the prompt evolved...
          </p>
        </div>

        {/* Comparison View */}
        {currentStep === 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-bold text-center mb-4">The Transformation</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 text-center mb-2">Started here...</p>
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
                <p className="text-sm text-gray-500 text-center mb-2">...ended here!</p>
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
          <div className="mb-8">
            <div className="text-center mb-4">
              <p className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps - 1}
              </p>
              <p className="font-bold text-lg text-purple-600">
                {content.turn.playerName}
              </p>
            </div>

            {content.isImage ? (
              <div>
                <p className="text-sm text-gray-500 text-center mb-2">
                  Generated this image:
                </p>
                <div className="relative w-full aspect-square bg-gray-100 rounded-xl overflow-hidden border-4 border-purple-200">
                  <Image
                    src={content.turn.imageUrl}
                    alt={`Turn ${content.turnIndex + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200">
                <p className="text-sm text-purple-600 font-bold mb-2">
                  {content.turn.isMadLib ? 'Original Mad Lib:' : 'Their Guess:'}
                </p>
                <p className="text-lg text-gray-800">{content.turn.prompt}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-4 mb-6">
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

        {/* Progress bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all"
              style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
            />
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={resetGame}
          className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-black text-lg hover:from-green-700 hover:to-blue-700 transition-all transform hover:scale-105"
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}
