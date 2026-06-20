import os
from instagrapi import Client
from dotenv import load_dotenv

load_dotenv()

_client = None
_connected_username = None


def login(username: str, password: str) -> str:
    global _client, _connected_username
    cl = Client()
    cl.login(username, password)
    _client = cl
    _connected_username = username
    return username


def get_status() -> dict:
    if _client is not None and _connected_username:
        return {"connected": True, "username": _connected_username}
    # fall back to env check (not logged in yet)
    env_user = os.getenv("INSTAGRAM_USERNAME")
    if env_user:
        return {"connected": False, "username": env_user, "note": "env credentials set but not logged in"}
    return {"connected": False}


def _get_client() -> Client:
    global _client, _connected_username
    if _client is None:
        username = os.getenv("INSTAGRAM_USERNAME")
        password = os.getenv("INSTAGRAM_PASSWORD")
        if not username or not password:
            raise RuntimeError("Instagram not connected. Please login via the UI or set env vars.")
        cl = Client()
        cl.login(username, password)
        _client = cl
        _connected_username = username
    return _client


def post_reel_and_story(video_path: str, caption: str, hashtags: list) -> dict:
    cl = _get_client()
    full_caption = f"{caption}\n\n{' '.join(hashtags)}"

    # Post as Reel
    media = cl.clip_upload(
        path=video_path,
        caption=full_caption,
    )

    # Share same video to Story
    cl.video_upload_to_story(path=video_path)

    return {
        "media_id": str(media.pk),
        "media_code": media.code,
        "url": f"https://www.instagram.com/reel/{media.code}/",
    }
