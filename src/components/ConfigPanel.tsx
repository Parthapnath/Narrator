import React, { useState } from "react";
import { BookOpen, Languages, User, Sparkles, Volume2 } from "lucide-react";
import {
  LANGUAGES,
  VOICE_PERSONAS,
  TONE_OPTIONS,
  LanguageOption,
  VoicePersona,
  ToneOption,
} from "../types";

interface ConfigPanelProps {
  onSubmit: (config: {
    prompt: string;
    language: string;
    tone: string;
    voicePersona: string;
    engine: "gemini" | "gtts";
    languageCode: string;
  }) => void;
  isLoading: boolean;
}

const SAMPLE_PROMPTS = [
  {
    title: "The Neon Firefly",
    text: "A friendly cyberpunk firefly in a futuristic city gets lost in a forest of metallic trees, finding an ancient glowing key.",
    emoji: "💡",
  },
  {
    title: "Chocolatown Heist",
    text: "A tiny detective mouse attempts to solve the mysterious disappearance of the Grand Fudge Fountain inside a magical chocolate town.",
    emoji: "🍫",
  },
  {
    title: "Cloud Sailing",
    text: "An adventurous young sky-sloop pilot sails high into the violet-colored clouds of Jupiter, encountering friendly sky whales.",
    emoji: "☁️",
  },
];

export default function ConfigPanel({ onSubmit, isLoading }: ConfigPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [selectedVoice, setSelectedVoice] = useState<VoicePersona>(VOICE_PERSONAS[0]);
  const [selectedTone, setSelectedTone] = useState<ToneOption>(TONE_OPTIONS[0]);
  const [engine, setEngine] = useState<"gemini" | "gtts">("gemini");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    onSubmit({
      prompt: prompt.trim(),
      language: selectedLang.name,
      tone: selectedTone.id,
      voicePersona: selectedVoice.id,
      engine,
      languageCode: selectedLang.code,
    });
  };

  const selectSample = (sampleText: string) => {
    setPrompt(sampleText);
  };

  return (
    <div id="config-panel" className="bg-white rounded-2xl border border-slate-150 p-5 sm:p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Story Prompt Input Block */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" />
              Story Plot / Prompt
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {prompt.length}/300 chars
            </span>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 300))}
            placeholder="Describe your story idea... E.g., 'A tiny astronaut exploring a moon made of peppermint candy and meeting a sugar-dust friendly dragon.'"
            className="w-full min-h-[100px] max-h-[180px] p-4 text-sm text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
            required
            disabled={isLoading}
          />

          {/* Inspiration Prompts pills */}
          <div className="mt-3">
            <span className="text-xs font-semibold text-slate-500 block mb-2">
              Need inspiration? Pick a seed idea:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((sample) => (
                <button
                  key={sample.title}
                  type="button"
                  onClick={() => selectSample(sample.text)}
                  className="flex items-center gap-1 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-350 px-3 py-1.5 rounded-full transition-all border border-slate-200/50"
                  disabled={isLoading}
                >
                  <span role="img" aria-label="emoji" className="text-sm">
                    {sample.emoji}
                  </span>
                  <span className="font-medium">{sample.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configurations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Language Selection */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Languages className="w-4 h-4 text-indigo-500" />
              Target Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLang.code === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLang(lang)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-500 text-indigo-900"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100/80 text-slate-700"
                    }`}
                    disabled={isLoading}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <div>
                      <div className="text-xs font-bold leading-normal">{lang.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono leading-none">{lang.nativeName}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Persona & Tone Side */}
          <div className="space-y-4">
            {/* Tone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                Narrative Tone / Style
              </label>
              <select
                value={selectedTone.id}
                onChange={(e) => {
                  const toneValue = TONE_OPTIONS.find((t) => t.id === e.target.value);
                  if (toneValue) setSelectedTone(toneValue);
                }}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 text-sm text-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-medium"
                disabled={isLoading}
              >
                {TONE_OPTIONS.map((tone) => (
                  <option key={tone.id} value={tone.id}>
                    {tone.emoji} {tone.name}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 italic pl-1 leading-normal">
                {selectedTone.description}
              </p>
            </div>

            {/* Narrator Engine Pick */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-indigo-500" />
                Vocal Synthesis Engine
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEngine("gemini")}
                  className={`flex-1 p-2 text-xs font-bold rounded-lg border transition-all text-center ${
                    engine === "gemini"
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                  disabled={isLoading}
                >
                  ✨ Premium Voice (AI)
                </button>
                <button
                  type="button"
                  onClick={() => setEngine("gtts")}
                  className={`flex-1 p-2 text-xs font-bold rounded-lg border transition-all text-center ${
                    engine === "gtts"
                      ? "bg-indigo-600 border-indigo-700 text-white shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                  disabled={isLoading}
                >
                  🏎️ High Speed Express
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Premium AI Voice Persona selection */}
        {engine === "gemini" && (
          <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
            <label className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              AI Voice Persona (Single Speaker)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
              {VOICE_PERSONAS.map((p) => {
                const isSelected = selectedVoice.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedVoice(p)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500 text-indigo-900"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
                    }`}
                    disabled={isLoading}
                  >
                    <div className="text-xs font-bold">{p.name}</div>
                    <div className={`text-[9px] px-1.5 py-0.5 rounded-full mt-1.5 font-bold ${
                      p.gender === "Female" ? "bg-pink-100 text-pink-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {p.gender}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-slate-500 leading-normal pl-1">
              <span className="font-bold text-slate-700">Voice profile:</span> {selectedVoice.description}{" "}
              <span className="italic opacity-85">Pairs best with the "{TONE_OPTIONS.find((t) => t.id === selectedVoice.recommendedTone)?.name}" tone.</span>
            </div>
          </div>
        )}

        {/* Fire button */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-md cursor-pointer disabled:opacity-50 disabled:cursor-wait"
          disabled={isLoading || !prompt.trim()}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Co-authoring Story & Syncing Narration...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Story & Narrate
            </>
          )}
        </button>
      </form>
    </div>
  );
}
