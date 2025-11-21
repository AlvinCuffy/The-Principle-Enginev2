import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';

interface ServiceRecordProps {
  profile: UserProfile | null;
  onCreateProfile: (name: string, title: string) => void;
  stats: { actions: number, unlocked: number };
}

export const ServiceRecord: React.FC<ServiceRecordProps> = ({ profile, onCreateProfile, stats }) => {
  const [inputName, setInputName] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Rank based on activity
  const getRank = () => {
    if (stats.actions > 50) return "Vanguard";
    if (stats.actions > 20) return "Architect";
    if (stats.actions > 5) return "Operator";
    return "Initiate";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName && inputTitle) {
      onCreateProfile(inputName, inputTitle);
    }
  };

  // --- EXPORT LOGIC (BACKUP) ---
  const handleExport = () => {
      // 1. Gather Core Data
      const data = {
          profile: JSON.parse(localStorage.getItem('tpe_user_profile') || 'null'),
          vault: JSON.parse(localStorage.getItem('tpe_vault_index') || '[]'),
          stats: localStorage.getItem('tpe_stats_actions') || '0',
          timestamp: new Date().toISOString(),
      };
      
      // 2. Gather Granular Progress (Checkboxes & Notes)
      const allData: any = { ...data, details: {} };
      for(let i=0; i<localStorage.length; i++) {
          const key = localStorage.key(i);
          // Only grab keys related to this app
          if(key && (key.startsWith('tpe_progress_') || key.startsWith('tpe_notes_') || key.startsWith('tpe_art_'))) {
              allData.details[key] = localStorage.getItem(key);
          }
      }

      // 3. Create Download
      const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Filename: TPE-Record-[Name]-[Date].json
      const safeName = profile?.name.replace(/[^a-z0-9]/gi, '-').toLowerCase() || 'user';
      link.download = `TPE-Record-${safeName}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  // --- IMPORT LOGIC (RESTORE) ---
  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
          try {
              const json = JSON.parse(event.target?.result as string);
              
              // Validation: simple check if profile exists in json
              if (!json.profile && !json.stats) {
                  throw new Error("Invalid File Format");
              }

              // 1. Restore Core Data
              if (json.profile) localStorage.setItem('tpe_user_profile', JSON.stringify(json.profile));
              if (json.vault) localStorage.setItem('tpe_vault_index', JSON.stringify(json.vault));
              if (json.stats) localStorage.setItem('tpe_stats_actions', json.stats);

              // 2. Restore Details
              if (json.details) {
                  Object.keys(json.details).forEach(key => {
                      localStorage.setItem(key, json.details[key]);
                  });
              }

              // 3. Reboot
              alert("Service Record successfully restored. Rebooting engine...");
              window.location.reload(); 

          } catch (err) {
              alert("Error: The selected file is not a valid Principle Engine Record.");
          }
      };
      reader.readAsText(file);
  };


  // VIEW 1: NO PROFILE (COMMISSIONING)
  if (!profile) {
    return (
      <div className="w-full max-w-xl mx-auto animate-fade-in text-center">
        <h2 className="text-3xl md:text-4xl font-light text-white mb-6">Initialize Service Record</h2>
        <div className="w-16 h-px bg-gold mx-auto mb-8"></div>
        <p className="text-white/60 mb-10 leading-relaxed">
          To track your progress and secure your vault, establish your identity within the engine.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-gold text-xs font-bold tracking-widest uppercase ml-1">Name / Alias</label>
            <input 
              type="text" 
              required
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              className="w-full bg-navy-dark/50 border border-white/20 p-4 text-white focus:border-gold outline-none transition-colors"
              placeholder="e.g. John Doe"
            />
          </div>
          <div className="space-y-2 text-left">
            <label className="text-gold text-xs font-bold tracking-widest uppercase ml-1">Primary Domain</label>
            <input 
              type="text" 
              required
              value={inputTitle}
              onChange={(e) => setInputTitle(e.target.value)}
              className="w-full bg-navy-dark/50 border border-white/20 p-4 text-white focus:border-gold outline-none transition-colors"
              placeholder="e.g. Entrepreneur, Father, Leader..."
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-gold hover:bg-gold-light text-navy font-bold py-4 text-xs uppercase tracking-[0.2em] transition-all mt-4"
          >
            Establish Record
          </button>
        </form>

        {/* Restore Link for returning users without a profile set */}
        <div className="mt-12 border-t border-white/10 pt-8">
             <p className="text-white/30 text-[10px] uppercase tracking-widest mb-4">Already have a Service Record file?</p>
             <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".json"
             />
             <button 
                onClick={handleImportClick}
                className="text-gold hover:text-white text-xs uppercase tracking-widest border-b border-gold pb-1"
             >
                Import Existing Record
             </button>
        </div>
      </div>
    );
  }

  // VIEW 2: EXISTING PROFILE (DOSSIER)
  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in">
      
      {/* Identity Header */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/10 pb-8 mb-12 gap-6 md:gap-0">
        <div className="text-center md:text-left">
          <h2 className="text-3xl md:text-5xl font-light text-white mb-2">{profile.name}</h2>
          <p className="text-gold text-sm tracking-[0.2em] uppercase">{profile.title}</p>
        </div>
        <div className="text-center md:text-right">
          <div className="inline-block border border-gold/50 px-4 py-2 bg-navy-dark/30">
            <p className="text-[10px] text-white/40 uppercase tracking-widest mb-1">Current Rank</p>
            <p className="text-xl text-gold font-bold uppercase tracking-widest">{getRank()}</p>
          </div>
          <p className="text-[10px] text-white/20 mt-2 uppercase tracking-widest">Member since {new Date(profile.joinedAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-navy-light/20 p-6 border border-white/5 text-center">
           <div className="text-4xl text-white font-light mb-2">{stats.unlocked}</div>
           <div className="text-[10px] text-gold uppercase tracking-widest">Principles Unlocked</div>
        </div>
        <div className="bg-navy-light/20 p-6 border border-white/5 text-center">
           <div className="text-4xl text-white font-light mb-2">{stats.actions}</div>
           <div className="text-[10px] text-gold uppercase tracking-widest">Actions Executed</div>
        </div>
        <div className="bg-navy-light/20 p-6 border border-white/5 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-gold/5"></div>
           <div className="relative z-10">
             <div className="text-4xl text-white font-light mb-2">
                {Math.floor(stats.actions * 1.5)}
             </div>
             <div className="text-[10px] text-gold uppercase tracking-widest">Wisdom Score</div>
           </div>
        </div>
      </div>

      {/* Data Management Section */}
      <div className="border-t border-white/10 pt-8">
        <h3 className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-6">Data Persistence & Backup</h3>
        <div className="bg-navy-dark/40 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="text-left flex-1">
            <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-white text-sm">Local Storage Active</p>
            </div>
            <p className="text-white/40 text-xs mb-4 leading-relaxed">
                Your service record is securely stored on this device. To move your progress to another device or back it up, generate a Digital Key below.
            </p>
            
            <div className="flex flex-wrap gap-4">
                {/* EXPORT BUTTON */}
                <button 
                    onClick={handleExport}
                    className="flex items-center gap-2 border border-gold text-gold hover:bg-gold hover:text-navy px-5 py-3 text-[10px] uppercase tracking-widest transition-all font-bold"
                >
                    <span>⬇</span> Download Digital Key
                </button>
                
                {/* IMPORT BUTTON */}
                <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".json"
                />
                <button 
                    onClick={handleImportClick}
                    className="flex items-center gap-2 border border-white/20 text-white/60 hover:text-white px-5 py-3 text-[10px] uppercase tracking-widest transition-all hover:border-white"
                >
                    <span>⬆</span> Restore From Key
                </button>
            </div>
          </div>

          <div className="hidden md:block text-right opacity-20">
             <span className="text-[60px] text-white font-thin">⚿</span>
          </div>

        </div>
      </div>

    </div>
  );
};