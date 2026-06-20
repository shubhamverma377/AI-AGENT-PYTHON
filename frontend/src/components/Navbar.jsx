import { Link, useLocation } from "react-router-dom";
import { Video, Calendar, LayoutDashboard } from "lucide-react";

const links = [
  { to: "/", label: "Create", icon: Video },
  { to: "/scheduled", label: "Scheduled", icon: Calendar },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0d0d1a]/90 backdrop-blur border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className="text-xl font-bold text-brand-500">
          🎬 Social AI Agent
        </span>
        <div className="flex gap-1">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pathname === to
                  ? "bg-brand-500 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
