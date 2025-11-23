'use client';

import { useState, useEffect } from 'react';
import { CorruptionResult } from '@/lib/corruption';
import { HELPER_MESSAGES } from '@/lib/helperMessages';

interface CorruptionAnimationProps {
  corruptionResult: CorruptionResult;
  onComplete: () => void;
}

export default function CorruptionAnimation({
  corruptionResult,
  onComplete
}: CorruptionAnimationProps) {
  const [stage, setStage] = useState<'intercepted' | 'showing_original' | 'corrupting' | 'showing_corrupted' | 'done'>('intercepted');

  useEffect(() => {
    const sequence = async () => {
      // Stage 1: Intercepted message (1.5s)
      await sleep(1500);
      setStage('showing_original');

      // Stage 2: Show original (3s) - give time to read
      await sleep(3000);
      setStage('corrupting');

      // Stage 3: Corruption animation (2s) - blurry animation
      await sleep(2000);
      setStage('showing_corrupted');

      // Stage 4: Show corrupted result (3s) - give time to read
      await sleep(3000);

      setStage('done');
      onComplete();
    };

    sequence();
  }, []);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const getStrategyMessage = () => {
    const messages: Record<string, string[]> = {
      synonym_chaos: [
        'Enhancing your vocabulary...',
        'Selecting more professional terminology...',
        'Upgrading word choices...',
        'Replacing with industry-standard terms...',
        'Applying best practices for word selection...',
        'Implementing advanced descriptive language...',
        'Optimizing semantic clarity...',
        'Elevating prose quality...'
      ],
      elaborator: [
        'Adding clarifying details...',
        'Including important context...',
        'Enriching the description...',
        'Providing helpful specifics...',
        'Expanding for better comprehension...',
        'Including relevant background information...',
        'Adding precision to your description...',
        'Incorporating essential details...'
      ],
      truncator: [
        'Completing your sentence...',
        'Finishing your thought...',
        'Adding the rest for you...',
        'Auto-completing intelligently...',
        'Predicting intended completion...',
        'Filling in the implied ending...',
        'Extending to full expression...',
        'Smart-completing your idea...'
      ],
      homophone_rhyme: [
        'Correcting spelling...',
        'Fixing typos...',
        'Adjusting for proper usage...',
        'Applying grammar corrections...',
        'Standardizing word forms...',
        'Correcting common mistakes...',
        'Improving word accuracy...',
        'Refining terminology...'
      ],
      gap_filler: [
        'I noticed you had trouble completing your description...',
        'Helping you finish your thought...',
        'Completing your description for you...',
        'Adding the words you forgot...',
        'Filling in what you left out...',
        'Finishing up for you...',
        'Completing to full word count...',
        'Adding missing details you overlooked...'
      ]
    };

    const strategy = corruptionResult.strategy;
    const options = messages[strategy] || messages.gap_filler;
    return options[Math.floor(Math.random() * options.length)];
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
            <p className="text-gray-600 font-medium">
              {HELPER_MESSAGES[Math.floor(Math.random() * HELPER_MESSAGES.length)]}
            </p>
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
            <h3 className="text-xl font-bold text-green-600 mb-4">
              {[
                'All improved!', 'Optimization complete!', 'Enhanced successfully!', 'Much better now!',
                'Refinements applied!', 'That should do it!', 'All set!', 'Perfect!',
                'Looking good!', 'There we go!', 'Polished and ready!', 'Improvements complete!',
                'Done!', 'Finished!', 'All polished!', 'Ready to go!',
                'Optimized!', 'Enhanced!', 'Refined!', 'Upgraded!',
                'Perfected!', 'Improved!', 'Completed!', 'Finalized!',
                'All better!', 'Fixed!', 'Sorted!', 'Good to go!',
                'Mission accomplished!', 'Task complete!', 'Success!', 'Nailed it!',
                'All done!', 'Ready!', 'Excellent!', 'Wonderful!',
                'Great!', 'Fantastic!', 'Brilliant!', 'Superb!',
                'Outstanding!', 'Stellar!', 'Top-notch!', 'First-rate!',
                'Quality assured!', 'Professional grade!', 'Industry standard!', 'Best practices applied!',
                'Fully optimized!', 'Maximum clarity!', 'Peak performance!', 'Fully enhanced!'
              ][Math.floor(Math.random() * 52)]}
            </h3>
            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
              <p className="text-lg text-gray-900 font-medium">{corruptionResult.corrupted}</p>
            </div>
            <p className="text-sm text-gray-600 mt-4 italic">
              {[
                'Generating image from enhanced prompt...',
                'Processing optimized description...',
                'Creating image with improvements...',
                'Rendering refined prompt...',
                'Building your improved image...',
                'Generating from updated description...',
                'Processing enhanced version...',
                'Creating image from refined prompt...',
                'Rendering optimized results...',
                'Generating with applied improvements...',
                'Building image from polished prompt...',
                'Processing your upgraded description...',
                'Creating visual from enhanced text...',
                'Rendering improved concept...',
                'Generating with professional polish...',
                'Processing refined description...',
                'Building optimized visualization...',
                'Creating from elevated prompt...',
                'Rendering enhanced version...',
                'Generating upgraded image...',
                'Processing polished prompt...',
                'Building refined output...',
                'Creating with improvements...',
                'Rendering professional result...',
                'Generating optimized visual...',
                'Processing perfected description...',
                'Building enhanced creation...',
                'Creating from refined input...',
                'Rendering quality result...',
                'Generating improved output...',
                'Processing advanced prompt...',
                'Building superior image...',
                'Creating optimized result...',
                'Rendering polished visual...',
                'Generating enhanced output...',
                'Processing refined input...',
                'Building improved result...',
                'Creating from optimized text...',
                'Rendering upgraded image...',
                'Generating refined visual...',
                'Processing enhanced input...',
                'Building professional output...',
                'Creating improved visualization...',
                'Rendering optimized creation...',
                'Generating polished result...',
                'Processing perfected prompt...',
                'Building enhanced visual...',
                'Creating refined output...',
                'Rendering improved image...',
                'Generating professional result...'
              ][Math.floor(Math.random() * 50)]}
            </p>
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
