import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { GoogleGenAI } from '@google/genai';
import { Timer, Accessibility, Loader2, MapPin, ArrowRight } from 'lucide-react';

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function FanView() {
  const [gates, setGates] = useState([]);
  const [selectedGate, setSelectedGate] = useState('Gate 3');
  const [waitTime, setWaitTime] = useState(15);
  const [needsAccessibility, setNeedsAccessibility] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

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

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });

      setPrediction(JSON.parse(response.text));
    } catch (error) {
      console.error("AI Error:", error);
      alert("Failed to predict. Check console.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
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
          </div>
        </div>
      )}
    </div>
  );
}