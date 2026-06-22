import React, { useState } from "react";
import { Copy, Check, FileText, Globe, ZoomIn, ZoomOut } from "lucide-react";
import { StoryResponse } from "../types";

interface StoryViewerProps {
  story: StoryResponse | null;
  targetLanguage: string;
}

export default function StoryViewer({ story, targetLanguage }: StoryViewerProps) {
  const [copied, setCopied] = useState(false);
  const [textSize, setTextSize] = useState<"sm" | "base" | "lg" | "xl">("lg");
  const [activeTab, setActiveTab] = useState<"dual" | "target" | "english">("dual");

  if (!story) {
    return (
      <div id="story-viewer-empty" className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-400">
        <FileText className="w-12 h-12 stroke-1 mx-auto mb-3 text-slate-300" />
        <p className="text-sm">Your generated story will appear here.</p>
        <p className="text-xs text-slate-400 mt-1">Configure your plot above to begin the narration journey.</p>
      </div>
    );
  }

  const handleCopy = () => {
    const textToCopy = `Title: ${story.title}\n\n${story.storyText}${
      story.englishTranslation ? `\n\nEnglish Translation:\n${story.englishTranslation}` : ""
    }`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const textSizeClasses = {
    sm: "text-sm leading-relaxed",
    base: "text-base leading-relaxed",
    lg: "text-lg sm:text-xl leading-relaxed sm:leading-loose",
    xl: "text-xl sm:text-2xl leading-loose",
  };

  const isEnglishOnly = targetLanguage === "English";

  return (
    <div id="story-viewer" className="bg-[#fcfbf9] border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
      {/* Viewer Header Ribbon */}
      <div className="bg-stone-50 border-b border-stone-200 px-4 py-3 flex flex-wrap gap-2 justify-between items-center">
        {/* Languages tabs */}
        <div className="flex bg-stone-200/60 p-1 rounded-lg">
          {!isEnglishOnly && (
            <button
              onClick={() => setActiveTab("dual")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === "dual" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              Dual Columns
            </button>
          )}
          <button
            onClick={() => setActiveTab("target")}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
              activeTab === "target" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
            }`}
          >
            {targetLanguage}
          </button>
          {!isEnglishOnly && (
            <button
              onClick={() => setActiveTab("english")}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeTab === "english" ? "bg-white text-stone-900 shadow-xs" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              English
            </button>
          )}
        </div>

        {/* Accessibility Buttons (Zoom + Copy) */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex border border-stone-200 bg-white rounded-lg p-0.5">
            <button
              onClick={() => {
                if (textSize === "xl") setTextSize("lg");
                else if (textSize === "lg") setTextSize("base");
                else if (textSize === "base") setTextSize("sm");
              }}
              disabled={textSize === "sm"}
              className="p-1 px-1.5 hover:bg-stone-100 rounded-md text-stone-600 disabled:opacity-40"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold self-center px-1">
              Size
            </span>
            <button
              onClick={() => {
                if (textSize === "sm") setTextSize("base");
                else if (textSize === "base") setTextSize("lg");
                else if (textSize === "lg") setTextSize("xl");
              }}
              disabled={textSize === "xl"}
              className="p-1 px-1.5 hover:bg-stone-100 rounded-md text-stone-600 disabled:opacity-40"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-white border border-stone-200 hover:bg-stone-100 hover:text-stone-950 text-stone-700 px-3 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy Text
              </>
            )}
          </button>
        </div>
      </div>

      {/* Story Paper Canvas */}
      <div className="p-6 md:p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 leading-tight">
            {story.title}
          </h2>
          <div className="w-16 h-1 bg-indigo-500 mx-auto mt-4 rounded-full opacity-60" />
        </div>

        {/* Dual language comparison */}
        {activeTab === "dual" && !isEnglishOnly && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 division-line">
            {/* Target Language Column */}
            <div className="space-y-4">
              <div className="flex items-center gap-1.5 text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-md px-2.5 py-1 text-xs font-bold w-max mb-2">
                <Globe className="w-3.5 h-3.5" />
                {targetLanguage} Version
              </div>
              <p className={`${textSizeClasses[textSize]} text-stone-900 font-serif whitespace-pre-line antialiased px-1`}>
                {story.storyText}
              </p>
            </div>

            {/* Parallel English Translation Column */}
            <div className="space-y-4 pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-stone-200 md:pl-8">
              <div className="flex items-center gap-1.5 text-stone-600 bg-stone-100 border border-stone-200 rounded-md px-2.5 py-1 text-xs font-bold w-max mb-2">
                <FileText className="w-3.5 h-3.5" />
                English Parallel
              </div>
              <p className={`${textSizeClasses[textSize]} text-stone-700 font-serif whitespace-pre-line antialiased px-1 italic`}>
                {story.englishTranslation || "Translation synchronized."}
              </p>
            </div>
          </div>
        )}

        {/* Single Target Language Display */}
        {((activeTab === "target") || isEnglishOnly) && (
          <div className="max-w-2xl mx-auto pt-4">
            <p className={`${textSizeClasses[textSize]} text-stone-900 font-serif whitespace-pre-line antialiased`}>
              {story.storyText}
            </p>
          </div>
        )}

        {/* Single English Translation Display */}
        {activeTab === "english" && !isEnglishOnly && (
          <div className="max-w-2xl mx-auto pt-4">
            <p className={`${textSizeClasses[textSize]} text-stone-700 font-serif whitespace-pre-line antialiased italic`}>
              {story.englishTranslation}
            </p>
          </div>
        )}
      </div>

      {/* Story Footer Status */}
      <div className="bg-stone-50 border-t border-stone-150 px-5 py-3.5 flex justify-between items-center text-[11px] text-stone-500 font-mono">
        <div>Multiligual Content Model: Gemini 3.5 Flash</div>
        <div>Story Length: {story.storyText.split(/\s+/).filter(Boolean).length} words</div>
      </div>
    </div>
  );
}
