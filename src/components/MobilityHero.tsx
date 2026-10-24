import React, { useRef, useState, useEffect } from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { MobilityMode } from '../types/mobility';

interface MobilityHeroProps {
  activeMode: MobilityMode;
  onModeChange: (mode: MobilityMode) => void;
  children: React.ReactNode;
}

export const MobilityHero: React.FC<MobilityHeroProps> = ({
  activeMode,
  onModeChange,
  children,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playbackRate = 0.35; // Serene, relaxing ambient movement that eliminates eye strain
      video.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  const handleVideoReady = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playbackRate = 0.35;
    }
    setVideoLoaded(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      
      {/* 1. Peaceful Scenic Background Video Loop */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={handleVideoReady}
          onCanPlay={handleVideoReady}
          poster="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-80' : 'opacity-40'
          }`}
        >
          <source src="/videos/peaceful-scenic-drive.mp4" type="video/mp4" />
          <source src="/videos/scenic-mountain-pass.webm" type="video/webm" />
        </video>

        {/* 2. Soft, Dark Ambient Vignette Overlay with subtle backdrop blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-zinc-950/60 to-black/90 backdrop-blur-[2px]" />

        {/* Ambient radial vignette for peaceful depth */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 pointer-events-none" />
      </div>

      {/* 3. Hero Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20">
        
        {/* Top Header Badge & Tagline */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-4">
          
          {/* Subtle Ambient Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-emerald-300/90 text-xs font-medium tracking-wide shadow-sm backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-[11px] tracking-widest uppercase font-light">Serene Chauffeur Mobility • Private Escrow</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-light text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.18]">
            Effortless Journeys,{' '}
            <span className="font-serif italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-teal-100 to-amber-100">
              Quietly Crafted
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300/80 max-w-xl mx-auto font-light leading-relaxed text-pretty">
            Bespoke multi-stop itineraries and instant point-to-point private transfers with verified professional chauffeurs in calm luxury.
          </p>

          {/* In-Hero Minimalist Mode Switcher */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl">
              <button
                onClick={() => onModeChange('custom-trip')}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-300 ${
                  activeMode === 'custom-trip'
                    ? 'bg-white/10 text-white shadow-lg shadow-black/40 border border-white/15 backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Compass className={`w-4 h-4 ${activeMode === 'custom-trip' ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>Custom Trip (Method 1)</span>
              </button>

              <button
                onClick={() => onModeChange('quick-ride')}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-2xl font-medium text-xs sm:text-sm transition-all duration-300 ${
                  activeMode === 'quick-ride'
                    ? 'bg-white/10 text-white shadow-lg shadow-black/40 border border-white/15 backdrop-blur-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeMode === 'quick-ride' ? 'text-emerald-300' : 'text-slate-400'}`} />
                <span>Quick Ride (Method 2)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Embedded Active Mode Component */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  );
};
