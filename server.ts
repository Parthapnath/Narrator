import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Ensure JSON parsing middleware is active
app.use(express.json());

// Initialize Google GenAI on the server side
// The GEMINI_API_KEY is retrieved securely from environment secrets.
const apiKey = process.env.GEMINI_API_KEY;

// Lazy initialization function to fail gracefully if the key is missing on direct use.
function getAIClient() {
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY has not been configured in your Settings > Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

/**
 * 1. Story Generation API Endpoint
 * Generates a creative short story based on user prompts.
 * Leverages gemini-3.5-flash and enforces JSON output via responseSchema.
 */
app.post("/api/generate-story", async (req, res) => {
  try {
    const { prompt, language, tone, voicePersona } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Story prompt is required." });
    }

    const ai = getAIClient();

    const targetLanguage = language || "English";
    const storyTone = tone || "cheerful";
    const selectedVoice = voicePersona || "Kore";

    const systemInstruction = `You are a highly talented multilingual children's author and narrative designer. 
Your task is to write a short, captivating story (approx. 120-180 words) based on the user's prompt.
The story must be written in the specified language: ${targetLanguage}.
Include a creative title.
Adopt a tone that is: ${storyTone} (which matches the selected narrator voice persona: ${selectedVoice}).
If the requested language is NOT English, you MUST also provide a parallel English translation so the user can follow along. If the requested language IS English, return the English translation as empty or same.
Provide your response strictly in JSON format matching the schema requested.`;

    const contents = `Prompt: "${prompt}"
Language: ${targetLanguage}
Tone: ${storyTone}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.82,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "The title of the generated short story.",
            },
            storyText: {
              type: Type.STRING,
              description: "The creative story in the requested target language.",
            },
            englishTranslation: {
              type: Type.STRING,
              description: "An accurate and elegant parallel English translation. Leave empty if the target language is English.",
            },
          },
          required: ["title", "storyText"],
        },
      },
    });

    if (!response.text) {
      throw new Error("No story text returned from the AI model.");
    }

    const storyData = JSON.parse(response.text.trim());
    return res.json(storyData);
  } catch (error: any) {
    console.error("Story Generation Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate story. Please verify your Gemini API Key.",
    });
  }
});

/**
 * Helper to split text into neat word-based chunks under maxLength.
 */
function splitTextIntoChunks(text: string, maxLength: number = 180): string[] {
  const words = text.split(/\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const word of words) {
    if ((currentChunk + " " + word).trim().length <= maxLength) {
      currentChunk = (currentChunk + " " + word).trim();
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = word;
    }
  }
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  return chunks;
}

/**
 * 2. Text-to-Speech (TTS) API Endpoint
 * Conjugates text into spoken audio. Supports:
 * - 'gemini': Premium AI tts using gemini-3.1-flash-tts-preview & Voice Personas (Kore, Puck, Fenrir, Zephyr, Charon)
 * - 'gtts': Standard free TTS engine proxying Google Translate TTS for fast, natural flow and full coverage.
 */
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice, engine, languageCode } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text to synthesize is required." });
    }

    if (engine === "gtts") {
      // Direct high-speed narration using a gTTS-compatible proxy (for wider language compatibility & fast speed)
      // Standard translate TTS URL has short-length limitations (200 chars). We chunk cleanly using text boundary safety.
      const lang = languageCode || "en";
      const chunks = splitTextIntoChunks(text, 170);
      const audioChunks: Buffer[] = [];

      for (let chunk of chunks) {
        chunk = chunk.trim();
        if (!chunk) continue;

        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
        const ttsResponse = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          },
        });

        if (ttsResponse.ok) {
          const buffer = await ttsResponse.arrayBuffer();
          audioChunks.push(Buffer.from(buffer));
        } else {
          console.error(`gTTS Fetch Failed for Chunk: "${chunk}" Status: ${ttsResponse.status}`);
        }
      }

      if (audioChunks.length === 0) {
        throw new Error("Failed to produce standard TTS stream chunks.");
      }

      const unifiedBuffer = Buffer.concat(audioChunks);
      const base64Audio = unifiedBuffer.toString("base64");
      return res.json({ audio: base64Audio, mimeType: "audio/mpeg" });
    } else {
      // Default Premium AI TTS: Use 'gemini-3.1-flash-tts-preview'
      const ai = getAIClient();
      const voiceName = voice || "Kore"; // Kore, Puck, Fenrir, Zephyr, Charon

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Say with expression and matching feeling: ${text}` }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
          },
        },
      });

      // Find inline audio part robustly from response candidates
      let base64Audio = "";
      let mimeType = "audio/wav";
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          base64Audio = part.inlineData.data;
          if (part.inlineData.mimeType) {
            mimeType = part.inlineData.mimeType;
          }
          break;
        }
      }

      if (!base64Audio) {
        throw new Error("The Gemini TTS generator returned empty audio output parts.");
      }

      return res.json({
        audio: base64Audio,
        mimeType: mimeType,
      });
    }
  } catch (error: any) {
    console.error("TTS Synthesis Error:", error);
    return res.status(500).json({
      error: error.message || "An error occurred during voice synthesis. Make sure your Gemini API key is valid.",
    });
  }
});

// Setup dev server or serve production build
async function initializeServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated successfully.");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving static production assets from dist/ folder.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express custom server successfully active on http://0.0.0.0:${PORT}`);
  });
}

initializeServer().catch((err) => {
  console.error("Failed to start server:", err);
});
