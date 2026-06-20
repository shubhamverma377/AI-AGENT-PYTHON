import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CreatePage from "./pages/CreatePage";
import ScheduledPage from "./pages/ScheduledPage";
import DashboardPage from "./pages/DashboardPage";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<CreatePage />} />
        <Route path="/scheduled" element={<ScheduledPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </div>
  );
}
