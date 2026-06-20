import { useEffect, useState } from "react";
import { getScheduledJobs } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import { RefreshCw } from "lucide-react";

export default function ScheduledPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getScheduledJobs();
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Scheduled Posts</h1>
          <p className="text-white/50 text-sm">All queued Instagram posts</p>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center text-white/30">
          No scheduled posts yet. Create a video and schedule it!
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job) => (
            <div key={job.job_id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-mono text-white/60">#{job.job_id}</span>
                <StatusBadge status={job.status} />
              </div>
              <p className="text-xs text-white/40">
                Scheduled: {new Date(job.post_time).toLocaleString()}
              </p>
              {job.result?.url && (
                <a
                  href={job.result.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-500 underline mt-1 block"
                >
                  View on Instagram →
                </a>
              )}
              {job.error && (
                <p className="text-xs text-red-400 mt-1">{job.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
