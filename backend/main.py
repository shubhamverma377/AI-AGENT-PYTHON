from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import uuid
import os

from agent.script_processor import process_script
from agent.character_gen import generate_all_scene_images
from agent.voice_gen import generate_voice
from agent.video_creator import create_video
from scheduler import schedule_post, get_job_status, list_jobs

app = FastAPI(title="Social AI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OUTPUT_DIR = os.getenv("OUTPUT_DIR", "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)
app.mount("/output", StaticFiles(directory=OUTPUT_DIR), name="output")

# In-memory generation job tracker
generation_jobs: dict[str, dict] = {}


class ScriptRequest(BaseModel):
    script: str


class ScheduleRequest(BaseModel):
    job_id: str
    post_time: str  # ISO format: "2024-12-25T18:00:00"


class PostNowRequest(BaseModel):
    job_id: str


class InstagramCredentials(BaseModel):
    username: str
    password: str


def run_pipeline(job_id: str, script: str):
    try:
        generation_jobs[job_id]["status"] = "processing_script"
        parsed = process_script(script)

        generation_jobs[job_id]["status"] = "generating_images"
        generation_jobs[job_id]["parsed"] = parsed
        images = generate_all_scene_images(
            parsed["character_description"],
            parsed["art_style"],
            parsed["scenes"],
            job_id,
        )

        generation_jobs[job_id]["status"] = "generating_voice"
        voice_path = generate_voice(parsed["voiceover"], parsed["mood"], job_id)

        generation_jobs[job_id]["status"] = "creating_video"
        video_path = create_video(images, voice_path, parsed["dialogue"], job_id)

        generation_jobs[job_id]["status"] = "ready"
        generation_jobs[job_id]["video_path"] = video_path
        generation_jobs[job_id]["video_url"] = f"/output/{os.path.basename(video_path)}"
        generation_jobs[job_id]["caption"] = parsed["caption"]
        generation_jobs[job_id]["hashtags"] = parsed["hashtags"]

    except Exception as e:
        generation_jobs[job_id]["status"] = "failed"
        generation_jobs[job_id]["error"] = str(e)


@app.post("/api/generate")
async def generate(req: ScriptRequest, background_tasks: BackgroundTasks):
    job_id = str(uuid.uuid4())[:8]
    generation_jobs[job_id] = {"status": "queued", "job_id": job_id}
    background_tasks.add_task(run_pipeline, job_id, req.script)
    return {"job_id": job_id, "status": "queued"}


@app.get("/api/status/{job_id}")
async def status(job_id: str):
    job = generation_jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.post("/api/schedule")
async def schedule(req: ScheduleRequest):
    job = generation_jobs.get(req.job_id)
    if not job or job.get("status") != "ready":
        raise HTTPException(status_code=400, detail="Video not ready yet")

    post_time = datetime.fromisoformat(req.post_time)
    sched_id = schedule_post(
        job["video_path"],
        job["caption"],
        job["hashtags"],
        post_time,
    )
    return {"schedule_id": sched_id, "post_time": req.post_time}


@app.post("/api/post-now")
async def post_now(req: PostNowRequest, background_tasks: BackgroundTasks):
    from agent.instagram_poster import post_reel_and_story

    job = generation_jobs.get(req.job_id)
    if not job or job.get("status") != "ready":
        raise HTTPException(status_code=400, detail="Video not ready yet")

    def _post():
        try:
            result = post_reel_and_story(job["video_path"], job["caption"], job["hashtags"])
            generation_jobs[req.job_id]["posted"] = result
        except Exception as e:
            generation_jobs[req.job_id]["post_error"] = str(e)

    background_tasks.add_task(_post)
    return {"message": "Posting started"}


@app.get("/api/scheduled-jobs")
async def scheduled_jobs():
    return list_jobs()


@app.get("/api/schedule-status/{sched_id}")
async def schedule_status(sched_id: str):
    return get_job_status(sched_id)


@app.post("/api/instagram/connect")
async def instagram_connect(creds: InstagramCredentials):
    from agent.instagram_poster import login
    try:
        username = login(creds.username, creds.password)
        return {"success": True, "username": username}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))


@app.get("/api/instagram/status")
async def instagram_status():
    from agent.instagram_poster import get_status
    return get_status()


@app.get("/health")
async def health():
    return {"status": "ok"}


# Serve React frontend — must be LAST
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend_dist")
if os.path.isdir(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
