import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { askGemini } from '../lib/askGemini';
import { Timer, Accessibility, Loader2, MapPin, ArrowRight, Leaf, Train } from 'lucide-react';

export default function FanView() {
  const [gates, setGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState('Gate 3');
  const [waitTime, setWaitTime] = useState(15);
  const [needsAccessibility, setNeedsAccessibility] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [gateInfo, setGateInfo] = useState(null);
const [loadingInfo, setLoadingInfo] = useState(false);
const [predictionError, setPredictionError] = useState(null);
const [gateInfoError, setGateInfoError] = useState(null);

  // 1. Fetch live stadium data from Supabase
  useEffect(() => {
    const fetchGates = async () => {
      const { data, error } = await supabase
        .from('stadium_state')
        .select('*')
        .order('gate_id');
      
      if (data) setGates(data);
      if (error) console.error("Supabase Error:", error);
    };
    
    fetchGates();
  }, []);

  // 2. Generate Prediction via Gemini
  const getPrediction = async () => {
    setLoading(true);
    const targetGate = gates.find(g => g.gate_id === selectedGate);

    try {
      const prompt = `
        You are a stadium queue predictor. 
        Current Gate: ${selectedGate}
        Current Congestion: ${targetGate?.congestion_pct}%
        Current Queue Time: ${targetGate?.queue_time_min} mins
        Recent History: ${JSON.stringify(targetGate?.history || [])}
        
        The fan is deciding: leave their seat for food NOW, or wait ${waitTime} minutes.
        Predict the expected queue time in both cases based on the congestion trend.
        
        ${needsAccessibility ? "IMPORTANT CONSTRAINT: This fan requires wheelchair-accessible routing. Avoid stairs and escalators, prioritize elevators and ramps, and explicitly mention estimated extra transit time if the accessible route is longer." : ""}
        
        Return strict JSON in this exact format: 
        { 
          "now_wait": [number], 
          "later_wait": [number], 
          "recommendation": "[1-2 sentence explanation]" 
        }
      `;

      const result = await askGemini(prompt);
      setPrediction(result);
    } catch (error) {
      console.error("AI Error:", error);
      setPredictionError("Couldn't reach AI right now — try again.");
    }
    setLoading(false);
  };
  const getGateInfo = async () => {
    setLoadingInfo(true);
    const targetGate = gates.find(g => g.gate_id === selectedGate);
  
    try {
      const prompt = `
        You are a stadium fan assistant. Gate context: ${JSON.stringify(targetGate?.context || {})}
  
        Based on this, write:
        1. A short, friendly sustainability tip (mention the nearest recycling point if available)
        2. A short transportation status update (metro/parking) in plain language
  
        Return strict JSON:
        { "sustainability_tip": "...", "transport_status": "..." }
      `;
      const result = await askGemini(prompt);
      setGateInfo(result);
    } catch (error) {
      console.error("Gate info error:", error);
      setGateInfoError("Couldn't load gate info — try again.");
    }
    setLoadingInfo(false);
  };
  const [notifications, setNotifications] = useState([]);
const [notificationError, setNotificationError] = useState(null);

useEffect(() => {
  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    if (data) setNotifications(data);
  };
  fetchNotifications();
  const interval = setInterval(fetchNotifications, 5000);
  return () => clearInterval(interval);
}, []);
useEffect(() => {
  if (selectedGate && gates.length > 0) getGateInfo();
}, [selectedGate, gates]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {notifications.map((n) => (
  <div key={n.id} className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-lg text-sm mb-3">
    ⚠️ {n.message}
  </div>
))}

{predictionError && (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm mb-3">
    {predictionError}
  </div>
)}
{gateInfoError && (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm mb-3">
    {gateInfoError}
  </div>
)}
{notificationError && (
  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm mb-3">
    {notificationError}
  </div>
)}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MapPin className="text-green-600" />
          Smart Navigation & Queue Betting
        </h2>

        {/* Database Status check */}
        {gates.length === 0 && <p className="text-sm text-gray-500 mb-4 animate-pulse">Connecting to stadium sensors...</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target Concession/Gate</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                value={selectedGate}
                onChange={(e) => setSelectedGate(e.target.value)}
              >
                {gates.map(gate => (
                  <option key={gate.gate_id} value={gate.gate_id}>
                    {gate.gate_id} (Currently {gate.queue_time_min} min wait)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">I want to wait...</label>
              <select 
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-500"
                value={waitTime}
                onChange={(e) => setWaitTime(Number(e.target.value))}
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex flex-col justify-center">
             {/* Accessibility Toggle - This knocks out Phase 5! */}
            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-100 rounded-md transition-colors">
              <div className={`p-2 rounded-full ${needsAccessibility ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-500'}`}>
                <Accessibility size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Accessibility Mode</p>
                <p className="text-xs text-gray-500">Prioritize elevators & step-free routes</p>
              </div>
              <input 
                type="checkbox" 
                className="ml-auto w-5 h-5 accent-blue-600"
                checked={needsAccessibility}
                onChange={(e) => setNeedsAccessibility(e.target.checked)}
              />
            </label>
          </div>
        </div>

        <button 
          onClick={getPrediction}
          disabled={loading || gates.length === 0}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Predict Best Time to Go"}
        </button>
      </div>

      {/* Results UI */}
      {prediction && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-1">If you go NOW</p>
            <p className="text-3xl font-bold text-gray-900">{prediction.now_wait} <span className="text-lg font-normal text-gray-500">mins</span></p>
          </div>
          
          <div className="flex items-center justify-center">
             <ArrowRight className="text-gray-300 hidden md:block" size={32} />
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 text-center flex flex-col justify-center">
            <p className="text-sm text-gray-500 mb-1">If you wait {waitTime} mins</p>
            <p className="text-3xl font-bold text-gray-900">{prediction.later_wait} <span className="text-lg font-normal text-gray-500">mins</span></p>
          </div>

          <div className="md:col-span-3 bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3 mt-2">
            <Timer className="text-green-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-green-900">AI Recommendation</h4>
              <p className="text-green-800 text-sm mt-1">{prediction.recommendation}</p>
            </div>
            {gateInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-start gap-3">
                  <Leaf className="text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-green-900 text-sm">Sustainability Tip</h4>
                    <p className="text-green-800 text-sm mt-1">{gateInfo.sustainability_tip}</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                  <Train className="text-blue-600 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="font-semibold text-blue-900 text-sm">Transport Status</h4>
                    <p className="text-blue-800 text-sm mt-1">{gateInfo.transport_status}</p>
                  </div>
                </div>
              </div>
            )}
            {loadingInfo && (
              <p className="text-sm text-gray-400 animate-pulse">Loading gate info...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}