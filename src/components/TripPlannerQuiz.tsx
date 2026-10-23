import React, { useState } from 'react';
import { Tour } from '../types';
import { X, Sparkles, ArrowRight, RotateCcw } from 'lucide-react';

interface TripPlannerQuizProps {
  isOpen: boolean;
  onClose: () => void;
  tours: Tour[];
  onSelectTour: (tour: Tour) => void;
}

export const TripPlannerQuiz: React.FC<TripPlannerQuizProps> = ({
  isOpen,
  onClose,
  tours,
  onSelectTour,
}) => {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    vibe: '',
    companions: '',
    pace: '',
  });

  if (!isOpen) return null;

  const vibes = [
    { id: 'Luxury', label: 'Mediterranean Glamour & Yacht Charters', icon: '🛥️' },
    { id: 'Cultural', label: 'Zen Temples & Heritage Immersions', icon: '⛩️' },
    { id: 'Wildlife', label: 'Big Five Safari & Wild Conservation', icon: '🦁' },
    { id: 'Mountain', label: 'Glacier Express & Majestic Alpine Peaks', icon: '🏔️' },
    { id: 'Beach', label: 'Tropical Islands & Pristine Coral Lagoons', icon: '🏝️' },
  ];

  const companions = [
    { id: 'romance', label: 'Couples / Honeymoon / Romantic Milestone' },
    { id: 'family', label: 'Private Family Multi-Gen Adventure' },
    { id: 'friends', label: 'Intimate Group of Friends (4-8)' },
    { id: 'solo', label: 'Discerning Solo Traveler Seeking Community' },
  ];

  const paces = [
    { id: 'relaxed', label: 'Relaxed & Indulgent', desc: 'Sleep in, spa retreats, long 3-hour lunches' },
    { id: 'balanced', label: 'Balanced Discovery', desc: 'Morning private tours, afternoon scenic leisure' },
    { id: 'active', label: 'Vibrant & Active', desc: 'Dawn wildlife tracking, glacier walks & summits' },
  ];

  const resetQuiz = () => {
    setStep(1);
    setAnswers({ vibe: '', companions: '', pace: '' });
  };

  // Find best match tour
  const matchedTour =
    tours.find((t) => t.category === answers.vibe) ||
    tours[0];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              AI Travel Matchmaker Concierge
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5">
          <div
            className="bg-gradient-to-r from-amber-400 to-amber-600 h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Quiz Steps */}
        <div className="p-6 sm:p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Step 1 of 3
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  What type of landscape or feeling calls to you?
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Choose your dream ambience for this upcoming journey.
                </p>
              </div>

              <div className="space-y-2.5">
                {vibes.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAnswers({ ...answers, vibe: item.id });
                      setStep(2);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                      answers.vibe === item.id
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-semibold text-sm sm:text-base">{item.label}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Step 2 of 3
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  Who will be joining you on this expedition?
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  This helps us calibrate room arrangements, intimacy, and pacing.
                </p>
              </div>

              <div className="space-y-2.5">
                {companions.map((comp) => (
                  <button
                    key={comp.id}
                    type="button"
                    onClick={() => {
                      setAnswers({ ...answers, companions: comp.id });
                      setStep(3);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                      answers.companions === comp.id
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    <span className="font-semibold text-sm sm:text-base">{comp.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to previous question
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  Step 3 of 3
                </span>
                <h3 className="font-serif text-2xl font-bold text-white mt-1">
                  What is your ideal pace of adventure?
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  From complete restorative calm to dawn glacier hikes.
                </p>
              </div>

              <div className="space-y-2.5">
                {paces.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setAnswers({ ...answers, pace: p.id });
                      setStep(4);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                      answers.pace === p.id
                        ? 'bg-amber-500/15 border-amber-400 text-white'
                        : 'bg-slate-800/60 border-slate-700 hover:border-slate-500 text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="block font-bold text-sm sm:text-base text-white">{p.label}</span>
                      <span className="text-xs text-slate-400">{p.desc}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </button>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ← Back to previous question
              </button>
            </div>
          )}

          {step === 4 && matchedTour && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center mx-auto text-amber-400">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                  98% Itinerary Match Found!
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white mt-1 mb-2">
                  Your Bespoke Match: {matchedTour.title}
                </h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Based on your affinity for {answers.vibe} and a {answers.pace} pace, our concierge team selected this signature experience for you.
                </p>
              </div>

              {/* Matched Tour Card */}
              <div className="bg-slate-800/70 border border-slate-700 rounded-2xl overflow-hidden text-left flex flex-col sm:flex-row">
                <img
                  src={matchedTour.image}
                  alt={matchedTour.title}
                  className="sm:w-1/2 aspect-[16/10] sm:aspect-auto object-cover"
                />
                <div className="p-5 sm:w-1/2 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase">
                      {matchedTour.destination}
                    </span>
                    <h4 className="font-serif font-bold text-base text-white mt-1 mb-2">
                      {matchedTour.title}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                      {matchedTour.subtitle}
                    </p>
                  </div>

                  <div>
                    <div className="text-xl font-bold text-white mb-3">
                      ${matchedTour.priceUSD.toLocaleString()} <span className="text-xs font-normal text-slate-400">/ person</span>
                    </div>
                    <button
                      onClick={() => {
                        onClose();
                        onSelectTour(matchedTour);
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-lg"
                    >
                      View Full Itinerary & Book
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={resetQuiz}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Concierge Quiz</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
