import { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Globe2, AlertCircle, Loader2 } from 'lucide-react';

// Initialize Gemini (Using the key from your .env.local)
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

export default function VolunteerView() {
  const [language, setLanguage] = useState('Spanish');
  const [situation, setSituation] = useState('Lost Child');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const generatePhrases = async () => {
    setLoading(true);
    try {
      const prompt = `
        You are helping a stadium volunteer communicate with a fan who speaks ${language}.
        Situation: ${situation}.
        Generate 5 short phrases the volunteer can read aloud or show on screen:
        - Original English phrase
        - ${language} translation
        - Phonetic pronunciation guide
        Also include 1 short, respectful cultural tip for interacting with people from this culture.
        
        Return strict JSON in this exact format: 
        { 
          "phrases": [ {"english": "...", "translated": "...", "phonetic": "..."} ],
          "cultural_tip": "..."
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json', // Forces Gemini to return clean JSON
        }
      });

      // Parse the JSON string Gemini returns into a JavaScript object
      const data = JSON.parse(response.text);
      setResult(data);
    } catch (error) {
      console.error("Error generating phrases:", error);
      alert("Failed to generate phrases. Check your API key and console.");
    }
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Globe2 className="text-blue-600" />
          Instant Phrasebook Generator
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Language</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option>Spanish</option>
              <option>French</option>
              <option>Arabic</option>
              <option>Japanese</option>
              <option>Portuguese</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Situation</label>
            <select 
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            >
              <option>Lost Child</option>
              <option>Medical Emergency</option>
              <option>Directions to Gate/Seat</option>
              <option>Ticketing Issue</option>
              <option>Food/Restroom Location</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generatePhrases}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : "Generate Translation Cards"}
        </button>
      </div>

      {/* Results UI */}
      {result && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-blue-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-semibold text-blue-900">Cultural Tip</h4>
              <p className="text-blue-800 text-sm mt-1">{result.cultural_tip}</p>
            </div>
          </div>

          <div className="grid gap-4">
            {result.phrases.map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">{item.english}</p>
                <p className="text-xl font-bold text-gray-900 mb-1">{item.translated}</p>
                <p className="text-sm font-mono text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded">
                  "{item.phonetic}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}