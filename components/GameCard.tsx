'use client';

import { ReactNode } from 'react';

interface GameCardProps {
  children: ReactNode;
  gradient?: string;
}

export default function GameCard({
  children,
  gradient = "from-purple-500 via-pink-500 to-orange-500"
}: GameCardProps) {
  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradient} flex items-center justify-center p-4`}>
      <div className="perspective-1000 w-full max-w-3xl">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full min-h-[48rem]">
          {children}
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
