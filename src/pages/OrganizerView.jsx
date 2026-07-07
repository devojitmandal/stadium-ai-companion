import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/askGemini';
import { LayoutDashboard, TrendingUp, ShieldAlert, CheckCircle2, Loader2, Users } from 'lucide-react';

export default function OrganizerView() {
  const [gates, setGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);

  // 1. Fetch live gate data
  const fetchStadiumState = async () => {
    const { data } = await supabase
      .from('stadium_state')
      .select('*')
      .order('gate_id');
    if (data) setGates(data);
  };

  useEffect(() => {
    fetchStadiumState();
    
    // Set up polling to mimic real-time sensor streams
    const interval = setInterval(fetchStadiumState, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Secret Hackathon Weapon: Instantly trigger the demo spike state
  const triggerDemoSpike = async () => {
    setActionStatus("Simulating crowd surge...");
    const { error } = await supabase
      .from('stadium_state')
      .update({
        congestion_pct: 94,
        queue_time_min: 35,
        context: { metro_arrival: "Train unpacked 1,200 fans", nearby_event: "Security lane closure", weather: "Humid / Peak Flow" }
      })
      .eq('gate_id', 'Gate 3');

    if (!error) {
      await fetchStadiumState();
      setActionStatus("Surge injected into Gate 3!");
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  // 3. GenAI Causal Analysis Feature
  const explainSpike = async (gate) => {
    setSelectedGate(gate);
    setLoadingAI(true);
    setAnalysis(null);

    try {
      const prompt = `
        You are a senior stadium operations analyst for the FIFA World Cup 2026.
        Here is the current operational snapshot of all stadium gates: ${JSON.stringify(gates)}
        
        Gate ${gate.gate_id} has breached safe operating margins with ${gate.congestion_pct}% congestion and a ${gate.queue_time_min} minute wait time.
        Sensor Contextual Factors: ${JSON.stringify(gate.context)}
        
        Provide a 2-3 sentence causal explanation of why this specific bottleneck happened, linking the context variables logically. 
        Then, provide exactly 1 short, actionable recommendation for command staff.
        
        Return strict JSON in this exact format:
        {
          "explanation": "...",
          "recommendation": "..."
        }
      `;

      const result = await askGemini(prompt);
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Failed to analyze spike.");
    }
    setLoadingAI(false);
  };

  // 4. Closing the Loop: Write an operational directive back to the spine
  const deployVolunteers = async () => {
    if (!selectedGate || !analysis) return;
    setLoadingAI(true);

    const { error } = await supabase
      .from('incidents')
      .insert([
        {
          type: 'Crowd Control Deployment',
          location: `${selectedGate.gate_id} Concourse`,
          status: 'open'
        }
      ]);

    if (!error) {
      setActionStatus(`Success: Dispatch alert broadcasted to Volunteer mobile views!`);
      setTimeout(() => setActionStatus(null), 4000);
    } else {
      console.error(error);
    }
    setLoadingAI(false);
  };
  const broadcastNotification = async () => {
    if (!selectedGate || !analysis) return;
    const { error } = await supabase.from('notifications').insert([
      { message: analysis.recommendation, gate_id: selectedGate.gate_id }
    ]);
    if (!error) {
      setActionStatus("Broadcast sent to all fans!");
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-gray-200 gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="text-purple-600" />
            Stadium Operations Center
          </h2>
          <p className="text-sm text-gray-500 mt-1">FIFA World Cup 2026 — Live Concourse Overview</p>
        </div>
        
        <button 
          onClick={triggerDemoSpike}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
        >
          Simulate Gate 3 Surge (For Demo)
        </button>
      </div>

      {actionStatus && (
        <div className="bg-purple-50 border border-purple-200 text-purple-800 p-3 rounded-lg text-sm text-center font-medium animate-pulse">
          {actionStatus}
        </div>
      )}

      {/* Grid Layout for Gate Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {gates.map((gate) => {
          const isCritical = gate.congestion_pct >= 75;
          return (
            <div 
              key={gate.gate_id} 
              onClick={() => explainSpike(gate)}
              className={`p-4 rounded-xl bg-white border cursor-pointer transition-all duration-200 hover:shadow-md ${
                isCritical ? 'border-red-500 ring-2 ring-red-100 bg-red-50/10' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-900">{gate.gate_id}</span>
                {isCritical && <ShieldAlert className="text-red-500 animate-bounce" size={18} />}
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-black text-gray-800">{gate.queue_time_min}m <span className="text-xs font-normal text-gray-400">wait</span></div>
                <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full ${isCritical ? 'bg-red-500' : gate.congestion_pct > 40 ? 'bg-amber-500' : 'bg-green-500'}`} 
                    style={{ width: `${gate.congestion_pct}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 pt-1 flex justify-between">
                  <span>Congestion:</span>
                  <span className="font-semibold">{gate.congestion_pct}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Deep-Dive Operational AI Panel */}
      {selectedGate && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 animate-in fade-in duration-300">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="text-red-500" />
              Sensor Deep Dive: {selectedGate.gate_id}
            </h3>
            <span className={`px-2 py-1 rounded-md text-xs font-semibold ${selectedGate.congestion_pct >= 75 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
              Status: {selectedGate.congestion_pct >= 75 ? 'Critical Surge' : 'Nominal'}
            </span>
          </div>

          {loadingAI ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Loader2 className="animate-spin text-purple-600" size={32} />
              <p className="text-sm text-gray-500">GenAI diagnosing telemetry data streams...</p>
            </div>
          ) : analysis ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Causal Explanation</h4>
                <p className="text-gray-800 text-sm leading-relaxed">{analysis.explanation}</p>
              </div>

              <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-500 mb-1">AI Actionable Recommendation</h4>
                <p className="text-purple-900 text-sm font-medium">{analysis.recommendation}</p>
              </div>

              {/* Close-the-loop action button */}
              <button
                onClick={deployVolunteers}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm"
              >
                <Users size={16} />
                Approve Recommendation & Deploy Field Volunteers
              </button>
              <button
              onClick={broadcastNotification}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 px-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors text-sm mt-2"
              >
                Broadcast to Fans
              </button>
            </div>
            
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">Click any card above to trigger real-time AI operational support diagnostics.</p>
          )}
        </div>
      )}
    </div>
  );
}