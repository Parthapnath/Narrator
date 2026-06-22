import os
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import io

# Load environment variables from .env
load_dotenv()

app = Flask(__name__)
# Enable CORS so our React frontend can easily connect to this backend locally
CORS(app)

# Ensure the Gemini API key is configured
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

def get_gemini_client():
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured in your environment variables.")
    # Import google-genai inside the function to keep requirements modular
    from google import genai
    from google.genai import types
    return genai.Client(api_key=GEMINI_API_KEY)


@app.route('/api/generate-story', methods=['POST'])
def generate_story():
    """
    Generates a creative short story using Gemini with a structured JSON response.
    """
    try:
        data = request.get_json() or {}
        prompt = data.get("prompt")
        language = data.get("language", "English")
        tone = data.get("tone", "cheerful")
        voice_persona = data.get("voicePersona", "Kore")

        if not prompt:
            return jsonify({"error": "Story prompt is required."}), 400

        client = get_gemini_client()
        from google.genai import types

        system_instruction = (
            f"You are a highly talented multilingual author. "
            f"Write a short, engaging story (approx 120-180 words) based on the prompt. "
            f"The story must be written in the specified language: {language}. "
            f"Choose a creative title. Adjust the narrative tone to be: {tone} (matching voice persona {voice_persona}). "
            f"If the requested language is NOT English, you MUST also provide a parallel English translation so the reader can follow along."
        )

        # Prompt with structure hints
        story_prompt = f"Prompt: {prompt}\nLanguage: {language}\nTone: {tone}"

        response = client.models.generate_content(
            model='gemini-3.5-flash',
            contents=story_prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.8,
                response_mime_type="application/json",
                response_schema=types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "title": types.Schema(type=types.Type.STRING),
                        "storyText": types.Schema(type=types.Type.STRING),
                        "englishTranslation": types.Schema(type=types.Type.STRING)
                    },
                    required=["title", "storyText"]
                )
            )
        )

        # Parse JSON string text returned from Gemini
        import json
        story_json = json.loads(response.text.strip())
        return jsonify(story_json)

    except Exception as e:
        print("Story Generation Error:", str(e))
        return jsonify({"error": str(e) or "Failed to generate story."}), 500


@app.route('/api/tts', methods=['POST'])
def tts():
    """
    Synthesizes speech using the requested motor engine.
    Supports premium Gemini TTS (via gemini-3.1-flash-tts-preview)
    or standard translation-based TTS (gTTS proxy for fallback).
    """
    try:
        data = request.get_json() or {}
        text = data.get("text")
        engine = data.get("engine", "gemini")
        voice = data.get("voice", "Kore")
        language_code = data.get("languageCode", "en")

        if not text:
            return jsonify({"error": "Text is required for TTS."}), 400

        if engine == "gtts":
            # Direct free translation-based gTTS fallback
            import urllib.request
            import urllib.parse
            
            # gTTS has a character limit, so we stream/aggregate sentences
            # Here is a robust Python gTTS proxy or custom URL request:
            encoded_text = urllib.parse.quote(text[:200]) # simple preview length clip
            gtts_url = f"https://translate.google.com/translate_tts?ie=UTF-8&tl={language_code}&client=tw-ob&q={encoded_text}"
            
            req_headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            url_request = urllib.request.Request(gtts_url, headers=req_headers)
            
            with urllib.request.urlopen(url_request) as url_response:
                audio_bytes = url_response.read()
                
            import base64
            base64_audio = base64.b64encode(audio_bytes).decode('utf-8')
            return jsonify({
                "audio": base64_audio,
                "mimeType": "audio/mpeg"
            })
        else:
            # Premium AI Voice synthesis via gemini-3.1-flash-tts-preview
            client = get_gemini_client()
            from google.genai import types

            response = client.models.generate_content(
                model="gemini-3.1-flash-tts-preview",
                contents=f"Say with matches of feeling: {text}",
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(
                                voice_name=voice
                            )
                        )
                    )
                )
            )

            # Retrieve base64 from inline data response
            parts = response.candidates[0].content.parts
            audio_data = None
            for part in parts:
                if part.inline_data:
                    audio_data = part.inline_data.data
                    break

            if not audio_data:
                return jsonify({"error": "No premium audio candidate returned."}), 500

            return jsonify({
                "audio": audio_data,
                "mimeType": "audio/wav"
            })

    except Exception as e:
        print("TTS Synthesis Error:", str(e))
        return jsonify({"error": str(e) or "Failed to synthesize speech."}), 500


if __name__ == '__main__':
    # Start flask application locally on port 5000
    print("Starting Multilingual Audio Narrator local Python Flask server...")
    app.run(host='0.0.0.0', port=5000, debug=True)
