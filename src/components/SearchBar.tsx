import React, { useState } from 'react';
import { Search, MapPin, Compass, Calendar, Users, ChevronDown } from 'lucide-react';

interface SearchBarProps {
  onSearch: (filters: { destination: string; category: string; guests: number; month: string }) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('All');
  const [month, setMonth] = useState('Anytime');
  const [guests, setGuests] = useState(2);
  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ destination, category, guests, month });
    const destElem = document.getElementById('destinations');
    if (destElem) {
      destElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const quickPills = [
    { label: 'Amalfi Coast', dest: 'Amalfi' },
    { label: 'Kyoto Sanctuary', dest: 'Kyoto' },
    { label: 'Serengeti Safari', dest: 'Serengeti' },
    { label: 'Swiss Alps', dest: 'Swiss' },
    { label: 'Patagonia', dest: 'Patagonia' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Search Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-2xl border border-white/40 text-slate-800 transition-all hover:shadow-amber-500/10"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 sm:gap-4 items-center">
          
          {/* Destination Field */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/70">
            <MapPin className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="w-full">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Where To?
              </label>
              <input
                type="text"
                placeholder="e.g. Italy, Japan, Alps..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Experience Category */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/70">
            <Compass className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="w-full">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Experience
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Experiences</option>
                <option value="Luxury">Luxury & Yachting</option>
                <option value="Cultural">Cultural Heritage</option>
                <option value="Wildlife">Wildlife Safari</option>
                <option value="Mountain">Alpine & Trekking</option>
                <option value="Beach">Island & Beach</option>
              </select>
            </div>
          </div>

          {/* Month / Season */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/70">
            <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div className="w-full">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Departure
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="Anytime">Any Season</option>
                <option value="Summer">Summer 2026</option>
                <option value="Autumn">Autumn 2026</option>
                <option value="Winter">Winter 2026-27</option>
                <option value="Spring">Spring 2027</option>
              </select>
            </div>
          </div>

          {/* Guests & Action Button */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-200/70 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Guests
                    </span>
                    <span className="text-sm font-semibold text-slate-800">
                      {guests} {guests === 1 ? 'Traveler' : 'Travelers'}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Guest counter popover */}
              {showGuestsDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">Total Guests</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold text-slate-900">{guests}</span>
                      <button
                        type="button"
                        onClick={() => setGuests(Math.min(12, guests + 1))}
                        className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center font-bold text-slate-700"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowGuestsDropdown(false)}
                    className="w-full mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 text-center py-1"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Submit */}
            <button
              type="submit"
              className="h-[58px] px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-slate-950 font-bold rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 transition-all hover:scale-[1.02] active:scale-95"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-slate-950" />
              <span className="hidden lg:inline ml-2 text-sm">Search</span>
            </button>
          </div>
        </div>

        {/* Quick popular destination tags */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 font-medium">Trending Now:</span>
          {quickPills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              onClick={() => {
                setDestination(pill.dest);
                onSearch({ destination: pill.dest, category, guests, month });
                const destElem = document.getElementById('destinations');
                if (destElem) destElem.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-600 font-medium transition-colors"
            >
              {pill.label}
            </button>
          ))}
        </div>
      </form>
    </div>
  );
};
