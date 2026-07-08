import { Link } from 'react-router-dom';
import { MapPin, ShieldAlert, BadgeHelp, ArrowRight, Sparkles } from 'lucide-react';

// --- DATA ---
const PORTALS = [
  {
    to: '/fan',
    icon: MapPin,
    accent: 'blue',
    title: 'Fan Experience',
    description: 'Smart queue betting, dynamic navigation, and accessible routing.',
  },
  {
    to: '/volunteer',
    icon: BadgeHelp,
    accent: 'green',
    title: 'Field Volunteer',
    description: 'Real-time multilingual phrasebooks and cultural context guides.',
  },
  {
    to: '/organizer',
    icon: ShieldAlert,
    accent: 'purple',
    title: 'Command Center',
    description: 'Live telemetry, causal anomaly detection, and field deployment.',
  },
];

// --- ADVANCED TAILWIND THEMING ---
// Moving away from basic backgrounds to vibrant, glowing glassmorphism states
const ACCENT_STYLES = {
  blue: {
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-400',
    hoverBorder: 'group-hover:border-blue-500/50',
    hoverGlow: 'group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]',
    textHover: 'group-hover:text-blue-400',
  },
  green: {
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-400',
    hoverBorder: 'group-hover:border-green-500/50',
    hoverGlow: 'group-hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]',
    textHover: 'group-hover:text-green-400',
  },
  purple: {
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-400',
    hoverBorder: 'group-hover:border-purple-500/50',
    hoverGlow: 'group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]',
    textHover: 'group-hover:text-purple-400',
  },
};

// --- COMPONENTS ---
function PortalCard({ to, icon: Icon, accent, title, description }) {
  const styles = ACCENT_STYLES[accent];

  return (
    <Link
      to={to}
      aria-label={`Enter ${title} portal`}
      className={`group relative flex flex-col items-center text-center p-8 rounded-3xl 
                 bg-slate-900/40 backdrop-blur-xl border border-slate-800 
                 transition-all duration-500 ease-out hover:-translate-y-2
                 ${styles.hoverBorder} ${styles.hoverGlow} overflow-hidden`}
    >
      {/* Ambient internal card glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 
                      ${styles.iconBg} ${styles.iconColor} 
                      group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
      >
        <Icon size={32} strokeWidth={1.5} />
      </div>
      
      <h2 className="text-2xl font-bold text-slate-100 mb-3 tracking-tight z-10">{title}</h2>
      <p className="text-slate-400 mb-8 flex-grow leading-relaxed z-10">{description}</p>
      
      <div className={`mt-auto flex items-center gap-2 font-semibold tracking-wide text-sm
                      text-slate-300 ${styles.textHover} transition-colors duration-300 z-10`}
      >
        <span>INITIALIZE</span>
        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
      </div>
    </Link>
  );
}

export default function Landing() {
  return (
    // Background uses a deep slate base with hidden overflow to contain the absolute ambient glows
    <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden">
      
      {/* Ambient Background Mesh/Glows (Simulating Stadium Lights / AI Nodes) */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 text-center mb-16 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Sleek, glowing badge */}
        <div className="inline-flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-full px-5 py-2 mb-8 shadow-[0_0_20px_-5px_rgba(245,158,11,0.2)]">
          <Sparkles size={16} className="text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Powered by Gemini GenAI</span>
        </div>

        {/* High-impact typography */}
        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-tight">
          FIFA World Cup 2026
          <span className="block mt-2 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Stadium AI Companion
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          Select your operational portal to experience a unified, real-time nervous system for the world's largest sporting event.
        </p>
      </div>

      {/* Grid wrapper with stagger-ready layout */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full max-w-6xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
        {PORTALS.map((portal) => (
          <PortalCard key={portal.to} {...portal} />
        ))}
      </div>
      
    </div>
  );
}