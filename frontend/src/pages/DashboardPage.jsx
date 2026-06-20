import { Video, Calendar, Zap, Github } from "lucide-react";

const steps = [
  { icon: "✍️", title: "Write Script", desc: "Describe your character, scenes & dialogue in plain text" },
  { icon: "🤖", title: "AI Processes", desc: "Groq AI extracts character traits, scenes & voiceover" },
  { icon: "🎨", title: "Character Born", desc: "Pollinations.ai generates your cartoon character for free" },
  { icon: "🎙️", title: "Voice Added", desc: "Microsoft edge-tts gives your character a natural voice" },
  { icon: "🎬", title: "Video Created", desc: "MoviePy assembles everything into a 9:16 Instagram Reel" },
  { icon: "📱", title: "Auto Post", desc: "Posts to Instagram feed AND story at your chosen time" },
];

const stack = [
  { name: "Groq API", desc: "AI brain — llama-3.3-70b", free: true },
  { name: "Pollinations.ai", desc: "Character image generation", free: true },
  { name: "edge-tts", desc: "Microsoft neural voice", free: true },
  { name: "MoviePy + FFmpeg", desc: "Video assembly", free: true },
  { name: "instagrapi", desc: "Instagram automation", free: true },
  { name: "APScheduler", desc: "Post scheduling", free: true },
];

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-16 space-y-12">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">How It Works</h1>
        <p className="text-white/50">100% free AI stack — script to posted reel in minutes</p>
      </div>

      {/* Pipeline */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {steps.map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
            <span className="text-3xl">{s.icon}</span>
            <h3 className="font-semibold text-white text-sm">{s.title}</h3>
            <p className="text-white/50 text-xs leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Stack */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Tech Stack</h2>
        <div className="space-y-2">
          {stack.map((s) => (
            <div key={s.name} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3">
              <div>
                <span className="text-sm font-medium text-white">{s.name}</span>
                <span className="text-xs text-white/40 ml-3">{s.desc}</span>
              </div>
              {s.free && (
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full font-semibold">FREE</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Env Setup */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Required Setup</h2>
        <div className="bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-sm space-y-2">
          <p className="text-green-400"># .env file in /backend</p>
          <p className="text-white/70">GROQ_API_KEY=<span className="text-yellow-400">gsk_your_key_here</span></p>
          <p className="text-white/70">INSTAGRAM_USERNAME=<span className="text-yellow-400">your_username</span></p>
          <p className="text-white/70">INSTAGRAM_PASSWORD=<span className="text-yellow-400">your_password</span></p>
          <div className="pt-2 border-t border-white/10">
            <p className="text-green-400"># Get free Groq key at:</p>
            <p className="text-brand-400">console.groq.com → API Keys → Create</p>
          </div>
        </div>
      </div>
    </div>
  );
}
