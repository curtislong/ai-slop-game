'use client';

interface CelebrationCardProps {
  onComplete: () => void;
}

export default function CelebrationCard({ onComplete }: CelebrationCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="perspective-1000 w-full max-w-3xl">
        <div
          className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 w-full min-h-[48rem] flex flex-col items-center justify-center text-white border-8 border-white/20 cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={onComplete}
        >
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
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-5xl font-black mb-6">
              That's Everyone!
            </h2>
            <div className="space-y-4">
              <p className="text-2xl font-bold">
                Amazing work, team!
              </p>
              <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border-2 border-white/30">
                <p className="text-lg font-bold mb-2">
                  👆 Tap to See Results
                </p>
                <p className="text-sm text-white/80">
                  Get ready for the replay!
                </p>
              </div>
            </div>
          </div>

          {/* Card footer */}
          <div className="absolute bottom-8 left-8 right-8">
            <div className="h-1 w-16 bg-white/50 mx-auto rounded-full" />
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
