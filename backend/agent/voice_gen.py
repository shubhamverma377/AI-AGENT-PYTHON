import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Groq PlayAI voices mapped to mood
VOICE_MAP = {
    "fun": "Celeste-PlayAI",
    "educational": "Cheyenne-PlayAI",
    "serious": "Atlas-PlayAI",
    "dramatic": "Orion-PlayAI",
    "default": "Celeste-PlayAI",
}


def generate_voice(voiceover_text: str, mood: str, job_id: str) -> str:
    voice = VOICE_MAP.get(mood.lower(), VOICE_MAP["default"])
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"{job_id}_voice.mp3")

    response = client.audio.speech.create(
        model="playai-tts",
        voice=voice,
        input=voiceover_text,
        response_format="mp3",
    )

    response.stream_to_file(output_path)

    if not os.path.exists(output_path) or os.path.getsize(output_path) < 1000:
        raise RuntimeError(
            f"Voice generation failed — file too small: "
            f"{os.path.getsize(output_path) if os.path.exists(output_path) else 0} bytes"
        )

    return output_path
