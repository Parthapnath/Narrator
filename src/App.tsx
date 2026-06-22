import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Mic, Volume2, Info, AlertCircle, FileAudio, RotateCcw, Play, Pause, Square } from "lucide-react";
import { StoryResponse, LANGUAGES, VOICE_PERSONAS, TONE_OPTIONS } from "./types";
import ConfigPanel from "./components/ConfigPanel";
import StoryViewer from "./components/StoryViewer";

export default function App() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PERSONAS[0]);
  const [selectedTone, setSelectedTone] = useState(TONE_OPTIONS[0]);
  const [engine, setEngine] = useState<"gemini" | "gtts">("gemini");
  
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState<StoryResponse | null>(null);
  
  // Loading & error flags
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Audio playback controls
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.85);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize audio element settings
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Clean-up object URLs on unmount
  useEffect(() => {
    return () => {
      if (audioSrc && audioSrc.startsWith("blob:")) {
        URL.revokeObjectURL(audioSrc);
      }
    };
  }, [audioSrc]);

  /**
   * Orchestrates prompt story delivery & TTS stream synthesis
   */
  const handleGenerateStoryAndNarrate = async (config: {
    prompt: string;
    language: string;
    tone: string;
    voicePersona: string;
    engine: "gemini" | "gtts";
    languageCode: string;
  }) => {
    setIsLoading(true);
    setErrorMsg(null);
    setIsPlaying(false);
    
    // Sync current session choices to state so the display text & vocal descriptions match exactly
    const matchLang = LANGUAGES.find(l => l.name === config.language) || LANGUAGES[0];
    const matchVoice = VOICE_PERSONAS.find(v => v.id === config.voicePersona) || VOICE_PERSONAS[0];
    const matchTone = TONE_OPTIONS.find(t => t.id === config.tone) || TONE_OPTIONS[0];

    setSelectedLang(matchLang);
    setSelectedVoice(matchVoice);
    setSelectedTone(matchTone);
    setEngine(config.engine);

    // Revoke previous audio blob if any
    if (audioSrc && audioSrc.startsWith("blob:")) {
      URL.revokeObjectURL(audioSrc);
    }
    setAudioSrc(null);
    setStory(null);

    try {
      // Step 1: Request Story Generation from Gemini Backend
      const storyRes = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: config.prompt,
          language: config.language,
          tone: config.tone,
          voicePersona: config.voicePersona,
        }),
      });

      if (!storyRes.ok) {
        const errData = await storyRes.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate story text.");
      }

      const storyData: StoryResponse = await storyRes.json();
      setStory(storyData);

      // Step 2: Request Voice Narration for the generated text
      const ttsRes = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: storyData.storyText,
          voice: config.voicePersona,
          engine: config.engine,
          languageCode: config.languageCode,
        }),
      });

      if (!ttsRes.ok) {
        const errData = await ttsRes.json().catch(() => ({}));
        throw new Error(
          errData.error || "Story written successfully, but TTS speech synthesis failed. Please try switching the TTS engine."
        );
      }

      const ttsData = await ttsRes.json();
      if (!ttsData.audio) {
        throw new Error("TTS engine did not return an audio payload.");
      }

      // Convert Base64 payload to binary blob url
      const binaryString = window.atob(ttsData.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const audioBlob = new Blob([bytes], { type: ttsData.mimeType || "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      setAudioSrc(audioUrl);
      
      // Auto-play the newly loaded narration track
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .catch((e) => console.log("Auto-play blocked by client settings (e.g. user interaction required): ", e));
        }
      }, 80);

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "An unexpected error occurred during synthesis.");
    } finally {
      setIsLoading(false);
    }
  };

  // Play/Pause toggler
  const togglePlay = () => {
    if (!audioRef.current || !audioSrc) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(err => console.error("Play failed:", err));
    } else {
      audioRef.current.pause();
    }
  };

  // Skip progress helper
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = parseFloat(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  // Format time (s) to mm:ss
  const formatTime = (timeInseconds: number) => {
    if (isNaN(timeInseconds)) return "00:00";
    const minutes = Math.floor(timeInseconds / 60);
    const seconds = Math.floor(timeInseconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] flex justify-center items-center p-0 select-none overflow-hidden">
      <div className="w-full max-w-7xl h-screen md:h-[860px] flex flex-col md:flex-row bg-[#F1F5F9] md:rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* LEFT SIDEBAR - CONTROL PANEL (Sleek Dark Indigo/Slate Theme style) */}
        <div id="side-controls" className="w-full md:w-5/12 lg:w-4/12 bg-[#0F172A] p-6 lg:p-8 flex flex-col justify-between text-slate-100 overflow-y-auto border-r border-slate-850">
          <div className="space-y-6">
            {/* Header Branding */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Mic className="h-5.5 w-5.5 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight uppercase text-white flex items-center gap-1">
                  Narrator <span className="text-indigo-400 font-extrabold text-xs bg-indigo-900/60 px-1.5 py-0.5 rounded-md">AI</span>
                </h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Premium Story Studio</p>
              </div>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div id="error-box" className="p-4 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-200 text-xs flex items-start gap-2.5 shadow-sm animate-bounce">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Synthesis Warning</span>
                  <p>{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Interactive Inputs */}
            <ConfigPanel 
              onSubmit={handleGenerateStoryAndNarrate} 
              isLoading={isLoading} 
            />
          </div>

          {/* System Status and dynamic telemetry */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-800/50">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Model Server Status</span>
                <span className="text-emerald-400 flex items-center font-bold font-mono">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-ping"></span> Live & Online
                </span>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-indigo-500 rounded-full transition-all duration-1000 ${
                    isLoading ? "w-4/5 animate-pulse" : "w-full"
                  }`} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT AREA - STORY CANVAS & HEADER */}
        <div id="main-canvas" className="flex-1 flex flex-col bg-[#F8FAFC] overflow-y-auto relative pb-32">
          
          {/* Header Ribbon tracking app session and scope */}
          <header className="h-16 border-b border-slate-200 bg-white/70 backdrop-blur-md flex items-center justify-between px-6 sm:px-8 shrink-0 select-none">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black rounded-sm uppercase tracking-wider">
                V3.5 MULTILINGUAL
              </span>
              <span className="text-slate-400 text-xs hidden sm:inline">|</span>
              <span className="text-slate-500 text-xs font-mono font-bold tracking-tight">
                Session: /Dashboard /Multimodal-Story #{(story ? story.title.length + 420 : 412)}
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Gemini API Secure
              </div>
            </div>
          </header>

          {/* Main Content Workspace Container */}
          <main className="flex-1 p-5 sm:p-8 md:p-10 flex flex-col">
            <div className="flex-1 bg-white rounded-3xl shadow-xs border border-slate-200 p-6 sm:p-8 lg:p-10 relative flex flex-col justify-between min-h-[420px]">
              
              {/* Dynamic Viewer Integration */}
              <div className="flex-1 mb-8 overflow-y-auto">
                <StoryViewer 
                  story={story} 
                  targetLanguage={selectedLang.name} 
                />
              </div>

              {/* HTML5 Native Hidden Audio Tag for Narrator Audio Controls - keeps ref stable */}
              <audio
                ref={audioRef}
                src={audioSrc || ""}
                onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
                onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              {/* Dynamic Audio Controller Overlay Console */}
              {audioSrc && (
                <div id="audio-console" className="bg-slate-900 text-slate-100 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center gap-4 transition-all border border-slate-800 animate-slideUp">
                  
                  {/* Action Play/Pause Knob */}
                  <button
                    onClick={togglePlay}
                    className="p-3 bg-white text-slate-900 hover:bg-slate-150 active:scale-95 rounded-full transition-all cursor-pointer shadow-lg shrink-0"
                    title={isPlaying ? "Pause Narration" : "Resume Narration"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 ml-0.5" />}
                  </button>

                  {/* Scrubber and Timer Info */}
                  <div className="flex-1 w-full space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      <span>Speaking: <span className="text-indigo-400 font-bold">{selectedVoice.name}</span> AI voice profile</span>
                      <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
                    </div>
                    
                    {/* Linear timeline scrubber */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max={duration || 100}
                        value={currentTime}
                        onChange={handleSeek}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Volume Slider Knob */}
                  <div className="flex items-center gap-2.5 shrink-0 pl-2">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-16 sm:w-20 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Aesthetic Application Footer */}
            <footer className="mt-6 flex flex-col sm:flex-row justify-between items-center text-slate-400 text-xs px-2 gap-2.5">
              <p>© Multilingual Narrator AI Studio & Powered by Gemini-3.5-Flash</p>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (story) {
                      const text = `Story Text:\n${story.storyText}\n\nTranslation:\n${story.englishTranslation || "N/A"}`;
                      const blob = new Blob([text], { type: "text/plain" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${story.title.toLowerCase().replace(/\s+/g, "-")}-script.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }
                  }}
                  className={`hover:text-indigo-500 font-medium transition-colors ${!story ? "pointer-events-none opacity-40" : ""}`}
                >
                  Export Script
                </a>
                <span className="opacity-30">|</span>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (audioSrc) {
                      const a = document.createElement("a");
                      a.href = audioSrc;
                      a.download = `${story?.title.toLowerCase().replace(/\s+/g, "-") || "narration"}.mp3`;
                      a.click();
                    }
                  }}
                  className={`hover:text-indigo-500 font-medium transition-colors ${!audioSrc ? "pointer-events-none opacity-40" : ""}`}
                >
                  Download Audio (MP3/WAV)
                </a>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </main>
  );
}
