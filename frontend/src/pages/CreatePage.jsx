import { useState, useEffect, useRef } from "react";
import { Wand2, Send, Clock, Zap } from "lucide-react";
import { generateVideo, getStatus, schedulePost, postNow } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import InstagramConnect from "../components/InstagramConnect";

const EXAMPLE_SCRIPT = `Character: Mango, a cheerful orange cartoon mango with big eyes and tiny arms.

Scene 1: Mango wakes up, stretching his tiny arms with a big smile.
Mango says: "Good morning world! Today I'm going to teach you something amazing!"

Scene 2: Mango points at a blackboard with the text "Stay Hydrated"
Mango says: "Drinking water keeps you fresh, just like me — juicy and full of life!"

Scene 3: Mango dances happily
Mango says: "So drink 8 glasses a day and feel AMAZING! See you tomorrow!"`;

const DONE_STATUSES = ["ready", "failed"];
const POLL_INTERVAL = 3000;

export default function CreatePage() {
  const [script, setScript] = useState("");
  const [job, setJob] = useState(null);
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleResult, setScheduleResult] = useState(null);
  const [posting, setPosting] = useState(false);
  const pollRef = useRef(null);

  const startPolling = (jobId) => {
    pollRef.current = setInterval(async () => {
      const data = await getStatus(jobId);
      setJob(data);
      if (DONE_STATUSES.includes(data.status)) {
        clearInterval(pollRef.current);
      }
    }, POLL_INTERVAL);
  };

  useEffect(() => () => clearInterval(pollRef.current), []);

  const handleGenerate = async () => {
    if (!script.trim()) return;
    const data = await generateVideo(script);
    setJob(data);
    setScheduleResult(null);
    startPolling(data.job_id);
  };

  const handleSchedule = async () => {
    if (!scheduleTime || !job?.job_id) return;
    const result = await schedulePost(job.job_id, new Date(scheduleTime).toISOString());
    setScheduleResult(result);
  };

  const handlePostNow = async () => {
    setPosting(true);
    await postNow(job.job_id);
    setPosting(false);
    alert("Posted to Instagram!");
  };

  const isReady = job?.status === "ready";

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-1">Create Reel</h1>
        <p className="text-white/50 text-sm">Paste your script — AI will generate character, voice & video</p>
      </div>

      {/* Instagram Connect */}
      <InstagramConnect />

      {/* Script Input */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white/80">Your Script</label>
          <button
            onClick={() => setScript(EXAMPLE_SCRIPT)}
            className="text-xs text-brand-500 hover:text-brand-400 underline"
          >
            Load example
          </button>
        </div>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={12}
          placeholder="Describe your character and scenes here..."
          className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-white/90 placeholder-white/30 resize-none focus:outline-none focus:border-brand-500 transition"
        />
        <button
          onClick={handleGenerate}
          disabled={!script.trim() || (job && !DONE_STATUSES.includes(job.status))}
          className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
        >
          <Wand2 size={18} />
          Generate Video
        </button>
      </div>

      {/* Status */}
      {job && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/80">Job #{job.job_id}</span>
            <StatusBadge status={job.status} />
          </div>

          {job.status === "failed" && (
            <p className="text-red-400 text-sm bg-red-500/10 rounded-lg p-3">{job.error}</p>
          )}

          {/* Progress Steps */}
          {!DONE_STATUSES.includes(job.status) && (
            <div className="space-y-2">
              {["processing_script", "generating_images", "generating_voice", "creating_video"].map((s) => (
                <div key={s} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${job.status === s ? "bg-brand-500 animate-pulse" : "bg-white/20"}`} />
                  <span className={`text-xs ${job.status === s ? "text-white" : "text-white/30"}`}>
                    {s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Video Preview */}
          {isReady && job.video_url && (
            <div className="space-y-4">
              <video
                src={job.video_url}
                controls
                className="w-full rounded-xl border border-white/10 max-h-96 object-contain bg-black"
              />
              <div className="bg-black/20 rounded-xl p-3">
                <p className="text-xs text-white/50 mb-1">Caption</p>
                <p className="text-sm text-white/80">{job.caption}</p>
                <p className="text-xs text-brand-400 mt-2">{job.hashtags?.join(" ")}</p>
              </div>

              {/* Post Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handlePostNow}
                  disabled={posting}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition"
                >
                  <Zap size={16} />
                  {posting ? "Posting..." : "Post Now"}
                </button>

                <div className="flex flex-col gap-2">
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="bg-black/30 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={handleSchedule}
                    disabled={!scheduleTime}
                    className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white font-semibold py-2 rounded-xl transition text-sm"
                  >
                    <Clock size={14} />
                    Schedule
                  </button>
                </div>
              </div>

              {scheduleResult && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-400 text-sm">
                  ✅ Scheduled for {new Date(scheduleResult.post_time).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
