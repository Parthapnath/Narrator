# 🎙️ Narrator — Multilingual AI Audio Story Generator

> An end-to-end AI pipeline that transforms a text prompt into a narrated audio story — powered by Google Gemini and multilingual Text-to-Speech synthesis.

[![TypeScript](https://img.shields.io/badge/TypeScript-88%25-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-Flask-3776AB?style=flat&logo=python)](https://flask.palletsprojects.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini%20API-4285F4?style=flat&logo=google)](https://ai.google.dev/)
[![Vite](https://img.shields.io/badge/Vite-Frontend-646CFF?style=flat&logo=vite)](https://vitejs.dev/)

---

## 📌 Overview

**Narrator** is a full-stack web application that lets users generate and listen to AI-narrated stories in multiple languages. A user enters a story prompt, selects a language and voice persona — the app calls the **Gemini API** to generate a formatted story, then pipes it through a **TTS engine** that returns an audio narration directly in the browser.

This project was built to explore real-world generative AI pipelines combining **LLM-based content generation** with **multilingual audio synthesis** — core capabilities powering modern AI audio entertainment platforms.

---

## ✨ Features

- 🤖 **AI Story Generation** — Gemini API generates contextually rich, structured stories from free-text prompts
- 🔊 **Text-to-Speech Narration** — Synthesizes stories into audio with selectable voice personas
- 🌐 **Multilingual Support** — Supports English and Hindi (extensible to other Indian regional languages)
- 🎭 **Voice Persona Selection** — Choose narration style (e.g. storyteller, dramatic, calm)
- ⚡ **Real-time Pipeline** — Async LLM → TTS orchestration with in-browser audio playback
- 📱 **Responsive UI** — Clean TypeScript + Vite frontend, deployable on Vercel

---

## 🏗️ Architecture

```
User Prompt
     │
     ▼
┌─────────────┐      Gemini API Call      ┌──────────────────┐
│  React/TS   │ ──────────────────────── ▶│  Google Gemini   │
│  Frontend   │ ◀──── Formatted Story ─── │  (Story Gen)     │
└─────────────┘                           └──────────────────┘
     │
     │  POST /api/narrate
     ▼
┌─────────────┐      TTS Engine Call      ┌──────────────────┐
│   Flask     │ ──────────────────────── ▶│   TTS Service    │
│   Backend   │ ◀──── Audio Stream ─────  │  (Narration)     │
│  (app.py)   │                           └──────────────────┘
└─────────────┘
     │
     ▼
  Audio playback in browser
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | TypeScript, Vite, HTML/CSS |
| Backend | Python, Flask |
| AI / LLM | Google Gemini API |
| TTS | Text-to-Speech synthesis engine |
| Server | Node.js (server.ts) |
| Config | `.env` based API key management |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python 3.9+
- A [Google Gemini API Key](https://ai.google.dev/)

### 1. Clone the Repository

```bash
git clone https://github.com/Parthapnath/Narrator.git
cd Narrator
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Open `.env` and add your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Install Frontend Dependencies

```bash
npm install
```

### 4. Install Backend Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 🎮 How to Use

1. **Enter a prompt** — e.g., *"A brave girl discovers a hidden forest kingdom in Rajasthan"*
2. **Select language** — English or Hindi
3. **Choose a voice persona** — Storyteller, Dramatic, Calm Narrator
4. **Click Generate** — Gemini creates the story; TTS narrates it
5. **Listen** — Audio plays directly in the browser

---

## 📁 Project Structure

```
Narrator/
├── src/                  # TypeScript frontend source
├── assets/.aistudio/     # AI Studio configuration
├── app.py                # Flask backend — TTS + API orchestration
├── server.ts             # Node.js server
├── index.html            # App entry point
├── vite.config.ts        # Vite build config
├── tsconfig.json         # TypeScript config
├── requirements.txt      # Python dependencies
├── package.json          # Node dependencies
└── .env.example          # Environment variable template
```

---

## 🔮 Future Improvements

- [ ] Add support for more Indian regional languages (Tamil, Telugu, Malayalam, Kannada)
- [ ] Implement story genre selection (horror, romance, adventure, mythology)
- [ ] Add user history — save and replay generated stories
- [ ] Fine-tune prompts for language-specific narrative styles
- [ ] Integrate speaker diarization for multi-character stories

---

## 👤 Author

**Partha Pratim Nath**
B.Tech, Electronics and Communication Engineering
National Institute of Technology, Silchar

[![GitHub](https://img.shields.io/badge/GitHub-Parthapnath-181717?style=flat&logo=github)](https://github.com/Parthapnath)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
