from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.jobstores.memory import MemoryJobStore
from datetime import datetime
import uuid

scheduler = BackgroundScheduler(
    jobstores={"default": MemoryJobStore()},
    timezone="UTC",
)
scheduler.start()

# In-memory job status store
job_registry: dict[str, dict] = {}


def schedule_post(video_path: str, caption: str, hashtags: list, post_time: datetime) -> str:
    from agent.instagram_poster import post_reel_and_story

    job_id = str(uuid.uuid4())[:8]
    job_registry[job_id] = {"status": "scheduled", "post_time": post_time.isoformat(), "result": None}

    def _run():
        try:
            result = post_reel_and_story(video_path, caption, hashtags)
            job_registry[job_id]["status"] = "posted"
            job_registry[job_id]["result"] = result
        except Exception as e:
            job_registry[job_id]["status"] = "failed"
            job_registry[job_id]["error"] = str(e)

    scheduler.add_job(_run, "date", run_date=post_time, id=job_id)
    return job_id


def get_job_status(job_id: str) -> dict:
    return job_registry.get(job_id, {"status": "not_found"})


def list_jobs() -> list:
    return [{"job_id": k, **v} for k, v in job_registry.items()]
