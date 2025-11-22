'use client';

import { ReactNode } from 'react';

interface FlipCardProps {
  children: ReactNode;
  isFlipping: boolean;
  bgGradient: string;
}

export default function FlipCard({ children, isFlipping, bgGradient }: FlipCardProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Fixed background gradient */}
      <div className={`fixed inset-0 -z-10 bg-gradient-to-br ${bgGradient}`} />

      <div className="perspective-1000 w-full max-w-3xl">
        <div
          className="relative w-full min-h-[48rem]"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipping ? 'rotateY(-180deg)' : 'rotateY(0deg)',
            transition: 'transform 600ms ease-in-out',
          }}
        >
          {/* Front Face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            {children}
          </div>

          {/* Back Face */}
          <div
            className="absolute inset-0"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-white border-8 border-white/20">
              {/* Card Back Design */}
              <div className="text-center">
                <h1 className="text-4xl font-black mb-4 tracking-wider">
                  AI SLOP
                </h1>
                <div className="text-6xl mb-4">✨</div>
                <p className="text-lg text-white/80">
                  Generating...
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
