import { Link } from 'react-router-dom';
import { MapPin, ShieldAlert, BadgeHelp, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-200">
      <div className="text-center mb-12 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">
          FIFA World Cup 2026
          <span className="block text-blue-600 mt-2">Stadium AI Companion</span>
        </h1>
        <p className="text-lg text-gray-600 font-medium">
          Select your portal to experience the GenAI operational nervous system.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Fan Portal */}
        <Link 
          to="/fan" 
          className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <MapPin size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Fan Experience</h2>
          <p className="text-gray-500 mb-6 flex-grow">
            Smart queue betting, dynamic navigation, and accessible routing.
          </p>
          <div className="text-blue-600 font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
            Enter Portal <ArrowRight size={18} />
          </div>
        </Link>

        {/* Volunteer Portal */}
        <Link 
          to="/volunteer" 
          className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <BadgeHelp size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Field Volunteer</h2>
          <p className="text-gray-500 mb-6 flex-grow">
            Real-time multilingual phrasebooks and cultural context guides.
          </p>
          <div className="text-green-600 font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
            Enter Portal <ArrowRight size={18} />
          </div>
        </Link>

        {/* Organizer Portal */}
        <Link 
          to="/organizer" 
          className="group bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <ShieldAlert size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Command Center</h2>
          <p className="text-gray-500 mb-6 flex-grow">
            Live telemetry, causal anomaly detection, and field deployment.
          </p>
          <div className="text-purple-600 font-semibold flex items-center gap-2 group-hover:gap-4 transition-all">
            Enter Portal <ArrowRight size={18} />
          </div>
        </Link>
      </div>
    </div>
  );
}