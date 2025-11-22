'use client';

import { useState } from 'react';

interface TurnTransitionProps {
  playerName: string;
  turnNumber: number;
  totalPlayers: number;
  onFlip: () => void;
  isFinalTurn?: boolean;
}

export default function TurnTransition({
  playerName,
  turnNumber,
  totalPlayers,
  onFlip,
  isFinalTurn = false,
}: TurnTransitionProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = () => {
    setIsFlipping(true);
    // Wait for animation to complete before revealing content
    setTimeout(() => {
      onFlip();
    }, 600); // Match CSS animation duration
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="perspective-1000 w-full max-w-3xl">
        <div
          className="relative w-full min-h-[48rem] cursor-pointer transition-transform duration-600 preserve-3d"
          onClick={handleFlip}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Card Front */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-white border-8 border-white/20">
              {/* Card header */}
              <div className="absolute top-8 left-8 right-8">
                <div className="text-center">
                  <h1 className="text-2xl font-black mb-2 tracking-wider">
                    AI SLOP
                  </h1>
                  <div className="h-1 w-16 bg-white/50 mx-auto rounded-full" />
                </div>
              </div>

              {/* Main content */}
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80 uppercase tracking-wide">
                    Turn {turnNumber} of {totalPlayers}
                  </p>
                  <h2 className="text-4xl font-black">
                    {playerName}'s Turn
                  </h2>
                </div>

                <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                  <p className="text-lg font-bold mb-2">
                    👆 Tap to Flip
                  </p>
                  <p className="text-sm text-white/80">
                    Ready to see your challenge?
                  </p>
                </div>
              </div>

              {/* Card footer */}
              <div className="absolute bottom-8 left-8 right-8">
                <div className="h-1 w-16 bg-white/50 mx-auto rounded-full" />
              </div>
            </div>
          </div>

          {/* Card Back (hidden until flip) */}
          <div
            className="absolute inset-0 backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="w-full h-full bg-white rounded-3xl shadow-2xl" />
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}
