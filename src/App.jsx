import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Radio, Loader2 } from 'lucide-react';
import triondaBall from './assets/trionda-ball.png';

// Route-level code splitting: each view only downloads when the user
// actually navigates to it, instead of all four bundling into one file
// the browser has to fetch before anything renders.
const Landing = lazy(() => import('./pages/Landing'));
const FanView = lazy(() => import('./pages/FanView'));
const VolunteerView = lazy(() => import('./pages/VolunteerView'));
const OrganizerView = lazy(() => import('./pages/OrganizerView'));

// Demo-only placeholder for the "active match" indicator in the header.
const DEMO_ACTIVE_MATCH = 'ARG vs FRA';

function CommandBar() {
  return (
    <nav className="bg-slate-950 border-b border-slate-800 text-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="flex items-center gap-3 group cursor-pointer" title="Return to Portal">
        <img
          src={triondaBall}
          alt="World Cup 26 Trionda Ball"
          className="w-9 h-9 animate-spin motion-reduce:animate-none drop-shadow-md"
          style={{ animationDuration: '6s' }}
        />
        <span className="font-black text-lg tracking-wide text-slate-200 hidden sm:block">
          WORLD CUP <span className="text-blue-500">26</span>
        </span>
      </Link>

      <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full shadow-inner backdrop-blur-sm">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
        </span>
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Live Operations</span>
        <span className="text-xs text-slate-500 border-l border-slate-700 pl-3">Active Match: {DEMO_ACTIVE_MATCH}</span>
      </div>

      <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-400 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-800">
        <Radio size={14} className="text-emerald-500 animate-pulse" />
        <span className="uppercase">Connected</span>
      </div>
    </nav>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] bg-slate-950">
      <Loader2 className="animate-spin text-slate-500" size={32} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-300 gap-4">
      <p className="text-lg font-semibold">Page not found</p>
      <Link to="/" className="text-blue-400 hover:text-blue-300 underline">
        Return to portal
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CommandBar />
      <main className="min-h-[calc(100vh-3.5rem)] bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
        <Suspense fallback={<RouteLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/fan" element={<FanView />} />
            <Route path="/volunteer" element={<VolunteerView />} />
            <Route path="/organizer" element={<OrganizerView />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
    </BrowserRouter>
  );
}