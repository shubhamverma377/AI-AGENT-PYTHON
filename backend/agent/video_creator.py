import os
from moviepy.editor import (
    ImageClip, AudioFileClip, concatenate_videoclips,
    TextClip, CompositeVideoClip, ColorClip
)
from moviepy.video.fx.all import resize

OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")

# Instagram Reels: 9:16 ratio
REEL_W = 1080
REEL_H = 1920


def create_video(image_paths: list, voice_path: str, dialogue: list, job_id: str) -> str:
    audio = AudioFileClip(voice_path)
    total_duration = audio.duration
    per_scene = total_duration / max(len(image_paths), 1)

    clips = []
    for i, img_path in enumerate(image_paths):
        # Create background
        bg = ColorClip(size=(REEL_W, REEL_H), color=(15, 15, 25), duration=per_scene)

        # Character image centered
        char = (
            ImageClip(img_path)
            .set_duration(per_scene)
        )
        char = resize(char, width=REEL_W - 80)
        char = char.set_position(("center", 200))

        # Subtitle text
        scene_text = dialogue[i] if i < len(dialogue) else ""
        layers = [bg, char]

        if scene_text:
            txt = (
                TextClip(
                    scene_text,
                    fontsize=52,
                    color="white",
                    font="DejaVu-Sans-Bold",
                    method="caption",
                    size=(REEL_W - 80, None),
                    stroke_color="black",
                    stroke_width=2,
                )
                .set_duration(per_scene)
                .set_position(("center", REEL_H - 350))
            )
            layers.append(txt)

        composite = CompositeVideoClip(layers, size=(REEL_W, REEL_H))
        clips.append(composite)

    final = concatenate_videoclips(clips, method="compose")
    final = final.set_audio(audio)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    out_path = os.path.join(OUTPUT_DIR, f"{job_id}_reel.mp4")
    final.write_videofile(
        out_path,
        fps=24,
        codec="libx264",
        audio_codec="aac",
        temp_audiofile=os.path.join(OUTPUT_DIR, f"{job_id}_temp_audio.m4a"),
        remove_temp=True,
        logger=None,
    )
    return out_path
