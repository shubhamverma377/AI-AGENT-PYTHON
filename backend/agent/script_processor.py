import json
from groq import Groq
from dotenv import load_dotenv
import os

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

SYSTEM_PROMPT = """You are a creative AI that processes scripts for short social media videos.
Given a script, extract and return a JSON object with these fields:
- character_name: name of the main character
- character_description: detailed visual description for image generation (cartoon style, colors, features)
- art_style: animation style (e.g. "2D cartoon pixar style", "anime style", "chibi style")
- scenes: array of scene descriptions (max 4 scenes)
- dialogue: array of lines spoken in the video
- voiceover: full narration text joined as one string
- mood: overall mood (fun, serious, educational, dramatic)
- hashtags: array of 10 relevant instagram hashtags
- caption: instagram caption for the post (max 200 chars)
Return ONLY valid JSON, no extra text."""


def process_script(script: str) -> dict:
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Process this script:\n\n{script}"}
        ],
        temperature=0.7,
        max_tokens=1024,
    )
    raw = response.choices[0].message.content.strip()
    # strip markdown code blocks if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())
