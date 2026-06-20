import requests
import os
import time
from urllib.parse import quote

OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")


def generate_character_image(character_description: str, art_style: str, job_id: str, scene_index: int = 0) -> str:
    """
    Uses Pollinations.ai — completely FREE, no API key needed.
    Generates cartoon character image and saves locally.
    """
    prompt = (
        f"{character_description}, {art_style}, white background, "
        f"full body pose, high quality, vibrant colors, professional illustration"
    )
    encoded = quote(prompt)
    # Add seed for variety between scenes
    seed = int(time.time()) + scene_index
    url = f"https://image.pollinations.ai/prompt/{encoded}?width=1080&height=1080&seed={seed}&nologo=true"

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    img_path = os.path.join(OUTPUT_DIR, f"{job_id}_scene_{scene_index}.png")

    for attempt in range(3):
        try:
            resp = requests.get(url, timeout=60)
            if resp.status_code == 200:
                with open(img_path, "wb") as f:
                    f.write(resp.content)
                return img_path
        except Exception:
            time.sleep(2)

    raise Exception(f"Failed to generate character image after 3 attempts")


def generate_all_scene_images(character_description: str, art_style: str, scenes: list, job_id: str) -> list:
    image_paths = []
    for i, scene in enumerate(scenes):
        full_desc = f"{character_description}, {scene}"
        path = generate_character_image(full_desc, art_style, job_id, scene_index=i)
        image_paths.append(path)
        time.sleep(1)  # be nice to free API
    return image_paths
