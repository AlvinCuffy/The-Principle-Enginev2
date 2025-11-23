// Inside ServiceRecord.tsx

// Add this to your stats prop or fetch internally
const masteryCount = parseInt(localStorage.getItem('tpe_stats_mastery') || '0');

// ... In the return JSX, update the 3rd stats box:

<div className="bg-navy-light/20 p-6 border border-white/5 text-center relative overflow-hidden">
   {/* Add a Gold glow if they have at least 1 mastery */}
   {masteryCount > 0 && <div className="absolute inset-0 bg-gold/10 animate-pulse"></div>}
   
   <div className="relative z-10">
     <div className="text-4xl text-white font-light mb-2">
        {masteryCount}
     </div>
     <div className="text-[10px] text-gold uppercase tracking-widest">Protocols Executed</div>
   </div>
</div>