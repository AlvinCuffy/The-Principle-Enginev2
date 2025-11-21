import React, { useState, useCallback, useEffect } from 'react';
import { fetchPrinciple, generateBlueprint, BlueprintResponse } from './services/geminiService';
import { PrincipleResponse, AppState, VaultItem, UserProfile } from './types';
import { Loader } from './components/Loader';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ServiceRecord } from './components/ServiceRecord';

type NavTab = 'ENGINE' | 'BLUEPRINT' | 'HUB' | 'RECORD';

const App: React.FC = () => {
  // Navigation State
  const [activeNav, setActiveNav] = useState<NavTab>('ENGINE');

  // Engine Logic State
  const [input, setInput] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [data, setData] = useState<PrincipleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ actions: 0, unlocked: 0 });

  // Vault State
  const [showVault, setShowVault] = useState(false);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Blueprint Logic State
  const [bpInputs, setBpInputs] = useState({ burden: '', hand: '', history: '' });
  const [bpLoading, setBpLoading] = useState(false);
  const [bpResult, setBpResult] = useState<BlueprintResponse | null>(null);

  // Hub Logic State
  const [email, setEmail] = useState('');
  const [hubSubmitted, setHubSubmitted] = useState(false);

  // Load Data on Mount & Updates
  useEffect(() => {
    // Load Profile
    const savedProfile = localStorage.getItem('tpe_user_profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    // Load Stats
    const actions = parseInt(localStorage.getItem('tpe_stats_actions') || '0');
    let unlocked = 0;
    for(let i=0; i<localStorage.length; i++) {
        const key = localStorage.key(i);
        if(key && key.startsWith('tpe_progress_')) {
            unlocked++;
        }
    }
    setStats({ actions, unlocked });

    // Load Vault
    const vaultData = localStorage.getItem('tpe_vault_index');
    if (vaultData) {
        setVaultItems(JSON.parse(vaultData));
    }
  }, [activeNav, data]); 

  const handleCreateProfile = (name: string, title: string) => {
    const newProfile: UserProfile = {
      name,
      title,
      joinedAt: new Date().toISOString()
    };
    setUserProfile(newProfile);
    localStorage.setItem('tpe_user_profile', JSON.stringify(newProfile));
  };

  const saveToVault = (item: PrincipleResponse) => {
      const newItem: VaultItem = {
          id: item.id,
          category: item.category,
          corePrinciple: item.corePrinciple,
          unlockedAt: new Date().toISOString()
      };
      
      const currentVault = JSON.parse(localStorage.getItem('tpe_vault_index') || '[]');
      // Avoid duplicates
      if (!currentVault.some((v: VaultItem) => v.id === item.id)) {
          const updatedVault = [newItem, ...currentVault];
          localStorage.setItem('tpe_vault_index', JSON.stringify(updatedVault));
          setVaultItems(updatedVault);
      }
  };

  const handleSearch = useCallback(async (e?: React.FormEvent, overrideInput?: string) => {
    if (e) e.preventDefault();
    const query = overrideInput || input;
    if (!query.trim()) return;

    setAppState(AppState.LOADING);
    setShowVault(false); // Close vault on search
    setError(null);
    setData(null);

    try {
      const result = await fetchPrinciple(query);
      setData(result);
      saveToVault(result); // Save to Vault
      setAppState(AppState.SUCCESS);
    } catch (err: any) {
      if (err.message === "NO_MATCH") {
        setAppState(AppState.NO_MATCH);
      } else {
        setAppState(AppState.ERROR);
        setError("The engine encountered an issue retrieving the principle. Please try again.");
      }
    }
  }, [input]);

  const handleBlueprintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpInputs.burden || !bpInputs.hand || !bpInputs.history) return;
    setBpLoading(true);
    try {
        const result = await generateBlueprint(bpInputs.burden, bpInputs.hand, bpInputs.history);
        setBpResult(result);
    } catch (e) {
       // Error handling
    } finally {
        setBpLoading(false);
    }
  };

  const resetSearch = () => {
    setAppState(AppState.IDLE);
    setInput('');
    setData(null);
    setShowVault(false);
  };

  const handleHubSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setTimeout(() => {
        setHubSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col font-sans selection:bg-gold selection:text-navy overflow-x-hidden">
      
      {/* Sticky Header with Navigation */}
      <header className="w-full py-6 px-8 flex flex-col md:flex-row justify-between items-center z-50 border-b border-white/5 bg-navy/80 backdrop-blur-md sticky top-0">
        <div 
          onClick={() => { setActiveNav('ENGINE'); resetSearch(); }}
          className="text-white font-bold text-lg tracking-widest uppercase cursor-pointer hover:text-gold transition-colors mb-4 md:mb-0"
        >
          The Principle Engine
        </div>
        
        {/* Navigation Tabs */}
        <nav className="flex space-x-4 md:space-x-8 overflow-x-auto w-full md:w-auto">
          <button 
            onClick={() => setActiveNav('ENGINE')}
            className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all relative pb-2 whitespace-nowrap ${activeNav === 'ENGINE' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            The Engine
            {activeNav === 'ENGINE' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-tab-transition"></span>}
          </button>
          <button 
            onClick={() => setActiveNav('BLUEPRINT')}
            className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all relative pb-2 whitespace-nowrap ${activeNav === 'BLUEPRINT' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            The Blueprint
            {activeNav === 'BLUEPRINT' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-tab-transition"></span>}
          </button>
          <button 
            onClick={() => setActiveNav('HUB')}
            className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all relative pb-2 whitespace-nowrap ${activeNav === 'HUB' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            The Hub
            {activeNav === 'HUB' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-tab-transition"></span>}
          </button>
          <button 
            onClick={() => setActiveNav('RECORD')}
            className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all relative pb-2 whitespace-nowrap ${activeNav === 'RECORD' ? 'text-gold' : 'text-white/40 hover:text-white'}`}
          >
            The Record
            {activeNav === 'RECORD' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gold animate-tab-transition"></span>}
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-8 relative w-full max-w-7xl mx-auto min-h-[60vh] py-10">
        
        {/* Ambient Background Glow - Consistent across tabs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

        {/* TAB 1: THE ENGINE */}
        {activeNav === 'ENGINE' && (
          <div key="ENGINE" className="w-full flex flex-col items-center animate-tab-transition">
            {/* Initial State / Search View */}
            {appState === AppState.IDLE && !showVault && (
              <div className="w-full max-w-2xl text-center z-10 mt-10 md:mt-0">
                <h1 className="text-4xl md:text-6xl font-light text-white mb-4 tracking-tight">
                  Timeless Wisdom <br />
                  <span className="font-semibold text-white">For Modern Problems</span>
                </h1>
                <div className="w-16 h-1 bg-gold mx-auto my-8"></div>
                
                <form onSubmit={(e) => handleSearch(e)} className="w-full flex flex-col items-center mb-16">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="What challenge are you facing?"
                    className="w-full bg-transparent border-b border-white/20 text-xl md:text-2xl py-4 text-center text-white placeholder-white/30 focus:outline-none focus:border-gold transition-all duration-300 mb-10"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-gold hover:bg-gold-light text-navy font-bold py-4 px-12 rounded-sm uppercase tracking-widest text-sm transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    Reveal the Principle
                  </button>
                </form>

                {/* DOER'S LEDGER DASHBOARD */}
                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8 max-w-md mx-auto">
                   <div 
                     className="text-center cursor-pointer group"
                     onClick={() => setShowVault(true)}
                   >
                       <div className="text-3xl font-light text-gold mb-1 group-hover:text-white transition-colors">{vaultItems.length}</div>
                       <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 group-hover:text-gold transition-colors">Open Vault</div>
                   </div>
                   <div className="text-center border-l border-white/10">
                       <div className="text-3xl font-light text-gold mb-1">{stats.actions}</div>
                       <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Actions Taken</div>
                   </div>
                </div>
              </div>
            )}

            {/* THE VAULT GALLERY VIEW */}
            {showVault && (
               <div className="w-full z-10 animate-fade-in">
                   <div className="text-center mb-12">
                       <h2 className="text-3xl font-light text-white mb-4">The Archive Vault</h2>
                       <button onClick={() => setShowVault(false)} className="text-gold text-xs uppercase tracking-widest hover:text-white transition-colors">← Return to Search</button>
                   </div>
                   
                   {vaultItems.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {vaultItems.map((item) => (
                               <div 
                                 key={item.id}
                                 onClick={() => {
                                     // Hack to re-search specifically for this item without typing
                                     // In a real app we'd just load by ID, but search works for this demo
                                     setInput(item.category.split(' ')[0]); // Crude way to re-trigger, ideally we store the exact query or just load data directly
                                     handleSearch(undefined, item.category); 
                                 }}
                                 className="bg-navy-light/20 border border-white/5 p-8 hover:border-gold/30 cursor-pointer transition-all duration-300 hover:bg-navy-light/40 group"
                               >
                                   <p className="text-[10px] text-gold uppercase tracking-widest mb-4">{item.category}</p>
                                   <h3 className="text-white font-light text-lg leading-relaxed group-hover:text-gold transition-colors">
                                       "{item.corePrinciple}"
                                   </h3>
                                   <div className="mt-6 h-0.5 w-8 bg-white/10 group-hover:w-full group-hover:bg-gold transition-all duration-500"></div>
                               </div>
                           ))}
                       </div>
                   ) : (
                       <div className="text-center text-white/40 py-20">The Vault is empty. Begin your search to collect wisdom.</div>
                   )}
               </div>
            )}

            {/* Loading State */}
            {appState === AppState.LOADING && <Loader />}

            {/* Results State */}
            {appState === AppState.SUCCESS && data && (
              <div className="w-full py-12 z-10">
                 <ResultsDisplay data={data} />
                 <div className="mt-16 text-center animate-fade-in delay-500">
                    <button 
                      onClick={resetSearch}
                      className="text-gold/60 hover:text-gold text-xs uppercase tracking-[0.2em] border-b border-transparent hover:border-gold pb-1 transition-all"
                    >
                      Seek Another Principle
                    </button>
                 </div>
              </div>
            )}

            {/* No Match / General Wisdom Fallback State */}
            {appState === AppState.NO_MATCH && (
              <div className="text-center animate-fade-in z-10 max-w-lg mt-10 md:mt-0">
                 <h3 className="text-gold text-xl font-light mb-4">Wisdom is seeking.</h3>
                 <p className="text-white/70 text-lg leading-relaxed mb-8">
                   Our systems could not retrieve a specific principle for that query.
                 </p>
                 <button
                    onClick={resetSearch}
                    className="text-white/40 text-xs uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Try Again
                  </button>
              </div>
            )}

            {/* Error State */}
            {appState === AppState.ERROR && (
               <div className="text-center animate-fade-in z-10 mt-10 md:mt-0">
                 <p className="text-red-400 text-lg mb-6">{error}</p>
                 <button
                    onClick={resetSearch}
                    className="text-white underline hover:text-gold"
                  >
                    Try Again
                  </button>
               </div>
            )}
          </div>
        )}

        {/* TAB 2: THE BLUEPRINT (Updated with Detailed Form) */}
        {activeNav === 'BLUEPRINT' && (
          <div key="BLUEPRINT" className="w-full flex flex-col items-center animate-tab-transition z-10 max-w-4xl">
             <h2 className="text-3xl md:text-5xl font-light text-white mb-4 leading-tight text-center">
               The Principle of Purpose
             </h2>
             <div className="w-16 h-1 bg-gold mx-auto mb-12"></div>

             {!bpResult ? (
                 <form onSubmit={handleBlueprintSubmit} className="w-full space-y-12 animate-fade-in">
                    {/* Field 1: The Burden */}
                    <div className="space-y-4">
                        <div className="border-l-2 border-gold pl-6">
                            <label className="block text-gold text-lg font-serif italic mb-2">I. Identify the Sacred Burden</label>
                            <p className="text-white/60 text-sm font-light leading-relaxed max-w-2xl">
                                What problem do you *hate* seeing in the world? Your greatest opportunity lies where you feel the greatest anger or pain for others.
                            </p>
                        </div>
                        <textarea 
                            required
                            className="w-full bg-navy-dark/50 border border-white/10 rounded-sm p-6 text-white text-lg font-light focus:border-gold outline-none h-32 resize-none transition-all"
                            placeholder="e.g., I hate seeing good people fall for financial scams..."
                            value={bpInputs.burden}
                            onChange={e => setBpInputs({...bpInputs, burden: e.target.value})}
                        />
                    </div>

                    {/* Field 2: The Hand */}
                    <div className="space-y-4">
                        <div className="border-l-2 border-gold pl-6">
                            <label className="block text-gold text-lg font-serif italic mb-2">II. Inventory the Asset</label>
                            <p className="text-white/60 text-sm font-light leading-relaxed max-w-2xl">
                                What skill, talent, or unique experience has God put in your hand? Your gift makes room for you.
                            </p>
                        </div>
                         <textarea 
                            required
                            className="w-full bg-navy-dark/50 border border-white/10 rounded-sm p-6 text-white text-lg font-light focus:border-gold outline-none h-32 resize-none transition-all"
                            placeholder="e.g., I am a masterful communicator, or, I have deep experience in construction..."
                            value={bpInputs.hand}
                            onChange={e => setBpInputs({...bpInputs, hand: e.target.value})}
                        />
                    </div>

                    {/* Field 3: The History */}
                    <div className="space-y-4">
                        <div className="border-l-2 border-gold pl-6">
                            <label className="block text-gold text-lg font-serif italic mb-2">III. Validate the Story</label>
                            <p className="text-white/60 text-sm font-light leading-relaxed max-w-2xl">
                                What personal history, failure, or survival story gives you the authority to speak on this topic?
                            </p>
                        </div>
                         <textarea 
                            required
                            className="w-full bg-navy-dark/50 border border-white/10 rounded-sm p-6 text-white text-lg font-light focus:border-gold outline-none h-32 resize-none transition-all"
                            placeholder="e.g., I survived a major business failure and rebuilt my finances from scratch..."
                            value={bpInputs.history}
                            onChange={e => setBpInputs({...bpInputs, history: e.target.value})}
                        />
                    </div>

                    <div className="text-center pt-8 pb-12">
                        {bpLoading ? (
                            <div className="text-gold animate-pulse text-sm tracking-[0.3em] uppercase">Constructing Blueprint...</div>
                        ) : (
                            <button type="submit" className="bg-gold hover:bg-gold-light text-navy font-bold py-4 px-16 text-sm uppercase tracking-[0.25em] transition-all transform hover:scale-105 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                                Construct Blueprint
                            </button>
                        )}
                    </div>
                 </form>
             ) : (
                 <div className="w-full bg-navy-dark/40 border border-gold/30 p-8 md:p-12 text-center animate-fade-in">
                     <h3 className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-6">Divine Assignment Identified</h3>
                     <p className="text-2xl md:text-3xl text-white font-serif italic leading-relaxed mb-10">
                         "{bpResult.purposeStatement}"
                     </p>
                     <div className="text-left max-w-xl mx-auto">
                         <h4 className="text-white/50 text-[10px] uppercase tracking-widest mb-4 text-center">Strategic Execution Steps</h4>
                         <ul className="space-y-4">
                             {bpResult.executionSteps?.map((step, i) => (
                                 <li key={i} className="flex items-start gap-4 text-white/80 font-light">
                                     <span className="text-gold font-bold">0{i+1}</span>
                                     <span>{step}</span>
                                 </li>
                             ))}
                         </ul>
                     </div>
                     <button 
                        onClick={() => { setBpResult(null); setBpInputs({burden:'',hand:'',history:''}) }}
                        className="mt-12 text-white/30 hover:text-white text-xs uppercase tracking-widest"
                     >
                         Reset Blueprint
                     </button>
                 </div>
             )}
          </div>
        )}

        {/* TAB 3: THE HUB (UPDATED WITH FORM) */}
        {activeNav === 'HUB' && (
          <div key="HUB" className="w-full flex flex-col items-center justify-center animate-tab-transition text-center z-10 max-w-2xl">
             <h2 className="text-3xl md:text-5xl font-light text-white mb-6 leading-tight">
               The Community: <br/>
               <span className="text-gold font-serif italic">Moving from Hearer to Doer</span>
             </h2>
             <div className="w-16 h-1 bg-gold mx-auto my-8"></div>
             
             {!hubSubmitted ? (
                <div className="w-full">
                   <p className="text-white/70 text-lg font-light mb-8 leading-relaxed">
                     We are building a private network for those who refuse to settle for ordinary. 
                     Join the Vanguard and receive early access when the doors open.
                   </p>
                   <form onSubmit={handleHubSubmit} className="flex flex-col items-center w-full">
                      <div className="relative w-full max-w-md mb-6">
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address" 
                          className="w-full bg-navy-dark/50 border border-white/10 text-white px-6 py-4 text-center focus:outline-none focus:border-gold transition-colors placeholder-white/20"
                        />
                      </div>
                      <button 
                        type="submit"
                        className="bg-transparent border border-gold text-gold hover:bg-gold hover:text-navy font-bold py-3 px-10 text-xs uppercase tracking-[0.2em] transition-all duration-300"
                      >
                        Request Access
                      </button>
                   </form>
                   <p className="mt-6 text-white/20 text-[10px] uppercase tracking-widest">
                     Limited spots available for Alpha Cohort
                   </p>
                </div>
             ) : (
                <div className="w-full bg-gold/10 p-8 border border-gold/20 animate-fade-in">
                   <div className="text-gold text-4xl mb-4">✓</div>
                   <h3 className="text-white font-bold text-xl mb-2 uppercase tracking-widest">Access Requested</h3>
                   <p className="text-white/70 font-light">
                     Your signal has been received. Watch your inbox.<br/>
                     Welcome to the Vanguard.
                   </p>
                </div>
             )}
          </div>
        )}

        {/* TAB 4: THE RECORD (PROFILE) */}
        {activeNav === 'RECORD' && (
            <div key="RECORD" className="w-full flex flex-col items-center animate-tab-transition z-10">
                <ServiceRecord 
                    profile={userProfile} 
                    onCreateProfile={handleCreateProfile}
                    stats={stats}
                />
            </div>
        )}

      </main>

      {/* Footer */}
      <footer className="w-full py-6 text-center z-10">
        <p className="text-white/20 text-xs uppercase tracking-[0.2em]">
          Built for Doers
        </p>
      </footer>
    </div>
  );
};

export default App;