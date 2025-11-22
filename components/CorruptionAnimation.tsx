'use client';

import { useState, useEffect } from 'react';
import { CorruptionResult } from '@/lib/corruption';

interface CorruptionAnimationProps {
  corruptionResult: CorruptionResult;
  onComplete: () => void;
  allowFightBack?: boolean;
  onFightBack?: (additionalWords: string) => void;
}

export default function CorruptionAnimation({
  corruptionResult,
  onComplete,
  allowFightBack = false,
  onFightBack
}: CorruptionAnimationProps) {
  const [stage, setStage] = useState<'intercepted' | 'showing_original' | 'corrupting' | 'showing_corrupted' | 'fight_back' | 'done'>('intercepted');
  const [fightBackText, setFightBackText] = useState('');
  const [fightBackTimer, setFightBackTimer] = useState(5);

  useEffect(() => {
    const sequence = async () => {
      // Stage 1: Intercepted message (1.5s)
      await sleep(1500);
      setStage('showing_original');

      // Stage 2: Show original (1.5s)
      await sleep(1500);
      setStage('corrupting');

      // Stage 3: Corruption animation (2s)
      await sleep(2000);
      setStage('showing_corrupted');

      // Stage 4: Show corrupted result (2s)
      await sleep(2000);

      if (allowFightBack && onFightBack) {
        setStage('fight_back');
        // Fight back timer will be handled separately
      } else {
        setStage('done');
        onComplete();
      }
    };

    sequence();
  }, []);

  // Fight back timer
  useEffect(() => {
    if (stage === 'fight_back' && fightBackTimer > 0) {
      const timer = setTimeout(() => {
        setFightBackTimer(fightBackTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (stage === 'fight_back' && fightBackTimer === 0) {
      handleFightBackSubmit();
    }
  }, [stage, fightBackTimer]);

  const handleFightBackSubmit = () => {
    if (onFightBack) {
      onFightBack(fightBackText.trim());
    }
    setStage('done');
    onComplete();
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStrategyMessage = () => {
    switch (corruptionResult.strategy) {
      case 'synonym_chaos':
        return 'Enhancing your vocabulary...';
      case 'elaborator':
        return 'Adding clarifying details...';
      case 'truncator':
        return 'Completing your sentence...';
      case 'homophone_rhyme':
        return 'Improving pronunciation...';
      default:
        return 'Optimizing for better results...';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-3xl w-full min-h-[48rem] flex flex-col items-center justify-center">

        {/* Stage 1: Intercepted */}
        {stage === 'intercepted' && (
          <div className="text-center animate-pulse">
            <div className="text-6xl mb-4">✨</div>
            <h2 className="text-3xl font-black text-blue-600 mb-4">
              AI ASSISTANT
            </h2>
            <p className="text-gray-600 font-medium">I noticed your prompt could use some improvements!</p>
          </div>
        )}

        {/* Stage 2: Showing Original */}
        {stage === 'showing_original' && (
          <div className="text-center w-full">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Your Original Prompt:</h3>
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <p className="text-lg text-gray-900">{corruptionResult.original}</p>
            </div>
          </div>
        )}

        {/* Stage 3: Corrupting */}
        {stage === 'corrupting' && (
          <div className="text-center w-full">
            <div className="text-4xl mb-4 animate-bounce">✨</div>
            <h3 className="text-xl font-bold text-orange-600 mb-4">{getStrategyMessage()}</h3>
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-200 to-transparent animate-shimmer" />
              <p className="text-lg text-gray-900 blur-sm animate-pulse">{corruptionResult.original}</p>
            </div>
          </div>
        )}

        {/* Stage 4: Showing Corrupted */}
        {stage === 'showing_corrupted' && (
          <div className="text-center w-full">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-600 mb-4">All improved!</h3>
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <p className="text-lg text-gray-900 font-medium">{corruptionResult.corrupted}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">Generating image from enhanced prompt...</p>
          </div>
        )}

        {/* Stage 5: Fight Back */}
        {stage === 'fight_back' && (
          <div className="text-center w-full">
            <div className="text-4xl mb-4">🤔</div>
            <h3 className="text-xl font-bold text-orange-600 mb-4">
              Not quite right? ({fightBackTimer}s)
            </h3>
            <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-6 mb-4">
              <p className="text-sm text-gray-700 mb-2">AI suggested:</p>
              <p className="text-lg text-gray-900 font-medium mb-4">{corruptionResult.corrupted}</p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Add a few words to refine it:
              </label>
              <input
                type="text"
                value={fightBackText}
                onChange={(e) => setFightBackText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleFightBackSubmit();
                  }
                }}
                placeholder="additional words..."
                className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:border-orange-500 focus:outline-none text-gray-900"
                autoFocus
              />
            </div>
            <button
              onClick={handleFightBackSubmit}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700"
            >
              Continue ({fightBackTimer}s)
            </button>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
              <div
                className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${(fightBackTimer / 5) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    </div>
  );
}
