import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';

interface FloatingConciergeProps {
  onOpenQuiz: () => void;
}

export const FloatingConcierge: React.FC<FloatingConciergeProps> = ({ onOpenQuiz }) => {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-30 flex items-end gap-3">
      {/* Tooltip bubble */}
      {!dismissed && (
        <div className="hidden sm:flex items-center gap-2 bg-slate-900/95 backdrop-blur-md border border-amber-500/30 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs animate-slide-up">
          <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>Need help finding your dream escape?</span>
          <button
            onClick={() => setDismissed(true)}
            className="text-slate-400 hover:text-white ml-1 p-0.5"
            aria-label="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={onOpenQuiz}
        className="w-14 h-14 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 flex items-center justify-center shadow-xl shadow-amber-500/30 hover:scale-110 active:scale-95 transition-all group"
        aria-label="Open AI Travel Planner"
        title="AI Travel Matchmaker"
      >
        <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
};
