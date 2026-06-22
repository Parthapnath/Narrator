import React from "react";
import { Sparkles, AudioLines } from "lucide-react";

export default function Header() {
  return (
    <header id="app-header" className="relative text-center max-w-4xl mx-auto pt-8 pb-6 px-4">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-wider mb-3 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        Multimodal Narrative Studio
      </div>
      
      <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-950 mt-1">
        Multilingual <span className="text-indigo-600 bg-clip-text">Audio Story</span> Narrator
      </h1>
      
      <p className="mt-3 text-slate-600 max-w-2xl mx-auto text-base sm:text-lg">
        Input a creative prompt to generate custom short stories in multiple languages. 
        Listen to high-fidelity AI-powered voice personas narrate your tale in real-time.
      </p>

      <div className="absolute top-2 right-4 flex items-center gap-1.5 opacity-80">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Preview Active</span>
      </div>
    </header>
  );
}
