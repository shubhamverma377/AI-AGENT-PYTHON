import asyncio
import edge_tts
import os

OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")

# Free Microsoft voices — pick based on mood
VOICE_MAP = {
    "fun": "en-US-AriaNeural",
    "educational": "en-US-GuyNeural",
    "serious": "en-US-DavisNeural",
    "dramatic": "en-GB-RyanNeural",
    "default": "en-US-AriaNeural",
}


async def _generate(text: str, voice: str, output_path: str):
    tts = edge_tts.Communicate(text, voice=voice, rate="+5%")
    await tts.save(output_path)


def generate_voice(voiceover_text: str, mood: str, job_id: str) -> str:
    voice = VOICE_MAP.get(mood.lower(), VOICE_MAP["default"])
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"{job_id}_voice.mp3")
    asyncio.run(_generate(voiceover_text, voice, output_path))
    return output_path
