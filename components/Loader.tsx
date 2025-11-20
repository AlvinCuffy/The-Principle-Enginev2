import React from 'react';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 animate-fade-in">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-t-2 border-gold rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-b-2 border-navy-light rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <div className="mt-6 text-center">
        <p className="text-gold/80 text-sm tracking-[0.2em] font-light uppercase animate-pulse">
          Scanning Archives...
        </p>
        <p className="text-white/20 text-[10px] tracking-widest uppercase mt-2">
          Categorizing Inquiry
        </p>
      </div>
    </div>
  );
};