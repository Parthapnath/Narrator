export interface StoryResponse {
  title: string;
  storyText: string;
  englishTranslation?: string;
}

export interface VoicePersona {
  id: string;
  name: string;
  gender: "Male" | "Female";
  description: string;
  recommendedTone: string;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface ToneOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵" },
];

export const VOICE_PERSONAS: VoicePersona[] = [
  { id: "Kore", name: "Kore", gender: "Female", description: "Smooth, warm, and highly engaging; perfect for gentle fairytales.", recommendedTone: "cheerful" },
  { id: "Puck", name: "Puck", gender: "Male", description: "Lively, whimsical, and theatrical; excellent for creative adventures.", recommendedTone: "playful" },
  { id: "Zephyr", name: "Zephyr", gender: "Female", description: "Soft, tranquil, and comforting; ideal for bedtime stories.", recommendedTone: "mysterious" },
  { id: "Charon", name: "Charon", gender: "Male", description: "Deep, solemn, and resonant; great for epics or historical narratives.", recommendedTone: "dramatic" },
  { id: "Fenrir", name: "Fenrir", gender: "Male", description: "Intense, bold, and energetic; ideal for fast-paced stories.", recommendedTone: "energetic" },
];

export const TONE_OPTIONS: ToneOption[] = [
  { id: "cheerful", name: "Cheerful & Warm", emoji: "☀️", description: "Brings a happy, glowing narrative feel suited for lighthearted stories." },
  { id: "playful", name: "Playful & Whimsical", emoji: "🎈", description: "Adds bouncy energy, curiosity, and childlike wonder." },
  { id: "mysterious", name: "Mysterious & Cozy", emoji: "🌙", description: "Imparts a magical, whispery atmosphere with subtle suspense." },
  { id: "dramatic", name: "Dramatic & Epic", emoji: "🎭", description: "Delivers a heavy, emotional, or historic gravity to the plot." },
  { id: "energetic", name: "Bold & Adventurous", emoji: "⚡", description: "High-octane excitement and courageous spirit." },
];
