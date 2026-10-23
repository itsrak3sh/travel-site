import React, { useEffect, useState } from 'react';
import { Tour } from '../types';
import { X, Star, Calendar, Users, MapPin, CheckCircle2, ShieldCheck, ArrowRight, Heart } from 'lucide-react';

interface TourModalProps {
  tour: Tour | null;
  onClose: () => void;
  onBookNow: (tour: Tour) => void;
  isWishlisted: boolean;
  onToggleWishlist: (tourId: string) => void;
}

export const TourModal: React.FC<TourModalProps> = ({
  tour,
  onClose,
  onBookNow,
  isWishlisted,
  onToggleWishlist,
}) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!tour) return null;

  const currentGallery = tour.gallery && tour.gallery.length > 0 ? tour.gallery : [tour.image];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden my-8 text-white max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
            <MapPin className="w-4 h-4" />
            <span>{tour.destination} ({tour.country})</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onToggleWishlist(tour.id)}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-8 flex-1">
          {/* Gallery Showcase */}
          <div>
            <div className="aspect-[16/9] w-full rounded-2xl overflow-hidden mb-3 relative bg-slate-950">
              <img
                src={currentGallery[activeImageIdx]}
                alt={tour.title}
                className="w-full h-full object-cover transition-all duration-500"
              />
              <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-xs font-semibold text-slate-200">
                Photo {activeImageIdx + 1} of {currentGallery.length}
              </div>
            </div>

            {/* Thumbnails */}
            {currentGallery.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentGallery.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImageIdx === idx
                        ? 'border-amber-400 scale-105'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Metadata */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                {tour.category} Odyssey
              </span>
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-300">
                <Star className="w-4 h-4 fill-amber-300" />
                <span>{tour.rating.toFixed(2)} rating</span>
                <span className="text-slate-400 font-normal">({tour.reviewCount} reviews)</span>
              </div>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-2">
              {tour.title}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {tour.subtitle}
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Duration</span>
                  <span className="text-sm font-bold text-white">{tour.durationDays} Days / {tour.durationDays - 1} Nights</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-amber-400" />
                <div>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Group Limit</span>
                  <span className="text-sm font-bold text-white">{tour.groupSize}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <span className="block text-[11px] text-slate-400 uppercase font-semibold">Flexibility</span>
                  <span className="text-sm font-bold text-emerald-400">100% Refundable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-4">Expedition Highlights</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tour.highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                  <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Day-by-Day Itinerary */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-4">Day-by-Day Itinerary</h3>
            <div className="space-y-4">
              {tour.itinerary.map((day) => (
                <div key={day.day} className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold text-amber-400 text-sm flex-shrink-0">
                    D{day.day}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm sm:text-base mb-1">{day.title}</h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{day.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* What's Included */}
          <div>
            <h3 className="text-lg font-serif font-bold text-white mb-4">Complimentary Inclusions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-300">
              {tour.included.map((inc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>{inc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Booking Sticky Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between gap-4">
          <div>
            <span className="block text-[11px] text-slate-400 uppercase font-semibold">Total Price Per Guest</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-white">${tour.priceUSD.toLocaleString()}</span>
              {tour.originalPriceUSD && (
                <span className="text-sm text-slate-500 line-through">${tour.originalPriceUSD.toLocaleString()}</span>
              )}
            </div>
            <span className="text-[11px] text-amber-400 font-medium">{tour.nextDeparture}</span>
          </div>

          <button
            onClick={() => onBookNow(tour)}
            className="flex items-center gap-2 px-6 sm:px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-sm sm:text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95"
          >
            <span>Proceed to Booking</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
