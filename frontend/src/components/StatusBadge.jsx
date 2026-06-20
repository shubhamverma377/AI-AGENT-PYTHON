const colors = {
  queued: "bg-yellow-500/20 text-yellow-400",
  processing_script: "bg-blue-500/20 text-blue-400",
  generating_images: "bg-purple-500/20 text-purple-400",
  generating_voice: "bg-indigo-500/20 text-indigo-400",
  creating_video: "bg-pink-500/20 text-pink-400",
  ready: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
  scheduled: "bg-orange-500/20 text-orange-400",
  posted: "bg-green-500/20 text-green-400",
};

const labels = {
  queued: "⏳ Queued",
  processing_script: "🧠 Reading Script",
  generating_images: "🎨 Drawing Character",
  generating_voice: "🎙️ Generating Voice",
  creating_video: "🎬 Creating Video",
  ready: "✅ Ready",
  failed: "❌ Failed",
  scheduled: "📅 Scheduled",
  posted: "🚀 Posted",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-white/10 text-white/60"}`}>
      {labels[status] || status}
    </span>
  );
}
