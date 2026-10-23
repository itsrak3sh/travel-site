import React, { useState, useMemo } from 'react';
import { Tour } from '../types';
import { Star, Clock, Users, MapPin, Heart, ArrowUpRight, Sparkles, Filter } from 'lucide-react';

interface FeaturedDestinationsProps {
  tours: Tour[];
  wishlist: string[];
  onToggleWishlist: (tourId: string) => void;
  onSelectTour: (tour: Tour) => void;
  onBookTour: (tour: Tour) => void;
  activeFilterCategory?: string;
  searchQuery?: string;
}

export const FeaturedDestinations: React.FC<FeaturedDestinationsProps> = ({
  tours,
  wishlist,
  onToggleWishlist,
  onSelectTour,
  onBookTour,
  activeFilterCategory = 'All',
  searchQuery = '',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(activeFilterCategory);
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'rating'>('recommended');

  const categories = ['All', 'Trending', 'Luxury', 'Mountain', 'Cultural', 'Wildlife', 'Beach'];
  const regions = ['All', 'Europe', 'Asia', 'Americas', 'Africa', 'Polar'];

  // Sync if prop changed
  React.useEffect(() => {
    if (activeFilterCategory && activeFilterCategory !== 'All') {
      setSelectedCategory(activeFilterCategory);
    }
  }, [activeFilterCategory]);

  const filteredTours = useMemo(() => {
    return tours
      .filter((tour) => {
        // Search query filter (destination, country, title)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchTitle = tour.title.toLowerCase().includes(query);
          const matchDest = tour.destination.toLowerCase().includes(query);
          const matchCountry = tour.country.toLowerCase().includes(query);
          if (!matchTitle && !matchDest && !matchCountry) return false;
        }

        // Category filter
        if (selectedCategory !== 'All' && tour.category !== selectedCategory) {
          return false;
        }

        // Region filter
        if (selectedRegion !== 'All' && tour.region !== selectedRegion) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceUSD - b.priceUSD;
        if (sortBy === 'price-desc') return b.priceUSD - a.priceUSD;
        if (sortBy === 'rating') return b.rating - a.rating;
        return 0; // default order
      });
  }, [tours, searchQuery, selectedCategory, selectedRegion, sortBy]);

  return (
    <section id="destinations" className="py-20 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Expeditions</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white">
              Signature Journeys
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl text-base sm:text-lg">
              Intimate, small-group itineraries meticulously engineered for true connoisseurs of discovery.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="mt-4 md:mt-0 text-right">
            <span className="text-xs text-slate-400 font-medium">Showing</span>
            <span className="ml-1.5 text-sm font-bold text-amber-400">
              {filteredTours.length} handcrafted {filteredTours.length === 1 ? 'itinerary' : 'itineraries'}
            </span>
          </div>
        </div>

        {/* Filter & Sorting Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-800">
          
          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25 scale-[1.02]'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Expeditions' : cat}
              </button>
            ))}
          </div>

          {/* Region & Sort Selectors */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60 text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Region:</span>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                {regions.map((reg) => (
                  <option key={reg} value={reg} className="bg-slate-900 text-white">
                    {reg}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700/60 text-xs">
              <span className="text-slate-400">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="recommended" className="bg-slate-900 text-white">Recommended</option>
                <option value="price-asc" className="bg-slate-900 text-white">Price: Low to High</option>
                <option value="price-desc" className="bg-slate-900 text-white">Price: High to Low</option>
                <option value="rating" className="bg-slate-900 text-white">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTours.length === 0 && (
          <div className="text-center py-16 bg-slate-800/40 rounded-3xl border border-dashed border-slate-700 p-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No itineraries matched your criteria</h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Try adjusting your destination search or selecting "All Expeditions" to explore all bespoke journeys.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedRegion('All');
              }}
              className="px-6 py-2.5 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Tour Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTours.map((tour) => {
            const isWishlisted = wishlist.includes(tour.id);
            const savings = tour.originalPriceUSD ? tour.originalPriceUSD - tour.priceUSD : 0;

            return (
              <div
                key={tour.id}
                className="group bg-slate-800/70 rounded-3xl overflow-hidden border border-slate-700/60 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col justify-between"
              >
                {/* Image Container with Badges */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={tour.image}
                    alt={tour.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {tour.badge && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                        {tour.badge}
                      </span>
                    )}
                    {savings > 0 && (
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-md">
                        Save ${savings}
                      </span>
                    )}
                  </div>

                  {/* Wishlist toggle */}
                  <button
                    onClick={() => onToggleWishlist(tour.id)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:text-rose-400 hover:scale-110 transition-all"
                    aria-label="Save to Wishlist"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                  </button>

                  {/* Bottom Image Stats */}
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>{tour.destination}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full border border-white/10 font-bold text-amber-300">
                      <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                      <span>{tour.rating.toFixed(2)}</span>
                      <span className="text-slate-400 font-normal">({tour.reviewCount})</span>
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Duration & Group Size */}
                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {tour.durationDays} Days / {tour.durationDays - 1} Nights
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {tour.groupSize}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-snug mb-2">
                      {tour.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                      {tour.subtitle}
                    </p>

                    {/* Highlights bullet preview */}
                    <div className="space-y-1.5 mb-6">
                      {tour.highlights.slice(0, 2).map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 flex-shrink-0" />
                          <span className="line-clamp-1">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and CTAs */}
                  <div className="pt-4 border-t border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        All-Inclusive From
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-white">
                          ${tour.priceUSD.toLocaleString()}
                        </span>
                        {tour.originalPriceUSD && (
                          <span className="text-xs text-slate-500 line-through">
                            ${tour.originalPriceUSD.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Flexible dates & refundable
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectTour(tour)}
                        className="p-2.5 rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                        title="View Detailed Itinerary"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onBookTour(tour)}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02]"
                      >
                        Book Trip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
