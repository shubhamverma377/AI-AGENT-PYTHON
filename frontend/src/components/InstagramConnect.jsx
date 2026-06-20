import { useState, useEffect } from "react";
import { Instagram, CheckCircle, LogIn, Eye, EyeOff, Loader } from "lucide-react";
import { connectInstagram, getInstagramStatus } from "../api/client";

export default function InstagramConnect() {
  const [status, setStatus] = useState(null); // null = loading
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getInstagramStatus()
      .then(setStatus)
      .catch(() => setStatus({ connected: false }));
  }, []);

  const handleConnect = async () => {
    if (!username.trim() || !password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await connectInstagram(username, password);
      setStatus({ connected: true, username: res.username });
      setPassword("");
    } catch (e) {
      setError(e.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  if (status === null) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Instagram size={18} className="text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-white">Instagram Account</h2>
          <p className="text-xs text-white/40">Connect to post reels directly</p>
        </div>
        {status.connected && (
          <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-medium">
            <CheckCircle size={14} />
            Connected
          </div>
        )}
      </div>

      {status.connected ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <span className="text-green-400 text-sm">@{status.username}</span>
          <button
            onClick={() => setStatus({ connected: false })}
            className="ml-auto text-xs text-white/30 hover:text-white/60 transition"
          >
            Switch account
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Instagram username"
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition"
          />
          <div className="relative">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Instagram password"
              onKeyDown={(e) => e.key === "Enter" && handleConnect()}
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500 transition pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPass((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-xs bg-red-500/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleConnect}
            disabled={loading || !username.trim() || !password.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-xl transition text-sm"
          >
            {loading ? <Loader size={16} className="animate-spin" /> : <LogIn size={16} />}
            {loading ? "Connecting..." : "Connect Instagram"}
          </button>

          <p className="text-xs text-white/25 text-center">
            Credentials are used only for posting and not stored permanently.
          </p>
        </div>
      )}
    </div>
  );
}
