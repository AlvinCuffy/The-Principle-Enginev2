import React, { useState, useEffect, useRef } from 'react';
import { PrincipleResponse } from '../types';

interface ResultsDisplayProps {
  data: PrincipleResponse;
}

type Tab = 'principle' | 'qa' | 'references';

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<Tab>('principle');
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load completed steps from localStorage when data.id changes
  useEffect(() => {
    const savedProgress = localStorage.getItem(`tpe_progress_${data.id}`);
    if (savedProgress) {
      setCompletedSteps(JSON.parse(savedProgress));
    } else {
      setCompletedSteps([]);
    }
  }, [data.id]);

  // Toggle step completion and save to localStorage
  const toggleStep = (index: number) => {
    let newSteps;
    if (completedSteps.includes(index)) {
      newSteps = completedSteps.filter(i => i !== index);
    } else {
      newSteps = [...completedSteps, index];
    }
    setCompletedSteps(newSteps);
    localStorage.setItem(`tpe_progress_${data.id}`, JSON.stringify(newSteps));
    
    // Update global stats for Dashboard
    const currentTotal = parseInt(localStorage.getItem('tpe_stats_actions') || '0');
    if (!completedSteps.includes(index)) {
        localStorage.setItem('tpe_stats_actions', (currentTotal + 1).toString());
    } else {
        localStorage.setItem('tpe_stats_actions', (currentTotal - 1).toString());
    }
  };

  // Audio Immersion Logic
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    const utterance = new SpeechSynthesisUtterance(`${data.corePrinciple}. The Source: ${data.sourceReference}.`);
    utterance.rate = 0.9;
    utterance.pitch = 0.9;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Wisdom Artifact Logic (Minting)
  const handleMint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set up Canvas
    canvas.width = 1080;
    canvas.height = 1080;
    
    // Background
    ctx.fillStyle = '#0F2A4D'; // Navy
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Border
    ctx.strokeStyle = '#D4AF37'; // Gold
    ctx.lineWidth = 20;
    ctx.strokeRect(40, 40, 1000, 1000);

    // Text Setup
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    
    // Principle
    ctx.font = '60px serif';
    const words = data.corePrinciple.split(' ');
    let line = '';
    let y = 400;
    const maxWidth = 800;
    const lineHeight = 80;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, canvas.width/2, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, canvas.width/2, y);

    // Source
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'italic 40px serif';
    ctx.fillText(data.sourceReference, canvas.width/2, y + 100);

    // Brand
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.font = '20px sans-serif';
    ctx.fillText("THE PRINCIPLE ENGINE", canvas.width/2, 950);

    // Download
    const link = document.createElement('a');
    link.download = `Principle-${data.category}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto animate-slide-up">
      
      <canvas ref={canvasRef} className="hidden" />

      {/* Category Header - Indicates "Routing" */}
      <div className="text-center mb-8">
        <div className="inline-block border border-gold/30 px-4 py-1 rounded-sm bg-navy-dark/50 backdrop-blur-md">
          <p className="text-gold text-[10px] font-bold tracking-[0.3em] uppercase">
            Archive Accessed: {data.category}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-0 mb-12 border-b border-white/10">
        <button 
          onClick={() => setActiveTab('principle')}
          className={`px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${activeTab === 'principle' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          The Principle
          {activeTab === 'principle' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('qa')}
          className={`px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${activeTab === 'qa' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          Archive Q&A
          {activeTab === 'qa' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('references')}
          className={`px-4 md:px-6 py-4 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${activeTab === 'references' ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
        >
          Wisdom Sources
          {activeTab === 'references' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gold"></div>}
        </button>
      </div>

      {/* TAB 1: THE PRINCIPLE (Main Output) */}
      {activeTab === 'principle' && (
        <div className="animate-fade-in">
          <div className="mb-12 text-center relative group">
            <h2 className="text-3xl md:text-5xl font-light leading-tight text-white mb-6">
              "{data.corePrinciple}"
            </h2>
            <div className="w-24 h-px bg-gold mx-auto opacity-50 mb-8"></div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4 opacity-50 hover:opacity-100 transition-opacity duration-300">
                <button 
                    onClick={handleSpeak}
                    className="flex items-center gap-2 px-3 py-1 border border-white/20 rounded-full hover:border-gold hover:text-gold transition-colors text-[10px] uppercase tracking-widest"
                >
                    <span className="text-lg">{isSpeaking ? '◼' : '▶'}</span> {isSpeaking ? 'Silence' : 'Listen'}
                </button>
                <button 
                    onClick={handleMint}
                    className="flex items-center gap-2 px-3 py-1 border border-white/20 rounded-full hover:border-gold hover:text-gold transition-colors text-[10px] uppercase tracking-widest"
                >
                    <span>✦</span> Mint Artifact
                </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Source Section */}
            <div className="md:col-span-4 flex flex-col justify-start p-6 border border-gold/20 bg-navy-light/10 backdrop-blur-sm rounded-sm h-fit">
              <h3 className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-6">
                The Source
              </h3>
              <div className="flex-grow flex items-center justify-center md:justify-start">
                <p className="text-xl md:text-2xl font-serif italic text-white/90">
                  {data.sourceReference}
                </p>
              </div>
              <p className="text-xs text-white/40 mt-6 leading-relaxed">
                Ancient wisdom codified for current application.
              </p>
            </div>

            {/* Action Plan Section */}
            <div className="md:col-span-8 border-t md:border-t-0 md:border-l border-gold/20 pt-8 md:pt-0 md:pl-12">
              <h3 className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-8 flex justify-between items-center">
                <span>The 7-Step Action Plan</span>
                <span className="text-[10px] text-white/30 tracking-normal font-sans">Progress Saved</span>
              </h3>
              <ul className="space-y-6">
                {data.actionPlan.map((step, index) => {
                  const isCompleted = completedSteps.includes(index);
                  return (
                    <li 
                      key={index} 
                      onClick={() => toggleStep(index)}
                      className="flex items-start group cursor-pointer select-none"
                    >
                      <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center border transition-all duration-300 rounded-full mr-4 ${isCompleted ? 'bg-gold border-gold text-navy' : 'border-gold/30 text-gold text-sm hover:border-gold'}`}>
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <span className="font-medium text-sm">{index + 1}</span>
                        )}
                      </div>
                      <p className={`text-lg font-light leading-relaxed pt-0.5 transition-all duration-300 ${isCompleted ? 'text-gold/50 line-through' : 'text-white/80'}`}>
                        {step}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ARCHIVE Q&A */}
      {activeTab === 'qa' && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-2">Common Inquiries</h3>
            <p className="text-white/50 font-light text-sm">Similar questions found in the {data.category.toLowerCase()} archive.</p>
          </div>
          
          <div className="space-y-8">
            {data.relatedQuestions.map((qa, index) => (
              <div key={index} className="bg-navy-light/20 border-l-2 border-gold/30 p-6 hover:bg-navy-light/30 transition-colors duration-300">
                <p className="text-white/60 text-xs font-bold tracking-widest uppercase mb-2">Inquiry #{parseInt(data.id.split('-')[1]) * 100 + index + 34}</p>
                <h4 className="text-xl text-white font-medium mb-4">"{qa.question}"</h4>
                <div className="pl-4 border-l border-white/10">
                  <p className="text-gold/90 italic font-serif leading-relaxed">
                    {qa.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: WISDOM SOURCES */}
      {activeTab === 'references' && (
        <div className="animate-fade-in max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-gold text-xs font-bold tracking-[0.3em] uppercase mb-2">Aligning Scriptures</h3>
            <p className="text-white/50 font-light text-sm">Foundational texts supporting the {data.category.toLowerCase()} principle.</p>
          </div>

          <div className="grid gap-6">
            {data.additionalScriptures.map((scripture, index) => (
              <div key={index} className="relative p-8 border border-white/10 bg-navy-dark/40 text-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-navy px-4">
                  <span className="text-gold text-xs font-bold tracking-widest">{scripture.verse}</span>
                </div>
                <p className="text-white/80 font-serif text-lg leading-loose">
                  "{scripture.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};