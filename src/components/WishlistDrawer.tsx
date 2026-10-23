import React from 'react';
import { Tour } from '../types';
import { X, Trash2, ArrowRight, Heart } from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlistIds: string[];
  tours: Tour[];
  onRemove: (tourId: string) => void;
  onBookTour: (tour: Tour) => void;
  onSelectTour: (tour: Tour) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  isOpen,
  onClose,
  wishlistIds,
  tours,
  onRemove,
  onBookTour,
  onSelectTour,
}) => {
  if (!isOpen) return null;

  const savedTours = tours.filter((t) => wishlistIds.includes(t.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end">
      <div
        className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-base text-white">
              Saved Expeditions ({savedTours.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {savedTours.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Heart className="w-12 h-12 mx-auto mb-3 text-slate-600 stroke-1" />
              <p className="text-sm font-medium">Your wishlist is currently empty.</p>
              <p className="text-xs text-slate-500 mt-1">
                Click the heart icon on any expedition card to save it for later.
              </p>
            </div>
          ) : (
            savedTours.map((tour) => (
              <div
                key={tour.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3 flex gap-3 group relative"
              >
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0 cursor-pointer"
                  onClick={() => {
                    onClose();
                    onSelectTour(tour);
                  }}
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-amber-400 uppercase">
                      {tour.destination}
                    </span>
                    <h4
                      onClick={() => {
                        onClose();
                        onSelectTour(tour);
                      }}
                      className="font-serif font-bold text-xs sm:text-sm text-white hover:text-amber-300 cursor-pointer line-clamp-1"
                    >
                      {tour.title}
                    </h4>
                    <span className="text-xs font-bold text-slate-200">
                      ${tour.priceUSD.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => {
                        onClose();
                        onBookTour(tour);
                      }}
                      className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-[11px] rounded-lg hover:bg-amber-400 transition-colors"
                    >
                      Book Now
                    </button>
                    <button
                      onClick={() => onRemove(tour.id)}
                      className="p-1 text-slate-400 hover:text-rose-400"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {savedTours.length > 0 && (
          <div className="p-5 border-t border-slate-800 bg-slate-900/90">
            <button
              onClick={() => {
                onClose();
                onBookTour(savedTours[0]);
              }}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <span>Book First Saved Journey</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
