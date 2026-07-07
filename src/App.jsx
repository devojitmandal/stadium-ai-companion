import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Landing from './pages/Landing'
import FanView from './pages/FanView'
import VolunteerView from './pages/VolunteerView'
import OrganizerView from './pages/OrganizerView'
import { Radio } from 'lucide-react'
import triondaBall from './assets/trionda-ball.png' // <-- Add this line

function App() {
  return (
    <BrowserRouter>
      {/* Creative Command Bar */}
      <nav className="bg-slate-950 border-b border-slate-800 text-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        
        {/* Left: Spinning Trionda Football & Branding */}
        <Link to="/" className="flex items-center gap-3 group cursor-pointer" title="Return to Portal">
          <img 
            src={triondaBall} 
            alt="World Cup 26 Trionda Ball" 
            className="w-9 h-9 animate-spin drop-shadow-md"
            style={{ animationDuration: '6s' }} /* Slowed down slightly to read the logo */
          />
          <span className="font-black text-lg tracking-wide text-slate-200 hidden sm:block">
            WORLD CUP <span className="text-blue-500">26</span>
          </span>
        </Link>

        {/* Center: Live Pulse (Hidden on very small screens) */}
        <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-900 border border-slate-800 rounded-full shadow-inner">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Operations</span>
          <span className="text-xs text-slate-500 border-l border-slate-700 pl-3">Active Match: ARG vs FRA</span>
        </div>

        {/* Right: Network Status */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
          <Radio size={14} className="text-green-500 animate-pulse" />
          <span>Connected</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="min-h-[calc(100vh-3.5rem)] bg-gray-50 text-gray-900">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/fan" element={<FanView />} />
          <Route path="/volunteer" element={<VolunteerView />} />
          <Route path="/organizer" element={<OrganizerView />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App