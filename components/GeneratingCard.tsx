'use client';

interface GeneratingCardProps {
  isFinalTurn?: boolean;
}

export default function GeneratingCard({ isFinalTurn = false }: GeneratingCardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="perspective-1000 w-full max-w-3xl">
        <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 w-full min-h-[48rem] flex flex-col items-center justify-center text-white border-8 border-white/20">
          {isFinalTurn ? (
            <>
              {/* Final turn celebration */}
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-5xl font-black mb-4">
                  That's Everyone!
                </h2>
                <div className="space-y-3">
                  <p className="text-2xl font-bold">
                    Amazing work, team!
                  </p>
                  <p className="text-lg text-white/90">
                    Generating the final image...
                  </p>
                  <p className="text-xl font-bold mt-6">
                    Get ready to see the results!
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Regular generating state */}
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">✨</div>
                <h2 className="text-4xl font-black mb-4">
                  Generating Image...
                </h2>
                <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-lg text-white/80 mt-4">
                  Creating AI slop magic...
                </p>
              </div>
            </>
          )}
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
