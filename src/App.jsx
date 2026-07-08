import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing';
import FanView from './pages/FanView';
import VolunteerView from './pages/VolunteerView';
import OrganizerView from './pages/OrganizerView';
import { Radio } from 'lucide-react';
import triondaBall from './assets/trionda-ball.png';

// --- COMPONENTS ---

/**
 * Global Command Bar
 * Provides persistent navigation and system status across all views.
 */
function CommandBar() {
  return (
    <nav className="bg-slate-950 border-b border-slate-800 text-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      
      {/* Left: Spinning Trionda Football & Branding */}
      <Link to="/" className="flex items-center gap-3 group cursor-pointer" title="Return to Portal">
        <img 
          src={triondaBall} 
          alt="World Cup 26 Trionda Ball" 
          className="w-9 h-9 animate-spin drop-shadow-md"
          style={{ animationDuration: '6s' }} 
        />
        <span className="font-black text-lg tracking-wide text-slate-200 hidden sm:block">
          WORLD CUP <span className="text-blue-500">26</span>
        </span>
      </Link>

      {/* Center: Live Pulse Status (Hidden on mobile) */}
      <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full shadow-inner backdrop-blur-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Operations</span>
        <span className="text-xs text-slate-500 border-l border-slate-700 pl-3">Active Match: ARG vs FRA</span>
      </div>

      {/* Right: Network Status */}
      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-800">
        <Radio size={14} className="text-emerald-500 animate-pulse" />
        <span className="uppercase">Connected</span>
      </div>
    </nav>
  );
}

// --- MAIN APP ENTRY ---

export default function App() {
  return (
    <BrowserRouter>
      <CommandBar />
      
      {/* Main Content Area 
        Updated to bg-slate-950 to perfectly match the dark theme of all nested pages.
      */}
      <main className="min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/fan" element={<FanView />} />
          <Route path="/volunteer" element={<VolunteerView />} />
          <Route path="/organizer" element={<OrganizerView />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}