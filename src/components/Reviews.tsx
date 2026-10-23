import React from 'react';
import { TESTIMONIALS } from '../data/tours';
import { Star, CheckCircle, Quote } from 'lucide-react';

export const Reviews: React.FC = () => {
  return (
    <section id="reviews" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Verified Voyager Testimonials</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mb-4">
            Stories From the Edge of Wonder
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Hear from discerning couples, solo adventurers, and private families who trust us with their most cherished milestones.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((review) => (
            <div
              key={review.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-2xl hover:shadow-black/50 relative group"
            >
              <Quote className="w-10 h-10 text-amber-500/20 absolute top-6 right-6 pointer-events-none group-hover:text-amber-500/30 transition-colors" />

              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-amber-400 mb-6">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic mb-8">
                  "{review.quote}"
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-slate-800/80">
                <img
                  src={review.avatar}
                  alt={review.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-400/40"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-sm">{review.name}</span>
                    {review.verified && (
                      <span title="Verified Voyager">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      </span>
                    )}
                  </div>
                  <span className="block text-xs text-slate-400">{review.location}</span>
                  <span className="text-[11px] font-semibold text-amber-400 mt-0.5 block">
                    {review.trip}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trustpilot Banner */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-800 px-6 py-3 rounded-full text-xs sm:text-sm">
            <span className="text-slate-300">Rated <strong className="text-white">Exceptional</strong> 4.98 out of 5 based on 2,400+ reviews on</span>
            <span className="font-bold text-emerald-400 tracking-wide">★ Trustpilot</span>
          </div>
        </div>
      </div>
    </section>
  );
};
